# ⚙️ ETS EMEA Backend

Symfony REST API for the ETS EMEA language test reservation platform. It manages users,
cookie-based JWT authentication, test sessions, reservations, validation, and MongoDB persistence.

For complete project and Docker setup instructions, see the [root README](../README.md).

## 🗂️ Structure

```text
backend/
├── config/
│   ├── packages/          Symfony, Security, JWT, CORS and Doctrine configuration
│   └── routes/            Framework and security route configuration
├── src/
│   ├── Command/           Idempotent development data seeding
│   ├── Controller/        REST endpoints and HTTP coordination
│   ├── Document/          Doctrine MongoDB ODM documents
│   └── Dto/               Validated request and query data
├── tests/Controller/      PHPUnit functional API tests
├── docker/                Apache, environment and entrypoint configuration
├── Dockerfile             Backend development image
└── composer.json          PHP dependencies and project configuration
```

## 🏗️ Architecture choice

The backend follows Symfony's conventional layered approach:

```text
HTTP request
    → Controller
    → Validated DTO
    → Doctrine MongoDB ODM
    → MongoDB document
```

- Controllers receive requests and coordinate simple application logic.
- DTOs bind and validate request or query data.
- Symfony Security handles authentication and role-based authorization.
- Doctrine MongoDB ODM manages documents and persistence.
- PHPUnit functional tests verify behavior through real HTTP requests.

DDD, Hexagonal Architecture, and full Clean Architecture were intentionally not introduced. This
is a small technical project with straightforward business rules, so adding domain, application,
port, adapter, and repository abstraction layers would make the code harder to follow without
providing a practical benefit.

If the project grows and its business rules become more complex, logic can be moved from
controllers into focused application services, repository interfaces, and domain objects.

## 🧰 Main technologies

- PHP 8.5
- Symfony 8.1
- MongoDB 8.0
- Doctrine MongoDB ODM Bundle
- Symfony Security
- LexikJWTAuthenticationBundle
- NelmioCorsBundle
- Symfony Validator and Serializer
- PHPUnit 13.4
- Apache and Docker

## 🔐 Authentication and authorization

Authentication uses a JWT stored in the HTTP-only `AUTH_TOKEN` cookie.

- `/api/login`, `/api/register`, and `/api/logout` are public.
- Other `/api` routes require an authenticated user.
- Session creation, update, and deletion require `ROLE_ADMIN` through `#[IsGranted]`.
- Reservation operations are available to authenticated users and administrators.
- Reservation queries and cancellation are restricted to the authenticated user's own data.

User roles are stored as `USER` or `ADMIN` and exposed to Symfony Security as `ROLE_USER` or
`ROLE_ADMIN`.

## 🔌 Main API routes

| Method   | Route                    | Access        | Purpose                                |
| -------- | ------------------------ | ------------- | -------------------------------------- |
| `POST`   | `/api/register`          | Public        | Register a user                        |
| `POST`   | `/api/login`             | Public        | Authenticate and create the JWT cookie |
| `POST`   | `/api/logout`            | Public        | Clear the JWT cookie                   |
| `GET`    | `/api/me`                | Authenticated | Get account information                |
| `PUT`    | `/api/me`                | Authenticated | Update account information             |
| `GET`    | `/api/sessions`          | Authenticated | List future sessions with pagination   |
| `POST`   | `/api/sessions`          | Administrator | Create a session                       |
| `PUT`    | `/api/sessions/{id}`     | Administrator | Update a session                       |
| `DELETE` | `/api/sessions/{id}`     | Administrator | Delete a session                       |
| `GET`    | `/api/reservations`      | Authenticated | List the current user's reservations   |
| `POST`   | `/api/reservations`      | Authenticated | Reserve a session                      |
| `DELETE` | `/api/reservations/{id}` | Owner         | Cancel a reservation                   |

## ⚙️ Environment configuration

Local Docker values are stored in [`docker/dev.env`](./docker/dev.env).

```env
APP_ENV=dev
APP_DEBUG=1
APP_SECRET=development-only-secret
MONGODB_URI=mongodb://database:27017
MONGODB_DB=ets_emea
JWT_SECRET_KEY=/var/lib/jwt/private.pem
JWT_PUBLIC_KEY=/var/lib/jwt/public.pem
JWT_PASSPHRASE=development-only-passphrase
JWT_COOKIE_SECURE=0
CORS_ALLOW_ORIGIN='^http://(localhost|127\.0\.0\.1):3000$'
```

The committed file contains development-only values. Real secrets must be supplied through the
deployment environment or a secret manager.

The Docker entrypoint automatically generates the JWT key pair when it is missing. The keys are
kept in the `backend_jwt` Docker volume.

## 🗄️ Database environments

- Development uses `ets_emea`.
- PHPUnit uses the isolated `ets_emea_test` database.
- Production uses the database defined by the production `MONGODB_DB` variable.

The `when@test` Doctrine configuration explicitly selects `ets_emea_test`. Test cleanup therefore
does not modify development data.

## 🚀 Running the backend

Start the complete application from the repository root:

```bash
docker compose up --build -d
```

The API is available at http://localhost:8000 and its health check at
http://localhost:8000/healthz.

Useful backend commands:

```bash
# Display Symfony information
docker compose exec backend php bin/console about

# List API routes
docker compose exec backend php bin/console debug:router

# Validate configuration
docker compose exec backend php bin/console lint:yaml config
docker compose exec backend php bin/console lint:container

# Recreate or update development seed data
docker compose exec backend php bin/console app:seed
```

The development seed command is idempotent and creates the demo users, sessions, reservations, and
MongoDB indexes. It also runs automatically when the backend starts with `APP_ENV=dev`.

## 🧪 Testing

The backend uses PHPUnit functional tests. Tests boot Symfony, make HTTP requests, and verify both
API responses and MongoDB persistence.

Run all backend tests:

```bash
docker compose exec backend php bin/phpunit
```

Run one controller test class:

```bash
docker compose exec backend php bin/phpunit tests/Controller/AuthControllerTest.php
docker compose exec backend php bin/phpunit tests/Controller/ReservationControllerTest.php
docker compose exec backend php bin/phpunit tests/Controller/SessionControllerTest.php
```

Run one test method:

```bash
docker compose exec backend php bin/phpunit --filter testDuplicateReservationIsRejected
```

The tests cover registration, password hashing, login, protected routes, successful and rejected
reservations, reservation ownership, full sessions, and invalid administrator session data.

Expected `404` or `422` exceptions may appear in Symfony's test logs when a test deliberately
verifies an error response. The final PHPUnit result determines whether the suite passed.
