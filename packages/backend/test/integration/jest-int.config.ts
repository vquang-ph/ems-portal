import * as path from "path";
import * as dotenv from "dotenv";

const envPath = path.resolve(process.cwd(), "../../../../.env");
dotenv.config({ path: envPath });

export default {
  preset: "ts-jest",
  testEnvironment: "node",

  rootDir: "../../",

  // Coverage is disabled for integration tests
  collectCoverage: false,

  moduleFileExtensions: ["js", "json", "ts"],

  testRegex: ".*\\.int-spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },

  moduleNameMapper: {
    // Update your path alias to explicitly target the src directory
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  modulePaths: ["<rootDir>"],
  testTimeout: 30000,
};
