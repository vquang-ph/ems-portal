// @ts-check
import globals from "globals";
import baseConfig from "../../eslint.config.base.mjs";

/** @type {import('typescript-eslint').ConfigArray} */
export default [
  {
    ignores: ["dist/", "coverage/", "eslint.config.mjs"],
  },
  ...baseConfig,
  {
    name: "backend/language-setup",
    languageOptions: {
      globals: { ...globals.node },
      sourceType: "module",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    name: "backend/specific-rules",
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        { accessibility: "explicit" },
      ],
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
    },
  },
  {
    name: "backend/test-setup",
    files: ["**/*.spec.ts", "**/*.test.ts"],
    languageOptions: {
      globals: { ...globals.jest },
    },
    rules: {
      // Explicit disables
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/unbound-method": "off",

      // Unsafe disables
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },
  {
    name: "backend/migration-scripts-setup",
    files: [
      "**/src/database/migrations/*.ts",
      "**/src/database/seeds/*.ts",
      "**/src/database/seed-runner.ts",
    ],
    rules: {
      // Migrations are classes with public members by default
      "@typescript-eslint/explicit-member-accessibility": "off",

      // Migrations often have long SQL strings
      "max-len": "off",

      // Migrations are auto-generated, so let's be lenient with types
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
];
