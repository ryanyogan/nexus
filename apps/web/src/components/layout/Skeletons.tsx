import { PageContainer } from "./PageContainer";
import { PageHeaderSkeleton } from "./PageHeader";

// ============================================================================
// Base Skeleton - Animated placeholder element
// ============================================================================

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted ${className}`} />;
}

// ============================================================================
// PageSkeleton - Full page loading skeleton
// ============================================================================

interface PageSkeletonProps {
  hasBack?: boolean;
  hasIcon?: boolean;
  hasActions?: boolean;
  /** Number of content rows to show */
  rows?: number;
  /** Show card grid instead of list */
  cardGrid?: boolean;
  /** Number of cards in grid */
  cards?: number;
}

export function PageSkeleton({
  hasBack = false,
  hasIcon = false,
  hasActions = false,
  rows = 5,
  cardGrid = false,
  cards = 4,
}: PageSkeletonProps) {
  return (
    <PageContainer>
      <PageHeaderSkeleton hasBack={hasBack} hasIcon={hasIcon} hasActions={hasActions} />

      {cardGrid ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cards }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <ListSkeleton rows={rows} />
      )}
    </PageContainer>
  );
}

// ============================================================================
// CardSkeleton - Card loading state
// ============================================================================

export function CardSkeleton() {
  return (
    <div className="border border-border bg-background p-5 animate-pulse">
      <div className="mb-4 flex items-start gap-3">
        <div className="h-10 w-10 bg-muted" />
        <div className="flex-1">
          <div className="h-5 w-32 bg-muted rounded mb-1.5" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      </div>
      <div className="h-12 w-full bg-muted rounded mb-4" />
      <div className="flex items-center gap-2">
        <div className="h-5 w-16 bg-muted rounded" />
        <div className="h-5 w-20 bg-muted rounded" />
      </div>
    </div>
  );
}

// ============================================================================
// ListSkeleton - List of row skeletons
// ============================================================================

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border border-border divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-muted rounded" />
            <div>
              <div className="h-4 w-32 bg-muted rounded mb-1" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// StatCardSkeleton - Stats card loading state
// ============================================================================

export function StatCardSkeleton() {
  return (
    <div className="border border-border bg-background p-4 animate-pulse">
      <div className="h-4 w-4 bg-muted rounded mb-2" />
      <div className="h-8 w-16 bg-muted rounded mb-1" />
      <div className="h-3 w-20 bg-muted rounded" />
    </div>
  );
}

// ============================================================================
// StatsGridSkeleton - Grid of stat cards
// ============================================================================

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// TableSkeleton - Table loading state
// ============================================================================

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="border border-border">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-muted rounded animate-pulse"
            style={{ width: `${100 / columns}%` }}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-border last:border-b-0 px-4 py-3"
        >
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="h-4 bg-muted rounded animate-pulse"
              style={{ width: `${100 / columns}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// CenteredSpinner - Simple centered loading spinner
// ============================================================================

export function CenteredSpinner() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="h-6 w-6 animate-spin border-2 border-accent border-t-transparent" />
    </div>
  );
}

// ============================================================================
// InlineSpinner - Small inline spinner
// ============================================================================

export function InlineSpinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-4 w-4 animate-spin border-2 border-accent border-t-transparent rounded-full ${className}`}
    />
  );
}
