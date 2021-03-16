module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!<rootDir>/src/index.ts',
  ],
  testResultsProcessor: './node_modules/jest-junit-reporter',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/build',
    '/node_modules/'
  ],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100
    }
  }
}
