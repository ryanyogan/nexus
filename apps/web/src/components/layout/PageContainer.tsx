import type { ReactNode } from "react";

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
}

export function PageContainer({
  children,
  className = "",
  narrow = false,
  wide = false,
}: PageContainerProps) {
  const maxWidth = narrow ? "max-w-3xl" : wide ? "max-w-7xl" : "max-w-[960px]";

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
