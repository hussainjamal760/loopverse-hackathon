# Implementation phases

## Planning model
The paper gives no duration/team size. Allocate the available time proportionally; do not pretend a fixed 24-hour event. Phases total 100% of the window. Optional bonuses are stretch work only if baseline gates finish early; otherwise use their time for defects.

| Phase | Budget | Outcome |
|---|---:|---|
| 0 Scope and contracts | 5% | Agreed assumptions, schema, route map and owners |
| 1 Foundation | 10% | Running app, database, tokens, shared UI, seed skeleton |
| 2 Identity and onboarding | 12% | Real email setup, login, roles and complete student record |
| 3 Admin operations | 18% | All CRUD, assignment/slot rules and server pagination |
| 4 Student planner | 20% | One-time branch, complete planner, atomic save, print |
| 5 Requests and unlocks | 12% | End-to-end review and exactly-once grants |
| 6 Polish and eligible bonuses | 10% | Consistent UI, optional completed bonus features |
| 7 Verification and submission | 13% | Adversarial tests, fresh setup, five-minute rehearsal |

## Phase 0 — agree before coding
Tasks: copy rubric into issue tracker; record decisions in requirements doc; confirm single exam cycle, global slots, required end times, timezone and assignment freeze; agree API error/list envelopes; assign feature owners.

Output: route skeleton, ERD, backlog by score and dependency, design tokens, README assumptions.

Gate: everyone can explain first-time flow and what exactly one approved request permits. No competing schemas or parallel implementations of authentication.

## Phase 1 — foundation
Tasks: scaffold stack; migrations; constraints and indexes; domain error helper; auth guard interface; transaction/lock utilities; test database; Tailwind tokens; Button/Input/Dialog/Badge; admin and student shells; static accessible loading/empty/error components.

Output: app boots from clean checkout; one paginated database-backed list; synthetic branch/course seed; 360px shell.

Gate: lint/typecheck pass; migration on empty database passes; one API integration test and one browser smoke test pass.

## Phase 2 — identity
Tasks: complete three-group student schema/form; admin bootstrap; creation transaction/outbox; worker; setup/reset tokens; password hashing; sessions, logout and current-user endpoint; server RBAC; account deactivation.

Output: admin creates complete student; student receives setup email, sets password and logs in.

Gate: used/expired link fails; no self-registration; forgot response generic; student admin access fails; all required fields survive reload. Do not move on with email merely mocked.

## Phase 3 — admin operations
Tasks: branch/course/student detail/edit/delete/deactivate; assignment editor with draft/finalized distinction; all slot CRUD/publish validation; all six paginated searchable lists including initial request list; shared confirmation and errors.

Output: admin can prepare 4–6 courses and several slot choices per course for a student.

Gate: direct API requests cannot violate 4–6 finalized rule, uniqueness or past/end-time rules. Filtered totals are correct on page 2. Protected deletes return meaningful conflict errors.

## Phase 4 — core student product
Tasks: state-driven routing; active branch cards; atomic write-once selection; full read-only profile; course/date/time controls; agenda preview; UI/server conflict checks; review dialog; atomic sheet save and snapshot; print CSS.

Output: one complete real student journey from invitation through printed locked sheet.

Gate: second save fails through direct API; simultaneous branch saves yield one winner; invalid course/slot fails; no partial sheet; mobile 360px journey passes; print contains required sorted fields.

## Phase 5 — controlled changes
Tasks: help form; unique pending validation; request history; admin filters/remarks/decision; grant creation; approved routing; atomic single-use consumption; branch revision handling; rejected/unused grant states.

Output: request → approve → change once → locked again, for BOTH types.

Gate: concurrent approvals create one grant; failed save retains grant; two simultaneous uses yield one successful change; rejecting changes nothing; branch grant cannot alter exam slots.

## Phase 6 — polish and stretch
First fix spacing, form errors, long labels, sticky controls, loading states and reduced motion. Add only the motion specified in design.md.

Suggested bonus order by incremental risk: audit log, decision email (reuse outbox), real dashboard metrics/chart, downloadable PDF, then capacity. Audit hooks should already exist; complete the UI and assertions here. Capacity is last because it changes booking and branch-change transactions.

Gate: no bonus ships if it weakens baseline. A “Download PDF” button must return a real file; a “Seats left” badge must reflect database bookings; otherwise remove it rather than fake it.

## Phase 7 — verify and present
Freeze features. Run complete tests and race tests, review logs for secrets, test setup on clean clone, check deployed mail and optional PDF, finish ERD/assumptions, fill disposable demo credentials and live link, rehearse 5 minutes with local backup.

Gate: rubric checklist has evidence for every claimed item; each member can explain their domain logic; submission occurs before deadline with buffer.

## Ownership pattern
For a hypothetical four-person team: A owns schema/auth/security; B admin CRUD/assignments/schedules; C student planner/design/print; D request flow/tests/deploy/docs. This is an example, not the event's team requirement. With fewer people, merge roles and work in dependency order. Each contributor commits their actual work regularly; do not fabricate commit history.

## Cut order if time shrinks
Cut animated entrances → custom charts → downloadable PDF → capacity → decorative icon work. Keep subtle CSS feedback if already stable. Never cut server validation, email onboarding, full student fields, any admin listing pagination, print, request unlocks, or submission rehearsal.
