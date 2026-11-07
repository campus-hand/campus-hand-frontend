import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/components/**', 'src/features/**'],
      exclude: ['src/lib/api/**', 'src/components/ui/**'],
      // Starting limits (stack doc): web 60%; auth + payments 80% once they exist.
      thresholds: { lines: 60, functions: 60, branches: 60, statements: 60 },
    },
  },
});
