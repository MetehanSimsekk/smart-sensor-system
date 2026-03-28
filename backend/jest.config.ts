import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  forceExit: true,
  clearMocks: true,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        strict: false
      }
    }]
  }
};

export default config;
