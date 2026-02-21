import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

const config = defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  ssr: {
    // Ensure these packages are bundled for SSR
    noExternal: ['zod', 'drizzle-orm'],
  },
  optimizeDeps: {
    include: ['zod'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Shiki is large (~1MB), keep it in a separate chunk
          shiki: ['shiki', 'shiki/core', 'shiki/engine/javascript'],
          // GSAP for animations
          gsap: ['gsap', 'gsap/ScrollTrigger'],
        },
      },
    },
  },
  plugins: [
    // TanStack devtools disabled - causes port conflicts
    // devtools(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
