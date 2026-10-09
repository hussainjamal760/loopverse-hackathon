# Setup and implementation runbook

## Status
These are planned repository conventions, not commands verified against an existing app. The implementation must create the referenced package scripts and Docker services. Replace this note with tested instructions before submission.

## Kickoff
1. Confirm hackathon window and team duration. Create repository during the permitted window.
2. Scaffold a TypeScript Next.js App Router app with src directory, linting and Tailwind. Use a maintained compatible Node LTS and record its exact version.
3. Pin package versions with package-lock.json; do not mix package managers.
4. Install Prisma/PostgreSQL client, Zod, form libraries, Argon2, SMTP client and chosen accessible UI primitives. Add testing libraries separately.
5. Create PostgreSQL and local Mailpit services in compose.yml. Bind local database/mail ports to loopback; credentials come from ignored environment files.
6. Write schema/migrations, test infrastructure and seed script before building every page.
7. Build design tokens and one accessible form/table pattern, then reuse them.

## Environment template
```dotenv
# Example placeholders only; never commit working secrets.
APP_URL=http://localhost:3000
DATABASE_URL=postgresql://<db-user>:<db-password>@localhost:5432/examslot
APP_TIME_ZONE=Asia/Karachi
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=ExamSlot <portal@example.test>
SESSION_TTL_HOURS=12
SETUP_TOKEN_TTL_HOURS=24
RESET_TOKEN_TTL_MINUTES=60
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
SEED_STUDENT_EMAIL=
SEED_STUDENT_PASSWORD=
SEED_DEMO_MODE=false
CRON_SECRET=
```

Use provider-appropriate SMTP credentials/port/TLS for real mail. Never expose DATABASE_URL, SMTP_PASSWORD, seed passwords or CRON_SECRET through NEXT_PUBLIC variables. Opaque sessions do not need a fictional JWT secret. If the chosen implementation introduces a signed-cookie library, document its actual required signing secret.

## Required package scripts
| Script | Expected command responsibility |
|---|---|
| dev | Run Next.js locally |
| build | Generate Prisma client if required and build application |
| start | Start production web server |
| lint | Lint source |
| typecheck | Run TypeScript without emit |
| db:migrate | Development migration workflow |
| db:deploy | Apply committed migrations to deployment database |
| db:seed | Idempotent synthetic seed, explicitly gated |
| mail:worker | Process outbox jobs locally/long-running deployment |
| test | Unit tests |
| test:integration | Integration tests against separate test database |
| test:e2e | Playwright browser tests |
```
npm ci
docker compose up -d db mailpit
npm run db:migrate
npm run db:seed
npm run mail:worker
# Separate terminal:
npm run dev
```

The author must provide compose.yml, scripts and worker; these lines alone do not implement them. Fresh-install rehearsal must test all commands.

## Seed plan
- At least 1 admin, 3 branches, 8 courses, 5 students; all synthetic names and identity data.
- Branches: Karachi Central / KHI-01, Lahore Garden / LHR-01, Islamabad Campus / ISB-01. Illustrative demo institutions, not claimed real campuses.
- Courses: CS101 Introduction to Computing, CS201 Programming Fundamentals, CS301 Data Structures, MTH101 Calculus, MTH202 Discrete Mathematics, ENG101 English Composition, STA301 Statistics, MGT101 Introduction to Management.
- Student A: invited, no password, draft assignments.
- Student B: active demo login, 4 finalized courses, no branch, no sheet.
- Student C: 5 finalized courses, branch selected, unsaved sheet.
- Student D: 6 finalized courses, saved sheet and pending date-sheet request.
- Student E: 4 finalized courses, saved sheet and rejected branch request with remark.
- At least 3 published future slots per course and one draft slot. Compute dates relative to seed run in Asia/Karachi, e.g. +7 to +21 days; never fixed dates that become past.
- Provide one guaranteed conflict pair and at least one complete conflict-free schedule for every finalized student.
- Admin/password-ready student credentials come from explicit seed environment variables, hashed before storage. Normal admin-created students still use email setup.
- Idempotent upserts use unique codes/emails. Do not reset existing passwords or overwrite sheets on routine reruns. A separate destructive demo reset requires explicit local/demo gating.
- Seeded saved sheet selections/revisions must be relationally consistent and future-dated. Reject or explicitly regenerate a stale demo dataset rather than silently mutate real history.
- Optional capacity test: one nearly full slot and fixture students for last-seat race test.

## Email proof
Mailpit is useful for local development but a real SMTP provider demonstration is stronger evidence of email to the address on file. During rehearsal use a team-owned inbox, send an actual invitation, open it, set a password, and prove replay fails. If using a captured SMTP inbox locally, disclose that setup honestly. Do not claim external delivery from an outbox status alone.

## Deploy
1. Provision PostgreSQL and configure the Node-compatible host.
2. Set HTTPS APP_URL, private environment variables, cookie behavior and real SMTP.
3. Apply committed migrations with db:deploy; do not run development migrations in deployment.
4. Run demo seed only against an isolated demo database with explicit demo flag.
5. Deploy web app and a real outbox worker/scheduled processor; protect scheduler trigger with secret authentication.
6. Check database connection limits, mail reachability, password hashing and optional PDF runtime.
7. Run smoke journey against live URL using synthetic users.
8. Keep a tested local fallback and local SMTP sink ready.

Publish only disposable demo credentials for synthetic data as requested by the paper. Never publish a reused or production admin password. Disable/reset the public demo after judging. No real CNICs, phone numbers or student records in the demo repository/database.
