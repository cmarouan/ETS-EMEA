<?php

declare(strict_types=1);

namespace App\Tests\Controller;

use App\Document\Reservation;
use App\Document\TestSession;
use App\Document\User;
use DateTimeImmutable;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class ReservationControllerTest extends WebTestCase
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

    // Scenario 1: an authenticated user can reserve an available session and persist it.
    public function testSuccessfulReservationIsPersisted(): void
    {
        $this->createUser('reservation@example.com', 'password123!');
        $sessionId = $this->createSession('TEST-SESSION-001')->getId();
        $this->login('reservation@example.com', 'password123!');

        $this->client->jsonRequest('POST', '/api/reservations', ['sessionId' => $sessionId]);

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $responseData = $this->responseData();
        self::assertSame($sessionId, $responseData['sessionId']);
        self::assertSame(Reservation::STATUS_CONFIRMED, $responseData['status']);

        $user = $this->documentManager
            ->getRepository(User::class)
            ->findOneBy(['email' => 'reservation@example.com']);
        $session = $this->documentManager->find(TestSession::class, $sessionId);
        self::assertInstanceOf(User::class, $user);
        self::assertInstanceOf(TestSession::class, $session);

        $reservation = $this->documentManager
            ->getRepository(Reservation::class)
            ->findOneBy(['user' => $user, 'session' => $session]);

        self::assertInstanceOf(Reservation::class, $reservation);
        self::assertSame(4, $session->getRemainingSeats());
    }

    // Scenario 2: reserving the same session twice returns 409 and stores only one reservation.
    public function testDuplicateReservationIsRejected(): void
    {
        $this->createUser('duplicate@example.com', 'password123!');
        $sessionId = $this->createSession('TEST-SESSION-002')->getId();
        $this->login('duplicate@example.com', 'password123!');

        $this->client->jsonRequest('POST', '/api/reservations', ['sessionId' => $sessionId]);
        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);

        $this->client->jsonRequest('POST', '/api/reservations', ['sessionId' => $sessionId]);
        self::assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
        self::assertSame(
            'Vous avez déjà réservé cette session.',
            $this->responseData()['message'],
        );

        $user = $this->documentManager
            ->getRepository(User::class)
            ->findOneBy(['email' => 'duplicate@example.com']);
        $session = $this->documentManager->find(TestSession::class, $sessionId);
        self::assertInstanceOf(User::class, $user);
        self::assertInstanceOf(TestSession::class, $session);

        $reservationCount = $this->documentManager
            ->createQueryBuilder(Reservation::class)
            ->field('user')
            ->references($user)
            ->field('session')
            ->references($session)
            ->count()
            ->getQuery()
            ->execute();

        self::assertSame(1, (int) $reservationCount);
        self::assertSame(4, $session->getRemainingSeats());
    }

    // Scenario 3: a fully booked session returns 409 and creates no reservation.
    public function testCannotReserveFullyBookedSession(): void
    {
        $this->createUser('full@example.com', 'password123!');
        $sessionId = $this->createSession('TEST-SESSION-003', 0)->getId();
        $this->login('full@example.com', 'password123!');

        $this->client->jsonRequest('POST', '/api/reservations', ['sessionId' => $sessionId]);

        self::assertResponseStatusCodeSame(Response::HTTP_CONFLICT);
        self::assertSame('Cette session est complète.', $this->responseData()['message']);
        $reservationCount = $this->documentManager
            ->createQueryBuilder(Reservation::class)
            ->count()
            ->getQuery()
            ->execute();
        self::assertSame(0, (int) $reservationCount);

        $session = $this->documentManager->find(TestSession::class, $sessionId);
        self::assertInstanceOf(TestSession::class, $session);
        self::assertSame(0, $session->getRemainingSeats());
    }

    // Scenario 4: a user cannot cancel another user's reservation.
    public function testCannotCancelAnotherUsersReservation(): void
    {
        $userA = $this->createUser('user-a@example.com', 'password123!');
        $this->createUser('user-b@example.com', 'password123!');
        $session = $this->createSession('TEST-SESSION-004', 4);
        $reservation = (new Reservation())
            ->setUser($userA)
            ->setSession($session)
            ->setBookedAt(new DateTimeImmutable())
            ->setStatus(Reservation::STATUS_CONFIRMED);
        $this->documentManager->persist($reservation);
        $this->documentManager->flush();
        $reservationId = $reservation->getId();
        $sessionId = $session->getId();

        $this->login('user-b@example.com', 'password123!');
        $this->client->request('DELETE', '/api/reservations/'.$reservationId);

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);

        $persistedReservation = $this->documentManager->find(Reservation::class, $reservationId);
        $persistedSession = $this->documentManager->find(TestSession::class, $sessionId);
        self::assertInstanceOf(Reservation::class, $persistedReservation);
        self::assertSame(Reservation::STATUS_CONFIRMED, $persistedReservation->getStatus());
        self::assertInstanceOf(TestSession::class, $persistedSession);
        self::assertSame(4, $persistedSession->getRemainingSeats());
    }

    private function createUser(string $email, string $plainPassword): User
    {
        $user = (new User())
            ->setName('Test User')
            ->setEmail($email)
            ->setRole(User::ROLE_USER);
        $user->setPassword($this->passwordHasher->hashPassword($user, $plainPassword));

        $this->documentManager->persist($user);
        $this->documentManager->flush();

        return $user;
    }

    private function createSession(string $code, int $remainingSeats = 5): TestSession
    {
        $session = (new TestSession())
            ->setCode($code)
            ->setLanguage('English')
            ->setStartsAt(new DateTimeImmutable('+7 days'))
            ->setLocation('Test Center')
            ->setCapacity(10)
            ->setRemainingSeats($remainingSeats);

        $this->documentManager->persist($session);
        $this->documentManager->flush();

        return $session;
    }

    private function login(string $email, string $password): void
    {
        $this->client->jsonRequest('POST', '/api/login', [
            'email' => $email,
            'password' => $password,
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
