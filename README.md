# Resume Space

Resume Space is a career workspace for creating polished resumes, improving existing CVs, exploring career resources, finding jobs, and tracking applications in one place.

It combines a resume builder, AI-assisted resume import, job discovery, learning resources, public resume sharing, PDF export, and an admin dashboard for managing content.

## What It Does

- Build and customize resumes with multiple templates.
- Import an existing resume file and convert it into editable resume data.
- Export resumes as PDFs and share public resume links.
- Browse curated career resources such as articles and videos.
- Search jobs, view job details, and apply with a resume.
- Track submitted job applications.
- Manage users, resumes, jobs, resources, and applications from an admin dashboard.
- Self-host the full stack with Docker, PostgreSQL, object storage, and a browser service for PDF generation.

## Tech Stack

- React, Vite, TypeScript, Tailwind CSS
- NestJS, Prisma, PostgreSQL
- MinIO-compatible object storage
- Browserless/Chrome for PDF rendering
- Next.js admin dashboard
- Nx monorepo tooling
- Zod, React Hook Form, TanStack Query, Zustand
- Optional AI integrations for resume parsing and writing assistance

## Monorepo Structure

```text
apps/
  client/      Main web app
  server/      Backend API
  artboard/    Resume preview and rendering app
admin/         Admin dashboard
libs/
  dto/         Shared API DTOs
  schema/      Resume and validation schemas
  ui/          Shared UI components
  hooks/       Shared React hooks
  parser/      Resume import/export parsers
  utils/       Shared utilities
tools/
  prisma/      Database schema and migrations
  scripts/     Seed and maintenance scripts
```

## Local Development

Prerequisites:

- Node.js 22.13.1 or newer
- pnpm 10.18.1
- Docker Desktop

Install dependencies:

```powershell
pnpm install
```

Start local infrastructure:

```powershell
docker compose -f compose.dev.yml up -d
```

Generate Prisma client and apply migrations:

```powershell
pnpm prisma:generate
pnpm prisma:migrate:dev
```

Seed demo data:

```powershell
pnpm seed:resources
pnpm seed:jobs
```

Run the main apps:

```powershell
pnpm dev
```

Default local URLs:

- Client: <http://localhost:5173>
- API: <http://localhost:3000/api>
- API docs: <http://localhost:3000/api/docs>
- Artboard: <http://localhost:6173>
- Admin: <http://localhost:3001>

## Admin App

The admin dashboard is a separate Next.js app in `admin/`.

```powershell
cd admin
pnpm install --ignore-workspace
pnpm dev
```

The current admin login is still demo-grade and must be replaced with real backend-backed admin authentication before public production use.

## Useful Commands

```powershell
pnpm build               # Build all apps
pnpm test                # Run tests
pnpm lint                # Run lint checks
pnpm format              # Check formatting
pnpm format:fix          # Apply formatting
pnpm prisma:generate     # Generate Prisma client
pnpm prisma:migrate:dev  # Apply local migrations
```

## Current Roadmap

Immediate priorities:

- Harden admin authentication and authorization.
- Finish smoke testing across resume, jobs, resources, and applications.
- Clean the worktree into smaller reviewable changes.
- Add CI checks for build, tests, lint, and Prisma generation.

