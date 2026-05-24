# Backend API (@ems-portal/backend)

This is the core API service built with **NestJS** and **TypeORM**.

Package name: `@ems-portal/backend`

## Project Structure

We follow a modular architecture. Each feature should be encapsulated within its own module directory.

```
.
├── README.md               # Backend-specific documentation
├── src/
│   ├── common/             # Shared "global" logic used across multiple modules
│   │   ├── dto             # Base or shared Data Transfer Objects (e.g., Pagination)
│   │   ├── entities        # Global/Abstract entities (e.g., BaseEntity)
│   │   └── filters         # Global exception filters (e.g., HttpExceptionFilter)
│   ├── config/             # Configuration files (Environment variable mapping)
│   │   ├── database.config.ts
│   │   └── swagger.config.ts
│   ├── database/           # Persistence layer configuration and data management
│   │   ├── migrations/     # TypeORM auto-generated SQL migration files
│   │   │   └── 001-InitialSchema.ts
│   │   ├── seeds/          # Data seeding logic for initial DB population
│   │   │   ├── datas/      # Raw data for seeds
│   │   │   │   └── todo.data.ts
│   │   │   └── 01-todo.seed.ts
│   │   ├── datasource.ts   # TypeORM DataSource config
│   │   └── seed-runner.ts  # Script to execute seed files
│   ├── modules/            # Business Logic: Feature-based modular structure
│   │   ├── health          # Liveness/Readiness probes Endpoint
│   │   ├── metrics         # Metric Endpoint
│   │   └── todo/           # Example Feature Module
│   │       ├── dto/        # Inputs/Outputs DTO for this specific feature
│   │       ├── entities/   # Database schema for this feature (*.entity.ts)
│   │       ├── todo.module.ts      # Module definition and dependency wiring
│   │       ├── todo.controller.ts  # Route handlers (Entry point)
│   │       ├── todo.service.ts     # Business logic layer
│   │       ├── todo.repository.ts  # Custom Database queries (Data Mapper)
│   │       ├── todo.constants.ts   # Module-scoped constants (e.g., BCRYPT_ROUNDS)
│   │       ├── todo.types.ts       # Module-scoped types/interfaces (if needed)
│   │       ├── *.spec.ts           # Unit tests for controller/service
│   │       └── *.int-spec.ts       # Integration tests (connecting to real DB)
│   ├── app.module.ts       # Root Module: Orchestrates all other modules
│   └── main.ts             # Entry Point: Boots the NestJS application
├── jest-int.config.ts      # Integration test config
├── jest.config.ts          # Unit test config
├── eslint.config.mjs       # ESLint configuration
├── Dockerfile              # Multi-stage build definition
├── nest-cli.json           # NestJS CLI configuration
├── package.json            # NPM package definition
├── tsconfig.json           # TypeScript configuration
└── tsconfig.build.json     # TypeScript build configuration
```

## How to get started

Generally, you should start this backend package via the root directory using Docker Compose to ensure the database is properly configured.

However, for local development/debugging:

1. Start the Database:

```bash
# From the monorepo root
docker compose up -d db
```

2. Install & Run:

```bash
yarn install
yarn workspace @ems-portal/backend dev
```

Note: The application starts on the port defined in `APP_BACKEND_PORT` (default: 3000).

## Environment Variables

For variables that are required, their descriptions is detailde in the `.env.example` file. You can copy that file to `.env` and fill in the values.

Required Variables:

```env
APP_BACKEND_PORT=3000
APP_DATABASE_HOST=127.0.0.1
APP_DATABASE_PORT=3306
APP_DATABASE_USER=root
APP_DATABASE_PASSWORD=root
APP_DATABASE_NAME=boilerplate
```

## Architecture Standards

For this API, we have chosen specific patterns to ensure maintainability and testability:

### Data Mapper Pattern (TypeORM)

We decouple our domain entities from the database access logic.

- **Entities**: Must extend `BaseEntity` for consistent auditing (`createdAt`, `updatedAt`).
- **Repositories**: We use custom repositories decorated with `@Injectable()` to encapsulate complex queries, keeping the **Service** layer focused purely on business rules.

### Documentation (Swagger/OpenAPI)

Documentation is automatically generated based on our DTOs and Controllers.

- **Interactive UI**: `http://localhost:3000/api/docs`

### DTO conventions

All input/output shapes for a feature live in `modules/<feature>/dto/` and are exported from a single `<feature>.dto.ts` file (`todo/dto/todo.dto.ts`, `user/dto/user.dto.ts`). Two kinds of shapes share that folder:

- **Wire DTOs** — anything crossing the HTTP boundary. Wrap a Zod schema from `@ems-portal/types` with `createZodDto` so NestJS picks up validation and Swagger metadata automatically:

  ```typescript
  import { TodoCreateSchema } from "@ems-portal/types";
  import { createZodDto } from "nestjs-zod";

  export class TodoCreateDto extends createZodDto(TodoCreateSchema) {}
  ```

- **Internal service inputs** — shapes that never cross the wire (plaintext passwords, internal-only fields, seed inputs). Derive them from the shared schema with `Pick`/`Omit` so the type stays anchored to `@ems-portal/types`:

  ```typescript
  import type { User } from "@ems-portal/types";

  export type CreateUserInput = Pick<User, "email" | "name" | "role"> & {
    password: string;
  };
  ```

Why internal inputs live in `dto/` even though they don't cross a process boundary: services + seeds + any future caller share these shapes, so they belong on the module's contract surface rather than buried in `<feature>.service.ts`. Pick from shared types so adding a field to e.g. `UserSchema` triggers a compile error at every consumer, instead of two parallel interfaces drifting.

Rule of thumb: if more than one file in the module needs the shape, it goes in `dto/`. If it's truly local to one function, leave it inline.

