<?php

declare(strict_types=1);

namespace App\Services\Chat\Exceptions;

class ChatNotConfigured extends \RuntimeException
{
    public function __construct(string $message = 'AI chat is not configured.', int $code = 503)
    {
        parent::__construct($message, $code);
    }
}
