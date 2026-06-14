<?php

declare(strict_types=1);

namespace App\Models;

use App\Notifications\ResetPasswordNotification;
use Illuminate\Contracts\Auth\CanResetPassword;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * Storefront user — authenticated customer account.
 *
 * @property int $id
 * @property string|null $email
 * @property string|null $name
 * @property string|null $password
 * @property string|null $country
 * @property string|null $ip
 * @property string|null $locale
 * @property bool $marketing_opt_in
 * @property Carbon|null $email_verified_at
 * @property Carbon|null $last_seen_at
 */
class User extends Authenticatable implements CanResetPassword
{
    use Notifiable;

    /** @var list<string> */
    protected $fillable = [
        'email', 'name', 'password', 'locale', 'country', 'ip', 'user_agent',
        'marketing_opt_in', 'last_seen_at', 'suspended_at', 'suspended_reason',
    ];

    /** @var list<string> */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'marketing_opt_in' => 'bool',
            'last_seen_at' => 'datetime',
            'email_verified_at' => 'datetime',
            'suspended_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isSuspended(): bool
    {
        return $this->suspended_at !== null;
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    public function limitOrders(): HasMany
    {
        return $this->hasMany(LimitOrder::class);
    }

    public function recurringSchedules(): HasMany
    {
        return $this->hasMany(RecurringSchedule::class);
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
