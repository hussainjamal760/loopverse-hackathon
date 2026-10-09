# Five-minute demo and submission

## Narrative
“ExamSlot lets students plan their own exams without losing institutional control. Every choice is validated, saved once, and changed only through a traceable one-time approval.”

Show a working product, not a design tour. Keep one admin browser and one student/private browser open, plus a team-owned inbox. Use prepared synthetic fixtures, but disclose them; do not fake server responses or edit database state during the presentation.

## Demo timeline
| Time | What to show | Evidence |
|---|---|---|
| 0:00–0:20 | Product promise and warm planner UI | Clear purpose and visual direction |
| 0:20–1:05 | Admin student creation; full form groups; open invitation; set password | Real onboarding and complete information |
| 1:05–1:40 | Assignment set 4–6; slot editor; search and page 2 | Backend validation and database pagination |
| 1:40–2:40 | Student chooses branch; selects slots; trigger overlap; fix; review/save | Core complete journey, useful feedback |
| 2:40–3:00 | Sorted sheet, print preview, locked planner | Print and write-once rule |
| 3:00–4:00 | Student request; admin approval; one replacement; relocked state | Exactly-once controlled change |
| 4:00–4:25 | Mobile viewport and keyboard/reduced-motion polish | Responsive usability |
| 4:25–4:45 | Only completed bonuses; audit/counts/mail/PDF | Real implementation, not promises |
| 4:45–5:00 | ERD, tests and reproducible setup | Engineering confidence |

Email delay contingency: show creation and queued/sent state, then use an already-delivered invitation for a separate seeded student, saying explicitly that it was prepared for timing. Keep live onboarding test evidence from rehearsal. Do not claim the prepared email was just delivered.

Choose one request type for timed presentation, but prepare both for judge questions. Branch change on a saved sheet is a likely edge-case question.

## Judge-ready explanations
- Why PostgreSQL? The design uses relational constraints and transactions for linked exam records and concurrent changes.
- Why required end time? It makes true interval-overlap validation possible; the paper permits the choice.
- Why drafts below four? New accounts need a setup state; only finalized sets of 4–6 can proceed.
- Why grants rather than an unlocked boolean? A grant ties authorization to a specific approved request and has a one-time consumption record.
- What if two tabs save? Student row lock, validation inside transaction and unique constraints ensure one valid commit.
- What happens when email fails? Outbox retry; account remains valid; controlled resend available.
- Can a student modify another student's data? Student identity is derived from the session; role and ownership checks are on server.
- Why not delete used slots? That would invalidate saved date sheets; protected records remain stable.
- Why no dark mode? User-requested light identity; audit log targets the alternative one-point bonus.
- How are dates handled? UTC storage, Asia/Karachi input/display, full dates and timezone on document.

## Submission bundle
- Source repository URL, regular genuine contributor commits.
- Finished README with exact tested commands, environment variables, ERD and assumptions.
- Lockfile, migrations, synthetic idempotent seed.
- Disposable admin and student demo credentials, isolated demo only.
- Live link if hosted, plus local fallback instructions.
- Test results and short list of honest limitations.
- Five-minute demo practiced with a timer.
- No secrets, real CNICs, working production credentials, misleading completion claims or pre-built project representation.

## Final quality rule
A beautiful interface with fake persistence will not satisfy this paper. A correct app with confusing controls leaves usability marks at risk. Finish the complete journey, prove its rules, then make every interaction feel considered.
