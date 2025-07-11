module.exports = {
  projects: [
    // Frontend (React Native / Expo) Configuration
    {
      displayName: 'frontend',
      preset: 'jest-expo',
      setupFilesAfterEnv: ['./jest.setup.js'],
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
      ],
      testMatch: [
        '<rootDir>/app/**/*.test.tsx'
      ],
      moduleNameMapper: {
        // Enhanced mappings for external directories
        '^@/common/(.*)$': '<rootDir>/common/$1',
        '^@/backend/(.*)$': '<rootDir>/backend/$1',
        '^common/(.*)$': '<rootDir>/common/$1',
        '^backend/(.*)$': '<rootDir>/backend/$1',
        '^../../../common/types$': '<rootDir>/common/types',
        '^../../common/(.*)$': '<rootDir>/common/$1',
        '^../common/(.*)$': '<rootDir>/common/$1',
        // Handle utils and hooks directories
        '^@/utils/(.*)$': '<rootDir>/utils/$1',
        '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
        '^../utils/(.*)$': '<rootDir>/utils/$1',
        '^../hooks/(.*)$': '<rootDir>/hooks/$1',
      },
      // Allow Jest to transform files from external directories
      testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/backend/node_modules/',
      ],
      // Ensure external modules are not ignored
      modulePathIgnorePatterns: [
        '<rootDir>/backend/node_modules/',
      ],
    },
    // Backend (Node.js) Configuration
    {
      displayName: 'backend',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/backend/src/**/*.test.ts'
      ],
      moduleNameMapper: {
        // This is needed to help the backend test find the common types module
        '^common/(.*)$': '<rootDir>/common/$1',
      },
    },
  ],
}; 