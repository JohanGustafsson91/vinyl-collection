module.exports = {
  roots: ["<rootDir>"],
  modulePaths: ["src"],
  testEnvironment: "./jsdom-extended",
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "json", "jsx"],
  testPathIgnorePatterns: ["<rootDir>[/\\\\](node_modules|.next)[/\\\\]"],
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(ts|tsx)$"],
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
  },
  verbose: true,
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "text-summary"],
};
