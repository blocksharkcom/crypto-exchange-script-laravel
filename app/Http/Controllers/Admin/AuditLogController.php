<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use OwenIt\Auditing\Models\Audit;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizePermission('audit.view');

        $q = Audit::query();

        if (($event = (string) $request->string('event')) !== '') {
            $q->where('event', $event);
        }
        if (($model = (string) $request->string('model')) !== '') {
            $q->where('auditable_type', 'like', '%'.$model.'%');
        }
        if (($df = (string) $request->string('date_from')) !== '') {
            try {
                $q->where('created_at', '>=', Carbon::parse($df)->startOfDay());
            } catch (\Throwable) {
                // ignore
            }
        }
        if (($dt = (string) $request->string('date_to')) !== '') {
            try {
                $q->where('created_at', '<=', Carbon::parse($dt)->endOfDay());
            } catch (\Throwable) {
                // ignore
            }
        }

        $paginator = $q->latest()->paginate(25)->withQueryString();

        $paginator->getCollection()->transform(function (Audit $a): array {
            $userLabel = null;
            if ($a->user_type !== null && $a->user_id !== null) {
                $userLabel = $this->resolveUserLabel((string) $a->user_type, (int) $a->user_id);
            }

            return [
                'id' => $a->id,
                'event' => $a->event,
                'auditable' => class_basename((string) $a->auditable_type).'#'.((int) $a->auditable_id),
                'auditable_type' => (string) $a->auditable_type,
                'auditable_id' => (int) $a->auditable_id,
                'user_label' => $userLabel,
                'old_values' => (array) ($a->old_values ?? []),
                'new_values' => (array) ($a->new_values ?? []),
                'ip_address' => $a->ip_address,
                'created_at' => $a->created_at?->toIso8601String(),
            ];
        });

        return Inertia::render('Admin/Audit/Index', [
            'audits' => $paginator,
            'filters' => [
                'event' => (string) $request->string('event'),
                'model' => (string) $request->string('model'),
                'date_from' => (string) $request->string('date_from'),
                'date_to' => (string) $request->string('date_to'),
            ],
            'events' => $this->distinctEvents(),
            'models' => $this->distinctModels(),
        ]);
    }

    /**
     * @return array<int, string>
     */
    private function distinctEvents(): array
    {
        /** @var array<int, string> $rows */
        $rows = Audit::query()
            ->select('event')
            ->distinct()
            ->orderBy('event')
            ->pluck('event')
            ->all();

        return $rows;
    }

    /**
     * @return array<int, string>
     */
    private function distinctModels(): array
    {
        return Audit::query()
            ->select('auditable_type')
            ->distinct()
            ->orderBy('auditable_type')
            ->pluck('auditable_type')
            ->map(fn ($v): string => class_basename((string) $v))
            ->all();
    }

    private function resolveUserLabel(string $type, int $id): ?string
    {
        if (! class_exists($type)) {
            return null;
        }
        try {
            /** @var Model|null $model */
            $model = $type::query()->find($id);
            if ($model === null) {
                return null;
            }
            $attrs = $model->getAttributes();

            return (string) ($attrs['name'] ?? $attrs['email'] ?? class_basename($type).'#'.$id);
        } catch (\Throwable) {
            return null;
        }
    }

    private function authorizePermission(string $permission): void
    {
        $admin = auth('admin')->user();
        if ($admin === null || ! method_exists($admin, 'can') || ! $admin->can($permission)) {
            abort(403);
        }
    }
}
