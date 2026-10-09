# AI coding assistant instructions

## Master instruction
You are implementing ExamSlot for the supplied Loopverse 3.0 paper. Read 01-REQUIREMENTS.md, design.md, 04-ARCHITECTURE.md, 05-DATA-MODEL.md and 06-API-AND-STATE-MACHINES.md before changing code. This documentation is a plan, not evidence that features already exist.

Build a real full-stack application. Use the repository's actual installed versions and scripts. Do not claim a test passed unless you ran it. Do not replace database/email/security work with localStorage, mock endpoints or simulated delays.

Design: warm ivory #F7F5EF, white surfaces, forest #285742, sage #E7EEE3, terracotta #9A4F36. No blue/purple, dark backgrounds, glow, blur, gradients, background animation or generic AI dashboard decoration. Use restrained transitions and reduced-motion support.

Security: every server route authenticates and authorizes; students only access themselves. Tokens are random/hashed/expiring/single use. Passwords hashed. Sessions server-side. Validate every input. Protect cookie mutations against CSRF. Use parameterized queries and never log secrets.

Integrity: student-scoped writes use shared transaction/locking discipline. Initial branch/sheet saves are one-time. Approved grants are type-specific and consumed only on a successful commit. Duplicate pending requests prevented with database indexes. Assignment finalization requires 4–6 unique courses. Slots must belong to the selected course and must not overlap.

Process: implement one phase at a time, add tests, report modified files, executed commands, results and known gaps. Ask before altering requirements or schema assumptions. Do not implement bonuses while baseline has failing acceptance tests. Do not commit secrets or invent teammate contributions.

## Phase prompts
### Foundation
Inspect the existing repository. Implement Phase 1, including migrations, tokens/styles, shell, shared form/table states, error envelope and test database. Build a real paginated branch list as a vertical slice. End with tests and a precise gap report. Do not build every screen with mock data.

### Onboarding
Implement Phase 2. Persist all personal/guardian/academic fields; use an outbox and working SMTP worker; implement secure setup/reset and opaque sessions. Add token replay/expiry/race, deactivation and RBAC tests. Explain how to observe the email locally and with a real provider.

### Admin operations
Implement Phase 3. Include full CRUD, protected deletion, draft/finalized assignment replacement and published slot validation. Every admin listing must paginate/search in database with filtered totals. Test direct invalid API calls. Follow the same design components throughout.

### Student planner
Implement Phase 4 from the real API. Build native-accessible branch/course/slot controls, agenda preview, profile, review/save and print. Protect saved state on server with locked transactions. Test overlap, wrong slot/course, double save and mobile layout. Do not rely on disabled buttons for security.

### Change requests
Implement Phase 5 for BOTH types. Add request review, independent grants and single-use consumption. Preserve old sheet until replacement commits. Branch changes after save update document revision only, not exam times. Test duplicate requests, concurrent decisions, failed use and two simultaneous grant uses.

### Final polish
Compare every screen to design.md. Fix spacing, contrast, focus, copy, empty/loading/error states, long labels, 360px behavior and print. Apply only subtle motion with reduced-motion fallback. List each mismatch fixed. Do not add irrelevant features.

### Optional capacity
Only after baseline passes: implement BranchSlot/SeatBooking and transactionally reconcile reservations for saves, replacements and branch moves. Add last-seat and all-or-nothing branch-move races. A count displayed in UI without protected booking logic does not count as completion.

## Completion report format
- Implemented scope and files.
- Database migration impact.
- Commands actually executed and results.
- Acceptance test IDs satisfied.
- Remaining gaps/risks.
- Reproducible manual verification steps.

Never write “production-ready”, “fully secure” or “all requirements complete” without scoped evidence. Prefer a specific statement such as “token replay and concurrent branch-write tests passed against the local test database.”
