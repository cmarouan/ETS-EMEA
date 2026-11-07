<?php

declare(strict_types=1);

namespace App\Controller;

use App\Document\Reservation;
use App\Document\TestSession;
use App\Document\User;
use App\Dto\CreateReservationRequest;
use DateTimeImmutable;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class ReservationController extends AbstractController
{
    #[Route('/api/reservations', name: 'api_reservations_list', methods: ['GET'])]
    public function list(
        #[CurrentUser] User $user,
        DocumentManager $documentManager,
    ): JsonResponse {
        $reservations = $documentManager
            ->getRepository(Reservation::class)
            ->findBy(['user' => $user], ['bookedAt' => 'desc']);

        $data = [];

        foreach ($reservations as $reservation) {
            if ($reservation instanceof Reservation) {
                $data[] = $this->reservationData($reservation);
            }
        }

        return $this->json($data);
    }

    #[Route('/api/reservations', name: 'api_reservations_create', methods: ['POST'])]
    public function create(
        #[CurrentUser] User $user,
        #[MapRequestPayload] CreateReservationRequest $request,
        DocumentManager $documentManager,
    ): JsonResponse {
        $session = $documentManager->find(TestSession::class, $request->sessionId);

        if (!$session instanceof TestSession) {
            throw $this->createNotFoundException('Session not found.');
        }

        if ($session->getStartsAt() <= new DateTimeImmutable()) {
            return $this->json(
                ['message' => 'Cette session a déjà commencé.'],
                Response::HTTP_CONFLICT,
            );
        }

        $existingReservation = $documentManager
            ->getRepository(Reservation::class)
            ->findOneBy(['user' => $user, 'session' => $session]);

        if ($existingReservation instanceof Reservation) {
            return $this->json(
                ['message' => 'Vous avez déjà réservé cette session.'],
                Response::HTTP_CONFLICT,
            );
        }

        if ($session->getRemainingSeats() < 1) {
            return $this->json(
                ['message' => 'Cette session est complète.'],
                Response::HTTP_CONFLICT,
            );
        }

        $reservation = (new Reservation())
            ->setUser($user)
            ->setSession($session)
            ->setBookedAt(new DateTimeImmutable())
            ->setStatus(Reservation::STATUS_CONFIRMED);

        $session->setRemainingSeats($session->getRemainingSeats() - 1);
        $documentManager->persist($reservation);
        $documentManager->flush();

        return $this->json($this->reservationData($reservation), Response::HTTP_CREATED);
    }

    #[Route(
        '/api/reservations/{id}',
        name: 'api_reservations_cancel',
        requirements: ['id' => '[a-f0-9]{24}'],
        methods: ['DELETE'],
    )]
    public function cancel(
        string $id,
        #[CurrentUser] User $user,
        DocumentManager $documentManager,
    ): Response {
        $reservation = $documentManager
            ->getRepository(Reservation::class)
            ->findOneBy(['id' => $id, 'user' => $user]);

        if (!$reservation instanceof Reservation) {
            throw $this->createNotFoundException('Reservation not found.');
        }

        $session = $reservation->getSession();
        $session->setRemainingSeats(min(
            $session->getCapacity(),
            $session->getRemainingSeats() + 1,
        ));

        $documentManager->remove($reservation);
        $documentManager->flush();

        return new Response(status: Response::HTTP_NO_CONTENT);
    }

    /**
     * @return array{
     *     id: string|null,
     *     sessionId: string|null,
     *     status: string,
     *     bookedAt: string,
     *     exam: string,
     *     language: string,
     *     startsAt: string,
     *     location: string
     * }
     */
    private function reservationData(Reservation $reservation): array
    {
        $session = $reservation->getSession();

        return [
            'id' => $reservation->getId(),
            'sessionId' => $session->getId(),
            'status' => $reservation->getStatus(),
            'bookedAt' => $reservation->getBookedAt()->format(DATE_ATOM),
            'exam' => $session->getCode(),
            'language' => $session->getLanguage(),
            'startsAt' => $session->getStartsAt()->format(DATE_ATOM),
            'location' => $session->getLocation(),
        ];
    }
}
