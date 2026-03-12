import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

/**
 * Protected layout route.
 * All routes under /_authed/ require authentication.
 * If user is not authenticated, redirects to /sign-in with return URL.
 */
export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ context, location }) => {
    // Session is populated by __root.tsx beforeLoad
    const { session } = context;

    if (!session?.user) {
      throw redirect({
        to: "/sign-in",
        search: { redirect: location.href },
      });
    }

    // Pass session to child routes
    return { session };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  return <Outlet />;
}
