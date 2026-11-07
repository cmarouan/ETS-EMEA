<?php

declare(strict_types=1);

namespace App\Command;

use App\Document\Reservation;
use App\Document\TestSession;
use App\Document\User;
use DateTimeImmutable;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(name: 'app:seed', description: 'Create idempotent development data.')]
final class SeedDevelopmentDataCommand extends Command
{
    public function __construct(
        private readonly DocumentManager $documentManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->normalizeExistingUserRoles();
        $admin = $this->upsertUser('Admin', 'admin@ets-emea.test', 'admin', User::ROLE_ADMIN);
        $user = $this->upsertUser('User', 'user@ets-emea.test', 'user', User::ROLE_USER);
        $sessions = $this->upsertSessions();
        $this->documentManager->flush();

        $this->upsertReservation($admin, $sessions[0], Reservation::STATUS_CONFIRMED);
        $this->upsertReservation($user, $sessions[1], Reservation::STATUS_PENDING);

        $this->documentManager->flush();
        $this->documentManager->getSchemaManager()->ensureIndexes();

        $output->writeln('<info>Development data is ready.</info>');
        $output->writeln('Admin: admin@ets-emea.test / admin');
        $output->writeln('User: user@ets-emea.test / user');

        return Command::SUCCESS;
    }

    private function normalizeExistingUserRoles(): void
    {
        foreach ($this->documentManager->getRepository(User::class)->findAll() as $user) {
            if (!$user instanceof User) {
                continue;
            }

            $user->setRole(
                $user->getEmail() === 'admin@ets-emea.test' ? User::ROLE_ADMIN : User::ROLE_USER,
            );
        }
    }

    private function upsertUser(string $name, string $email, string $plainPassword, string $role): User
    {
        $repository = $this->documentManager->getRepository(User::class);
        $user = $repository->findOneBy(['email' => $email]) ?? new User();

        $user->setName($name)->setEmail($email)->setRole($role);
        $user->setPassword($this->passwordHasher->hashPassword($user, $plainPassword));
        $this->documentManager->persist($user);

        return $user;
    }

    /**
     * @return list<TestSession>
     */
    private function upsertSessions(): array
    {
        $today = new DateTimeImmutable('today');
        $definitions = [
            ['ETS-EN-001', 'English', $today->modify('+7 days')->setTime(9, 0), 'Casablanca - Maarif', 24, 12],
            ['ETS-FR-001', 'French', $today->modify('+10 days')->setTime(14, 0), 'Rabat - Agdal', 18, 4],
            ['ETS-EN-002', 'English', $today->modify('+14 days')->setTime(9, 30), 'Casablanca - CFC', 16, 8],
            ['ETS-FR-002', 'French', $today->modify('+17 days')->setTime(10, 0), 'Marrakech - Gueliz', 20, 15],
            ['ETS-EN-003', 'English', $today->modify('+21 days')->setTime(13, 0), 'Rabat - Agdal', 12, 2],
            ['ETS-FR-003', 'French', $today->modify('+24 days')->setTime(9, 0), 'Casablanca - Maarif', 24, 19],
            ['ETS-EN-004', 'English', $today->modify('+28 days')->setTime(14, 30), 'Tangier - Centre', 18, 7],
            ['ETS-FR-004', 'French', $today->modify('+31 days')->setTime(11, 0), 'Casablanca - CFC', 16, 1],
            ['ETS-EN-005', 'English', $today->modify('+35 days')->setTime(9, 30), 'Marrakech - Gueliz', 20, 20],
            ['ETS-FR-005', 'French', $today->modify('+38 days')->setTime(15, 0), 'Rabat - Agdal', 14, 6],
            ['ETS-EN-006', 'English', $today->modify('+42 days')->setTime(10, 0), 'Agadir - Centre', 22, 3],
            ['ETS-FR-006', 'French', $today->modify('+45 days')->setTime(13, 30), 'Tangier - Centre', 18, 0],
            ['ETS-EN-007', 'English', $today->modify('+49 days')->setTime(9, 0), 'Casablanca - Maarif', 24, 10],
            ['ETS-FR-007', 'French', $today->modify('+52 days')->setTime(14, 0), 'Agadir - Centre', 16, 9],
            ['ETS-EN-008', 'English', $today->modify('+56 days')->setTime(11, 30), 'Rabat - Agdal', 12, 5],
        ];

        $repository = $this->documentManager->getRepository(TestSession::class);
        $sessions = [];

        foreach ($definitions as [$code, $language, $startsAt, $location, $capacity, $remainingSeats]) {
            $session = $repository->findOneBy(['code' => $code]) ?? new TestSession();
            $session
                ->setCode($code)
                ->setLanguage($language)
                ->setStartsAt($startsAt)
                ->setLocation($location)
                ->setCapacity($capacity)
                ->setRemainingSeats($remainingSeats);

            $this->documentManager->persist($session);
            $sessions[] = $session;
        }

        return $sessions;
    }

    private function upsertReservation(User $user, TestSession $session, string $status): void
    {
        $repository = $this->documentManager->getRepository(Reservation::class);
        $reservation = $repository->findOneBy(['user' => $user, 'session' => $session]) ?? new Reservation();
        $reservation
            ->setUser($user)
            ->setSession($session)
            ->setBookedAt(new DateTimeImmutable())
            ->setStatus($status);

        $this->documentManager->persist($reservation);
    }
}
