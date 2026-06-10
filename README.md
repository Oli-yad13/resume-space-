# Resume Space

Resume Space is a career platform for Ethiopia and beyond: build polished resumes, import an existing CV with AI, discover jobs, learn from curated resources, and track your applications — all in one place.

Trusted partner organizations can post jobs and learning resources through a dedicated admin portal, with every post reviewed and approved by the platform team before it goes live.

## Features

### For job seekers

- **Resume builder** — 13 professionally designed templates with live preview, drag-and-drop section layout, custom typography and theming
- **AI resume import** — upload a PDF, DOCX, image, or text CV and have it parsed into an editable resume (powered by Google Gemini)
- **PDF export & public sharing** — pixel-accurate PDF rendering and shareable public resume links
- **Job marketplace** — browse and search jobs, AI-powered recommendations matched against your resume, one-click applications
- **Resource library** — curated videos and articles on resume writing, interviews, and career growth
- **Application tracking** — follow every application from submission to offer

### For partner organizations & administrators

- **Role-based admin portal** — separate accounts for partner organizations (`ORG_ADMIN`) and the platform team (`SUPER_ADMIN`)
- **Approval workflow** — organization posts start as *pending* and only appear publicly after super-admin approval; edits to live posts automatically return to review
- **Organization management** — the platform team provisions partner accounts, resets credentials, and can revoke access instantly
- **Application management** — organizations review applications to their own job posts
- **Platform analytics** — users, resumes, and content statistics

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | NestJS 10, Prisma 5, PostgreSQL 16 |
| Admin portal | Next.js 15, React 19, Tailwind CSS 4 |
| Auth | Passport (JWT httpOnly cookies, local + OAuth), optional 2FA |
| AI | Google Gemini (multimodal resume parsing, job matching) |
| PDF rendering | Puppeteer + Browserless Chrome |
| Storage | MinIO-compatible object storage |
| Tooling | Nx monorepo, pnpm workspaces, Zod, TanStack Query, Zustand |

## Monorepo structure

```text
apps/
  client/      Main web app (Vite + React)          :5173
  server/      Backend API (NestJS)                 :3000
  artboard/    Resume rendering engine              :6173
admin/         Admin & partner portal (Next.js)     :3001
libs/
  dto/         Shared API contracts (Zod)
  schema/      Resume data schema
  ui/          Shared UI components
  hooks/       Shared React hooks
  parser/      Resume import parsers
  utils/       Shared utilities
tools/
  prisma/      Database schema
  scripts/     Seed & maintenance scripts
```

## Getting started

### Prerequisites

- Node.js ≥ 22.13
- pnpm ≥ 10
- Docker Desktop

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env        # then fill in secrets (see Environment below)

# 3. Start infrastructure (PostgreSQL, MinIO, Chrome)
docker compose -f compose.dev.yml up -d

# 4. Generate the Prisma client and create the database schema
pnpm prisma:generate
pnpm exec prisma db push

# 5. (Optional) seed demo content
pnpm seed:jobs
pnpm seed:resources

# 6. Create the platform super-admin account
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD=change-me pnpm seed:admin

# 7. Run the main stack (client + server + artboard)
pnpm dev
```

### Admin portal

The admin portal is a standalone Next.js app:

```bash
cd admin
npm install
npm run dev
```

Sign in at <http://localhost:3001> with the super-admin account created in step 6. From **Org Accounts** you can provision partner organization logins.

### Local URLs

| App | URL |
|---|---|
| Client | <http://localhost:5173> |
| API | <http://localhost:3000/api> |
| Artboard | <http://localhost:6173> |
| Admin portal | <http://localhost:3001> |

## Environment

Key variables (see `.env.example` for the full list):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `ACCESS_TOKEN_SECRET` / `REFRESH_TOKEN_SECRET` | JWT signing secrets — generate strong random values |
| `GEMINI_API_KEY` | Google Gemini key for AI resume import & job matching (optional — features degrade gracefully) |
| `GEMINI_MODEL` | Gemini model id (default `gemini-2.0-flash`) |
| `CHROME_URL` / `CHROME_TOKEN` | Browserless Chrome for PDF export |
| `STORAGE_*` | Object storage (MinIO/S3) configuration |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Used once by `pnpm seed:admin` to create or promote the super admin |

## Useful commands

```bash
pnpm dev                 # client + server + artboard
pnpm build               # build all apps
pnpm test                # run tests (vitest)
pnpm lint                # lint
pnpm format:fix          # format
pnpm prisma:generate     # regenerate Prisma clients (root + admin)
pnpm seed:admin          # create/promote the super admin
```

## How the approval workflow works

1. A partner organization signs into the admin portal and posts a job or resource → status **PENDING** (not publicly visible)
2. The super admin reviews it in the **Approvals** queue → **Approve** (goes live) or **Reject** with a note
3. If an organization edits an approved post, it is automatically pulled from the public site and re-enters review
4. Public APIs only ever serve content that is both *published* and *approved*

## License & credits

MIT — see [LICENSE.md](LICENSE.md).

Resume Space builds upon [Reactive Resume](https://github.com/AmruthPillai/Reactive-Resume) by Amruth Pillai (MIT). The resume builder core derives from that excellent project; the job marketplace, resource library, AI import, and multi-role admin platform are original additions.
