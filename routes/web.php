<?php

declare(strict_types=1);

use App\Http\Controllers\Account\DashboardController as AccountDashboardController;
use App\Http\Controllers\Account\LimitOrderController as AccountLimitOrderController;
use App\Http\Controllers\Account\RecurringController as AccountRecurringController;
use App\Http\Controllers\Account\SettingsController as AccountSettingsController;
use App\Http\Controllers\Account\TicketController as AccountTicketController;
use App\Http\Controllers\Account\TransactionController as AccountTransactionController;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\ApiManagementController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\CampaignController;
use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\TicketController as AdminTicketController;
use App\Http\Controllers\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\HelpController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Install\InstallController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\PreviewController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\UnsubscribeController;
use App\Http\Middleware\EnsureInstalled;
use Illuminate\Support\Facades\Route;

// Public storefront
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/preview', [PreviewController::class, 'show'])->name('preview');
Route::get('/p/{slug}', [PageController::class, 'show'])
    ->where('slug', '[a-z0-9-]+')
    ->name('page.show');
Route::get('/support', [SupportController::class, 'show'])->name('support');
Route::get('/tx/{providerId}', [HomeController::class, 'transaction'])->name('tx.show');
Route::post('/lang/{locale}', [HomeController::class, 'setLocale'])->name('lang.set');

// Signed unsubscribe link delivered inside campaign emails.
Route::get('/email/unsubscribe', [UnsubscribeController::class, 'show'])
    ->middleware('signed')
    ->name('email.unsubscribe');

// Help center + customer ticket portal
Route::get('/help', [HelpController::class, 'index'])->name('help.index');
Route::get('/help/category/{slug}', [HelpController::class, 'category'])->name('help.category');
Route::get('/help/article/{slug}', [HelpController::class, 'article'])->name('help.article');
Route::post('/help/lookup', [HelpController::class, 'lookup'])->name('help.lookup');
Route::get('/help/ticket/{ticket}/{token}', [HelpController::class, 'show'])->name('help.ticket');
Route::post('/help/ticket/{ticket}/{token}/reply', [HelpController::class, 'reply'])->name('help.ticket.reply');

