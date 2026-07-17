import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.integration.test.ts'],
    setupFiles: ['test/setup.ts'],
    testTimeout: 20000,
    hookTimeout: 20000,
    globals: false,
    pool: 'forks',
    // All integration files share one test database; running them serially
    // prevents one file's truncate-all from wiping another file's data.
    fileParallelism: false,
  },
});
