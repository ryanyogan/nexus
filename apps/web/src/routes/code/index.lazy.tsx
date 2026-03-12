import { createLazyFileRoute } from "@tanstack/react-router";
import { ConnectionPage } from "@/components/code/pages/ConnectionPage";

export const Route = createLazyFileRoute("/code/")({
  component: CodeIndexPage,
});

function CodeIndexPage() {
  const { session } = Route.useRouteContext();
  return <ConnectionPage session={session} />;
}
