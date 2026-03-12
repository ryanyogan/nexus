import { createLazyFileRoute } from "@tanstack/react-router";
import { ConnectionPage } from "@/components/code/pages/ConnectionPage";

export const Route = createLazyFileRoute("/code/")({
  component: ConnectionPage,
});
