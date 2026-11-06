<?php

declare(strict_types=1);

namespace App\Document;

use DateTimeImmutable;
use Doctrine\ODM\MongoDB\Mapping\Attribute as ODM;
use Symfony\Component\Validator\Constraints as Assert;

#[ODM\Document(collection: 'reservations')]
#[ODM\UniqueIndex(keys: ['user' => 'asc', 'session' => 'asc'])]
class Reservation
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUSES = [self::STATUS_PENDING, self::STATUS_CONFIRMED];

    #[ODM\Id]
    private ?string $id = null;

    #[ODM\ReferenceOne(targetDocument: User::class, storeAs: 'id')]
    #[Assert\NotNull]
    private User $user;

    #[ODM\ReferenceOne(targetDocument: TestSession::class, storeAs: 'id')]
    #[Assert\NotNull]
    private TestSession $session;

    #[ODM\Field(type: 'date_immutable')]
    #[Assert\NotNull]
    private DateTimeImmutable $bookedAt;

    #[ODM\Field(type: 'string')]
    #[Assert\Choice(choices: self::STATUSES)]
    private string $status = self::STATUS_PENDING;

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getSession(): TestSession
    {
        return $this->session;
    }

    public function setSession(TestSession $session): self
    {
        $this->session = $session;

        return $this;
    }

    public function getBookedAt(): DateTimeImmutable
    {
        return $this->bookedAt;
    }

    public function setBookedAt(DateTimeImmutable $bookedAt): self
    {
        $this->bookedAt = $bookedAt;

        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;

        return $this;
    }
}
