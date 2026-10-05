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
- Share links use 256-bit random tokens, and only a SHA-256 hash is stored. The
  full link is shown once, when it is created.
- A shared profile is built by a single function from the link's settings, so a
  section the candidate excluded is absent from the data, not just hidden.
  Contact details, the resume file and any reason for a career break are never
  part of it.
- Every refusal on a share link (unknown, expired, revoked or not permitted)
  shows the same neutral page.
  - Discovery is opt-in and off by default. A candidate appears only as a short code,
  never with a name or email, and a search can match only on the sections she
  exposes. Her career break is never a filter, a sort, or part of a comparison.
- Employers search only from one of their own published jobs. A listing opens only
  if the candidate is discoverable, has not blocked that company, and is relevant
  to the job, and every other case returns the same 404.
- Matching groups candidates by recent evidence and shows a tick-and-warning
  breakdown. There is no score or rank, and the order inside a group is a stable
  shuffle based on the candidate's public code and the job.
- Contact details are copied onto an invitation only when the candidate accepts,
  in one atomic update, and are visible only to the employer who invited her.
  Declined, expired and blocked outcomes reveal nothing.
- Invitation messages are plain text of 20 to 500 characters with no links or
  email addresses, with a limit of 10 invitations per employer per 24 hours and
  one invitation per candidate and job.

## Status

- Phase 0: foundation, auth with roles, dashboards (done)
- Phase 1: candidate profile, resume upload, AI extraction, review (done)
- Phase 2: employer company profile, jobs, AI requirement extraction, review and publish (done)
- Phase 3: skill taxonomy, target jobs, skill-gap engine and analysis page (done)
- Phase 4: assessment engine with Java, REST and SQL practice tasks (done); project review deferred
- Phase 5: evidence profile, share links, employer view and access log (done)
- Design A and B: design system, app shell, dashboards with charts, restyled screens (done)
- Phase 6: discoverability, evidence-based candidate search, invitations with consent (done)
- Phase 7: hardening, privacy audit and deployment readiness (next)
- Phase 8: evaluation
