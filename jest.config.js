const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

module.exports = createJestConfig({
  roots: ["<rootDir>"],
  modulePaths: ["src"],
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "json", "jsx"],
  verbose: true,
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "text-summary"],
  collectCoverageFrom: ["<rootDir>/src/**/*.{js,jsx,tsx,ts}", "!**/mocks/**"],
});
