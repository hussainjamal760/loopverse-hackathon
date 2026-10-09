# Test plan and release gates

## Automated test layers
Unit: interval comparisons, date conversion, normalization, validation schemas, permission derivation and pagination parsing.
Integration with real PostgreSQL: constraints, RBAC/ownership, tokens, transactions, protected deletion, grants and search counts.
Browser: complete admin/student journeys, keyboard flow, mobile and print preview. Use separate test database and synthetic data; tests must never reset deployment data.

## Required acceptance cases
| ID | Test | Expected result |
|---|---|---|
| AUTH-01 | Create student with every required group | All fields persist; email job created |
| AUTH-02 | Open setup link and set password | Password hashed; user can log in |
| AUTH-03 | Replay/expire token | Rejected without changing password |
| AUTH-04 | Submit token twice concurrently | One succeeds; other rejected |
| AUTH-05 | Forgot password for known/unknown email | Same public message; rate limits apply |
| AUTH-06 | Reset password then use old session | Session rejected |
| ACL-01 | Student calls each admin mutation/list | 403, no data/state change |
| ACL-02 | Student A requests B's resource | 404/denied, no identity leak |
| CRUD-01 | Create/read/update/delete unused entities | Persisted correct values and confirmation UX |
| CRUD-02 | Delete selected branch/chosen slot | Blocked; existing sheet intact |
| CRUD-03 | Deactivate student with history | Login/session blocked; history retained |
| FIELD-01 | Missing guardian/emergency/academic fields | Server rejects and points to fields |
| FIELD-02 | Duplicate normalized email/code/registration | Friendly conflict from database-backed uniqueness |
| ASSIGN-01 | Draft 0–3 courses | Saved incomplete; planning disabled |
| ASSIGN-02 | Finalize 3 or 7 courses | Rejected |
| ASSIGN-03 | Finalize 4 and 6 courses | Accepted |
| ASSIGN-04 | Duplicate course in payload | Rejected, no duplicate row |
| ASSIGN-05 | Reduce finalized set to 3 | Rejected atomically |
| ASSIGN-06 | Edit after sheet exists | Rejected even with slot-change grant |
| SLOT-01 | Past start, end<=start, cross-midnight | Rejected under documented policy |
| SLOT-02 | Exact same course/start/end twice | Rejected |
| SLOT-03 | Draft slot in student's payload | Rejected |
| SLOT-04 | Edit/unpublish selected slot | Rejected |
| PAGE-01 | Each of six lists with >pageSize records | API returns only requested page and correct count |
| PAGE-02 | Search/filter then go to page 2 | Filtered total/pages remain correct |
| PAGE-03 | Remove last record on final page | UI moves to valid page; no misleading total |
| BR-01 | Initial branch choice | Saved once; login skips selection |
| BR-02 | Second direct choice without grant | 409 and unchanged branch |
| BR-03 | Inactive/missing branch | Rejected |
| PLAN-01 | Missing/extra/wrong-course slot | Rejected, no partial sheet |
| PLAN-02 | Overlapping intervals | Both UI and server reject |
| PLAN-03 | Adjacent intervals | Accepted |
| PLAN-04 | Same time different days | Accepted |
| PLAN-05 | Valid complete selection | Snapshot and relational selections commit together |
| PLAN-06 | Second sheet save without grant | Rejected |
| PLAN-07 | Slot becomes past before submit | Rejected with recoverable message |
| PRINT-01 | Print current sheet | Required fields, chronological order, no controls/PII |
| REQ-01 | Two pending same type | Second rejected |
| REQ-02 | One pending of each type | Both allowed |
| REQ-03 | Approve and log in again | Only matching action reopened |
| REQ-04 | Reject with remark | Locks unchanged; remark visible |
| REQ-05 | Failed replacement save | Old sheet/grant intact |
| REQ-06 | Successful replacement then retry | First succeeds, next fails; grant consumed |
| REQ-07 | Branch change after saved sheet | Branch-only revision; times unchanged |
| REQ-08 | New same-type request while grant unused | Rejected with clear next action |
| REQ-09 | Both approved grants | Independent; using one leaves other unused |
| MAIL-01 | SMTP unavailable | Account/decision persists; retryable failure visible |
| SEC-01 | Script tags in name/reason | Rendered as text, not executed |
| SEC-02 | SQL-like query input | No injection; validation/parameterization preserved |
| SEC-03 | Foreign origin mutation/no CSRF | Rejected |

## Concurrency suite
Use separate real database connections and synchronized request starts. Assert database rows after both responses, not just HTTP codes.
- Two initial branch saves: exactly one committed branch.
- Two initial sheet saves: one sheet, one revision, correct selection count.
- Two approvals for same request: one grant and one final decision.
- Two requests attempting the same unlock: one committed replacement, one consumption.
- Admin assignment edit versus initial sheet save: serialized; either valid complete sheet or clear conflict, never mismatched assignments.
- Slot deletion/edit versus sheet save: either slot mutation wins and save rejects stale choice, or sheet wins and mutation is blocked.
- Token double-use: one password update.
- Optional final seat: one booking succeeds; no overbooking.
- Optional branch move: all seats move or none do; failed move preserves grant.

## Responsive and accessible checks
Widths: 360, 390, 768, 1024, 1440px. Include landscape and 200% zoom.
- No page-wide horizontal overflow.
- Visible labels, validation text, table/card actions and pagination.
- Sticky actions do not cover last course, footer, keyboard focus or navigation.
- Complete planner using keyboard alone; all radio choices have meaningful labels.
- Dialog focus trapped/restored; Escape/cancel works without data loss.
- Errors announced and associated with fields; focus moves to useful error summary.
- Reduced-motion preference removes transforms/animation, not state changes.
- Contrast checked on rendered components, including disabled/help/focus/error states.
- Long names, addresses, course titles and empty results remain usable.
- Print A4 preview in at least two target browsers if available; no cut-off rows.

## Optional bonus checks
PDF is a genuine authenticated attachment, own data only, and matches current revision. Decision mail contains status/remark safely escaped. Dashboard counts equal known seeded database facts. Audit metadata excludes passwords/tokens/CNIC. Capacity respects retained reservations and full-slot hiding.

## Release checklist
- [ ] Unit/integration/browser checks pass or limitations explicitly documented.
- [ ] Build, lint, typecheck pass.
- [ ] Clean clone and empty database setup rehearsed.
- [ ] At least 1 admin, 3 branches, 8 courses, 5 students and usable future slots.
- [ ] Email setup actually demonstrated, not merely mocked.
- [ ] Both grant types tested end-to-end.
- [ ] All six lists searched and paginated.
- [ ] No secrets or real student data in repository/history/screenshots.
- [ ] README complete; live/local backup ready; demo <=5 minutes.
