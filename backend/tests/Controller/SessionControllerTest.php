<?php

declare(strict_types=1);

namespace App\Tests\Controller;

use App\Document\Reservation;
use App\Document\TestSession;
use App\Document\User;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class SessionControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private DocumentManager $documentManager;
    private UserPasswordHasherInterface $passwordHasher;

    protected function setUp(): void
    {
        $this->client = self::createClient();
        $this->client->disableReboot();
        $container = self::getContainer();
        $this->documentManager = $container->get(DocumentManager::class);
        $this->passwordHasher = $container->get(UserPasswordHasherInterface::class);
        $this->clearDatabase();
    }

    protected function tearDown(): void
    {
        $this->clearDatabase();
        $this->documentManager->close();

        parent::tearDown();
    }

    // Scenario 1: invalid session data returns 422 and is not persisted.
    public function testCannotCreateSessionWithInvalidData(): void
    {
        $this->createAdmin();
        $this->login();

        $this->client->jsonRequest('POST', '/api/sessions', [
            'code' => '',
            'language' => '',
            'startsAt' => '2020-01-01T09:00:00+00:00',
            'location' => '',
            'capacity' => -1,
            'remainingSeats' => -1,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
        $responseData = $this->responseData();
        self::assertArrayHasKey('violations', $responseData);
        self::assertNotEmpty($responseData['violations']);
        $sessionCount = $this->documentManager
            ->createQueryBuilder(TestSession::class)
            ->count()
            ->getQuery()
            ->execute();
        self::assertSame(0, (int) $sessionCount);
    }

    private function createAdmin(): void
    {
        $admin = (new User())
            ->setName('Test Admin')
            ->setEmail('admin@example.com')
            ->setRole(User::ROLE_ADMIN);
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'password123!'));

        $this->documentManager->persist($admin);
        $this->documentManager->flush();
    }

    private function login(): void
    {
        $this->client->jsonRequest('POST', '/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password123!',
        ]);
        self::assertResponseIsSuccessful();
    }

    /**
     * @return array<string, mixed>
     */
    private function responseData(): array
    {
        $content = $this->client->getResponse()->getContent();
        self::assertNotFalse($content);

        $data = json_decode($content, true, flags: JSON_THROW_ON_ERROR);
        self::assertIsArray($data);

        return $data;
    }

    private function clearDatabase(): void
    {
        foreach ([Reservation::class, TestSession::class, User::class] as $documentClass) {
            $this->documentManager
                ->createQueryBuilder($documentClass)
                ->remove()
                ->getQuery()
                ->execute();
        }

        $this->documentManager->clear();
    }
}
