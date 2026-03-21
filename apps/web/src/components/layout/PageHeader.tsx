import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

// ============================================================================
// PageHeader - Consistent page header with title, description, and actions
// ============================================================================

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional description below title */
  description?: string;
  /** Optional icon to show before title */
  icon?: ReactNode;
  /** Back link URL - shows back arrow if provided */
  backHref?: string;
  /** Back link label (defaults to "Back") */
  backLabel?: string;
  /** Actions to show on the right side */
  actions?: ReactNode;
  /** Additional classes */
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  backHref,
  backLabel = "Back",
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`pt-8 pb-6 md:pt-12 md:pb-8 ${className}`}>
      {/* Back link */}
      {backHref && (
        <Link
          to={backHref}
          className="mb-4 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground md:mb-6"
        >
          <ArrowLeft className="h-3 w-3" />
          {backLabel}
        </Link>
      )}

      {/* Title row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center border border-foreground bg-foreground text-background md:h-12 md:w-12">
              {icon}
            </div>
          )}
          <div>
            <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-foreground md:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1 font-mono text-sm text-muted-foreground md:text-base">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

// ============================================================================
// PageHeaderSkeleton - Loading state for PageHeader
// ============================================================================

export function PageHeaderSkeleton({
  hasBack = false,
  hasIcon = false,
  hasActions = false,
}: {
  hasBack?: boolean;
  hasIcon?: boolean;
  hasActions?: boolean;
}) {
  return (
    <div className="pt-8 pb-6 md:pt-12 md:pb-8 animate-pulse">
      {hasBack && <div className="mb-4 h-4 w-16 bg-muted rounded md:mb-6" />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          {hasIcon && <div className="h-10 w-10 bg-muted md:h-12 md:w-12" />}
          <div>
            <div className="h-8 w-48 bg-muted rounded md:h-9" />
            <div className="mt-2 h-4 w-64 bg-muted rounded" />
          </div>
        </div>
        {hasActions && <div className="h-10 w-24 bg-muted rounded" />}
      </div>
    </div>
  );
}
