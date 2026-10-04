# ReLaunch

Evidence-based career re-entry platform. Candidates turn past experience into
current, job-specific evidence. Employers review that evidence alongside the
resume.

## Stack

Next.js 15 (App Router), TypeScript, Tailwind, PostgreSQL, Prisma, Auth.js,
Gemini API (resume and job extraction), Piston (sandboxed code execution),
Vitest.

## Setup

1. Install Node 20+, pnpm and Docker Desktop.
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env` and fill in the values
   (generate `AUTH_SECRET` with `openssl rand -base64 32`; get a Gemini key
   at https://aistudio.google.com/apikey).
4. Start the database: `docker compose up -d`
5. Apply migrations and seed demo data:
   `pnpm prisma migrate dev` then `pnpm prisma db seed`
6. Start the code runner (Piston), needed for practice-task grading:

```
   docker run --privileged -v piston_data:/piston --tmpfs /piston/jobs -dit -p 2000:2000 --name piston_api ghcr.io/engineer-man/piston
```

   Then install the two runtimes it needs. List the versions available, and
   install one Java and one Python version:

```
   Invoke-RestMethod http://localhost:2000/api/v2/packages
   Invoke-RestMethod -Method Post -Uri http://localhost:2000/api/v2/packages -ContentType "application/json" -Body '{"language":"java","version":"15.0.2"}'
   Invoke-RestMethod -Method Post -Uri http://localhost:2000/api/v2/packages -ContentType "application/json" -Body '{"language":"python","version":"3.12.0"}'
```

   (PowerShell syntax. Use the versions your Piston lists.) After a restart,
   start it again with `docker start piston_api`.
7. Run the app: `pnpm dev` (http://localhost:3000)

Demo logins (local only, password `password123`):
`aditi@example.com` (candidate), `hr@acme.example.com` (employer).

## Scripts

`pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`,
`pnpm tasks:verify` (runs every practice task's reference solution and starter
code through Piston to prove the tasks are fair; needs Piston running)

## Security notes

- Resume files are stored outside `public/` and served only to their owner.
- Candidate code runs only inside Piston. Piston needs `--privileged`, so in
  production run it on its own isolated machine, never alongside the database.
- Hidden test cases and reference solutions never leave the server.
- Career-break dates never enter the skill-gap engine.

## Status

- Phase 0: foundation, auth with roles, dashboards (done)
- Phase 1: candidate profile, resume upload, AI extraction, review (done)
- Phase 2: employer company profile, jobs, AI requirement extraction, review and publish (done)
- Phase 3: skill taxonomy, target jobs, skill-gap engine and analysis page (done)
- Phase 4: assessment engine with Java, REST and SQL practice tasks (done); project review deferred
- Phase 5: evidence profile (next)