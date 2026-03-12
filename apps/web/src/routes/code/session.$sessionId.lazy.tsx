import { createLazyFileRoute } from "@tanstack/react-router";
import { SessionPage } from "@/components/code/pages/SessionPage";

export const Route = createLazyFileRoute("/code/session/$sessionId")({
  component: () => {
    const { sessionId } = Route.useParams();
    return <SessionPage sessionId={sessionId} />;
  },
});
