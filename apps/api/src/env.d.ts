// Extend the generated Env type with secrets (from .dev.vars / wrangler secret)
declare global {
  interface Env {
    // Secrets - not in wrangler.jsonc, loaded from .dev.vars or wrangler secret
    BETTER_AUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
  }
}

export {};
