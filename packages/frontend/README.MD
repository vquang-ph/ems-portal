# Frontend React Application (@ems-portal/frontend)

This is the frontend application built with **React 19**, **Vite**, **TanStack Router**, **Tanstack Query**, **Tailwind CSS**, **Jotai**, and **shadcn/ui**.

Package name: `@ems-portal/frontend`

## Project Structure

We follow a modular architecture. Each feature should be encapsulated within its own module directory.

```
.
├── public/                 # Static assets (favicons, etc.) served directly without processing
├── src/                    # Main application source code
│   ├── app/                # Core app setup: Providers (Query/Jotai), Router, and entry Wrapper
│   ├── assets/             # Global static files like images, SVGs, and fonts
│   ├── common/             # Project-wide constants and shared config values
│   ├── components/         # Reusable UI components for the entire app
│   │   └── ui/             # Shadcn/UI or base design system elements (buttons, inputs)
│   ├── layouts/            # Page wrappers (e.g., Sidebars or Navigation shells)
│   ├── lib/                # Third-party configurations (API clients, React Query setup)
│   ├── modules/            # FEATURE-BASED LOGIC (The "Brain" of the app)
│   │   └── todo/           # Example Feature Module
│   │       ├── api/        # API function call (Axios/Fetch)
│   │       ├── cache/      # React Query key factories
│   │       ├── components/ # Feature-specific UI (not used elsewhere)
│   │       ├── hooks/      # Custom hooks for this module
│   │       │   ├── mutations/ # Mutation hooks - API calls that change data
│   │       │   └── queries/   # Query hooks - API calls that fetch data
│   │       ├── layouts/    # Custom layouts for this module
│   │       ├── pages/      # Full-page views for this module
│   │       ├── store/      # Jotai atoms specific to the Todo module
│   │       └── utils/      # Helper functions specific to this module
│   ├── routes/             # TanStack Router (or file-based router) definitions
│   ├── store/              # Global Jotai atoms (e.g., Auth, User settings)
│   ├── test/               # Global test utilities, mocks, and setup files
│   ├── utils/              # Global helper functions (date parsing, formatting)
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles and Tailwind directives
├── Dockerfile              # Containerization instructions for deployment
├── components.json         # Configuration for Shadcn/UI components
├── vite.config.ts          # Build tool and plugin configuration
└── tsconfig.json           # TypeScript compiler and path alias settings
```

## How to get started

Generally, you shouldn't start this frontend package in isolation. Instead, follow the instructions in the root README to start the entire application with Docker Compose, which will handle both the frontend and backend together.

However, if you want to run the frontend locally without Docker, you can do so by following these steps:

1. Install dependencies:

```bash
yarn install
```

2. Start the development server:

```bash
yarn dev
```

Note: By default the application starts on port as defined in the environment variable `APP_FRONTEND_PORT` (default: 3001). Make sure to set it if you want to use a different port.

## Environment Variables

The frontend application relies on environment variables for configuration. Create a `.env` file in the root directory based on the variables defined in `vite.config.ts`, and types defined in `env.d.ts`.
**Note:** All frontend-specific variables are prefixed with `APP_FRONTEND_` to distinguish them from backend or system configurations.

**Required Variables:**

```env
APP_FRONTEND_PORT=3000
APP_BACKEND_URL=http://localhost:8080
APP_ENVIRONMENT=development
```

## Module Utils Convention

Each feature module owns its own `utils/` folder for **pure helper functions** that are scoped to that module. The rule is simple: **if a helper has no JSX, no hooks, and is reusable beyond a single call site (or a single file), it belongs in `modules/<feature>/utils/`** — not inline at the top of a component or page.

### Why

- Components stay focused on rendering and orchestration; logic that can be unit-tested in isolation moves to `utils/`.
- A scan of `modules/<feature>/utils/` surfaces every parsing/formatting/derivation helper the module relies on at a glance.
- Helpers are testable without rendering the component (no jsdom, no Testing Library) and have no hidden React dependencies.

### Rules of thumb

- **One file, one export, kebab-cased filename matching the export** (e.g. `numberOrNull.ts` exports `numberOrNull` as default).
- **Default export the function.** Consumers import with the same name: `import numberOrNull from "../utils/numberOrNull"`.
- **No React imports**, no hooks, no JSX — if you reach for `useState` or `useEffect`, it's a hook, not a util (put it in `hooks/`).
- **Promote to `src/utils/` only when a second module needs the helper.** Until then, keep it module-local. Premature promotion forces every change to ripple across the app.
- **Inline tiny helpers used in exactly one place once.** Two call sites (or any reuse from a sibling file) is the trigger to extract.
- **Don't dump types into `utils/`.** Module types live next to the consumer or in a `types.ts` if shared.

### Example

