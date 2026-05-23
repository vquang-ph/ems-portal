# Contributing to Boilerplate Typescript

First off, thank you for taking the time to contribute! It’s people like you that make this boilerplate a better foundation for everyone.

All contributors are expected to follow our code of conduct and the guidelines outlined below.

## Local Development Setup

To get started with local development, please refer to the [Quick Start](./README.md#quick-start) section in the root README. It provides detailed instructions on how to set up the development environment using Docker Compose, which will handle both the frontend and backend together.

## Branching Strategy

We follow a GitHub Flow model:

- `main` is always deployable and protected.
- All work happens in Feature Branches (`feat/`, `fix/`, `docs/`, `chore/`).
- Branches must be deleted after merging.

## Commit Message Convention

We enforce Conventional Commits. This is mandatory because our Changelog and Releases are automated based on these messages.

Format: `<type>(<scope>): <description>`

- `feat(backend): add auth middleware`
- `fix(frontend): resolve button alignment`
- `docs(root): update contributing guide`

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

For more information, please refer to the [Commit Lint Message](./docs/standards.md#commit-lint-message) section in our standards documentation.

The config is also defined in the `commitlint.config.js` file at the root of the repository.

## Coding Standards

Our [Standards Documentation](./docs/standards.md) covers our linting, formatting, and testing guidelines in detail. Please make sure to review it before contributing.

## Pull Request Process

1. Self-Audit: Before submitting, run `yarn lint` and `yarn build`. If not these commands will be run automatically when you commit or open a PR.
2. Draft PRs: Feel free to open a Draft PR if you want early feedback.
3. Fulfill the PR template: Provide all required information in the PR template to help reviewers understand the context and scope of your changes, also go through the checklist to make sure you have covered all the bases.
4. Review: At least one approval for a contributor with write access is required before merging.

## Testing Guideline

On how tests are written in this project and how they are maintained, please visit the [Testing Documentation](./docs/testing.md) for more details.
