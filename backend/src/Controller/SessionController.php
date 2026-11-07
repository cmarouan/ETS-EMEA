<?php

declare(strict_types=1);

namespace App\Controller;

use App\Document\TestSession;
use App\Dto\SessionListQuery;
use DateTimeImmutable;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryString;
use Symfony\Component\Routing\Attribute\Route;

final class SessionController extends AbstractController
{
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

            $data[] = [
                'id' => $session->getId(),
                'code' => $session->getCode(),
                'language' => $session->getLanguage(),
                'startsAt' => $session->getStartsAt()->format(DATE_ATOM),
                'location' => $session->getLocation(),
                'capacity' => $session->getCapacity(),
                'remainingSeats' => $session->getRemainingSeats(),
            ];
        }

        return $this->json([
            'data' => $data,
            'page' => $query->page,
            'limit' => $query->limit,
            'totalItems' => $totalItems,
            'totalPages' => (int) ceil($totalItems / $query->limit),
        ]);
    }
}
