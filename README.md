# ReLaunch

Evidence-based career re-entry platform. Candidates turn past experience into
current, job-specific evidence. Employers review that evidence alongside the
resume.

## Stack

Next.js 15 (App Router), TypeScript, Tailwind, PostgreSQL, Prisma, Auth.js,
Gemini API (resume extraction), Vitest.

## Setup

1. Install Node 20+, pnpm and Docker Desktop.
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env` and fill in the values
   (generate `AUTH_SECRET` with `openssl rand -base64 32`; get a Gemini key
   at https://aistudio.google.com/apikey).
4. Start the database: `docker compose up -d`
5. Apply migrations and seed demo data:
   `pnpm prisma migrate dev` then `pnpm prisma db seed`
6. Run the app: `pnpm dev` (http://localhost:3000)

Demo logins (local only, password `password123`):
`aditi@example.com` (candidate), `hr@acme.example.com` (employer).

## Scripts

`pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`

## Status

- Phase 0: foundation, auth with roles, dashboards (done)
- Phase 1: candidate profile, resume upload, AI extraction, review (done)
- Phase 2: employer company profile, jobs, AI requirement extraction, review and publish (done)
- Phase 3: skill-gap engine (next)