import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node', // для редьюсеров/селектора хватает node
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
  moduleNameMapper: {
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1' // если используешь алиасы
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/jest.setup.ts'],
  collectCoverageFrom: [
    'src/services/slices/**/*.ts' // покрываем слайсы
    // 'src/services/selectors/**/*.ts', // (опц.) селекторы
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/stories/',
    'src/pages/',
    'src/components/',
    'src/index.tsx',
    'src/utils/' // если пока не тестируешь API/утилиты
  ],
  coverageReporters: ['text', 'text-summary', 'lcov']
};

export default config;
