# Architecture

## Proposed stack
| Layer | Choice | Purpose |
|---|---|---|
| Full-stack application | Next.js App Router + TypeScript | One repository for UI and HTTP handlers |
| UI | Tailwind CSS + accessible Radix primitives | Implement design.md rather than stock theme |
| Motion | CSS first; Motion library only if needed | Small state transitions, reduced-motion support |
| Database | PostgreSQL | Relations, constraints, transactions and row locking |
| Database access | Prisma plus reviewed SQL migrations | Typed queries; SQL for partial indexes/locks as needed |
| Forms/validation | React Hook Form + Zod | Shared field shapes, server is authoritative |
| Authentication | Opaque server-side database sessions | HttpOnly cookies, revocation and current role checks |
| Passwords | Argon2id | Password hashes, never reversible encryption |
| Mail | Nodemailer SMTP adapter | Local SMTP sink and real provider for demo |
| Tests | Vitest + Playwright | Service tests and real browser journeys |
| Optional downloadable PDF | @react-pdf/renderer | Separate authenticated PDF endpoint using shared document data |

These are design choices, not claims about the latest package versions. Select compatible maintained versions at kickoff, pin them in the lockfile, and record Node/package versions in README. Use Node runtime for password hashing, database access, SMTP and PDF; do not accidentally deploy these handlers to an incompatible edge runtime.

## Dependency direction
Route handler → auth/role guard → input schema → domain service → repository/transaction → response mapper.

React components never decide authoritative permissions. Domain services do not trust student IDs, roles, grant IDs, or course sets supplied by a student. Derive student identity from the session. Shared pure helpers may preview conflicts in UI, but the service runs the same checks independently against database records.

## Suggested structure
```text
src/
  app/
    (auth)/login/ forgot-password/ set-password/
    admin/ branches/ courses/ students/ assignments/ schedules/ requests/
    student/ branch/ profile/ date-sheet/ help/
    api/auth/ admin/ me/
  components/
    ui/ layout/ forms/ tables/ planner/ date-sheet/
  features/
    branches/ courses/ students/ assignments/ schedules/ requests/
  server/
    auth/ db/ mail/ policies/ services/ repositories/
  lib/
    validation/ dates/ conflicts/ errors/ pagination/
  styles/
    globals.css print.css
prisma/
  schema.prisma migrations/ seed.ts
tests/
  unit/ integration/ e2e/
docs/
```
The route tree above is conceptual; place entity directories inside their proper admin folder in the actual filesystem.

## Security baseline
- Server sessions use cryptographically random opaque identifiers; store a hash server-side. Cookie is HttpOnly, SameSite=Lax, Secure in deployed HTTPS, with explicit expiry and path.
- Rotate session at login; revoke on logout, password reset and student deactivation. Reject expired/revoked sessions on every protected route.
- CSRF: require same-origin mutations and a CSRF token for cookie-authenticated state changes. Never mutate through GET.
- Hash passwords with Argon2id using reviewed library settings and verify runtime performance. No passwords or reset tokens in logs.
- Rate-limit login, forgot-password, token verification and sensitive writes. Use a shared store or database strategy across deployed instances, not only process memory.
- Generic forgot-password response; do not expose whether an email exists. Generate high-entropy random tokens, store a hash, link to user and purpose, enforce expiry and single use atomically.
- Password setup policy: proposed 15–128 characters, permit paste/password managers, no arbitrary composition rules. Use one consistent policy for setup/reset.
- Construct email links from configured APP_URL, not an untrusted request Host header. No third-party scripts on token pages; Referrer-Policy: no-referrer; redact token-bearing URLs.
- Strict Zod schemas; parameterized ORM/raw SQL; no HTML rendering of user reasons or names. Escape text in mail templates.
- Block mass assignment: accept only fields explicitly allowed for the role and endpoint.
- CSP and appropriate response security headers; no public caching of private responses; return minimal fields.
- Optional photo: validate size/type, randomized filename and private access; if not implemented, leave absent rather than accept unsafe uploads.
- CNIC/guardian information appears only on authorized profile/detail views. No sensitive identity data in URLs, charts, printed sheet, audit payloads or demo screenshots.

Password-token design is informed by OWASP's Forgot Password Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html

## Email and consistency
Student account creation transaction writes User, Student and an email outbox job. The worker creates a random token when processing, persists only its hash, and sends the plaintext link directly to SMTP without logging/persisting the raw token. A failed retry invalidates previous unconsumed tokens of that purpose and issues a new one. Duplicate messages from uncertain SMTP delivery are possible; explain that only the latest link works.

Jobs contain user IDs/template type, not credentials or raw links. Email failures do not undo a valid student account or request decision. Show delivery status and support controlled resend. A scheduler/worker must actually run in production; serverless deployment does not run an infinite background loop automatically.

## Performance boundaries
Use database pagination with deterministic ordering and filtered counts. Page size default 10, allow 10/20/50, reject or clamp above 100. Add indexes on foreign keys and common sort/filter columns. Debounce client search; cancel obsolete fetches. Do not fetch all records and slice in React.

Render authenticated server data without leaking it through shared public caches. Keep identity-rich profile responses out of persistent browser storage. Draft slot IDs may live in memory and must be revalidated before commit.
