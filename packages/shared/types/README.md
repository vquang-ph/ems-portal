# Shared Types & Schemas (@ems-portal/types)

This package serves as the **Single Source of Truth** for data structures and validation logic shared between the Frontend and Backend.

By centralizing our TypeScript interfaces and **Zod** schemas here, we ensure 100% type-safety across the entire network boundary.

Package name: `@ems-portal/types`

**Note:** For this monorepo, this package is automatically being build after runnning `yarn install` in the root of the repository, so you don't need to worry about building it separately. Just make sure to run `yarn install` whenever you pull new changes that might include updates to the shared types.

## Project Structure

This package is a pure TypeScript library that compiles into multiple formats to support different runtime environments.

```text
.
├── src/
│   ├── index.ts          # Main entry point (exports all schemas/types)
│   ├── base.schema.ts    # Common base types (e.g., IDs, Timestamps, Pagination)
│   └── todo.schema.ts    # Feature-specific schemas and inferred types
├── scripts/              # Build scripts for CJS compatibility
├── dist/                 # Compiled output (ignored by git)
│   ├── cjs/              # CommonJS build (for Backend/Node runtime)
│   ├── esm/              # ES Modules build (for Frontend/Vite runtime)
│   └── types/            # TypeScript declaration files (.d.ts)
└── tsconfig.json         # Base TypeScript configuration
```

## The Multi-Format Build System

We deliberately compile this package into both ESM and CJS. This is a critical architectural choice for monorepos that bridge different environments:

### ESM (ES Modules) — For the Frontend

- **Directory**: `dist/esm/`
- **Target**: Modern browsers and Vite.
- **Why**: ESM supports **Tree Shaking**. This ensures that if the frontend only uses one specific type, the rest of the package logic is stripped away during the final build, keeping the browser bundle as small as possible.

### CJS (CommonJS) — For the Backend

- **Directory**: `dist/cjs/`
- **Target**: Node.js environment (NestJS).
- **Why**: While modern Node.js supports ESM, many legacy tools, certain NestJS configurations, and testing frameworks (like Jest) still rely on the CommonJS `require()` system. Providing a CJS build ensures maximum compatibility and faster execution in the Node runtime.

### Types (.d.ts) — For Development

- **Directory**: `dist/types/`
- **Why**: These files provide the "Intellisense" you see in VS Code. By separating types into their own directory, we ensure that TypeScript definitions are available regardless of whether the consumer is using ESM or CJS.

## Validation with Zod

We don't just share "static" TypeScript interfaces; we share Runtime Schemas using Zod.

- **Schema**: Defined in `src/*.schema.ts` (e.g., `TodoSchema`).
- **Inferred Types**: We derive TypeScript types directly from the schemas:

```typescript
export const TodoSchema = zod.object({ ... });
export type Todo = zod.infer<typeof TodoSchema>;
```

- **Benefit**: The Backend uses these to validate incoming requests, while the Frontend uses them to ensure API responses match our expectations. If a field name changes in `src/`, both projects will immediately show TypeScript errors.

## How to Use

### Installation

As a private workspace package, it is linked automatically by Yarn:

```bash
yarn install
```

### Development Workflow

When you modify a file in `src/`, you must rebuild the package to reflect changes in the frontend or backend:

```bash
yarn run build:types
```

### Usage in Code

```typescript
import { TodoSchema, type Todo } from "@ems-portal/types";
```

## Build Commands

| Command            | Description                                   |
| ------------------ | --------------------------------------------- |
| `yarn build`       | Full clean build of all formats (Recommended) |
| `yarn build:types` | Generates only the `.d.ts` declaration files  |
| `yarn clean`       | Removes the `dist` folder                     |
