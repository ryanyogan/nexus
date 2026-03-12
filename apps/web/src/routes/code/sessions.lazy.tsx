import { createLazyFileRoute } from "@tanstack/react-router";
import { SessionsPage } from "@/components/code/pages/SessionsPage";

export const Route = createLazyFileRoute("/code/sessions")({
  component: SessionsPage,
});
