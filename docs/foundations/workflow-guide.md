# Workflow Guide

In this document, we'll provide an overview of the automation workflows and CI/CD pipelines set up for this boilerplate application. This includes the triggers for each workflow, the steps involved, and how to verify that everything is working correctly.

All of these workflow is in the `.github/workflows` directory, and are configured using GitHub Actions.

## The CI Architecture

Our pipeline is designed to be efficient. We use "Path Filtering" to ensure that if you only change frontend code, we don't waste time running backend integration tests.

### Primary Entry Point: Pull Requests

The main trigger for our CI pipeline is when a Pull Request is opened or updated. This ensures that every change goes through a series of automated checks before being merged into the main branch.

The PR Check workflow would trigger all of the other workflow that is dependency of it, such as the linting, testing, and Docker verification workflows.

## Individual Workflow Details

### Build & Test (`workflow-build.yaml`)

This is the core validation layer. It handles both applications but only executes the steps for the modified package.

- **Typechecking**: Runs `tsc` to ensure no TypeScript errors were introduced.
- **Unit Testing**: Executes Vitest (Frontend) or Jest (Backend).
- **Coverage Reporting**: Generates a visual comment directly on your PR showing the code coverage percentage.

### Coding Style (`workflow-style.yaml`)

Ensures the codebase remains consistent in coding style.

- **Commitlint**: Validates that your commit messages follow the Conventional Commits standard.
- **Prettier**: Checks for formatting violations.
- **ESLint**: Runs our specialized linting rules.

### Security Check (`workflow-security.yaml`)

- **Audit-CI**: Scans the dependency tree for known vulnerabilities.
- **Failure Threshold**: The pipeline will **fail** if any `High` or `Critical` severity issues are found, preventing insecure code from entering `main`.

This is done by running the `audit-ci` package, which is a powerful tool for auditing npm dependencies.

### Backend Integration (`workflow-integration.yaml`)

This runs only if the Backend has changed.

- **Service Containers**: Spins up a real MySQL 8.0 service inside the runner.
- **Schema Validation**: Runs all migrations and seeds from scratch.
- **Deep Testing**: Runs the integration test suite (`yarn test:int`) against the live database.

### Deployment Readiness (`workflow-orchestration.yaml`)

This is our "Smoke Test." It simulates a production environment using Docker.

- **Containerization**: Builds the actual Docker images for the Frontend and Backend.
- **Orchestration**: Runs `docker compose up`.
- **Docker Image Size Check**: Verifies that the built images are within a reasonable size limit (e.g., < 500MB). Right now, we don't have a specified limit, but the step will console log the image sizes for review.
- **Health Polling**: Uses `curl` to verify that the Backend API responds with `ok` and the Frontend serves valid HTML.
