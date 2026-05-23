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
