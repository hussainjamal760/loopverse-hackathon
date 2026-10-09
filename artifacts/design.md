# ExamSlot design system

## Concept: the modern campus planner
A calm, premium light interface with the warmth of a printed university planner. Use warm ivory backgrounds, white paper surfaces, forest-green primary actions, sage selection fills, and sparing muted terracotta. The feeling is organized, human, and quietly confident—not an AI startup dashboard.

Product name: ExamSlot. Tagline: Your exams. Your plan.
Simple mark: four rounded calendar cells, one checked. Use an SVG; do not invent a university seal or claim official affiliation.

### Non-negotiable exclusions
- No blue or purple brand colors.
- No dark theme or dark full-width panels. Dark ink remains necessary for readable text.
- No neon, sharp saturation, glow, blurred gradients, glassmorphism, floating blobs, animated backgrounds, or oversized gradient headlines.
- No bouncy transitions, celebratory confetti, typing effects, or perpetual motion.
- No UI-only locks: the UI reflects server authorization.

## Palette and tokens
| Token | Hex | Intended use |
|---|---|---|
| canvas | #F7F5EF | App background, warm ivory |
| surface | #FFFFFF | Cards, sheets, forms |
| surface-soft | #F0EEE6 | Subtle grouped sections |
| ink | #24352B | Main text and headings |
| ink-muted | #59645B | Supporting text; do not reduce opacity |
| forest | #285742 | Primary buttons, links, focus outlines |
| forest-hover | #204735 | Hover/pressed primary |
| sage | #E7EEE3 | Selected surfaces, positive backgrounds |
| terracotta | #9A4F36 | Small accent icon/text; not primary navigation |
| peach | #F5E6DC | Accent background |
| ochre | #795D18 | Pending status text |
| butter | #F5EDCE | Pending status background |
| danger | #A3342F | Error text and destructive action |
| danger-soft | #FAEAE7 | Error surfaces |
| border | #DEDCD1 | Decorative dividers only |
| control-border | #7B8578 | Inputs and interactive outlines |

Use roughly 75% warm neutral, 20% white/sage, and 5% accent. These are visual proportions, not computed constraints. White text is reserved for forest or danger filled buttons. Terracotta is an accent, not a competing second primary color. Status always includes an icon and text, never color alone.

```css
:root {
  color-scheme: light;
  --canvas: #f7f5ef;
  --surface: #ffffff;
  --surface-soft: #f0eee6;
  --ink: #24352b;
  --ink-muted: #59645b;
  --primary: #285742;
  --primary-hover: #204735;
  --selected: #e7eee3;
  --accent: #9a4f36;
  --accent-soft: #f5e6dc;
  --warning: #795d18;
  --warning-soft: #f5edce;
  --danger: #a3342f;
  --danger-soft: #faeae7;
  --border: #dedcd1;
  --control-border: #7b8578;
  --radius-control: 12px;
  --radius-card: 20px;
  --radius-dialog: 24px;
  --shadow-card: 0 4px 20px rgb(36 53 43 / 0.045);
  --shadow-overlay: 0 16px 48px rgb(36 53 43 / 0.12);
}
body { background: var(--canvas); color: var(--ink); }
:focus-visible { outline: 3px solid var(--primary); outline-offset: 3px; }
```

## Typography and composition
- UI/body: locally bundled Inter when available; system sans-serif fallback. Do not make the application depend on a live font CDN.
- Editorial accent: Georgia for the auth headline and final date-sheet title only. No serif in dense data tables.
- Body: 16px/1.5. Metadata: 13–14px/1.45. Table text: 14px/1.5. Never below 12px.
- Page title: 32px/1.15 desktop, 26px mobile; semibold, not extra bold.
- Auth hero: 44px desktop, 30px mobile; modest line length, no giant marketing area.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px. Form controls at least 44px high; default 48px.
- Content max-width: 1280px. Desktop horizontal padding: 32px; tablet 24px; phone 16px.
- Card padding: 24px desktop, 16px mobile. Avoid card-inside-card nesting unless it communicates grouping.
- Readable descriptions max-width approximately 65 characters per line.

## Application shells
### Admin
Desktop: 232px light sidebar, 72px header, flexible main. Sidebar contains Overview, Branches, Courses, Students, Assignments, Exam slots, Requests, and optional Audit log. Current item has a sage pill, forest icon, and visible label. Pending requests may show a real count badge.

Header contains breadcrumb and current admin identity, not a decorative global search. Put search within each listing so its scope is clear. At narrow widths sidebar becomes a labeled Menu button and accessible drawer.

### Student
Desktop: restrained top navigation with My exams, My profile, Need help, account menu. On mobile use a compact header and three labeled bottom navigation items. Provide bottom safe-area padding so navigation never covers controls.

Planner desktop: flexible course column plus 320–360px sticky agenda panel. Planner mobile: one column, compact progress header, collapsible agenda, full-width review button in a sticky bottom action area above navigation. Keep focused controls visible when the keyboard opens.

