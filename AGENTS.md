<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Project Architecture & Coding Standards

Every agent and developer working on this project MUST strictly adhere to the following rules:

## 1. Core Principles & Separation of Concerns

- **Preserve Existing Functionality**: Never break or alter existing clinical business logic, glycemic evaluation, Khmer & English localization, Telegram bot webhooks, or database contracts.
- **Three-Tier Architecture**:
  1. **UI Presentation Tier** (`src/components/`, `src/app/`): Pure presentation. Components receive props, render UI, and emit user interactions. No direct `axios` or `fetch` calls in UI components.
  2. **Custom Hooks Tier** (`src/hooks/`): Manage component state, form validation, filtering/sorting, TanStack Query caching, and mutation coordination.
  3. **Services Tier** (`src/services/`, `src/lib/`): Centralized API communication via `apiClient` (`src/lib/api-client.ts`). All HTTP requests must go through dedicated domain services (`glucoseService`, `medicationService`, `targetService`, `patientService`, etc.).

## 2. File Size Guidelines (150–200 LOC Target)

- **Target Size**: Approximately **150–200 lines of code** per source file.
- **Hard Ceiling**: Avoid exceeding 200 LOC unless there is a strong technical reason (e.g., extensive bilingual dictionary, complex SVG/chart layout).
- **No Artificial Splitting**: Do not split code artificially just for the line count. Split by extracting coherent, reusable molecules, custom hooks, services, constants, and subcomponents.
- **Single Responsibility Principle**: Every file must have exactly one clear, well-defined purpose.

## 3. Atomic Design Component Hierarchy

Organize all UI elements according to Atomic Design:

- **Atoms** (`src/components/atoms/`): Smallest indivisible UI primitives (`badge.tsx`, `button.tsx`, `input.tsx`, `card.tsx`). Must be fully reusable and independent of domain models.
- **Molecules** (`src/components/molecules/` or domain-specific molecules): Combinations of atoms performing a single discrete UI task (`form-field.tsx`, `search-input.tsx`, `modal-wrapper.tsx`, `empty-state.tsx`, `GlucoseSpectrumGauge.tsx`, `TargetItemCard.tsx`, `MedicationListItem.tsx`).
- **Organisms** (`src/components/[feature]/`): Complex, feature-level UI sections coordinating multiple molecules and atoms (`GlucoseTrendChart.tsx`, `AppHeader.tsx`, `SettingsView.tsx`, `MedicationList.tsx`, `TargetConfigCard.tsx`).
- **Templates** (`src/components/templates/`): Layout and structural wireframes defining page shells and content areas (`page-shell.tsx`).
- **Pages** (`src/app/[locale]/...`): Route handlers and page entry points. Thin coordinators that bind templates with custom hooks and domain organisms.

## 4. Custom Hooks & Logic Separation

- **Components**:
  - Receive typed props.
  - Render accessible, responsive UI.
  - Dispatch events to custom hook handlers.
  - MUST NOT embed inline API calls, multi-step validation state, or heavy data calculations.
- **Custom Hooks** (`src/hooks/`):
  - File prefix: `use-<feature-or-action>.ts` (e.g., `use-glucose-entry-form.ts`, `use-medication-search.ts`).
  - Manage state, side-effects, and queries.
  - Coordinate TanStack Query invalidation and optimistic updates.
  - Provide derived values and memoized computations.

## 5. Naming Conventions

- **Files and Folders**: Always use **kebab-case** (`glucose-trend-chart.tsx`, `use-target-form.ts`, `patient-service.ts`, `clinical-presets.constants.ts`).
- **React Components**: Always use **PascalCase** (`GlucoseTrendChart`, `MedicationList`, `AppHeader`).
- **Functions & Variables**: Always use **camelCase** (`calculateAverage`, `patientDisplayName`).
- **Constants**: Always use **UPPER_SNAKE_CASE** for environment or static data constants (`CLINICAL_PRESETS`, `MEDICATION_PRESETS`).
- **Custom Hook Names**: Always start with `use` (`useTargetForm`, `useGlucoseEntryForm`).

## 6. TypeScript Standards

- **Strict Mode**: Never use `any`. Explicitly type all props, state, function arguments, and return types.
- **Shared Types**: Place application-wide clinical entities in `src/types/index.ts` or `src/types/<domain>.ts`.
- **Discriminated Unions**: Use discriminated unions for distinct status flows (e.g., target approval states, measurement types).
- **Props Interfaces**: Export explicit prop interfaces for every component (e.g., `interface TargetModalProps { ... }`).

## 7. Next.js App Router Best Practices

- **Server Components by Default**: Default to React Server Components. Add `'use client'` only when interactive state, browser APIs, or custom hooks are strictly required.
- **Code Splitting & Bundle Optimization**:
  - Dynamically import (`next/dynamic`) heavy libraries (e.g., Recharts) and hidden-by-default modals with `{ ssr: false }`.
  - Lazy-load massive vendor libraries (e.g., `jsPDF`) via inline `await import(...)` only inside click handlers.
  - Keep `experimental.optimizePackageImports: ['lucide-react', 'recharts']` configured in `next.config.ts`.
- **Async Waterfalls**: Avoid sequential `await` waterfalls in route handlers and repositories; parallelize independent queries using `Promise.all([ ... ])`.
- **Rendering Conditionals**: Avoid boolean short-circuits (`{condition && <Component />}`). Always use explicit ternaries (`{condition ? <Component /> : null}`) to prevent leaking falsy values into the DOM tree.

## 8. Verification & Quality Gates

Before finishing any task or making modifications:
1. Run `npm test` — Ensure all unit and integration test suites pass with 0 failures.
2. Run `npm run build` — Ensure TypeScript type checking and Next.js Turbopack build succeed with 0 errors.
