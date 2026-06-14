<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SettingsUpdateRequest;
use App\Http\Requests\Admin\UploadLogoRequest;
use App\Services\Chat\ChatService;
use App\Services\Chat\Exceptions\ChatNotConfigured;
use App\Services\Chat\Exceptions\ChatRequestFailed;
use App\Support\Settings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $featured = Settings::get('featured_currencies', ['btc', 'eth', 'usdt', 'bnb', 'sol', 'usdc', 'xmr', 'ada', 'trx', 'doge']);
        $blacklist = Settings::get('blacklist_currencies', []);
        $social = (array) Settings::get('social', (array) config('swapforge.social', []));

        $chatApiKey = (string) Settings::get('chat.api_key', '');
        $chatProvider = (string) Settings::get('chat.provider', ChatService::PROVIDER_NONE);

        $mailPassword = (string) Settings::get('mail.password', '');

        return Inertia::render('Admin/Settings/Index', [
            'settings' => [
                'brand' => (string) Settings::get('brand', (string) config('swapforge.brand', 'CrossSwap')),
                'tagline' => (string) Settings::get('tagline', (string) config('swapforge.tagline', '')),
                'logo' => (string) Settings::get('logo', ''),
                'support_email' => (string) Settings::get('support_email', (string) config('swapforge.support_email', '')),
                'theme' => (string) Settings::get('theme', (string) config('swapforge.theme', 'dark')),
                'webgl_hero' => (bool) Settings::get('webgl_hero', true),
                'fixed_rate' => (bool) Settings::get('fixed_rate', true),
                'show_promo' => (bool) Settings::get('show_promo', true),
                'collect_email' => (bool) Settings::get('collect_email', true),
                'featured_currencies' => is_array($featured) ? implode(',', $featured) : '',
                'blacklist_currencies' => is_array($blacklist) ? implode(',', $blacklist) : '',
                'terms_url' => (string) Settings::get('terms_url', ''),
                'privacy_url' => (string) Settings::get('privacy_url', ''),
                'aml_url' => (string) Settings::get('aml_url', ''),
                'social' => [
                    'twitter' => (string) ($social['twitter'] ?? ''),
                    'telegram' => (string) ($social['telegram'] ?? ''),
                    'discord' => (string) ($social['discord'] ?? ''),
                    'reddit' => (string) ($social['reddit'] ?? ''),
                ],
                'chat' => [
                    'enabled' => (bool) Settings::get('chat.enabled', false),
                    'provider' => in_array($chatProvider, ['none', 'openai', 'anthropic'], true) ? $chatProvider : 'none',
                    'has_api_key' => $chatApiKey !== '',
                    'api_key_masked' => $this->mask($chatApiKey),
                    'api_key' => '',
                    'model' => (string) Settings::get('chat.model', ''),
                    'assistant_name' => (string) Settings::get('chat.assistant_name', ChatService::DEFAULT_ASSISTANT_NAME),
                    'system_prompt' => (string) Settings::get('chat.system_prompt', ''),
                ],
                'mail' => [
                    'transport' => (string) Settings::get('mail.transport', 'log'),
                    'host' => (string) Settings::get('mail.host', ''),
                    'port' => (string) Settings::get('mail.port', ''),
                    'username' => (string) Settings::get('mail.username', ''),
                    'password' => '',
                    'has_password' => $mailPassword !== '',
                    'encryption' => (string) Settings::get('mail.encryption', 'tls'),
                    'from_address' => (string) Settings::get('mail.from_address', ''),
                    'from_name' => (string) Settings::get('mail.from_name', ''),
                ],
            ],
            'languages' => (array) config('swapforge.languages', ['en']),
        ]);
    }

    public function update(SettingsUpdateRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $featured = $this->splitList((string) ($data['featured_currencies'] ?? ''));
        $blacklist = $this->splitList((string) ($data['blacklist_currencies'] ?? ''));

        $payload = [
            'brand' => (string) ($data['brand'] ?? ''),
            'tagline' => (string) ($data['tagline'] ?? ''),
            'logo' => (string) ($data['logo'] ?? ''),
            'support_email' => (string) ($data['support_email'] ?? ''),
            'theme' => (string) ($data['theme'] ?? 'dark'),
            'webgl_hero' => (bool) ($data['webgl_hero'] ?? false),
            'fixed_rate' => (bool) ($data['fixed_rate'] ?? false),
            'show_promo' => (bool) ($data['show_promo'] ?? false),
            'collect_email' => (bool) ($data['collect_email'] ?? false),
            'featured_currencies' => $featured,
            'blacklist_currencies' => $blacklist,
            'terms_url' => (string) ($data['terms_url'] ?? ''),
            'privacy_url' => (string) ($data['privacy_url'] ?? ''),
            'aml_url' => (string) ($data['aml_url'] ?? ''),
            'social' => [
                'twitter' => (string) ($data['social']['twitter'] ?? ''),
                'telegram' => (string) ($data['social']['telegram'] ?? ''),
                'discord' => (string) ($data['social']['discord'] ?? ''),
                'reddit' => (string) ($data['social']['reddit'] ?? ''),
            ],
        ];

        $chat = (array) ($data['chat'] ?? []);
        $payload['chat.enabled'] = (bool) ($chat['enabled'] ?? false);
        $payload['chat.provider'] = (string) ($chat['provider'] ?? 'none');
        $payload['chat.model'] = (string) ($chat['model'] ?? '');
        $payload['chat.assistant_name'] = (string) ($chat['assistant_name'] ?? '');
        $payload['chat.system_prompt'] = (string) ($chat['system_prompt'] ?? '');

        // Only overwrite the API key when the admin provided a new value;
        // an empty string from the form means "keep what is stored".
        $newKey = (string) ($chat['api_key'] ?? '');
        if ($newKey !== '') {
            $payload['chat.api_key'] = $newKey;
        }

        $mail = (array) ($data['mail'] ?? []);
        $payload['mail.transport'] = in_array((string) ($mail['transport'] ?? 'log'), ['smtp', 'log'], true) ? (string) $mail['transport'] : 'log';
        $payload['mail.host'] = (string) ($mail['host'] ?? '');
        $payload['mail.port'] = (string) ($mail['port'] ?? '');
        $payload['mail.username'] = (string) ($mail['username'] ?? '');
        $payload['mail.encryption'] = in_array((string) ($mail['encryption'] ?? 'tls'), ['tls', 'ssl', 'none'], true) ? (string) $mail['encryption'] : 'tls';
        $payload['mail.from_address'] = (string) ($mail['from_address'] ?? '');
        $payload['mail.from_name'] = (string) ($mail['from_name'] ?? '');
        $newPass = (string) ($mail['password'] ?? '');
        if ($newPass !== '') {
            $payload['mail.password'] = $newPass;
        }

        Settings::setMany($payload);
        Settings::flush();

        return back()->with('success', trans('site.admin.settings.update_success'));
    }

    /**
     * Upload a brand logo. Stores on the public disk and writes the resulting
     * URL into the `logo` setting so every layout reads it.
     */
    public function uploadLogo(UploadLogoRequest $request): JsonResponse
    {
        $file = $request->file('logo');
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->extension());
        $name = 'logo-'.now()->format('Ymd-His').'-'.bin2hex(random_bytes(3)).'.'.$ext;
        $path = $file->storeAs('branding', $name, 'public');

        // Remove the previous logo file if any.
        $previous = (string) Settings::get('logo', '');
        if ($previous && str_contains($previous, '/storage/branding/')) {
            $previousPath = ltrim((string) str_replace('/storage/', '', $previous), '/');
            Storage::disk('public')->delete($previousPath);
        }

        $url = Storage::disk('public')->url($path);
        Settings::set('logo', $url);

        return response()->json(['ok' => true, 'data' => ['url' => $url]]);
    }

    /**
     * Clear a previously-uploaded logo so the brand falls back to the SVG mark.
     */
    public function clearLogo(): JsonResponse
    {
        $previous = (string) Settings::get('logo', '');
        if ($previous && str_contains($previous, '/storage/branding/')) {
            $previousPath = ltrim((string) str_replace('/storage/', '', $previous), '/');
            Storage::disk('public')->delete($previousPath);
        }
        Settings::set('logo', '');

        return response()->json(['ok' => true]);
    }

    /**
     * Send a one-shot probe to the configured chat provider.
     */
    public function testChat(Request $request, ChatService $chat): JsonResponse
    {
        $data = $request->validate([
            'message' => ['nullable', 'string', 'max:200'],
        ]);

        $probe = (string) ($data['message'] ?? 'Hello');

        try {
            $result = $chat->send([['role' => 'user', 'content' => $probe]]);

            return response()->json([
                'ok' => true,
                'data' => [
                    'reply' => $result['reply'],
                    'tokens_in' => $result['tokens_in'],
                    'tokens_out' => $result['tokens_out'],
                ],
            ]);
        } catch (ChatNotConfigured $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 503);
        } catch (ChatRequestFailed $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 502);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Send a one-line probe through the live mail settings.
     */
    public function testMail(Request $request): JsonResponse
    {
        $data = $request->validate([
            'recipient' => ['required', 'email', 'max:255'],
        ]);

        try {
            Mail::raw('This is a test message from your '.Settings::brand().' admin panel.', function ($message) use ($data): void {
                $message->to($data['recipient'])
                    ->subject('['.Settings::brand().'] SMTP test message');
            });

            return response()->json(['ok' => true]);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * @return array<int, string>
     */
    private function splitList(string $input): array
    {
        return array_values(array_filter(
            array_map(static fn (string $v): string => strtolower(trim($v)), explode(',', $input)),
            static fn (string $v): bool => $v !== '',
        ));
    }

    private function mask(string $key): string
    {
        if ($key === '') {
            return '';
        }
        $len = strlen($key);
        if ($len <= 4) {
            return str_repeat('•', $len);
        }

        return str_repeat('•', max(4, $len - 4)).substr($key, -4);
    }
}
