# Fullstack TypeScript Application

This is a \* Application** built on a monorepo architecture. Originally cloned from the [Boilerplate Typescript](https://github.com/CODE-LEAP-AG/boilerplate-typescript), this project demonstrates a complete CRUD implementation using **NestJS**, **React**, and **PostgreSQL\*\*.

## Tech Stack

- Monorepo Management: [Turborepo](https://turborepo.dev/)
- Backend: [NestJS](https://nestjs.com/) (REST API, TypeORM)
- Frontend: [React](https://react.dev/) + [Vite](https://vite.dev/) + [TanStack Router](https://tanstack.com/router/latest)
- Database: PostgreSQL
- Infrastructure: Docker & Docker Compose
- Testing: k6 (Performance) & Vitest & Jest

## Project Structure

- `packages/backend`: NestJS API handling tasks, persistence, and validation (Port 3000).
- `packages/frontend`: Vite + React UI for managing lists (Port 3001).
- `packages/shared/types`: Shared TypeScript interfaces and DTOs used by both ends.

## Prerequisites

- Node.js: >= 22.12.0
- Yarn: >= 1.22.0
- Docker: For database orchestration.
- k6: For running performance benchmarks.

## Quick Start

Get the app running locally in minutes:

1. Environment Setup

```bash
cp .env.example .env
```

_Note: Open `.env` and ensure your database credentials match your local or Docker setup._

2. Start the Database

```bash
docker compose up -d db
```

3. Launch the Application

You can run the entire stack in containers:

```bash
docker compose up --build
```

**OR** run in development mode with Hot Module Replacement (HMR):

```bash
yarn install
yarn dev
```

4. Access the App

- Frontend UI: [http://localhost:3001](http://localhost:3001)
- Backend API: [http://localhost:3000/api](http://localhost:3000/api)
- Swagger Docs: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## How to Extend This Project

If you want to use this app as a base for a different project, use the built-in scaffolding tools:

### Scaffolding New Modules

The project includes CLI tools to generate standardized code:

- **New Frontend Module:**
  ```bash
  yarn scaffold:frontend "my-module"
  ```
- **New Backend API Module:**
  ```bash
  yarn scaffold:backend "my-module"
  ```

### Rebranding the Repository

If you are repurposing this for a new client or project:

1. Clone the repo and delete `.git`.
2. Run a global replace for the project name:
   ```bash
   npx replace-in-file /ems-portal/g "my-new-app-name" "**/*" --ignore=".git/**"
   ```

## Documentation Map

| Resource         | Description                                 | Location                                                                |
| ---------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| **Backend API**  | NestJS architecture and To-Do logic.        | [`/packages/backend/README.md`](./packages/backend/README.md)           |
| **Frontend UI**  | React components and Task state management. | [`/packages/frontend/README.md`](./packages/frontend/README.md)         |
| **Shared Types** | Common Task and User interfaces.            | [`/packages/shared/types/README.md`](./packages/shared/types/README.md) |
| **Database**     | Migrations and Schema for tasks.            | [`/docs/foundations/database.md`](./docs/foundations/database.md)       |
| **Performance**  | k6 benchmarks for API endpoints.            | [`/scripts/benchmarks/README.md`](./scripts/benchmarks/README.md)       |
