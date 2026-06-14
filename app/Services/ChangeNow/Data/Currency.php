<?php

declare(strict_types=1);

namespace App\Services\ChangeNow\Data;

final readonly class Currency
{
    public function __construct(
        public string $ticker,
        public string $name,
        public string $image,
        public ?string $network = null,
        public bool $hasExternalId = false,
        public bool $isFiat = false,
        public bool $isStable = false,
        public ?string $tokenContract = null,
        public bool $featured = false,
    ) {}

    /** @param array<string, mixed> $row */
    public static function fromArray(array $row, bool $featured = false): self
    {
        return new self(
            ticker: strtolower((string) ($row['ticker'] ?? '')),
            name: (string) ($row['name'] ?? strtoupper((string) ($row['ticker'] ?? ''))),
            image: (string) ($row['image'] ?? ''),
            network: $row['network'] ?? null,
            hasExternalId: (bool) ($row['hasExternalId'] ?? false),
            isFiat: (bool) ($row['isFiat'] ?? false),
            isStable: (bool) ($row['isStable'] ?? false),
            tokenContract: $row['tokenContract'] ?? null,
            featured: $featured,
        );
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'ticker' => $this->ticker,
            'name' => $this->name,
            'image' => $this->image,
            'network' => $this->network,
            'has_extra' => $this->hasExternalId,
            'is_fiat' => $this->isFiat,
            'is_stable' => $this->isStable,
            'token_contract' => $this->tokenContract,
            'featured' => $this->featured,
        ];
    }
}
