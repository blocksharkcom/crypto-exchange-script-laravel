<?php

declare(strict_types=1);

namespace App\Services\Chat\Exceptions;

class ChatRequestFailed extends \RuntimeException
{
    public function __construct(string $message = 'AI chat request failed.', int $code = 502)
    {
        parent::__construct($message, $code);
    }
}
