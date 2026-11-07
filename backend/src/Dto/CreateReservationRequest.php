<?php

declare(strict_types=1);

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final readonly class CreateReservationRequest
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Regex(pattern: '/^[a-f0-9]{24}$/', message: 'The session ID is invalid.')]
        public string $sessionId,
    ) {
    }
}
