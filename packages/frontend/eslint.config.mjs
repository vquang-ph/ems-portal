// @ts-check
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import baseConfig from "../../eslint.config.base.mjs";

/** @type {import('typescript-eslint').ConfigArray} */
export default [
  {
    name: "frontend/ignores",
    ignores: ["dist/", "node_modules/", ".turbo/", "coverage/"],
  },
  ...baseConfig,
  {
    name: "frontend/language-setup",
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        // Let projectService handle the multiple tsconfigs
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: "detect" },
    },
  },
  {
    name: "frontend/specific-rules",
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      // React specific enforcement
      ...reactHooks.configs.recommended.rules,
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    name: "frontend/test-setup",
    files: ["**/*.spec.{ts,tsx}", "**/*.test.{ts,tsx}"],
    languageOptions: {
      globals: {},
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
];
