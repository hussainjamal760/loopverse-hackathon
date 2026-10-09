# 📜 Loopverse Hackathon Engineering Guidelines & Code Quality Standards (`AGENTS.md`)

This document establishes the mandatory architectural, technical, and code quality standards for the **Loopverse Hackathon** monorepo across both **Frontend** and **Backend**. All human developers and AI coding assistants working on this repository must strictly adhere to these rules without exception.

---

## 🏛️ Core Principles & Architecture Rules

### 1. Opinionated Code Quality & Anti-Pattern Rejection (No "Yes-Man" Code)
- **Push Back Against Anti-Patterns**: Never implement flawed patterns, quick hacks, global mutable state anti-patterns, or monolithic scripts even if explicitly requested. Always refactor towards clean, modular, and scalable software architecture.
- **SOLID Principles**:
  - **Single Responsibility Principle (SRP)**: Each file, class, function, or component must have one, and only one, reason to change.
  - **Open/Closed Principle**: Modules must be open for extension but closed for modification.
  - **Dependency Inversion Principle**: High-level business logic must depend on abstractions (interfaces/services), not concrete implementations.
- **DRY (Don't Repeat Yourself)**: Eliminate duplicate logic immediately by extracting utility functions, custom hooks, or reusable middleware.
- **YAGNI (You Aren't Gonna Need It)**: Do not over-engineer speculative functionality. Build clean solutions for current requirements with clear extension points.

### 2. Strict Line-Count Limits & Anti-Monolith Policy
- **Functions & Methods**: **Maximum 30 lines** per function. If a function is doing multiple tasks (e.g., parsing, validating, transforming, saving), break it down into focused helper functions immediately.
- **Components & Files**: **Maximum 200 lines** per file. Large components must be broken down into sub-components and custom hooks.

---

## 🏗️ Feature-Driven Architecture (Feature-Sliced Design)

Organize code by **Feature / Domain**, **NEVER** by generic file type. A feature folder contains everything needed for that specific domain.

```text
Loopverse Hackathon/
├── AGENTS.md                    # Project-wide engineering standards
├── README.md                    # Project documentation & overview
│
├── frontend/                    # Next.js 15 + React 19 Frontend Application
│   ├── app/                     # Next.js App Router (pages, layout, global styles)
│   │   ├── styles/              # Global design tokens & CSS partials
│   │   ├── layout.jsx           # Root layout + Redux StoreProvider
│   │   └── page.jsx             # Main landing page composition
│   │
│   ├── features/                # Domain-isolated frontend feature modules
│   │   ├── navigation/          # Navbar, StaggeredMenu, navigation state/slice
│   │   ├── hero/                # VimeoHero & video controls
│   │   ├── motion-cards/        # MotionCards & GSAP inertia fling
│   │   ├── service-cards/       # ServiceCards & fan-out hover effects
│   │   ├── marquee/             # DoubleMarquee & logo randomization
│   │   ├── footer/              # Footer layout, stickers, socials
│   │   └── effects-and-cursor/  # CursorBubble, TransitionScribble, Lenis SmoothScroll
│   │
│   ├── store/                   # Central Redux store configuration & StoreProvider
│   └── components/ui/           # Low-level primitive shared UI components (e.g. SvgSymbols)
│
└── backend/                     # Node.js + Express + TypeScript + MongoDB Backend
    └── src/
        ├── config/              # Centralized environment parsing & database connection
        ├── middlewares/         # Global Express middlewares (error, validation, logger)
        ├── utils/               # Shared helpers (ApiError, ApiResponse, asyncHandler)
        └── features/            # Domain-isolated backend feature modules
            ├── health/          # Health check endpoints
            └── user/            # User management domain (model, validation, service, controller, routes)
```

### Feature Boundary Rules:
1. **Isolation**: Components or modules inside `features/<domain>/` belong exclusively to that domain.
2. **Cross-Feature Imports**: A feature **MUST NOT** import from deep internal paths of another feature (e.g. `features/auth/components/internal/Helper.jsx`). If a component or helper is needed by multiple features, promote it to `components/ui/` or `lib/`.

---

## 🎨 Frontend Standards (Next.js 15 + React 19 + Redux)

### 1. Server vs Client Component Rules
- **Server Components First**: Use React Server Components (RSC) by default for optimal performance and minimal bundle size.
- **Client Components Scope**: Add `'use client';` strictly at the top of files that require browser APIs, interactive event listeners (`onClick`, `onMouseMove`), React state/hooks (`useState`, `useEffect`), or GSAP animations.
- **Keep Client Boundaries Small**: Do not mark entire page layouts as Client Components. Isolate interactivity into small leaf Client Components.

### 2. State Management Rules
- **Global UI State**: Use **Redux Toolkit** in `store/` via feature slices (`features/<domain>/<name>Slice.js`) for app-wide UI states (e.g. active menu overlay, cursor hover mode, audio mute state).
- **Transient Local State**: Form input values, local hover toggles, and UI dropdowns must remain in React `useState`.

### 3. Styling & Motion Guidelines
- **CSS System**: Use CSS Variables defined in `app/styles/base.css` or feature-scoped CSS partials (`app/styles/*.css`). Avoid inline dynamic style blobs.
- **GSAP Animation Cleanup**: All GSAP timelines and event listeners created in `useEffect` MUST return a cleanup function or execute inside `gsap.context()` to prevent memory leaks and duplicate ticker callbacks.

---

## ⚙️ Backend Standards (Node.js + Express + TypeScript + Zod + Mongoose)

### 1. Mandatory 4-Layer Flow
Every API endpoint must strictly follow the 4-layer unidirectional flow:

```text
Route Layer (*.routes.ts)
   └── Middleware Layer (validate.middleware.ts with Zod)
        └── Controller Layer (*.controller.ts + asyncHandler)
             └── Service Layer (*.service.ts - Business Logic & ApiError)
                  └── Model Layer (*.model.ts - Mongoose Schema & DB Access)
```

- **Route Layer (`*.routes.ts`)**: Defines endpoints, HTTP verbs, and attaches Zod validation middlewares.
- **Controller Layer (`*.controller.ts`)**: Handles HTTP `req`/`res` objects, extracts input, calls the Service layer, and returns `ApiResponse`. Wrapped in `asyncHandler`. **No database queries in controllers!**
- **Service Layer (`*.service.ts`)**: Pure business logic and database interactions. Throws instances of `ApiError`.
- **Model Layer (`*.model.ts`)**: Defines Mongoose schemas, database indexes, and TypeScript interfaces (`IUser`).

### 2. Strict Zod Validation & Type Safety
- **Zero `any` Policy**: The use of `any` is strictly prohibited. Use explicit TypeScript interfaces, types, or Zod infer types (`z.infer<typeof schema>`).
- **Input Boundaries**: Every incoming HTTP request MUST be validated via Zod schemas BEFORE execution reaches the controller:
  ```ts
  router.post('/', validate({ body: createUserSchema }), createUser);
  ```
- **Environment Validation**: All environment variables MUST be validated via Zod in `src/config/env.ts` at boot time. Missing or invalid variables must crash server initialization immediately with clear error logs.

### 3. Error & Response Standardization
All endpoints MUST adhere to standardized JSON payloads:

#### Success Response Standard:
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Operation completed successfully",
  "success": true
}
```

#### Error Response Standard:
```json
{
  "statusCode": 400,
  "message": "Validation Error",
  "errors": [
    { "field": "email", "message": "Invalid email address format" }
  ],
  "success": false
}
```

---

## 🏷️ Naming Conventions & Code Style

| Asset Type | Convention | Example |
|---|---|---|
| **Directories** | `kebab-case` | `features/service-cards/`, `features/effects-and-cursor/` |
| **React Component Files** | `PascalCase.jsx` | `VimeoHero.jsx`, `CursorBubble.jsx` |
| **TypeScript / JS Utilities** | `camelCase.ts` | `asyncHandler.ts`, `validate.middleware.ts` |
| **Routes & Controllers** | `feature.layer.ts` | `user.controller.ts`, `user.routes.ts` |
| **CSS Classes** | `kebab-case` / BEM | `.service-card`, `.nav-work-btn__text` |
| **Types & Interfaces** | `PascalCase` / `I` prefix for interfaces | `IUser`, `CreateUserInput` |
| **Constants** | `UPPER_SNAKE_CASE` | `WIGGLE_CONFIG`, `ANIMATION_TIMEOUT` |

---

## 🛡️ Security, Operations & Git Hygiene

1. **Environment Secrets**:
   - `.env` files MUST NEVER be committed to version control.
   - Maintain updated `.env.example` templates in both `frontend/` and `backend/` whenever new environment variables are added.
2. **HTTP Security**:
   - Backend MUST enforce `helmet` for security headers and configured `cors` origin checks.
3. **Graceful Shutdown**:
   - Backend MUST catch `SIGTERM` and `SIGINT` process signals to close MongoDB connections and flush server logs cleanly.
4. **Git Commits**:
   - Write clear, descriptive commit messages prefixed by domain/scope:
     - `feat(frontend/navigation): add Redux dispatch to StaggeredMenu`
     - `feat(backend/user): implement Zod validated user creation endpoint`
     - `refactor(frontend): restructure components into feature-sliced architecture`
