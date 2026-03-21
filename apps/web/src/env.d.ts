/// <reference types="vite-plus/client" />

interface ImportMetaEnv {
  /**
   * Development-only auth bypass flag.
   * When "true" and running on localhost, bypasses real auth
   * and logs you in as Ryan (admin).
   *
   * SAFETY: Only set in .env.development, never in production.
   */
  readonly VITE_DEV_BYPASS_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
