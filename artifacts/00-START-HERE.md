# ExamSlot — Hackathon Build Pack

## The direction
Build an exam portal that feels like a thoughtfully designed university planner: warm paper, confident forest-green actions, quiet terracotta accents, generous spacing, and useful motion. Product line: **Your exams. Your plan.**

This is a proposed implementation specification, not a finished application or a guarantee of winning. It translates the supplied Loopverse 3.0 question paper into a buildable product. The linked Claude artifact could not be retrieved; the pasted paper is the source of truth. Team size and hackathon duration were blank, so phases use percentages rather than invented deadlines.

## Read in this order
| File | Purpose |
|---|---|
| 01-REQUIREMENTS.md | All scored requirements, acceptance criteria, and priorities |
| design.md | Visual identity, exact colors, layout, components, responsive and motion rules |
| 03-SCREENS-AND-FLOWS.md | Screen-by-screen UI and all important states |
| 04-ARCHITECTURE.md | Stack, folder structure, responsibility boundaries |
| 05-DATA-MODEL.md | Entities, constraints, ERD, and safe-delete decisions |
| 06-API-AND-STATE-MACHINES.md | API contracts, permissions, locking, concurrent writes |
| 07-SETUP.md | Planned local setup, environment variables, seed and deployment |
| 08-PHASES.md | Dependency-ordered implementation phases and exit gates |
| 09-TEST-PLAN.md | Acceptance, integration, concurrency, responsive and demo checks |
| 10-DEMO-AND-SUBMISSION.md | Five-minute presentation and delivery checklist |
| 11-AI-BUILD-INSTRUCTIONS.md | Guardrails and phase prompts for an AI coding assistant |
| 12-README-TEMPLATE.md | Repository README template to finish before submission |

## Product priorities
1. Build the entire real student journey before decorative work.
2. Make backend invariants demonstrable: one-time saves, one-time unlocks, course limits, ownership, conflicts.
3. Make every screen readable and usable at 360 px.
4. Apply the visual system consistently instead of making every page unique.
5. Add bonuses only after the 100-point baseline passes.

## Signature moments
- Branch cards that settle into a locked selection after confirmation.
- A course-by-course planner with a live, keyboard-accessible agenda preview.
- Clear explanations when two exams overlap, with a direct route back to the affected course.
- A restrained document reveal when the server confirms the date sheet is saved.
- A request timeline explaining pending, approved, used, and rejected states without technical jargon.

## Explicit boundaries
No AI assistant feature, chat widget, landing-page detour, gamification, dark mode, decorative dashboard charts with fake numbers, or background blobs. Bonus preference: audit log instead of dark mode. Do not implement a payment system, attendance, or institution-wide multi-tenancy.

The paper requires work during the hackathon window. Confirm organizer policy before using prepared materials; do not submit a pre-built project or misrepresent when work was done. Each teammate must understand and be able to explain the code they present.

## Evidence used
The supplied question paper defines the requirements. External security and accessibility references inform implementation checks, not the proposed brand direction:
- OWASP Forgot Password Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
- Yale Animated Content and Timing: https://usability.yale.edu/digital-accessibility/accessibility-resources/accessibility-articles/animated-content-and-timing
