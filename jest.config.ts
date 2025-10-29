import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
  moduleNameMapper: {
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/jest.setup.ts'],
  collectCoverageFrom: [
    'src/services/slices/**/*.ts'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/stories/',
    'src/pages/',
    'src/components/',
    'src/index.tsx',
    'src/utils/'
  ],
  coverageReporters: ['text', 'text-summary', 'lcov']
};

export default config;
