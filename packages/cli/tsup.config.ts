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
  platform: "node",
  banner: {
    js: "#!/usr/bin/env node",
  },
  // Don't bundle dependencies - let npm/pnpm resolve them at runtime
  // This avoids CJS/ESM interop issues with packages like ink
  skipNodeModulesBundle: true,
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