// Customer authentication
Route::middleware('guest:web')->group(function (): void {
    Route::get('/sign-in', [AuthController::class, 'showLogin'])->name('auth.login.show');
    Route::post('/sign-in', [AuthController::class, 'login'])->name('auth.login');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('auth.register.show');
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::get('/forgot-password', [PasswordResetController::class, 'showForgot'])->name('auth.password.forgot');
    Route::post('/forgot-password', [PasswordResetController::class, 'sendLink'])->name('auth.password.email');
    Route::get('/reset-password/{token}', [PasswordResetController::class, 'showReset'])->name('auth.password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'reset'])->name('auth.password.update');
});
Route::post('/sign-out', [AuthController::class, 'logout'])->middleware('auth:web')->name('auth.logout');

// Customer account
Route::middleware('auth:web')->prefix('account')->name('account.')->group(function (): void {
    Route::get('/', [AccountDashboardController::class, 'index'])->name('dashboard');
    Route::get('/transactions', [AccountTransactionController::class, 'index'])->name('transactions');
    Route::get('/tickets', [AccountTicketController::class, 'index'])->name('tickets');
    Route::get('/settings', [AccountSettingsController::class, 'show'])->name('settings');
    Route::post('/settings/profile', [AccountSettingsController::class, 'updateProfile'])->name('settings.profile');
    Route::post('/settings/password', [AccountSettingsController::class, 'updatePassword'])->name('settings.password');

    Route::get('/limit-orders', [AccountLimitOrderController::class, 'index'])->name('limit-orders');
    Route::post('/limit-orders/{id}/cancel', [AccountLimitOrderController::class, 'cancel'])->whereNumber('id')->name('limit-orders.cancel');

    Route::get('/recurring', [AccountRecurringController::class, 'index'])->name('recurring');
    Route::post('/recurring/{id}/cancel', [AccountRecurringController::class, 'cancel'])->whereNumber('id')->name('recurring.cancel');
    Route::post('/recurring/{id}/pause', [AccountRecurringController::class, 'pause'])->whereNumber('id')->name('recurring.pause');
    Route::post('/recurring/{id}/resume', [AccountRecurringController::class, 'resume'])->whereNumber('id')->name('recurring.resume');
});

// Signed link from recurring-run email — pauses the next run without requiring sign-in.
Route::get('/account/recurring/{schedule}/skip', [AccountRecurringController::class, 'pauseSigned'])
    ->name('account.recurring.pause-signed');

// Installer (only reachable when not installed; EnsureInstalled middleware handles this)
Route::prefix('install')->withoutMiddleware([EnsureInstalled::class])->group(function (): void {
    Route::get('/', [InstallController::class, 'show'])->name('install.show');
    Route::post('/requirements', [InstallController::class, 'requirements'])->name('install.requirements');
    Route::post('/database', [InstallController::class, 'database'])->name('install.database');
    Route::post('/admin', [InstallController::class, 'admin'])->name('install.admin');
    Route::post('/branding', [InstallController::class, 'branding'])->name('install.branding');
    Route::post('/api', [InstallController::class, 'api'])->name('install.api');
    Route::post('/finalize', [InstallController::class, 'finalize'])->name('install.finalize');
});

// Admin area
Route::prefix('admin')->name('admin.')->group(function (): void {
    Route::middleware('guest:admin')->group(function (): void {
        Route::get('login', [AdminAuthController::class, 'show'])->name('login');
        Route::post('login', [AdminAuthController::class, 'login'])->name('login.attempt');
    });

    Route::middleware(['auth:admin', 'permission:admin.access'])->group(function (): void {
        Route::post('logout', [AdminAuthController::class, 'logout'])->name('logout');

        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('transactions', [AdminTransactionController::class, 'index'])->name('transactions.index');
        Route::get('transactions/stuck', [AdminTransactionController::class, 'stuck'])->name('transactions.stuck');
        Route::get('transactions/{tx}', [AdminTransactionController::class, 'show'])->name('transactions.show');
        Route::post('transactions/{tx}/refresh', [AdminTransactionController::class, 'refresh'])->name('transactions.refresh');
        Route::post('transactions/{tx}/flag', [AdminTransactionController::class, 'flag'])->name('transactions.flag');
        Route::get('transactions-export', [AdminTransactionController::class, 'export'])->name('transactions.export');

        Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
        Route::get('users/create', [AdminUserController::class, 'create'])->name('users.create');
        Route::post('users', [AdminUserController::class, 'store'])->name('users.store');
        Route::get('users/{user}', [AdminUserController::class, 'show'])->name('users.show');
        Route::get('users/{user}/edit', [AdminUserController::class, 'edit'])->name('users.edit');
        Route::put('users/{user}', [AdminUserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');
        Route::post('users/{user}/suspend', [AdminUserController::class, 'suspend'])->name('users.suspend');
        Route::post('users/{user}/restore', [AdminUserController::class, 'restore'])->name('users.restore');

        Route::get('tickets', [AdminTicketController::class, 'index'])->name('tickets.index');
        Route::get('tickets/{ticket}', [AdminTicketController::class, 'show'])->name('tickets.show');
        Route::post('tickets/{ticket}/reply', [AdminTicketController::class, 'reply'])->name('tickets.reply');
        Route::post('tickets/{ticket}/close', [AdminTicketController::class, 'close'])->name('tickets.close');

        Route::get('api-management', [ApiManagementController::class, 'index'])->name('api.index');
        Route::post('api-management', [ApiManagementController::class, 'update'])->name('api.update');
        Route::post('api-management/rotate', [ApiManagementController::class, 'rotate'])->name('api.rotate');

        Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::post('settings', [SettingsController::class, 'update'])->name('settings.update');
        Route::post('settings/logo', [SettingsController::class, 'uploadLogo'])->name('settings.logo.upload');
        Route::delete('settings/logo', [SettingsController::class, 'clearLogo'])->name('settings.logo.clear');
        Route::post('settings/test-chat', [SettingsController::class, 'testChat'])->name('settings.test_chat');
        Route::post('settings/mail/test', [SettingsController::class, 'testMail'])->name('settings.test_mail');

        Route::get('campaigns', [CampaignController::class, 'index'])->name('campaigns.index');
        Route::get('campaigns/create', [CampaignController::class, 'create'])->name('campaigns.create');
        Route::post('campaigns', [CampaignController::class, 'store'])->name('campaigns.store');
        Route::get('campaigns/{campaign}/edit', [CampaignController::class, 'edit'])->name('campaigns.edit');
        Route::put('campaigns/{campaign}', [CampaignController::class, 'update'])->name('campaigns.update');
        Route::delete('campaigns/{campaign}', [CampaignController::class, 'destroy'])->name('campaigns.destroy');
        Route::post('campaigns/{campaign}/send', [CampaignController::class, 'send'])->name('campaigns.send');

        Route::get('audit', [AuditLogController::class, 'index'])->name('audit.index');

        Route::get('pages', [App\Http\Controllers\Admin\PageController::class, 'index'])->name('pages.index');
        Route::get('pages/create', [App\Http\Controllers\Admin\PageController::class, 'create'])->name('pages.create');
        Route::post('pages', [App\Http\Controllers\Admin\PageController::class, 'store'])->name('pages.store');
        Route::get('pages/{page}/edit', [App\Http\Controllers\Admin\PageController::class, 'edit'])->name('pages.edit');
        Route::put('pages/{page}', [App\Http\Controllers\Admin\PageController::class, 'update'])->name('pages.update');
        Route::delete('pages/{page}', [App\Http\Controllers\Admin\PageController::class, 'destroy'])->name('pages.destroy');

        Route::get('content', [ContentController::class, 'index'])->name('content.index');
        Route::get('content/{key}', [ContentController::class, 'edit'])
            ->where('key', '[a-z_]+')
            ->name('content.edit');
        Route::post('content/{key}', [ContentController::class, 'update'])
            ->where('key', '[a-z_]+')
            ->name('content.update');
    });
});
