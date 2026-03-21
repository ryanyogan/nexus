import type { ReactNode } from "react";

// ============================================================================
// Layout Constants - Single source of truth for widths
// ============================================================================

export const LAYOUT_WIDTHS = {
  /** Full layout width (header, dashboard with sidebar) */
  full: "max-w-[1120px]",
  /** Standard content width */
  content: "max-w-[960px]",
  /** Narrow content (forms, settings) */
  narrow: "max-w-3xl",
  /** Wide content (data tables, grids) */
  wide: "max-w-7xl",
} as const;

// ============================================================================
// PageContainer - Consistent page wrapper with max-width and padding
// ============================================================================

interface PageContainerProps {
  children: ReactNode;
  /** Additional classes to apply to the outer container */
  className?: string;
  /** Use narrow max-width (768px) instead of default (960px) */
  narrow?: boolean;
  /** Use wide max-width (1280px) instead of default (960px) */
  wide?: boolean;
  /** Use full layout width (1120px) for pages with sidebars */
  full?: boolean;
}

export function PageContainer({
  children,
  className = "",
  narrow = false,
  wide = false,
  full = false,
}: PageContainerProps) {
  const maxWidth = narrow
    ? LAYOUT_WIDTHS.narrow
    : wide
      ? LAYOUT_WIDTHS.wide
      : full
        ? LAYOUT_WIDTHS.full
        : LAYOUT_WIDTHS.content;

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className={`mx-auto ${maxWidth} px-4 sm:px-6 lg:px-0`}>{children}</div>
    </div>
  );
}

// ============================================================================
// PageSection - Consistent section wrapper within a page
// ============================================================================

interface PageSectionProps {
  children: ReactNode;
  className?: string;
}

export function PageSection({ children, className = "" }: PageSectionProps) {
  return <div className={`py-6 md:py-8 ${className}`}>{children}</div>;
}
