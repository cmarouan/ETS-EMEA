# 🌍 ETS EMEA Language Test Reservation Platform

ETS EMEA is a full-stack platform for browsing language test sessions and managing reservations.
It includes a responsive Next.js dashboard, a Symfony REST API secured with cookie-based JWT
authentication, and MongoDB persistence through Doctrine ODM.

The application supports two roles:

- **Users** can register, sign in, update their account, browse available sessions, reserve a
  session, review their reservations, and cancel their own reservations.
- **Administrators** can use the same user features and can additionally create, update, and delete
  test sessions from the session management page.

**Sreens**

| Login | Sessions | Reservations | Update Account | Sessions update (for admins) |
| --- | --- | --- | --- | --- |
| - | - | - | - | - |

## 👥 Development accounts

The backend seeds the following accounts automatically when it starts in the `dev` environment:

| Role          | Email                 | Password |
| ------------- | --------------------- | -------- |
| Administrator | `admin@ets-emea.test` | `admin`  |
| User          | `user@ets-emea.test`  | `user`   |

These credentials are intended only for local development and demonstrations. Never use them in a
production environment.

## 🏗️ Repository structure and architecture

```text
ETS-EMEA/
├── frontend/              Next.js application
├── backend/               Symfony REST API
├── docker-compose.yml     Local orchestration
└── README.md              Project-level documentation
```

### 🎨 Frontend

The frontend follows a pragmatic component-based Next.js App Router structure:

```text
frontend/src/
├── app/                   Routes, layouts, providers, loading and error pages
├── components/
│   ├── auth/              Login, registration and current-user UI
│   ├── layout/            Header, sidebar and dashboard shell
│   ├── management/        Administrator session management UI
│   ├── reservations/      User reservation UI
│   ├── sessions/          Session listing and booking UI
│   ├── shared/            Shared application components
│   └── ui/                Reusable shadcn-style UI primitives
├── hooks/                 Reusable client-side behavior
├── lib/
│   ├── api/               Axios client and typed API functions
│   └── schemas/           Zod form schemas
├── config/                Navigation configuration
└── types/                 Shared TypeScript types
```

Routes and layouts remain in `app/`, reusable UI is kept in `components/`, and HTTP access is
centralized in `lib/api/`. The project uses React Hook Form and Zod for forms and Jest with React
Testing Library for frontend tests.

See the [frontend README](./frontend/README.md) for frontend-specific documentation.

### ⚙️ Backend

The backend uses Symfony's conventional layered approach:

```text
backend/
├── config/                Framework, security, JWT, CORS and Doctrine configuration
├── src/
│   ├── Command/           Idempotent development data seeding
│   ├── Controller/        REST endpoints and HTTP coordination
│   ├── Document/          Doctrine MongoDB ODM documents
│   └── Dto/               Validated request and query data
├── tests/Controller/      PHPUnit functional API tests
└── docker/                Apache, environment and entrypoint configuration
```

Controllers handle HTTP requests, DTOs bind and validate request data, Symfony Security handles
authentication and authorization, and Doctrine MongoDB ODM manages persistence. This intentionally
avoids heavier DDD or Hexagonal layers because the current business rules and project scope are
small.

See the [backend README](./backend/README.md) for backend-specific documentation.

## 🧰 Technology and versions

### 🐳 Runtime

| Technology     | Version                            |
| -------------- | ---------------------------------- |
| Node.js        | 24, from the frontend Docker image |
| PHP            | 8.5, Apache image                  |
| Composer       | 2                                  |
| MongoDB        | 8.0                                |
| Docker Compose | Compose v2                         |

### 🎨 Frontend

| Technology            | Version |
| --------------------- | ------- |
| Next.js               | 16.4.5  |
| React / React DOM     | 19.3.0  |
| TypeScript            | 5.x     |
| Tailwind CSS          | 4.x     |
| Axios                 | 1.x     |
| React Hook Form       | 7.x     |
| Zod                   | 4.x     |
| Lucide React          | 1.x     |
| Jest / jsdom          | 30.5.x  |
| React Testing Library | 16.3.x  |

### ⚙️ Backend

| Technology                   | Version |
| ---------------------------- | ------- |
| Symfony                      | 8.1     |
| Doctrine MongoDB ODM Bundle  | 5.6.x   |
| LexikJWTAuthenticationBundle | 3.2.x   |
| NelmioCorsBundle             | 2.6.x   |
| PHPUnit                      | 13.4.x  |

The lock files remain the source of truth for exact transitive dependency versions.

## 🔐 Environment configuration

Local Docker defaults are defined in [`backend/docker/dev.env`](./backend/docker/dev.env). They are
safe demonstration values and must not be reused in production.

