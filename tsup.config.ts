import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    jsx: 'src/jsx/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: [],
  noExternal: ['three', 'troika-three-text'],
  minify: false,
  target: 'es2022',
});
