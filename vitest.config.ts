import { defineConfig } from 'vitest/config';
import { reactNativeVitestPlugin } from 'react-native-testing-mocks/vitest';

export default defineConfig({
  plugins: [reactNativeVitestPlugin()],
  test: {
    include: ['app/**/*.test.tsx', 'utils/**/*.test.ts', 'hooks/**/*.test.ts'],
    exclude: ['node_modules/**', 'backend/**'],
    setupFiles: ['./vitest.setup.ts'],
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@/common': './common',
      '@/utils': './utils',
      '@/hooks': './hooks',
      '@/app': './app',
    },
  },
}); 