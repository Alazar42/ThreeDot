import { defineConfig } from 'vitest/config';
import path from 'path';

import { fileURLToPath } from 'url';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
    },
  },
  resolve: {
    alias: {
      'threedot': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
    },
  },
});
