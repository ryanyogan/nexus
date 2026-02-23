import type { D1Database } from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, customSession } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@nexus/db";

// Env bindings type - simplified, no KV needed
export interface AuthEnv {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

// Create auth instance for runtime
export function createAuth(env: AuthEnv) {
  const db = drizzle(env.DB, { schema });

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      usePlural: true,
    }),
    emailAndPassword: {
      enabled: false, // OAuth only for now
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "user",
          input: false, // Users can't set their own role
        },
      },
    },
    plugins: [
      // Enable bearer token auth for cross-domain API calls
      bearer(),
      // Include role in session response so getSession returns it
      customSession(async ({ user, session }) => {
        return {
          user: {
            ...user,
            role: (user as any).role || "user",
          },
          session,
        };
      }),
    ],
    // Cross-subdomain cookie settings - both nexus.yogan.dev and api.nexus.yogan.dev share .yogan.dev
    advanced: {
      crossSubDomainCookies: {
        enabled: true,
        domain: ".yogan.dev", // Shared parent domain
      },
      // Use Lax for same-site subdomains (more compatible than None+Partitioned)
      defaultCookieAttributes: {
        sameSite: "lax",
        secure: true,
      },
    },
    trustedOrigins: [
      "https://nexus.yogan.dev",
      "https://code.nexus.yogan.dev",
    ],
  });
}

// Type helper for auth instance
export type Auth = ReturnType<typeof createAuth>;

// Export for CLI schema generation (used by better-auth CLI)
export const auth = betterAuth({
  database: drizzleAdapter({} as any, {
    provider: "sqlite",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: "placeholder",
      clientSecret: "placeholder",
    },
    github: {
      clientId: "placeholder",
      clientSecret: "placeholder",
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      return {
        user: {
          ...user,
          role: (user as any).role || "user",
        },
        session,
      };
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
});
