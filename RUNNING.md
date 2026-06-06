# Running Resume Space

This repo is a full-stack monorepo. The main app runs through `nx`, the API needs PostgreSQL plus supporting services, and the admin app is a separate Next.js project in `admin/`.

## Prerequisites

- Node.js `22.13.1` or newer
- pnpm `10.18.1`
- Docker Desktop

## Install

```powershell
pnpm install
```

## Start Local Services

Bring up the local infrastructure used by the app:

```powershell
docker compose -f compose.dev.yml up -d
```

## Prisma

Generate the Prisma client and sync the admin Prisma schema first:

```powershell
pnpm prisma:generate
```

Apply local migrations:

```powershell
pnpm prisma:migrate:dev
```

For a production-style local start, the app uses:

```powershell
pnpm prisma:migrate
```

## Seed Demo Data

```powershell
pnpm seed:resources
pnpm seed:jobs
```

## Run The Main Apps

Start the client, server, and artboard apps together:

```powershell
pnpm dev
```

Expected local URLs:

- Client: `http://localhost:5173`
- API: `http://localhost:3000/api`
- API docs: `http://localhost:3000/api/docs`
- Artboard: `http://localhost:6173`

## Run The Admin App

The admin dashboard lives in `admin/` and is run separately:

```powershell
cd admin
pnpm install --ignore-workspace
pnpm dev
```

Admin URL:

- Admin: `http://localhost:3001`

## Useful Commands

```powershell
pnpm build
pnpm test
pnpm lint
pnpm format
pnpm format:fix
```

## Notes

- `pnpm dev` runs the main workspace apps through `nx run-many -t serve`.
- `pnpm build` runs all workspace builds through `nx run-many -t build`.
- If Prisma generation fails, check that the local database and supporting containers from `compose.dev.yml` are running.
