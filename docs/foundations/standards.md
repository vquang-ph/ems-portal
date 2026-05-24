# Standards: Linting and Formatting

In this document, we'll the style standards that are applied in this boilerplate application, along with their rationale and configuration details.

## Linting

This repository uses a tiered ESLint configuration to ensure high code quality and consistency across both Frontend and Backend projects.

We follow a **"Base + Layer"** approach. This allows us to share universal standards (like basic TypeScript safety) while respecting the different technical requirements of browser-based and server-based code.

### Key Layers

- **`eslint.config.base.mjs`**: The foundation. It enforces TypeScript "Recommended" rules, integrates Prettier, and defines universal safety checks (like forbidding `any`).
- **Frontend Layer**: Extends the base with React-specific hooks and browser globals.
- **Backend Layer**: Extends the base with Node.js globals and strict class-member visibility.

### General Principles

#### Strict Type Safety

We use `recommendedTypeChecked` rules. This means the linter doesn't just look at the syntax; it looks at your TypeScript types.

- **No `any`**: The use of `any` is restricted (`error`).
- **Unused Vars**: Warns if variables are defined but not used (ignores variables prefixed with `_`).
- **Async Awareness**: The linter enforces that `await` is only used on thenable objects.

#### Context-Aware Rules

Rather than enforcing a rigid, one-size-fits-all policy, the linter dynamically adjusts its strictness based on the specific role of each file. By utilizing the `files` and `overrides` capabilities of the ESLint Flat Config, we ensure that the rules support—rather than hinder—the development workflow.

Example:

```javascript
{
  name: "backend/test-setup",
  files: ["**/*.spec.ts", "**/*.test.ts"],
  rules: {
    // Relaxed for easier mocking
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
  },
}
```

### How to Run

To run the linting process, use the following command:

```bash
yarn lint
```

Note: This would lint all of the packages within the repository.

## Code Formatting

In this repository, we use **Prettier** for code formatting to ensure a consistent style across the entire repository.

Prettier is an opinionated code formatter that supports a wide range of languages and integrates well with various editors and tools.

### Setup

The Prettier setup of the repository is defined in the root .prettierrc.

This is intentional as both the frontend and backend are built with TypeScript, they share this configuration to ensure style parity across the monorepo. This eliminates the need for per-project formatting rules and simplifies the global build pipeline.

### Local Development

It is recommended that you have the plugin `prettier.prettier-vscode` installed in your VSCode, and enable "Format on Save" for an optimal development experience.

This config has been set up in the `.vscode/settings.json` file, so it should work out of the box when you open the project in VSCode.

### How to Run

To check if your code is formatted according to the Prettier configuration, you can run:

```bash
yarn run format:check
```

To automatically format your code, you can run:

```bash
yarn run format
```

Note: These commands will format or check formatting for all of the packages within the repository.

## Commit Lint Message

In this repository, we follow the conventional commit guideline as defined in [here](https://www.conventionalcommits.org/en/v1.0.0/).

This is enforced by the `commitlint` package, which is configured in the `commitlint.config.js` file at the root of the repository.

The commit message is linted whenever you try to make a commit, and if the message does not follow the conventional commit format, the commit will be rejected.
