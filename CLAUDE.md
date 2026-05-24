# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

This is a turborepo typescript monorepo which is a TODO application, it serves as a foundation for production-ready full-stack applications. The stack is designed for **developer experience**, **type safety**, and **scalability**.

Every modules that is `todos` related is for demonstration purposes only and should be replaced when building out the actual EMS Portal features. The `todos` modules are meant to show how to structure features, handle cross-cutting concerns, and implement best practices in a real-world codebase.

Turborepo monorepo (Yarn 1 workspaces) with three packages:

- `packages/backend` (`@ems-portal/backend`) — NestJS REST API on Fastify, TypeORM + PostgreSQL, served at `:3000` under `/api`. Swagger UI at `/api/docs`.
- `packages/frontend` (`@ems-portal/frontend`) — Vite + React 19 + TanStack Router (file-based, codegen) + TanStack Query + Jotai + Tailwind v4 + shadcn/ui, served at `:3001`.
- `packages/shared/types` (`@ems-portal/types`) — Zod schemas, the single source of truth for cross-boundary types. Auto-built after `yarn install` via `postinstall`.

A single root-level `.env` feeds all packages. Vite reads it via `loadEnv` against the repo root; the backend's standalone TypeORM CLI loads `../../../../.env` from `src/database/datasource.ts`.

## Common Commands

Run from the monorepo root unless noted.

```bash
yarn install            # also builds @ems-portal/types (postinstall)
yarn dev                # turbo dev — starts frontend + backend with HMR
yarn build              # turbo build (respects ^build dep ordering)
yarn build:types        # rebuild only the shared types package
yarn lint               # eslint across all packages
yarn format / format:check
yarn test:int           # backend integration tests (uses real DB via root .env)
yarn test:benchmark     # k6 perf tests via scripts/benchmarks/run-benchmarks.sh
yarn scaffold:backend "my-module"   # generate a NestJS feature module
yarn scaffold:frontend "my-module"  # generate a frontend feature module
```

Backend (run inside `packages/backend` or via `yarn workspace @ems-portal/backend <cmd>`):

```bash
yarn dev                          # nest start --watch
yarn test                         # Jest unit tests (*.spec.ts)
yarn test path/to/file.spec.ts    # single file
yarn test:int                     # integration tests (*.int-spec.ts), uses test/integration/jest-int.config.ts
yarn test:cov                     # coverage; thresholds: 80/80/80/70 (lines/funcs/stmts/branches)
yarn migration:generate src/database/migrations/<Name>   # diff entities → migration
yarn migration:run | migration:revert
yarn seed:run                     # runs src/database/seed-runner.ts
```

Frontend (inside `packages/frontend`):

```bash
yarn dev                          # vite
yarn test [path]                  # vitest; jsdom + setup at src/test/setup.ts
yarn test:cov                     # per-file thresholds 80% across the board
yarn build                        # tsc -b && vite build
```

Database via Docker:

```bash
docker compose up -d db           # just Postgres 15 on $APP_DATABASE_PORT
docker compose up --build         # full stack: db + backend + frontend
```

## Project Summary: EMS Portal

### What is it?
* A **digital marketplace** to connect clients with engineering experts.
* A platform built using a **client-server architecture**.

### Why build it?
* To solve the difficulty of finding the right engineer using an **intelligent matching algorithm**.
* To ensure the system is **secure**, **fast**, and handles network traffic efficiently.

### Key Features
* **Smart Matching:** Ranks providers based on skills, availability, cost, location, and ratings.
* **User Roles:** Separate portals for **Clients**, **Service Providers**, and **Admins**.
* **Skill Management:** Allows providers to showcase their specific engineering talents.
* **Rating System:** A feedback loop to keep service quality high.


## Architecture Notes

### Cross-package type flow (important)

`@ems-portal/types` defines a Zod schema like `TodoSchema`; both ends consume `z.infer<typeof TodoSchema>`. The **backend entity `implements Todo`** so any schema change forces a compile error in the entity — this is the intended coupling. Do not import backend entities from the frontend; always go through the shared DTO/schema.

