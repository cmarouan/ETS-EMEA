<?php

declare(strict_types=1);

namespace App\Document;

use DateTimeImmutable;
use Doctrine\ODM\MongoDB\Mapping\Attribute as ODM;
use Symfony\Component\Validator\Constraints as Assert;

#[ODM\Document(collection: 'sessions')]
#[ODM\UniqueIndex(keys: ['code' => 'asc'])]
class TestSession
{
    #[ODM\Id]
    private ?string $id = null;

    #[ODM\Field(type: 'string')]
    #[Assert\NotBlank]
    private string $code = '';

    #[ODM\Field(type: 'string')]
    #[Assert\NotBlank]
    private string $language = '';

    #[ODM\Field(type: 'date_immutable')]
    #[Assert\NotNull]
    #[Assert\GreaterThan('now')]
    private DateTimeImmutable $startsAt;

    #[ODM\Field(type: 'string')]
    #[Assert\NotBlank]
    private string $location = '';

    #[ODM\Field(type: 'int')]
    #[Assert\Positive]
    private int $capacity = 0;

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getCode(): string
    {
        return $this->code;
    }

    public function setCode(string $code): self
    {
        $this->code = trim($code);

        return $this;
    }

    public function getLanguage(): string
    {
        return $this->language;
    }

    public function setLanguage(string $language): self
    {
        $this->language = trim($language);

        return $this;
    }

    public function getStartsAt(): DateTimeImmutable
    {
        return $this->startsAt;
    }

    public function setStartsAt(DateTimeImmutable $startsAt): self
    {
        $this->startsAt = $startsAt;

        return $this;
    }

    public function getLocation(): string
    {
        return $this->location;
    }

    public function setLocation(string $location): self
    {
        $this->location = trim($location);

        return $this;
    }

    public function getCapacity(): int
    {
        return $this->capacity;
    }

    public function setCapacity(int $capacity): self
    {
        $this->capacity = $capacity;

        return $this;
    }
}
