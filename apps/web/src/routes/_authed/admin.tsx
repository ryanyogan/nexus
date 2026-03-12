import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

/**
 * Admin layout route.
 * All routes under /_authed/_admin/ require admin role.
 * If user is not admin, redirects to home page.
 */
export const Route = createFileRoute("/_authed/admin")({
  beforeLoad: async ({ context }) => {
    // Session is guaranteed by parent _authed route
    const { session } = context;

    if (session?.user.role !== "admin") {
      throw redirect({ to: "/" });
    }

    return {};
  },
  component: AdminLayout,
});

function AdminLayout() {
  return <Outlet />;
}