### 🧪 Test environment

PHPUnit forces `APP_ENV=test`. Symfony then uses the isolated `ets_emea_test` database through the
`when@test` Doctrine configuration. Tests clean only this test database and do not modify the local
`ets_emea` development database.

Local uncommitted secrets can be placed in `.env.local`, `.env.dev.local`, or `.env.test.local` as
appropriate. Do not commit real secrets, private keys, or production connection strings.

## 🚀 Running the project

### ✅ Requirements

- Docker Desktop, or Docker Engine with Docker Compose v2
- Git
- Available local ports `3000` and `8000`

Node.js, PHP, Composer, and MongoDB do not need to be installed on the host.

### ▶️ Start the application

From the repository root:

```bash
docker compose up --build -d
```

The first build may take several minutes. Check service status and logs with:

```bash
docker compose ps
docker compose logs -f
```

Open:

| Service              | URL                           |
| -------------------- | ----------------------------- |
| Frontend             | http://localhost:3000         |
| Symfony API          | http://localhost:8000         |
| Backend health check | http://localhost:8000/healthz |

MongoDB is available only inside the Docker network as `database:27017`.

During backend startup in development, the entrypoint:

1. Synchronizes Composer dependencies.
2. Generates the JWT key pair if necessary.
3. Clears the Symfony cache.
4. Runs the idempotent development seed command.
5. Starts Apache.

### ⏹️ Stop the application

```bash
docker compose down
```

This preserves MongoDB data, dependencies, caches, and JWT keys in named volumes. To deliberately
remove all local volumes and data:

```bash
docker compose down --volumes
```

### 🧪 Run checks and tests

```bash
# Backend tests
docker compose exec backend php bin/phpunit

# Symfony configuration validation
docker compose exec backend php bin/console lint:yaml config
docker compose exec backend php bin/console lint:container

# Frontend tests
docker compose exec frontend npm test

# Frontend lint and production build verification
docker compose exec frontend npm run lint
docker compose exec frontend npm run build
```

Run tests in watch mode while developing the frontend:

```bash
docker compose exec frontend npm run test:watch
```

## 🌐 Production deployment checklist

The provided Compose setup is optimized for local development. Before deploying publicly, make the
following changes.

### 1. 🔑 Use production environment values

- Set `APP_ENV=prod` and `APP_DEBUG=0`.
- Generate a strong, unique `APP_SECRET`.
- Generate a strong JWT passphrase and production JWT key pair.
- Store secrets in the deployment platform's secret manager instead of committed environment files.
- Set `JWT_COOKIE_SECURE=1` so the authentication cookie is sent only over HTTPS.
- Restrict `CORS_ALLOW_ORIGIN` to the exact production frontend origin.

### 2. 🛡️ Secure MongoDB

- Use a managed MongoDB service or a production MongoDB deployment with authentication enabled.
- Use a dedicated application user with only the required database permissions.
- Use TLS and a private network where possible.
- Set production `MONGODB_URI` and `MONGODB_DB` values through deployment secrets.
- Configure backups, retention, monitoring, and recovery procedures.

### 3. 📦 Build production images

- Replace bind-mounted source directories with immutable application images.
- Build the frontend with `npm ci` and `npm run build`, then run it with `npm run start`.
- Install backend dependencies with `composer install --no-dev --classmap-authoritative`.
- Warm the Symfony production cache during the image build or release phase.
- Do not run the development seed command in production.
- Create Doctrine MongoDB indexes as an explicit deployment or release step.

### 4. 🔒 Configure networking and HTTPS

- Put the frontend and API behind a production reverse proxy or load balancer.
- Configure valid TLS certificates and redirect HTTP traffic to HTTPS.
- Set `NEXT_PUBLIC_API_URL` to the public HTTPS API URL.
- Set `API_INTERNAL_URL` to the API's private service URL when server-side calls use an internal
  network.
- Expose only required public ports; never expose MongoDB directly to the internet.

### 5. 💾 Persist and protect runtime data

- Store JWT keys in a persistent secret mount or secret manager.
- Use durable storage only where the deployment architecture requires it.
- Send logs to centralized storage and add application and infrastructure monitoring.
- Define health checks, restart policies, resource limits, and a rollback strategy.

### 6. ✅ Validate before release

Run the complete quality checks in CI before producing a release:

```bash
docker compose exec backend php bin/phpunit
docker compose exec frontend npm test -- --runInBand
docker compose exec frontend npm run lint
docker compose exec frontend npm run build
```

Also verify production environment variables, HTTPS cookies, CORS behavior, MongoDB connectivity,
JWT key access, and database indexes in a staging environment before deploying to production.
