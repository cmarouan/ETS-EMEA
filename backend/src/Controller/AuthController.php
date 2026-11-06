<?php

declare(strict_types=1);

namespace App\Controller;

use App\Document\User;
use App\Dto\RegisterRequest;
use App\Dto\UpdateAccountRequest;
use Doctrine\ODM\MongoDB\DocumentManager;
use Lexik\Bundle\JWTAuthenticationBundle\Security\Http\Authentication\AuthenticationSuccessHandler;
use LogicException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class AuthController extends AbstractController
{
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(): never
    {
        throw new LogicException('This route is handled by the security firewall.');
    }

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        #[MapRequestPayload] RegisterRequest $request,
        DocumentManager $documentManager,
        UserPasswordHasherInterface $passwordHasher,
    ): JsonResponse {
        $email = mb_strtolower(trim($request->email));
        $existingUser = $documentManager->getRepository(User::class)->findOneBy(['email' => $email]);

        if ($existingUser instanceof User) {
            return $this->json(
                ['message' => 'Un compte existe déjà avec cette adresse e-mail.'],
                Response::HTTP_CONFLICT,
            );
        }

        $user = (new User())
            ->setName($request->name)
            ->setEmail($email)
            ->setRole(User::ROLE_USER);
        $user->setPassword($passwordHasher->hashPassword($user, $request->password));

        $documentManager->persist($user);
        $documentManager->flush();

        return $this->json($this->userData($user), Response::HTTP_CREATED);
    }

    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->authenticatedUser();

        return $this->json($this->userData($user));
    }

    #[Route('/api/me', name: 'api_me_update', methods: ['PUT'])]
    public function updateAccount(
        #[MapRequestPayload] UpdateAccountRequest $request,
        DocumentManager $documentManager,
        AuthenticationSuccessHandler $authenticationSuccessHandler,
    ): Response {
        $user = $this->authenticatedUser();
        $email = mb_strtolower(trim($request->email));
        $existingUser = $documentManager->getRepository(User::class)->findOneBy(['email' => $email]);

        if ($existingUser instanceof User && $existingUser->getId() !== $user->getId()) {
            return $this->json(
                ['message' => 'Un compte existe déjà avec cette adresse e-mail.'],
                Response::HTTP_CONFLICT,
            );
        }

        $user
            ->setName($request->name)
            ->setEmail($email);

        $documentManager->flush();

        // The email is the JWT user identifier, so issue a fresh cookie after it changes.
        return $authenticationSuccessHandler->handleAuthenticationSuccess(
            $user,
            data: ['user' => $this->userData($user)],
        );
    }

    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        $response = $this->json(['message' => 'Logged out.']);
        $response->headers->clearCookie('AUTH_TOKEN', '/', null, false, true, 'lax');

        return $response;
    }

    private function authenticatedUser(): User
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            throw $this->createAccessDeniedException();
        }

        return $user;
    }

    /**
     * @return array{id: string|null, name: string, email: string, role: string}
     */
    private function userData(User $user): array
    {
        return [
            'id' => $user->getId(),
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'role' => $user->getRole(),
        ];
    }
}
