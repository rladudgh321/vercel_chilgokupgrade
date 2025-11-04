
import nextJest from 'next/jest.js'
 
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})
 
// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@adminComponents/(.*)$': '<rootDir>/src/app/components/admin/$1',
    '^@svg/(.*)$': '<rootDir>/src/app/components/svg/$1',
    '^@adminShared/(.*)$': '<rootDir>/src/app/(admin)/shared/$1',
  },
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
}
 
// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
