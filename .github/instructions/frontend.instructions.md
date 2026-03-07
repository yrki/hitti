---
applyTo: "frontend/**"
---

# Frontend Instructions — React + TypeScript (Vite)

## Architecture

- **Vertical feature slices** — organize code by feature, not by technical layer.
- Each feature lives in `src/features/<feature>/` and contains its own pages, components, hooks, types, services, and tests.
- Shared code goes in `src/shared/` (components, hooks, utils, types).
- A feature folder structure looks like:
  ```
  src/features/<feature>/
  ├── components/       # Feature-specific UI components
  ├── hooks/            # Feature-specific custom hooks
  ├── services/         # API calls and data access
  ├── types.ts          # Feature-specific types/interfaces
  ├── <Feature>Page.tsx # Page/route entry point
  └── index.ts          # Public exports (barrel file)
  ```
- Features must not import directly from other features' internal files. Use barrel exports (`index.ts`) or lift shared code to `src/shared/`.

## TypeScript

- Strict mode is enabled — never use `any`. Use `unknown` and narrow types when needed.
- Prefer `interface` for object shapes and `type` for unions/intersections.
- Export types explicitly with `export type` when the export is type-only.
- Use `satisfies` to validate object literals against types without widening.

## React Patterns

- Use function components exclusively — no class components.
- Prefer named exports over default exports.
- Co-locate component styles using CSS Modules (`*.module.css`).
- Keep components focused — extract logic into custom hooks.
- Use React Router for routing. Define routes in `App.tsx`.
- Avoid prop drilling — prefer lifting state or using context for cross-cutting concerns.
- Memoize only when there is a proven performance need (`useMemo`, `useCallback`, `React.memo`).

## State Management

- Use React's built-in state (`useState`, `useReducer`, `useContext`) as the default.
- For server state, use a data-fetching library (e.g., TanStack Query) instead of manual `useEffect` + `fetch`.
- Keep state as close to where it's used as possible.

## Styling

- Use CSS Modules for component styles.
- Use CSS custom properties (variables) for theming and design tokens.
- Prefer CSS Grid and Flexbox for layout — no float-based layouts.
- Mobile-first responsive design with media queries.

## Unit Testing

- Every component, hook, and utility function must have unit tests.
- Use **Vitest** as the test runner and **React Testing Library** for component tests.
- Test files live next to the code they test: `ComponentName.test.tsx`, `useHook.test.ts`.
- Test behavior, not implementation details — assert on what the user sees and does.
- Prefer `screen.getByRole` and accessible queries over test IDs.
- Mock API calls and external dependencies — never hit real endpoints in tests.
- Aim for meaningful coverage, not 100% line coverage. Every user-facing behavior should be tested.

## Code Style

- Use `const` by default; use `let` only when reassignment is necessary. Never use `var`.
- Prefer early returns to reduce nesting.
- Destructure props and objects at the top of functions.
- Use template literals instead of string concatenation.
- Array methods (`map`, `filter`, `reduce`) over imperative loops when it improves readability.

## Imports

- Use path aliases (`@/`) for imports from `src/` to avoid deep relative paths.
- Group imports: React/external libs → shared → feature-internal → styles.
- Remove unused imports.
