import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  target: "node18",
  outDir: "dist",
  banner: {
    js: "#!/usr/bin/env node",
  },
  external: [
    // React and Ink should be bundled
  ],
  noExternal: [
    // Bundle these packages
    "ink",
    "ink-spinner",
    "ink-select-input",
    "ink-text-input",
    "react",
  ],
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
