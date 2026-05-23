# Testing

In this document, we'll cover the testing strategy and guidelines for both the frontend and backend of this boilerplate application.

We aim to provide a comprehensive approach to ensure code quality and reliability through unit and integration tests.

## The Testing Philosophy

We follow the principle of testing the public API of our modules, rather than testing the internal implementation details. This means that our tests should focus on the expected behavior of the module, rather than how it achieves that behavior. We'd have a large suite of Unit Tests that are backed up by Smaller Integration tests for critical paths.

- **Unit Tests**: These tests focus on individual functions or classes in isolation. They should be fast and cover a wide range of scenarios, including edge cases.
- **Integration Tests**: These tests focus on the interaction between multiple components or modules.
- **Co-location**: We co-locate our tests with the code they are testing. This makes it easier to find and maintain tests, and encourages developers to write tests as they develop new features.

## Frontend Testing

In the Frontend, we use Vitest in combination with React Testing Library for testing our React components and hooks. Vitest provides a fast and efficient testing environment, while React Testing Library encourages testing from the user's perspective.

### Location

We follow a co-location strategy for our tests. For each component or hook, we create a corresponding test file in the same directory. For example:

```
.
├── TodoCreateDialog.tsx
├── TodoDeleteButton.tsx
└── tests
    ├── TodoCreateDialog.test.tsx
    ├── TodoDeleteButton.test.tsx
```

For each module, we have a dedicated `tests` directory that contains all the test files related to that module. This helps to keep the tests organized and makes it easier to find the relevant tests when working on a specific module. Here is the recommended structure:

```
.
├── fixtures.ts  # Data Factory that holds the test data for the tests in this module
├── index.ts     # Barrel file for the module
└── testIds.ts   # Constants for data-testid attributes used in the tests
```

### Mocking

When writing tests for the Components in specific modules, it is expected that the test should only focus on this sole Components and the behavior of this component, rather than the behavior of the entire module.

Therefore, it is expected that you should mock the dependencies of the component, such as the API calls, state management logic, and components from the shared modules.

Example:

```tsx
import { UI_COMPONENTS_TEST_IDS } from "@/test/testIds";

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    ...rest
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
  }) => (
    <button
      data-testid={UI_COMPONENTS_TEST_IDS.button}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  ),
}));
```

**Note:** It is recommended to use a constant of `UI_COMPONENTS_TEST_IDS` for the `data-testid` attribute, as it provides better maintainability and readability for the tests.

For components that rely on Jotai, it is recommended that you create an dedicated `store` per test:

```tsx
import createTodoDialogAtom from "../../store/createTodoDialogAtom";

// Create the Store
const store = createStore();

// Set the value of the atom
store.set(createTodoDialogAtom, false);
```

And then render the component with the helper function `renderWithStore`:

```tsx
import renderWithStore from "@/test/renderWithStore";

renderWithStore(<TodoCreateDialog />, store);
```

Doing this would ensure that the tests are isolated and do not interfere with each other, as they are using different stores.

## Backend Testing

In the Backend, we use Jest as our testing framework.

We have separate configurations for unit tests and integration tests to ensure that they are run in the appropriate environment. For Unit Test, it is defined in `jest.config.js`, while for Integration Test, it is defined in `jest-int.config.ts`.

### Location

Similar to the Frontend, we also follow a co-location strategy for our tests in the Backend. However, we don't createa a dedicted `tests` directory for each module, instead we place the test files directly in the module directory, with the suffix `.spec.ts` for unit tests and `.int-spec.ts` for integration tests.

For example:

```
.
├── dto
│   └── todo.dto.ts
├── entites
│   └── todo.entity.ts
├── todo.controller.spec.ts   # Unit test for the controller layer
├── todo.controller.ts
├── todo.module.ts
├── todo.repository.spec.ts   # Unit test for the repository layer
├── todo.repository.ts
├── todo.service.int-spec.ts  # Integration test for the service layer
├── todo.service.spec.ts      # Unit test for the service layer
└── todo.service.ts
```

### Mocking

When writing unit tests for Controllers or Services, the focus must remain strictly on the logic of the unit under test. We avoid involving the actual database or external network layers to ensure tests remain fast, deterministic, and isolated.

Therefore, we use the NestJS `TestingModule` to mock all dependencies, such as Services (when testing Controllers) or Repositories (when testing Services).

#### Controller Isolation

Controllers should only be responsible for handling incoming requests and returning the correct response. In our tests, we mock the entire `Service` layer using `jest.fn()` to verify that the Controller calls the service with the correct parameters and handles the returned data (or errors) appropriately.

Example:

```typescript
const moduleRef = await Test.createTestingModule({
  controllers: [TodoController],
  providers: [
    {
      provide: TodoService,
      useValue: {
        findAll: jest.fn(), // Mocked implementation
        findOne: jest.fn(),
      },
    },
  ],
}).compile();
```

#### Repository & DataSource Mocking

For services that interact with the database, we use `getRepositoryToken()` to provide a mock repository. This prevents the tests from attempting to connect to a real database and allows us to simulate various database scenarios, such as "Record Not Found" or "Constraint Violation."

```typescript
{
  provide: getRepositoryToken(TodoEntity),
  useValue: {
    find: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  },
}
```

### Integration Tests

While unit tests verify individual logic blocks in isolation, Integration Tests ensure that our services interact correctly with the actual infrastructure—specifically the database and the configuration layer.

In this phase, we do **not** mock the Repository or the Database. Instead, we spin up a test module that connects to a real database instance to verify data persistence, query accuracy, and transaction integrity.

Key Characteristics:

- **Infrastructure Connectivity:** Uses `TypeOrmModule.forRootAsync` to establish a live connection, ensuring our SQL queries and entities are compatible with the database engine.
- **Seed Dependency:** These tests are designed to run against a database containing **Seed Data** (`INITIAL_TODOS`). This allows us to verify that our services can correctly retrieve and filter known datasets.
- **State Management:** To keep the test suite deterministic, any data created during a test (e.g., `service.create`) is manually cleaned up or deleted within the same test block to prevent side effects for subsequent tests.
- **No Synchronization:** We set `synchronize: false` and `dropSchema: false`. This ensures we are testing against the actual schema produced by our migrations, rather than an auto-generated one.

Example Strategy:

```typescript
it("should create a new todo and persist it", async () => {
  const createDto = { title: "Integration Test", status: TodoStatus.Pending };

  // Act: Save via Service
  const newTodo = await service.create(createDto);

  // Assert: Verify it exists in the actual database via Repository
  const inDb = await repository.findOne({ where: { id: newTodo.id } });
  expect(inDb?.title).toBe(createDto.title);

  // Clean Up: Restore database state
  await repository.delete(newTodo.id);
});
```
