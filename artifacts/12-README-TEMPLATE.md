# ExamSlot

A self-service exam date-sheet application for a multi-branch virtual university, built for Loopverse 3.0.

> TEMPLATE: Replace all bracketed fields and mark only features that are implemented and verified. The planning pack is not the application.

## Demo
- Live app: [insert hosted link, or state local-only]
- Demo admin email/password: [disposable synthetic demo credentials]
- Demo student email/password: [disposable synthetic demo credentials]
- Team members and contributions: [fill honestly]

Never list reused or production credentials. Demo data is synthetic and isolated; disable or rotate demo access after judging.

## Stack
[Insert exact framework, Node, package manager, database and library versions from the finished app.]

## Local setup
Prerequisites: [tested Node version], [tested package manager], Docker or PostgreSQL, SMTP service.

```sh
git clone <repository-url>
cd <repository-folder>
cp .env.example .env
# Fill the documented environment variables.
npm ci
docker compose up -d db mailpit
npm run db:migrate
npm run db:seed
# Separate terminal: npm run mail:worker
npm run dev
```

[Verify these commands against the actual repository. Document app port, local inbox URL, required worker, and any platform-specific steps. Do not leave a placeholder command as if tested.]

## Environment variables
| Name | Description |
|---|---|
| APP_URL | Canonical app origin for email links |
| DATABASE_URL | Private PostgreSQL connection string |
| APP_TIME_ZONE | Asia/Karachi |
| SMTP_HOST / SMTP_PORT / SMTP_SECURE | SMTP transport |
| SMTP_USER / SMTP_PASSWORD | Private provider credentials when required |
| EMAIL_FROM | Verified sender for deployment |
| SESSION_TTL_HOURS | Session expiry policy |
| SETUP_TOKEN_TTL_HOURS | Setup expiry, proposed 24 |
| RESET_TOKEN_TTL_MINUTES | Reset expiry, proposed 60 |
| SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD | Explicit synthetic demo seed input |
| SEED_STUDENT_EMAIL / SEED_STUDENT_PASSWORD | Explicit password-ready demo student |
| SEED_DEMO_MODE | Required gate for demo-only seeding |
| CRON_SECRET | Protect scheduled worker trigger if used |

[Remove unused variables and document any real additions. No secrets in NEXT_PUBLIC variables.]

## Database diagram
[Copy the final Mermaid ERD from docs/05-DATA-MODEL.md and update it to match the implemented schema, including bonus tables only if implemented.]

## Rules and assumptions
- One exam cycle; baseline course slots apply to all active branches.
- Dates stored UTC and displayed/input in Asia/Karachi.
- End times required, same local day, touching intervals do not overlap.
- New assignment drafts may have fewer than four; finalized sets must have 4–6.
- Assignments frozen after sheet save; date-sheet grants only change selected slots.
- Selected branches/slots protected from hard deletion; branch deactivation preserves existing commitments.
- Slots have draft/published state; selected slots cannot be edited/unpublished/deleted.
- Approval creates one scoped single-use grant; failed saves do not consume it.
- Old sheet remains valid until replacement commits; branch changes create branch-only revisions.
- Same-type pending request or unused grant blocks another same-type request.
- Saved document snapshots preserve the information at the time of that revision.
- [If capacity implemented, describe booking and branch-change semantics.]

## Implemented features
[Use the requirements matrix. Clearly distinguish baseline complete, bonus complete, partial and not implemented.]

## Email behavior
[Describe real provider/local sink, token policy, outbox worker startup, retry/resend and how delivery was tested. Never claim real external email if only a capture inbox was used.]

## Tests
```sh
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:e2e
npm run build
```
[Document test DB setup, actual results/date, browser coverage and known failures.]

## Deployment
[Host, database, migration command, environment configuration, worker/scheduler configuration, HTTPS, and rollback/fallback instructions.]

## Seed data
[Document at least 1 admin, 3 branches, 8 courses, 5 students and future slots. Explain idempotency, explicit demo gating, credential injection and how to reset demo safely.]

## Known limitations
[Honest, specific limitations. Do not label unimplemented required features as complete.]

## Team and provenance
[Contributors, responsibilities, AI/library assistance, and confirmation that project work followed the hackathon window rules.]
