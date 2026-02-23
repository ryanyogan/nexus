import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

// Redirect /explore/servers to /explore?tab=servers
export const Route = createFileRoute("/explore/servers/")({
  component: ServersRedirect,
});

function ServersRedirect() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate({ to: "/explore", search: { tab: "servers" } });
  }, [navigate]);
  
  return null;
}