### Constants

Module-scoped constants must live in a sibling `<feature>.constants.ts` file — never inline at the top of a service or controller, and never inside a single-file `constants/` folder. A scan of `modules/<feature>/` should surface every magic value the module relies on at a glance.

```typescript
// modules/user/user.constants.ts
export const BCRYPT_ROUNDS = 10;
export const MAX_LOGIN_ATTEMPTS = 5;
```

```typescript
// modules/user/user.service.ts
import { BCRYPT_ROUNDS } from "./user.constants";
```

Rules of thumb:

- Use a sibling `<feature>.constants.ts` file. Promote to a `constants/` folder **only** when the module genuinely has multiple constants files — never for a single file (folders are for collections).
- Constants used across more than one module belong in `src/common/constants/` instead.
- Names use `SCREAMING_SNAKE_CASE`; values must be `const` (literal or `as const`).
- Don't bury magic numbers or strings inside service methods — extract them.

### Config Folder Structure

Anything under `src/config/` that has more than one moving part (resolver + types, or resolver + constants) is organized as a folder with the same dotted-file convention as modules. Each config area uses these standard slots:

```
config/<area>/
├── index.ts              # Barrel — the only file consumers import from
├── <area>.config.ts      # Resolver(s) that read env via ConfigService
├── <area>.types.ts       # Interfaces and type aliases (optional)
└── <area>.constants.ts   # Default values, env keys, magic strings (optional)
```

Rules of thumb:

- Consumers **must** import from `@/config/<area>` (the barrel), never from internal files. This lets the internals be reshaped without touching callers.
- A file is only created when it has real content. If the area has no types beyond what the resolver already returns, skip `<area>.types.ts`. Same for constants.
- Tiny helpers that only this area uses (e.g., a one-off duration parser) live at the bottom of `<area>.config.ts` — do **not** spin up a `<area>.utils.ts` for a single function. Promote to `src/common/utils/` only when a second caller appears.
- Folders inside the area (`constants/`, `types/`, etc.) are reserved for collections. A single file in a folder is ceremony — collapse to a sibling.
- A standalone single-file config (`*.config.ts`) directly under `src/config/` is fine while it only has a resolver. The moment it grows types or constants, refactor it into the folder layout above.

Reference layout: `src/config/auth/` follows this exactly. New config areas (and migrations of `database.config.ts`, `swagger.config.ts`) must adopt the same shape.

### Method Documentation

Every method on a controller, service, repository, guard, interceptor, or pipe must carry a classic JSDoc block. Keep the wording simple and concise, but document the full surface: a one-line summary, every parameter with `@param`, the return value with `@returns`, and any thrown exceptions with `@throws`.

```typescript
/**
 * Verifies credentials and returns an access token.
 *
 * @param dto - Login payload (email and plaintext password).
 * @returns The signed access token and the public user payload.
 * @throws UnauthorizedException if the email or password is invalid.
 */
public async login(dto: LoginDto): Promise<AuthResponse> { ... }
```

Rules of thumb:

- Lead with a verb describing the behavior ("Registers…", "Maps…", "Signs…").
- Document every parameter with `@param <name> - <description>`.
- Always include `@returns` unless the method returns `void`.
- Add `@throws <ExceptionType>` for every exception the method can raise.
- Describe what the value represents, not its TypeScript type — types are already in the signature.
- Trivially obvious one-liners (e.g. a pure getter) can be left uncommented.

## Testing Standards

For the testing, it has been detailed in the `testing.md` file, you can visit it [here](../../docs/testing.md) for more information.

### Shared Types

Since both the frontend and backend share some common types (e.g., DTOs, interfaces), we have a dedicated package for shared types.

- **Location**: `packages/shared/types`
- **Usage**: Both the backend and frontend can import from this package to ensure type consistency

However, it is important to note that the entity defined in the backend should adhere to the Data Mapper pattern, meaning that it should not be directly used in the frontend. Instead, you should create a separate DTO in the shared types package that represents the data structure needed by the frontend, and map the entity to this DTO in the backend service layer. This approach ensures a clear separation of concerns and prevents tight coupling between the frontend and backend.

Moreover, this type should be `implemented` in the backend, to make sure that the type is correctly mapped to the database schema, and also to ensure that any changes in the database schema will be reflected in the shared types, which will help to maintain consistency across the application.

Example:

- In the shared package:

```typescript
export const TodoSchema = BaseSchema.extend({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  status: z.enum(TODO_STATUS_VALUES),
});

// This type is used for both frontend and backend, but it is not an entity, it is a DTO that represents the data structure needed by the frontend.
export type Todo = z.infer<typeof TodoSchema>;
```

- In the backend package:

```typescript
@Entity({ name: "todo" })
// `implements Todo` ensures that the entity adheres to the structure defined in the shared types, but it is not directly used in the frontend.
export class TodoEntity extends BaseEntity implements Todo {
  @Column({ length: 100 })
  public title: string;

  @Column({ type: "text" })
  public description: string;

  @Column({
    type: "enum",
    enum: TODO_STATUS_VALUES,
    default: TodoStatus.Todo,
  })
  public status: TodoStatus;
}
```

## Useful Commands

| Command                       | Description                                     |
| ----------------------------- | ----------------------------------------------- |
| `nest g resource modules/X`   | Scaffold a new feature module                   |
| `yarn migration:run`          | Apply pending database migrations               |
| `yarn migration:generate ...` | Generate a new migration from entity changes    |
| `yarn seed:run`               | Run database seeders                            |
| `yarn test:cov`               | Generate code coverage report                   |
| `yarn test pathToTestFile`    | Run a specific test file                        |
| `yarn test:int`               | Run integration tests (files with .int-spec.ts) |
