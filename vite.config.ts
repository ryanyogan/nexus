import { defineConfig } from "vite-plus";

export default defineConfig({
  // Oxlint configuration
  lint: {
    ignorePatterns: [
      "dist/**",
      ".wrangler/**",
      ".vinxi/**",
      ".output/**",
      ".vitepress/cache/**",
      "node_modules/**",
      "*.gen.ts",
      "worker-configuration.d.ts",
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },

  // Oxfmt configuration
  fmt: {
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "es5",
  },

  // Vitest configuration
  test: {
    include: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    exclude: ["node_modules/**", "dist/**", ".wrangler/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        global: {
          lines: 90,
          branches: 80,
          functions: 90,
          statements: 90,
        },
      },
    },
  },

  // Pre-commit hooks
  staged: {
    "*": "vp check --fix",
  },
});