## Component contracts
| Component | Visual treatment | Required behavior |
|---|---|---|
| Primary button | Forest fill, white label, 12px radius | One principal action per region; busy label and spinner on pending mutation |
| Secondary button | White fill, visible outline, ink label | Real button element; clear hover/focus |
| Destructive action | Danger text, danger fill only in confirmation | Explain impact before execution |
| Input | White, visible control border, persistent label | Help text and inline error connected with aria-describedby |
| Branch card | White, city eyebrow, branch name, address | Native radio semantics; selected outline + check + text |
| Course card | Course code, title, date control, time choices | Native controls; completion badge; inline overlap message |
| Slot chip | Outlined compact radio | Full date/time accessible name; disabled reason; min 44px target |
| Status badge | Soft semantic fill, icon, text | Pending/approved/rejected/locked remain understandable without color |
| Data table | Quiet header, horizontal dividers | Sort if supported; scoped search; loading/empty/error/footer states |
| Request timeline | Vertical rule with small nodes | Dates and remarks; no fake steps or promised approval time |
| Toast | Small neutral surface | Secondary feedback only; persistent errors stay near action |
| Modal/dialog | White paper, subtle shadow, solid translucent backdrop | Focus trap, accessible title, Escape when safe, focus restoration |
| Empty state | Small line icon, direct heading, one action | Differentiate no data, no matches, and blocked workflow |
| Skeleton | Static pale blocks or subtle optional fade | Preserve layout; avoid continuous shimmer |

Tables on mobile: branch/course/request lists become labeled cards; retain true tables where comparisons matter and provide a contained horizontal scroll region. Never make the entire page horizontally scroll. Pagination stays usable under either representation.

## Motion system
Motion should explain changes, not decorate waiting. Animate opacity and transform; avoid layout thrashing. Do not delay navigation or successful server responses to finish an animation.

| Interaction | Timing | Motion |
|---|---|---|
| Button hover | 120ms | Color change; optional 1px lift on pointer devices |
| Branch selected | 160ms | Border/fill change and check fades in |
| Route content enters | 180ms | Opacity 0→1; translateY 6px→0 once |
| Course completion | 160ms | Check fades in; status text updates |
| Agenda changes | 180ms | Affected row fades/slides by max 4px |
| Dialog opens | 180ms | Opacity and scale .98→1 |
| Inline validation | 120ms | Error fades in, no shaking |
| Successful sheet save | 240ms | Document surface fades up 8px after server success |

Use easing cubic-bezier(0.2, 0, 0, 1). Stagger at most the first four initially visible cards by 30ms; do not stagger tables or rerendered search results. Disable scroll-triggered effects. Reduced motion removes movement and keeps immediate state feedback.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
```

Do not depend on animationend to apply business state. Source reference: Yale's Animated Content and Timing guidance recommends respecting prefers-reduced-motion.

## Planner experience
Heading: “Plan your exam week.” Subtext: “Choose one available time for each course. You can save your date sheet once.”

Each course card contains:
1. Small code label, course title and credit hours.
2. Date options containing only dates with published future slots.
3. Time choices for the selected date, each showing start and end.
4. Completion state or an actionable conflict explanation.

Agenda preview sorts by start timestamp and presents day, date, course, and time. Always show full dates including year in final review. No drag-and-drop requirement: native keyboard-accessible controls are faster to understand.

Keep a newly selected conflicting slot visible long enough to explain the problem; mark both affected courses and disable save. Offer “Choose another time” focused on the relevant control. Never silently replace another selection or auto-save.

Review modal: selected branch, all courses, local timezone, and a plain-language warning: “After saving, changes require admin approval.” Buttons: “Back to planning” and “Confirm and save”. A failed request retains the draft. A successful response replaces the planner with the locked document.

## Copy and feedback
| State | Text |
|---|---|
| No branch | Choose where you’ll sit your exams. |
| Branch confirmation | You can choose a branch once. Later changes need admin approval. |
| Incomplete assignments | Your courses are still being assigned. You can plan once 4–6 courses are confirmed. |
| No slots | No exam times have been published for this course yet. |
| Conflict | CS101 overlaps with MTH101 on 12 November, 9:00–10:30 AM. Choose another time. |
| Locked sheet | Your date sheet is saved. Need a change? Send a request. |
| Approved branch grant | Your branch change is approved. You can choose a new branch once. |
| Approved sheet grant | Your date sheet change is approved. Your current sheet stays valid until you save a replacement. |
| Network failure | We couldn’t save your changes. Your choices are still here. Try again. |
| Full optional slot | This time just filled up. Choose another available time. |

Example dates in copy are illustrative, not seed dates.

## Accessibility and print gate
- Target WCAG AA contrast: test actual rendered normal text at 4.5:1 and important component boundaries at 3:1. Do not assume every arbitrary palette combination passes.
- Semantic headings, links for navigation, buttons for actions, labels for controls, native radio groups for choices.
- Full keyboard flow including dialogs, menus, date choices, time choices, review, save, and print.
- Visible focus; polite live region for updated course progress; alert/error summary for failed submissions.
- 200% zoom and 360px width must not hide content or controls.
- Reduced motion still communicates loading, selection, errors, and success.
- Print is black text on white, no navigation, no buttons, no shadow, no backgrounds required.
- A4 layout, approximately 12mm margins, repeated table header and no split course row. Show branch address, student name, registration, program, and timezone; exclude CNIC/guardian details from print.

## Visual QA checklist
- [ ] No blue/purple/default theme remnants, dark panels or gradients.
- [ ] All primary buttons share one style.
- [ ] Screen hierarchy is visible without decorative illustrations.
- [ ] Every async area has loading, empty, error and success states.
- [ ] All disabled actions explain why.
- [ ] Motion is subtle and honors the OS preference.
- [ ] Mobile screenshots include realistic long course and branch names.
- [ ] The planner and printed date sheet look like one product.
