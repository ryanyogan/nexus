// ============================================================================
// Shared Constants
// ============================================================================

export const LIBRARY_CATEGORIES = [
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "fullstack", label: "Full Stack" },
  { id: "database", label: "Database" },
  { id: "cloud", label: "Cloud" },
  { id: "ai", label: "AI / ML" },
  { id: "testing", label: "Testing" },
  { id: "utilities", label: "Utilities" },
] as const;

export type CategoryId = (typeof LIBRARY_CATEGORIES)[number]["id"];

export const CATEGORY_IDS = LIBRARY_CATEGORIES.map((c) => c.id);