`modules/provider-profile/components/ProfileForm.tsx` parses `<input type="number">` values via `numberOrNull`, which lives at `modules/provider-profile/utils/numberOrNull.ts`:

```typescript
// modules/provider-profile/utils/numberOrNull.ts
const numberOrNull = (value: string): number | null => {
  if (value === "" || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export default numberOrNull;
```

```typescript
// modules/provider-profile/components/ProfileForm.tsx
import numberOrNull from "../utils/numberOrNull";
// ...
onChange={(e) => field.onChange(numberOrNull(e.target.value))}
```

## Routing Conventions

We use **TanStack Router** with the **file-based routing** plugin (`@tanstack/router-plugin/vite`). The route tree is auto-generated into `src/routeTree.gen.ts` — **do not hand-edit that file**. Regenerate with `npx @tanstack/router-cli generate` (the Vite dev server and `yarn build` also regenerate it).

### Directory-based layout (not dot-flattened)

Routes live under `src/routes/`. We use **nested directories** for hierarchy rather than dot-delimited filenames (prefer `_authenticated/_app/profile/setup.tsx` over `_authenticated._app.profile.setup.tsx`). Both forms are valid in TanStack Router; we standardize on directories because they read better at a glance and keep diffs scoped.

Current layout:

```
src/routes/
├── __root.tsx                           # Root route — wraps the app with providers + RootLayout
├── _anonymous.tsx                       # Pathless layout: redirect to "/" if already authenticated
├── _anonymous/
│   ├── login.tsx                        # /login
│   └── register.tsx                     # /register
├── _authenticated.tsx                   # Pathless layout: redirect to "/login" if not authenticated
├── _authenticated/
│   ├── _app.tsx                         # Pathless layout for the main app surface (Outlet)
│   └── _app/
│       ├── index.tsx                    # /
│       ├── profile.tsx                  # /profile layout (Outlet)
│       └── profile/
│           ├── index.tsx                # /profile (reads ?userId via validateSearch)
│           ├── setup.tsx                # /profile/setup (role-gated: ServiceProvider only)
│           └── skills.tsx               # /profile/skills (role-gated: ServiceProvider only)
└── tests/                               # Route guard tests (filenames prefixed with "-" so the router scanner ignores them)
```

### Conventions

- **Pathless layouts** use a leading underscore (`_anonymous`, `_authenticated`, `_app`). They group routes and host shared `beforeLoad` guards without contributing a URL segment.
- **Auth gating** lives on the pathless layout, not on individual leaves. `_authenticated.tsx` redirects unauthenticated users to `/login`; `_anonymous.tsx` redirects already-authenticated users to `/`. Both read from Jotai via `jotaiStore.get(...)` because `beforeLoad` runs outside React.
- **Role gating** stays on the leaf that needs it (e.g. `setup.tsx`, `skills.tsx` check for `UserRole.ServiceProvider`). Don't promote role checks to a pathless layout unless every child needs the same role.
- **Search params** are validated per-route with `validateSearch: z.object({ ... })`. Consumers get typed `useSearch()` for free.
- **Test files inside `src/routes/`** must be prefixed with `-` (e.g. `tests/-_app.profile.setup.test.ts`) so the router plugin ignores them — otherwise it warns about non-Route exports.
- **`createFileRoute` path strings must match the directory path verbatim** (e.g. `createFileRoute("/_authenticated/_app/profile/setup")`). The router CLI validates this against the file location.
- **Adding a new route**: create the file under the appropriate directory, run the dev server (or the router CLI) to regenerate `routeTree.gen.ts`, then `Link to="/your/path"` is typed end-to-end.

## State Management

For this boilerplate React Application, two main libraries were delibrately chosen as React state management solution: Tanstack Query, Jotai.

### Tanstack Query: Async Server State Management

Tanstack Query is used for managing Async Server State, such as data fetched from the backend API or any external API. In this application, it acts as a Data Fetching and Caching layer.

It provides powerful features like caching, automatic refetching, and query invalidation, making it ideal for handling asynchronous data.

**Design Note:** We treat React Query as a "server cache" rather than a traditional global state manager. It ensures the UI stays in sync with the database without manual state updates.

### Jotai: Local/Global Client State

Jotai provides a simple and flexible way to manage global state in React applications. It allows us to create atoms that can be shared across components without the need for complex boilerplate code.

An alternative state management solution can be easily replaced if desired. However, I recommend Jotai for its simplicity, as Tanstack Query has done the heavy lifting of async logic, Jotai provides a lightweight way to manage everything else

## Useful Commands

| Command                    | Description                             |
| -------------------------- | --------------------------------------- |
| `yarn test:cov`            | Generate code coverage report           |
| `yarn test pathToTestFile` | Run a specific test file                |
| `yarn test:watch`          | Run the Vitest Test suite in watch mode |
