import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'calculator/index': 'src/calculator/index.ts',
    'percentage/index': 'src/percentage/index.ts',
    'discount/index': 'src/discount/index.ts',
    'gst/index': 'src/gst/index.ts',
    'emi/index': 'src/emi/index.ts',
    'number-format/index': 'src/number-format/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  minify: false,
  splitting: false,
});
