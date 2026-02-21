import { createAuth } from "@nexus/auth";

// Server-side auth instance for TanStack Start on Cloudflare
// Uses cloudflare:workers to access env bindings
export async function getAuth() {
  const { env } = await import("cloudflare:workers");
  
  return createAuth({
    DB: env.DB,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET || "",
    GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID || "",
    GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET || "",
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET || "",
    BETTER_AUTH_URL: env.BETTER_AUTH_URL || "http://localhost:3000",
  });
}

// Helper to get session from request
export async function getSession(request: Request) {
  const auth = await getAuth();
  return auth.api.getSession({ headers: request.headers });
}

// Helper to require authentication - throws redirect if not authenticated
export async function requireAuth(request: Request) {
  const session = await getSession(request);
  
  if (!session) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/sign-in" },
    });
  }
  
  return session;
}

// Helper to require admin role
export async function requireAdmin(request: Request) {
  const session = await requireAuth(request);
  
  // Cast user to include role field (defined in our DB schema and Better Auth config)
  const user = session.user as typeof session.user & { role?: string };
  if (user.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }
  
  return session;
}
