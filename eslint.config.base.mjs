// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierRecommended from "eslint-plugin-prettier/recommended";

/** @type {import('typescript-eslint').ConfigArray} */
export default [
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/coverage/**",
      ".turbo/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierRecommended,

  {
    name: "base/global-rules",
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  // TypeScript specific configs
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  {
    name: "base/typescript-specific",
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];
