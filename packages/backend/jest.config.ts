export default {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "src",

  collectCoverageFrom: [
    "**/*.ts",

    // bootstrap / wiring
    "!main.ts",
    "!app.module.ts",
    "!**/*.module.ts",

    // tests
    "!**/*.spec.ts",
    "!**/*.int-spec.ts",

    // DTOs
    "!**/dto/**/*.ts",

    // Entities
    "!**/*.entity.ts",

    // Migrations
    "!database/migrations/**/*.ts",
    "!database/datasource.ts",
    "!database/seeds/**/*.ts",
    "!database/seed-runner.ts",
  ],
  coverageReporters: ["json-summary", "text", "lcov", "json"],
  coverageDirectory: "../coverage",
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleFileExtensions: ["js", "json", "ts"],
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  modulePaths: ["<rootDir>"],
};
