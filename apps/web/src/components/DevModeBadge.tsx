import { isDevAuthEnabled } from "@/lib/auth";

/**
 * Visual indicator that dev auth bypass is active.
 * 
 * SAFETY: This component is completely tree-shaken out of production builds
 * because isDevAuthEnabled is a build-time constant that evaluates to false.
 */
export function DevModeBadge() {
  // Build-time check - entire component is removed in production
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
