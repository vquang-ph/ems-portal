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
