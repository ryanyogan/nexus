/**
 * Visual indicator that dev auth bypass is active.
 * 
 * Only shows when VITE_DEV_BYPASS_AUTH is set and running on localhost.
 */
export function DevModeBadge() {
  // Build-time check - only include in development
  const isDevAuthEnabled = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
  if (!isDevAuthEnabled) return null;

  // Runtime failsafe - only show on localhost
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return null;
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-medium text-black shadow-lg">
      <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
      DEV AUTH: Ryan (admin)
    </div>
  );
}
