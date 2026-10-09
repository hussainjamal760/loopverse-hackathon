# API and state machines

## Response contracts
Successful list:
```json
{"data":[],"pagination":{"page":1,"pageSize":10,"total":0,"totalPages":0}}
```
Failure:
```json
{"error":{"code":"EXAM_CONFLICT","message":"Two selected exams overlap.","fields":{},"details":{"courseIds":["courseA","courseB"]}}}
```
Use 401 unauthenticated, 403 role forbidden, 404 missing/other-student resource, 409 locked/concurrent/duplicate/full, 422 validation failure, 429 rate limit. Avoid exposing internal traces.

Lists accept page, pageSize, q and whitelisted filters/sorts. Use the same WHERE clause for count and rows. Order by a stable column plus id. Page beyond last returns empty rows and accurate total; UI navigates to last valid page after deletion. Blank query is permitted. Validate page integers and bound q length.

## Endpoints
| Method/path | Access | Responsibility |
|---|---|---|
| POST /api/auth/login | Public, rate-limited | Verify password, rotate session |
| POST /api/auth/logout | Session | Revoke session |
| POST /api/auth/forgot-password | Public, rate-limited | Generic response and reset email job |
| POST /api/auth/set-password | Token, rate-limited | Consume valid setup/reset token and hash password |
| GET /api/me | Session | Role, own profile summary and derived permissions |
| GET/POST /api/admin/branches | Admin | Paginated search/create |
| GET/PATCH/DELETE /api/admin/branches/:id | Admin | Details/edit/safe delete |
| GET/POST /api/admin/courses | Admin | Paginated search/create |
| GET/PATCH/DELETE /api/admin/courses/:id | Admin | Details/edit/safe delete |
| GET/POST /api/admin/students | Admin | Paginated search/create and queue email |
| GET/PATCH/DELETE /api/admin/students/:id | Admin | Full details/edit/safe delete |
| POST /api/admin/students/:id/resend-invite | Admin, rate-limited | Queue fresh invitation |
| GET /api/admin/assignments | Admin | Paginated searchable student assignment sets |
| GET/PUT /api/admin/students/:id/assignments | Admin | Read/atomically replace distinct course set |
| GET/POST /api/admin/schedules | Admin | Paginated search/create slot |
| GET/PATCH/DELETE /api/admin/schedules/:id | Admin | Details/edit/publish/protected delete |
| GET /api/admin/requests | Admin | Paginated search, status/type filters |
| POST /api/admin/requests/:id/decision | Admin | Approve/reject once, optional remark |
| GET /api/me/branches | Student | Active choices; paginated if needed |
| POST /api/me/branch | Student | Initial or approved branch write |
| GET /api/me/planner | Student | Own finalized courses, available slots, existing choices, permissions |
| POST /api/me/date-sheet | Student | Initial save or atomic replacement with grant |
| GET /api/me/date-sheet | Student | Current saved document |
| GET /api/me/date-sheet/pdf | Student | Optional downloadable own PDF |
| GET/POST /api/me/requests | Student | Own history/create request |
| GET /api/admin/metrics | Admin | Optional real aggregate chart/count data |
| GET /api/admin/audit | Admin | Optional paginated audit events |

No student endpoint accepts another student's identity as authority. If admin sheet preview is needed, use an explicitly admin-authorized student detail endpoint.

### Payloads
```json
{"branchId":"branch-id","expectedVersion":2}
```
```json
{"courseIds":["c1","c2","c3","c4"],"finalize":true,"expectedVersion":3}
```
```json
{"expectedVersion":4,"selections":[{"courseId":"c1","slotId":"s1"},{"courseId":"c2","slotId":"s2"},{"courseId":"c3","slotId":"s3"},{"courseId":"c4","slotId":"s4"}]}
```
```json
{"type":"DATE_SHEET","reason":"I need to move an exam because of a documented appointment."}
```
```json
{"decision":"APPROVED","remark":"Choose your replacement times and save once."}
```
expectedVersion is an optimistic UI guard, not the authorization mechanism. Increment Student.version on branch/assignment/sheet/grant-affecting changes. Reject stale state and return a refresh hint.

