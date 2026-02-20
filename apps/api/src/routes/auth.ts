import { Hono } from "hono";
import { createAuth } from "@nexus/auth";
import type { AppContext } from "../types";

const authRouter = new Hono<AppContext>();

// Better Auth handles all /api/auth/* routes
authRouter.all("/*", async (c) => {
  // Create auth instance with env bindings
  // Type assertion needed because wrangler types and @cloudflare/workers-types have slight differences
  const auth = createAuth(
    {
      DB: c.env.DB as any,
      KV: c.env.KV as any,
      GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET,
      GITHUB_CLIENT_ID: c.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: c.env.GITHUB_CLIENT_SECRET,
      BETTER_AUTH_SECRET: c.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: c.env.BETTER_AUTH_URL,
    },
    c.req.raw.cf as any
  );

  // Better Auth handles the request
  return auth.handler(c.req.raw);
});

export { authRouter };
