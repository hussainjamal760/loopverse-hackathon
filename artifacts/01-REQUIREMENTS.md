# Requirements and scoring map

## Baseline: 100 marks
| Area | Marks | Implementation | Acceptance evidence |
|---|---:|---|---|
| Branch, course, student CRUD | 15 | Complete admin forms, details, edit, safe delete | Create/edit/remove unused records; referenced records protected; all student groups persisted |
| Email setup and login | 10 | Admin-created accounts, real email, setup/reset, sessions | Open delivered message; set password; replay and expired token rejected |
| Course assignments | 8 | Server-validated draft and finalized sets | 4 and 6 accepted; duplicate, 3-finalized and 7 rejected |
| Exam schedules | 10 | Course slots, start/end, publishing | Past, duplicate and invalid time ranges rejected; selected slots protected |
| Search and pagination | 7 | All six admin listings query database | Search reduces total; page/pageSize transmitted; only requested page returned |
| Branch selection | 8 | First selection and backend routing | Second direct API save rejected; returning login skips selection |
| Planner and save lock | 10 | Exact course coverage, valid slots, overlap checks, atomic save | Incomplete/foreign/conflicting selections rejected; repeated save rejected |
| Date sheet and print | 5 | Sorted readable document and print stylesheet | Contains identity, branch, code/title/date/day/time; clean print preview |
| Requests and unlocks | 10 | Reason, status, remarks, approval/rejection and scoped grants | Duplicate pending blocked; approval unlocks only matching action once |
| Responsive design | 7 | Mobile layouts and usable tables/forms | Full journey works at 360 px, tablet and desktop |
| Security and quality | 5 | Auth, RBAC, validation, relations and organized code | Student cannot access admin or another student's data |
| Documentation/demo | 5 | Setup, ERD, assumptions, seed, credentials, presentation | Fresh clone works using documented commands; five-minute demo |

## Bonus: up to 10 marks
| Feature | Marks | Acceptance |
|---|---:|---|
| Branch seat capacity per slot | 3 | Fully booked branch-slot unavailable to new selections; atomic reservation survives race test |
| Downloadable PDF | 2 | Authenticated PDF download matches saved date sheet |
| Request decision email | 2 | Approved/rejected email reaches student; failures retry without rolling back decision |
| Admin counts and charts | 2 | Database-derived saved/not-saved counts and pending requests, no fabricated analytics |
| Audit log | 1 | Admin actor/action/entity/time recorded; secrets and full CNIC excluded |

## Required student fields
| Group | Fields |
|---|---|
| Personal | Full name, unique email, phone, CNIC/B-Form number, date of birth, gender, address; optional profile photo |
| Parent/guardian | Father or guardian name, parent CNIC, occupation, contact number, emergency contact |
| Academic | Unique registration number, program/degree, semester, session/batch, previous qualification, previous institute, marks or CGPA |

Use separate qualification result type/value/max fields rather than assuming every student has CGPA. Validate CGPA against a declared scale and marks against declared maximum. Use strings for phone and identity numbers, preserving leading zeros. Store date of birth as a date, not a timestamp. Optional photo may be deferred; do not defer other required fields.

## Hard requirements independent of UI
- Students cannot self-register; only admins create accounts.
- Every protected endpoint checks both role and record ownership where relevant.
- Email and codes have normalized unique keys; registration numbers are unique.
- Branch selection is write-once unless an unused approved branch grant exists.
- Date sheet is write-once unless an unused approved date-sheet grant exists.
- Every assigned course has exactly one selected slot from that course.
- Student cannot save with fewer than 4 or more than 6 finalized assignments.
- End times are mandatory in this implementation, although optional in the paper, to make overlap checks unambiguous.
- Saved sheets and used slots cannot be silently mutated by ordinary admin CRUD.
- All six admin lists have server-side search and pagination, including assignments and requests.
- Rejecting a request does not change locks, assignments, branch, or saved sheet.

## Documented assumptions
1. One exam cycle is in scope; multiple terms are a future feature.
2. All exam display and admin input use Asia/Karachi; timestamps are stored in UTC.
3. Course slots are global across active branches in baseline. No branch-specific slot availability until the optional capacity layer.
4. End time is required and slots do not cross local midnight. Adjacent intervals may touch without conflicting.
5. A newly created student has zero assignments and an INCOMPLETE status. Draft assignment sets may contain 0–6 distinct courses; only an atomic finalized set of 4–6 enables planning.
6. Once assignments are finalized, ordinary changes must keep 4–6. After a sheet exists, ordinary assignment edits are blocked even after a request: the approved request permits changing chosen slots, not the academic course roster. The paper allows a stricter documented policy; explain this clearly.
7. Request approval creates one grant. An unused grant blocks a new request of the same type until consumed. No automatic expiry in this one-cycle implementation.
8. Branch change changes the current sheet's displayed branch through an audited revision without unlocking course/time changes. Baseline slots remain valid across branches. Historical revisions remain preserved.
9. Deactivating a selected branch stops new selections but preserves existing commitments. No automatic migration. Affected students can request a change.
10. Delete unused records physically; block deletion of records with protected academic references. For students with history, offer deactivation instead. Document audit retention separately from academic references.
11. Slots have draft/published status. Students see published, future, active-course slots only. Selected slots cannot be edited, unpublished or deleted.
12. Not hosting is acceptable under the brief; a tested local app beats a broken live deployment.
