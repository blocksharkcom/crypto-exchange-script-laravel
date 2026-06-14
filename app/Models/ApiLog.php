<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiLog extends Model
{
    protected $table = 'api_log';

    public $timestamps = false;

    protected $fillable = [
        'endpoint', 'method', 'ip', 'duration_ms', 'status_code', 'error', 'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}