## Derived permissions
```text
canSelectBranch = branch is null OR unused BRANCH grant exists
canSaveSheet = active account AND selected branch exists
  AND finalized distinct assignments count in [4,6]
  AND (no date sheet OR unused DATE_SHEET grant exists)
```
Expose these computed values for display, but recompute inside each mutation. Do not store independent writable booleans such as isUnlocked that can drift from requests/grants.

## Request lifecycle
PENDING → APPROVED or REJECTED; decision cannot be reversed through ordinary CRUD.
APPROVED → one ChangeGrant; grant is UNUSED → CONSUMED only after successful corresponding action.

Lock student and request, confirm pending, reject if same-type unused grant already exists, create grant on approval, set reviewer/time/remark, record audit, queue optional decision email, commit. Repeated approval cannot mint another grant.

Request creation checks prerequisites, locks student, rejects duplicate pending or same-type unused approved grant. Branch and sheet requests are independent; one pending of each is permitted.

## Atomic branch save
1. Authenticate student and validate body.
2. Begin transaction; lock Student row and reload state/version.
3. Require no previous branch or one unused branch grant.
4. Lock requested Branch row; require active. For an approved change, reject selecting the same branch without consuming the grant.
5. Optional capacity: reserve all new-branch seats as one transaction if a sheet exists.
6. Update selectedBranchId. If sheet exists, create a new sheet revision with only branch data changed.
7. Consume the matching grant if this is a change; increment version; record event; commit.

Two initial branch writes in parallel result in one success and one conflict. A failed validation never consumes the grant.

## Atomic date-sheet save
1. Authenticate and validate request shape/length/duplicates.
2. Begin transaction; lock Student row, reload assignments, sheet, grant and expectedVersion.
3. Require branch selected, finalized 4–6 assignment set, and initial save or unused sheet grant.
4. Confirm submitted course IDs equal the complete assigned set, with no omission or extra course.
5. Lock all submitted ExamSlot rows in sorted ID order; require each slot exists, matches course, is published and starts in the future. Existing selected slots are protected from admin edits; recheck all input on server.
6. Compare all selected intervals. For n<=6, all-pairs is simple and sufficient.
7. Optional capacity: lock all affected BranchSlot rows in sorted order; verify and reconcile reservations.
8. Create sheet or replace selections within the transaction. Preserve old revision and write a new immutable snapshot.
9. Consume only DATE_SHEET grant if used, increment version, audit and commit.
10. Return committed sheet; send no success before commit.

Use PostgreSQL row locking via a reviewed parameterized query inside the transaction; ORM reads alone do not imply row locks. All services affecting student academic state must use the same student-lock discipline. Slot mutations lock slots and recheck references; referenced courses/branches need corresponding guarded writes so deletion cannot race validation. Define a consistent lock order and retry bounded deadlock/serialization failures; do not retry validation failures.

Double-click protection in React is not sufficient. Unique constraints and locks must protect simultaneous tabs and direct API requests. If response is lost after commit, client refetches current state; another POST cannot produce a second sheet or reuse a grant.

## Overlap logic
Represent intervals as half-open [start, end). Two overlap when:
```ts
const overlaps = (a, b) => a.start < b.end && b.start < a.end;
```
Compare real UTC instants. Adjacent exams 09:00–10:00 and 10:00–11:00 do not overlap. 09:00–10:30 and 10:00–11:00 do. The UI may warn that touching exams leave no travel break, but must not invent a mandatory gap absent from the paper.

## Password setup/reset transaction
Tokens are random, hashed in storage, purpose-scoped and expire after 24h for setup or 1h for reset (chosen policy). On submission lock the user and token, verify hash/purpose/expiry/unused, validate password, update hash, mark token used, invalidate other outstanding password tokens, revoke sessions, commit. A second simultaneous token submission fails. Redirect to login rather than silently starting a session. Do not consume a link on GET because email scanners may open links.
