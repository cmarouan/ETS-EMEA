# 🎨 ETS EMEA Frontend

Next.js frontend for the ETS EMEA language test reservation platform. It provides authentication,
session booking, reservation management, account editing, and administrator session management.

For complete Docker and backend setup instructions, see the [root README](../README.md).

## 🗂️ Structure

```text
src/
├── app/                  Routes, layouts, providers and global styles
├── components/
│   ├── auth/             Login, registration and current-user components
│   ├── layout/           Dashboard header, sidebar and shell
│   ├── management/       Administrator session management
│   ├── reservations/     User reservation list and cancellation
│   ├── sessions/         Session list, pagination and booking
│   ├── shared/           Shared application components
│   └── ui/               Reusable UI primitives
├── config/               Navigation configuration
├── hooks/                Reusable client-side behavior
├── lib/
│   ├── api/              Axios client and API functions
│   └── schemas/          Zod validation schemas
├── types/                Shared TypeScript types
└── proxy.ts              Authentication and role-based route protection
```

The `app/` directory is kept focused on routing and layouts. UI and page behavior live in
`components/`, API access is centralized in `lib/api/`, and forms use React Hook Form with Zod.

The `@/` alias points to `src/`.

## 🧭 Rendering choice

The application uses the Next.js App Router, but business data is fetched client-side in an
SPA-style flow rather than through SSR.

This was a deliberate choice because:

- The project is a small technical challenge.
- The authenticated dashboard is highly interactive.
- Sessions, reservations and pagination change after user actions.
- Keeping fetching, loading, error and interaction states together makes the flow easier to read.
- SSR would add server/client data coordination that is unnecessary for the current scope.

Next.js still handles file-based routing, layouts, static rendering, navigation, and the proxy used
to protect authenticated and administrator routes. SSR could be introduced later if public SEO,
faster initial data rendering, or a larger application made it useful.

## 🧰 Main technologies

- Next.js and React
- TypeScript with strict mode
- Tailwind CSS and reusable UI primitives
- Axios for Symfony API requests
- React Hook Form and Zod for forms
- Lucide React for icons
- Jest and React Testing Library for tests

## 🔌 API configuration

The frontend expects these environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
API_INTERNAL_URL=http://backend
```

- `NEXT_PUBLIC_API_URL` is used by browser requests.
- `API_INTERNAL_URL` is used when Next.js communicates with the backend inside Docker.

Axios is configured with `withCredentials: true` because authentication uses an HTTP-only JWT
cookie created by the Symfony API.

## 🚀 Running the frontend

The recommended approach is to run the complete project from the repository root:

```bash
docker compose up --build -d
```

The frontend is then available at http://localhost:3000.

Run frontend checks inside the active container:

```bash
docker compose exec frontend npm run lint
docker compose exec frontend npm run build
```

## 🧪 Testing

The frontend uses Jest, jsdom, React Testing Library, and `@testing-library/jest-dom`.

Run all tests:

```bash
docker compose exec frontend npm test
```

Run tests in watch mode:

```bash
docker compose exec frontend npm run test:watch
```

The current tests cover:

- Login rendering, validation and redirect behavior.
- Session details and full-session availability.
- Booking interactions.
- Reservation cancellation interactions.
- Session pagination.

Tests mock API boundaries and focus on behavior visible to the user.

## 🛠️ Useful commands

```bash
# Format the codebase
docker compose exec frontend npm run format

# Check formatting without changing files
docker compose exec frontend npm run format:check

# Run ESLint
docker compose exec frontend npm run lint

# Create a production build
docker compose exec frontend npm run build
```
