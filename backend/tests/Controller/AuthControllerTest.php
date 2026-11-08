<?php

declare(strict_types=1);

namespace App\Tests\Controller;

use App\Document\User;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class AuthControllerTest extends WebTestCase
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
        $this->clearUsers();
    }

    protected function tearDown(): void
    {
        $this->clearUsers();
        $this->documentManager->close();

        parent::tearDown();
    }

    // Scenario 1: a valid registration persists the user and hashes the password.
    public function testUserRegistrationPersistsUserWithHashedPassword(): void
    {
        $plainPassword = 'password123!';

        $this->client->jsonRequest('POST', '/api/register', [
            'name' => 'Test User',
            'email' => 'test.user@example.com',
            'password' => $plainPassword,
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_CREATED);
        self::assertResponseFormatSame('json');
        $responseData = $this->responseData();
        self::assertSame('Test User', $responseData['name']);
        self::assertSame('test.user@example.com', $responseData['email']);
        self::assertSame(User::ROLE_USER, $responseData['role']);

        $user = $this->documentManager
            ->getRepository(User::class)
            ->findOneBy(['email' => 'test.user@example.com']);

        self::assertInstanceOf(User::class, $user);
        self::assertNotSame($plainPassword, $user->getPassword());
        // password hasher recognizes the original password
        self::assertTrue($this->passwordHasher->isPasswordValid($user, $plainPassword));
    }

    // Scenario 2: valid credentials return a successful response containing the JWT cookie.
    public function testUserCanLoginAndReceivesJwtCookie(): void
    {
        $user = (new User())
            ->setName('Test User')
            ->setEmail('login@example.com')
            ->setRole(User::ROLE_USER);
        $user->setPassword($this->passwordHasher->hashPassword($user, 'password123!'));
        $this->documentManager->persist($user);
        $this->documentManager->flush();

        $this->client->jsonRequest('POST', '/api/login', [
            'email' => 'login@example.com',
            'password' => 'password123!',
        ]);

        self::assertResponseIsSuccessful();
        $cookie = $this->client->getCookieJar()->get('AUTH_TOKEN');

        self::assertNotNull($cookie);
        self::assertNotSame('', $cookie->getValue());
        self::assertCount(3, explode('.', $cookie->getValue()), 'The cookie must contain a JWT.');
    }

    // Scenario 3: a protected API endpoint rejects a request without a JWT.
    public function testProtectedRouteWithoutJwtReturnsUnauthorized(): void
    {
        $this->client->request('GET', '/api/me');

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
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

    private function clearUsers(): void
    {
        $this->documentManager
            ->createQueryBuilder(User::class)
            ->remove()
            ->getQuery()
            ->execute();
        $this->documentManager->clear();
    }
}
