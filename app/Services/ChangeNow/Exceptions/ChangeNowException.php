<?php

declare(strict_types=1);

namespace App\Services\ChangeNow\Exceptions;

class ChangeNowException extends \RuntimeException
{
    public function __construct(string $message, int $code = 502, public readonly ?array $context = null)
    {
        parent::__construct($message, $code);
    }
}
