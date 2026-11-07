<?php

declare(strict_types=1);

namespace App\Controller;

use App\Document\Reservation;
use App\Document\TestSession;
use App\Dto\CreateSessionRequest;
use App\Dto\SessionListQuery;
use App\Dto\UpdateSessionRequest;
use DateTimeImmutable;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryString;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

final class SessionController extends AbstractController
{
    #[IsGranted('ROLE_ADMIN')]
    #[Route('/api/sessions', name: 'api_sessions_create', methods: ['POST'])]
    public function create(
        #[MapRequestPayload] CreateSessionRequest $request,
        DocumentManager $documentManager,
    ): JsonResponse {
        $code = trim($request->code);
        $existingSession = $documentManager->getRepository(TestSession::class)->findOneBy(['code' => $code]);

        if ($existingSession instanceof TestSession) {
            return $this->json(
                ['message' => 'Une session existe déjà avec ce code.'],
                Response::HTTP_CONFLICT,
            );
        }

        $session = (new TestSession())
            ->setCode($code)
            ->setLanguage($request->language)
            ->setStartsAt($request->startsAt)
            ->setLocation($request->location)
            ->setCapacity($request->capacity)
            ->setRemainingSeats($request->remainingSeats);

        $documentManager->persist($session);
        $documentManager->flush();

        return $this->json($this->sessionData($session), Response::HTTP_CREATED);
    }

    #[Route('/api/sessions', name: 'api_sessions_list', methods: ['GET'])]
    public function list(
        #[MapQueryString(validationFailedStatusCode: Response::HTTP_UNPROCESSABLE_ENTITY)]
        SessionListQuery $query,
        DocumentManager $documentManager,
    ): JsonResponse {
        $repository = $documentManager->getRepository(TestSession::class);
        $now = new DateTimeImmutable();

        $totalItems = (int) $repository
            ->createQueryBuilder()
            ->field('startsAt')
            ->gte($now)
            ->count()
            ->getQuery()
            ->execute();

        $sessions = $repository
            ->createQueryBuilder()
            ->field('startsAt')
            ->gte($now)
            ->sort('startsAt', 'asc')
            ->skip(($query->page - 1) * $query->limit)
            ->limit($query->limit)
            ->getQuery()
            ->execute();

        $data = [];

        foreach ($sessions as $session) {
            if (!$session instanceof TestSession) {
                continue;
            }

            $data[] = $this->sessionData($session);
        }

        return $this->json([
            'data' => $data,
            'page' => $query->page,
            'limit' => $query->limit,
            'totalItems' => $totalItems,
            'totalPages' => (int) ceil($totalItems / $query->limit),
        ]);
    }

    #[IsGranted('ROLE_ADMIN')]
    #[Route(
        '/api/sessions/{id}',
        name: 'api_sessions_update',
        requirements: ['id' => '[a-f0-9]{24}'],
        methods: ['PUT'],
    )]
    public function update(
        string $id,
        #[MapRequestPayload] UpdateSessionRequest $request,
        DocumentManager $documentManager,
    ): JsonResponse {
        $session = $documentManager->find(TestSession::class, $id);

        if (!$session instanceof TestSession) {
            throw $this->createNotFoundException('Session not found.');
        }

        $code = trim($request->code);
        $existingSession = $documentManager->getRepository(TestSession::class)->findOneBy(['code' => $code]);

        if ($existingSession instanceof TestSession && $existingSession->getId() !== $session->getId()) {
            return $this->json(
                ['message' => 'Une session existe déjà avec ce code.'],
                Response::HTTP_CONFLICT,
            );
        }

        $session
            ->setCode($code)
            ->setLanguage($request->language)
            ->setStartsAt($request->startsAt)
            ->setLocation($request->location)
            ->setCapacity($request->capacity)
            ->setRemainingSeats($request->remainingSeats);

        $documentManager->flush();

        return $this->json($this->sessionData($session));
    }

    #[IsGranted('ROLE_ADMIN')]
    #[Route(
        '/api/sessions/{id}',
        name: 'api_sessions_delete',
        requirements: ['id' => '[a-f0-9]{24}'],
        methods: ['DELETE'],
    )]
    public function delete(string $id, DocumentManager $documentManager): Response
    {
        $session = $documentManager->find(TestSession::class, $id);

        if (!$session instanceof TestSession) {
            throw $this->createNotFoundException('Session not found.');
        }

        $reservationCount = (int) $documentManager
            ->createQueryBuilder(Reservation::class)
            ->field('session')
            ->references($session)
            ->count()
            ->getQuery()
            ->execute();

        if ($reservationCount > 0) {
            return $this->json(
                ['message' => 'Cette session ne peut pas être supprimée car elle possède des réservations.'],
                Response::HTTP_CONFLICT,
            );
        }

        $documentManager->remove($session);
        $documentManager->flush();

        return new Response(status: Response::HTTP_NO_CONTENT);
    }

    /**
     * @return array{
     *     id: string|null,
     *     code: string,
     *     language: string,
     *     startsAt: string,
     *     location: string,
     *     capacity: int,
     *     remainingSeats: int
     * }
     */
    private function sessionData(TestSession $session): array
    {
        return [
            'id' => $session->getId(),
            'code' => $session->getCode(),
            'language' => $session->getLanguage(),
            'startsAt' => $session->getStartsAt()->format(DATE_ATOM),
            'location' => $session->getLocation(),
            'capacity' => $session->getCapacity(),
            'remainingSeats' => $session->getRemainingSeats(),
        ];
    }
}
