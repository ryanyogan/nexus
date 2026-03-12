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
      // Cloudflare-specific imports should be external for client builds
      external: ['cloudflare:workers'],
      output: {
        manualChunks: {
          // Shiki is large (~1MB), keep it in a separate chunk (lazy-loaded)
          shiki: ['shiki', 'shiki/core', 'shiki/engine/javascript'],
          // CodeMirror for /code routes - lazy loaded
          codemirror: [
            '@codemirror/state',
            '@codemirror/view',
            '@codemirror/lang-javascript',
            '@codemirror/lang-css',
            '@codemirror/lang-html',
            '@codemirror/lang-json',
            '@codemirror/lang-markdown',
            '@codemirror/lang-python',
            '@codemirror/lang-go',
            '@codemirror/lang-rust',
            '@codemirror/lang-java',
            '@uiw/react-codemirror',
            '@uiw/codemirror-themes',
          ],
        },
      },
    },
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
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
})

export default config