The shared package emits **both ESM (`dist/esm` for Vite) and CJS (`dist/cjs` for Node/Jest)** plus `.d.ts`. After editing files in `packages/shared/types/src`, run `yarn build:types` from root before the change is visible to consumers.

### Backend module pattern

Each feature lives in `src/modules/<feature>/` as a NestJS module with the layering: `controller → service → repository → entity`. Controllers stay thin (request/response only); business logic in services; custom queries in `@Injectable()` repositories (Data Mapper, **not** Active Record). All entities extend `common/entities/base.entity.ts` (`BaseEntity`) for `id` (uuid), `createdAt`, `updatedAt`. Validation is global via `ZodValidationPipe` from `nestjs-zod` (registered as `APP_PIPE` in `app.module.ts`); TypeORM errors are translated by `TypeOrmExceptionFilter` (`APP_FILTER`).

`src/config/database.builder.ts` is the single source of TypeORM `DataSourceOptions` — it's shared by the runtime config (`database.config.ts` for `TypeOrmModule.forRootAsync`) and the CLI datasource (`database/datasource.ts`). If `APP_DATABASE_URL` is set it wins over the individual host/port/etc vars. `synchronize` is hardcoded `false`; **schema changes must go through migrations**.

Path alias `@/*` → `src/*` works in both the app and tests (configured in `tsconfig.json` and both Jest configs).

### Frontend module pattern

Feature modules under `src/modules/<feature>/` contain `api/`, `cache/` (TanStack Query key factories), `hooks/{queries,mutations}/`, `components/`, `pages/`, `store/` (feature-local Jotai atoms), `utils/`, `test/`. Global Jotai atoms live in `src/store/`. Routing is **file-based via TanStack Router** — files in `src/routes/` are scanned by the Vite plugin (`@tanstack/router-plugin`) which regenerates `src/routeTree.gen.ts`; do not hand-edit that file.

State management split: **TanStack Query owns all server state** (treat it as the server cache, not as global state). **Jotai owns client state.** Don't mirror server data into Jotai atoms.

Vite alias `@` → `src`. Env vars exposed to the client must match `envPrefix: ["APP_FRONTEND", "APP_ENVIRONMENT", "APP_BACKEND_URL"]` (see `vite.config.ts`).

### Testing conventions

- **Backend unit tests** (`*.spec.ts`) co-located with source. Mock dependencies via Nest `TestingModule`; mock repositories via `getRepositoryToken(Entity)`. Never touch a real DB in `.spec.ts`.
- **Backend integration tests** (`*.int-spec.ts`) use `test/integration/jest-int.config.ts`, hit a live Postgres, depend on seed data (e.g. `INITIAL_TODOS`), and must clean up any rows they create within the same test. `synchronize: false` — tests run against the migrated schema.
- **Frontend** tests live in per-module `test/` dirs and follow `*.test.tsx`. Use `renderWithStore` from `src/test/` for components that read Jotai. When a test depends on `data-testid`, use constants from `UI_COMPONENTS_TEST_IDS` (or the module's `testIds.ts`) rather than literals.

### CI pipeline

GitHub Actions in `.github/workflows/`. `pr-check.yaml` is the entry point and fans out via path filtering: `workflow-build.yaml` (typecheck + unit + coverage comment), `workflow-style.yaml` (commitlint + prettier + eslint), `workflow-security.yaml` (`audit-ci`, fails on High/Critical), `workflow-integration.yaml` (backend-only, spins a DB service and runs `yarn test:int`), `workflow-orchestration.yaml` (full `docker compose up` smoke test + image size log + health polling).

## Conventions Worth Knowing

- **Conventional Commits are enforced** by commitlint via Husky `commit-msg`. Format: `<type>(<scope>): <description>` (e.g. `feat(backend): add auth middleware`). Husky `pre-commit` runs `lint --max-warnings 0` against whichever package(s) have staged changes.
- **`any` is forbidden** in lint (`error`). Unused vars warn unless prefixed `_`. Async-awareness is on (`await` only on thenables).
- **No `synchronize: true`** in any TypeORM config (the codebase already enforces it; don't regress).
- New backend features: prefer `yarn scaffold:backend "<name>"` to get the controller/service/repository/entity/module scaffolding consistent.
