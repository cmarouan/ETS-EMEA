<?php

declare(strict_types=1);

namespace App\Dto;

use DateTimeImmutable;
use Symfony\Component\Validator\Constraints as Assert;

final readonly class CreateSessionRequest
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Length(max: 50)]
        public string $code,
        #[Assert\NotBlank]
        #[Assert\Length(max: 50)]
        public string $language,
        #[Assert\NotNull]
        #[Assert\GreaterThan('now')]
        public DateTimeImmutable $startsAt,
        #[Assert\NotBlank]
        #[Assert\Length(max: 180)]
        public string $location,
        #[Assert\Positive]
        public int $capacity,
        #[Assert\PositiveOrZero]
        #[Assert\LessThanOrEqual(propertyPath: 'capacity')]
        public int $remainingSeats,
    ) {
    }
}
