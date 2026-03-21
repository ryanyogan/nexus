import { defineConfig } from "vite-plus";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const config = defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  ssr: {
    // Ensure these packages are bundled for SSR
    noExternal: ["zod", "drizzle-orm"],
  },
  optimizeDeps: {
    include: ["zod"],
  },
  build: {
    rollupOptions: {
      // Cloudflare-specific imports should be external for client builds
      external: ["cloudflare:workers"],
      output: {
        // Use function form for proper typing with Vite 8
        manualChunks: (id: string) => {
          // Shiki is large (~1MB), keep it in a separate chunk (lazy-loaded)
          if (id.includes("shiki")) return "shiki";
          // CodeMirror for /code routes - lazy loaded
          if (
            id.includes("@codemirror") ||
            id.includes("@uiw/react-codemirror") ||
            id.includes("@uiw/codemirror-themes")
          ) {
            return "codemirror";
          }
          return undefined;
        },
      },
    },
  },
  plugins: [
    cloudflare({
      viteEnvironment: { name: "ssr" },
      persistState: { path: "../../.wrangler/state" },
    }),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      // Prerender disabled - docs moved to separate Starlight app
      prerender: {
        enabled: false,
      },
    }),
    viteReact(),
  ],
});

export default config;
