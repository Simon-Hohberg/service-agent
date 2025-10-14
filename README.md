# Service Agent

This is the frontend and backend for a service agent that allows to send requests either immediately or at a scheduled time.

## Tech Stack

- Frontend

  - Angular
  - Angular Material

- Backend
  - NodeJS
  - TypeScript
  - Fastify
  - Prisma (SQLite)

## How to run

0. Install NodeJs (>=24)
1. Install [pnpm](https://pnpm.io/installationm)
2. Run `pnpm install` in the root of this workspace

### Lib Common

1. `cd` to `libs/common`
2. Run `pnpm build`

### Backend

- Will run the backend on `localhost:3000`

1. `cd` to `apps/service-agent-backend/`
2. Create a `.env` file in the current directory with this line `DATABASE_URL="file:./dev.db"`
3. Run `npx prisma generate`
4. Run `npx prisma migrate deploy`
5. Run `pnpm run build`
6. Run `pnpm run start`

### Creating tenants and users

1. Create a new tenant: `curl -d '{"id":"<tenant id>" }' -H "Content-Type: application/json" -X POST http://localhost:3000/tenant/`
2. Create a new user in an existing tenant: `curl -d '{"id":"<user id>" }' -H "Content-Type: application/json" -X POST http://localhost:3000/tenant/<tenant id>/user`
3. (optional) Adding an existing user to an existing tenant: `curl -d '{"id":"<user id>" }' -H "Content-Type: application/json" -X PUT http://localhost:3000/tenant/<tenant id>/user`

### Frontend

- Will run the frontend on `localhost:4200`

1. `cd` to `apps/service-agent-frontend`
2. Run `ng serve`

### Mocked requests

When creating a HTTP call to a URL starting with `http://example.com`, the response is mocked.
