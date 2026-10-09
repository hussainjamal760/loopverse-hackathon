# Screens and journeys

## Route map
| Route | Role | Main content |
|---|---|---|
| /login | Public | Email/password, forgot link, no registration |
| /forgot-password | Public | Email form and generic result |
| /set-password?token=… | Public token | Password/confirmation; expired and used-link states |
| /admin | Admin | Workflow overview; bonus real counts/chart |
| /admin/branches | Admin | Search, status filter, paginated list, create/edit/details/delete |
| /admin/courses | Admin | Search, status filter, paginated CRUD |
| /admin/students | Admin | Search, paginated students and account/assignment states |
| /admin/students/new | Admin | Three-group form and account invitation |
| /admin/students/:id | Admin | Full details, edit, assignments, sheet and request history |
| /admin/assignments | Admin | Search/paginated student assignment sets and editor |
| /admin/schedules | Admin | Search/paginated slots, course/status filter, CRUD/publish |
| /admin/requests | Admin | Search, type/status filters, paginated requests, review dialog |
| /admin/audit | Admin | Optional paginated admin actions |
| /student/branch | Student | Initial or approved one-time branch choice |
| /student | Student | Planner, incomplete-assignment state, or locked-sheet summary |
| /student/profile | Student | Complete read-only personal/guardian/academic information |
| /student/date-sheet | Student | Current saved document and print/download actions |
| /student/help | Student | Request type/reason form and request history |

Server guards derive allowed routes from current database state. Bookmarked routes must not bypass workflow. Redirect is a UI convenience; API authorization is independent.

## First-time student flow
Admin creates student → account committed and email job queued → real setup email delivered → student opens setup link → sets password → explicit login → choose active branch → view profile summary and course planner → select all slots → review → atomic save → view/print locked sheet.

Creating the account is not the same as email delivery. Admin student detail shows queued/sent/failed and a resend action. Never show “Email delivered” merely because the database insert succeeded.

## Returning student routing
1. Unauthenticated: login.
2. Deactivated account: end session and show account unavailable.
3. No branch or unused approved branch grant: branch page; optional “Keep current branch for now” during approved change leaves the grant unused and exits without writing.
4. Branch set, no sheet, assignments incomplete: course assignment notice.
5. No sheet and valid assignments: planner.
6. Sheet exists and unused sheet grant: planner prefilled with current selections, plus current-sheet link.
7. Sheet exists, no grant: locked date sheet.

If both grants exist, present branch change first, then sheet change. Approval is visible on refresh/session-state refetch as well as next login. Recheck state on focus and successful mutation; do not rely on claims encoded at login.

## Admin CRUD patterns
List toolbar: title/count, scoped search, filters, create action. Search debounced around 300ms; reset to page 1 when search/filter/pageSize changes. Preserve URL query params for back navigation. Footer: “Showing 11–20 of 37” with previous/next and page size.

Create/edit pages use explicit submit, cancel and dirty-form warning. Validation failures show summary and field messages while retaining input. Detail views contain real persisted values. Delete confirmation names the entity and explains whether deletion is blocked or deactivation is available.

Student form: Personal → Parent/guardian → Academic → Review. Allow returning to completed sections without losing values. Final submission validates all groups on server. Mark required fields visibly. Gender uses a respectful list including self-description/prefer not to say if institution policy allows; do not silently assume a restrictive institutional policy.

## Assignment editor
Search/select courses, show count “4 of 6 maximum”, and list removable selections. New students can save a draft of up to 6 and remain blocked. “Finalize assignments” requires 4–6. Finalized sets edit atomically; don't send a series of delete calls that temporarily reduces a valid set below four.

After a sheet is saved, display read-only assignments with the reason: “Courses are fixed for this exam cycle. Approved date-sheet requests change exam times only.”

## Schedule editor
Choose course → local date → start/end → draft/published → review. Show Asia/Karachi next to times. Validate end > start, same local day, future start and duplicate course/start/end. The baseline has no unpublished calendar entries visible to students. Used slot forms become read-only and offer “Create another slot” rather than destructive editing.

## Requests
Student request form: two choices, clear explanation of each, reason 10–1000 characters. Branch request requires an existing branch; sheet request requires a saved sheet. Submission confirms only that the request was received, not approved.

Admin review dialog: student name/registration, request type, raised date, reason, current branch/sheet, optional remark, Approve/Reject. Decision is final for that request. Repeated/stale decisions receive conflict feedback and refresh.

Student history displays status and admin remark. Approved request also indicates “Ready to use” or “Used on [date]”. A rejected request does not hide the current sheet. An unused approved change retains current branch/sheet until a successful replacement.

## Global edge states
- Session expiry: preserve non-sensitive draft selections in memory where feasible, require reauthentication, refetch before save.
- Slot disappears after draft load: show affected course and refresh available choices; no partial save.
- No active branches: show admin-contact guidance, not an empty required selector.
- Selected branch becomes inactive: preserve existing commitment and show a notice; new selections cannot use it.
- Search finds nothing: show query and “Clear search”; do not show “Create your first record”.
- Concurrent edits: show conflict, reload authoritative state, never silently overwrite.
- Public link errors: generic invalid/expired token message with a route to request another link.
- Slow network: disable duplicate submits but keep navigation understandable; server still enforces invariants.
