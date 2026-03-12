import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Run tests in parallel across workspaces
    pool: "threads",
    // Global test timeout
    testTimeout: 10000,
    // Coverage settings
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "**/dist/**",
        "**/*.d.ts",
        "**/test/**",
        "**/*.config.*",
      ],
    },
  },
});
