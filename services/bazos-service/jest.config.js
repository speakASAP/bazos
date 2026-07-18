module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@bazos/shared$': '<rootDir>/../../shared',
    '^@bazos/shared/(.*)$': '<rootDir>/../../shared/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  globals: {
    'ts-jest': {
      tsconfig: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        esModuleInterop: true,
        module: 'commonjs',
        target: 'ES2021',
        moduleResolution: 'node',
        types: ['node', 'jest'],
        baseUrl: './',
        paths: {
          '@bazos/shared/*': ['../../shared/*'],
        },
      },
    },
  },
};
