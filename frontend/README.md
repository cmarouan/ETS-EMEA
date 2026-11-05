# ETS EMEA frontend

Next.js and React frontend for language test session bookings, with TypeScript,
Tailwind CSS, and Axios for requests to the Symfony REST API.

To run the frontend, backend, and MongoDB together with Docker, follow the
[root README](../README.md).

## Development

```bash
nvm use
npm install
npm run dev
```

Open http://localhost:3000. The home page is intentionally empty until application
screens are implemented.

## Commands

- `npm run dev`: start the development server.
- `npm run build`: build for production.
- `npm start`: run the production build.
- `npm run lint`: run ESLint.
- `npx tsc --noEmit`: check TypeScript types.

Application routes and global styles live in `src/app/`. The `@/*` import alias
resolves to `src/`. Axios is installed; API integration is not configured yet.
