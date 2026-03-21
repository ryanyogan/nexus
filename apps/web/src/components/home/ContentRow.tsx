import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Server,
  Zap,
  Layers,
  Cloud,
  Triangle,
  Database,
  Flame,
  Cog,
  Box,
  Gem,
  Bird,
  Monitor,
  Palette,
  Component,
  Terminal,
  TestTube,
  FileText,
} from "lucide-react";
import type { ContentItem, StackItem } from "../../types/home";

// ============================================================================
// Utility Functions
// ============================================================================

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

// ============================================================================
// Icon Mapping for Stacks
// ============================================================================

const STACK_ICONS: Record<string, typeof Layers> = {
  cloud: Cloud,
  triangle: Triangle,
  database: Database,
  flame: Flame,
  zap: Zap,
  cog: Cog,
  layers: Layers,
  box: Box,
  gem: Gem,
  bird: Bird,
  monitor: Monitor,
  palette: Palette,
  component: Component,
  terminal: Terminal,
  "test-tube": TestTube,
};

// ============================================================================
// ContentRow Component
// ============================================================================

interface ContentRowProps {
  item: ContentItem;
  isLast: boolean;
}

export function ContentRow({ item, isLast }: ContentRowProps) {
  const getDetailUrl = (): string => {
    switch (item.type) {
      case "doc":
        return `/explore/docs/${item.id}`;
      case "server":
        return `/explore/servers/${item.id}`;
      case "skill":
        return `/explore/skills/${item.id}`;
      case "stack":
        return `/explore/stacks/${item.slug}`;
      case "prompt":
        return `/dashboard/prompts/${item.id}`;
    }
  };

  const getIcon = () => {
    const iconClass = "h-3 w-3 sm:h-3.5 sm:w-3.5";

    switch (item.type) {
      case "doc":
        return <BookOpen className={iconClass} />;
      case "server":
        return <Server className={iconClass} />;
      case "skill":
        return <Zap className={iconClass} />;
      case "prompt":
        return <FileText className={iconClass} />;
      case "stack": {
        const stackItem = item as StackItem;
        const color = stackItem.color || undefined;
        const style = color ? { color } : undefined;
        const IconComponent = STACK_ICONS[stackItem.icon || "layers"] || Layers;
        return <IconComponent className={iconClass} style={style} />;
      }
    }
  };

  const getName = (): string => {
    if (item.type === "server") {
      return item.displayName || item.name;
    }
    return item.name;
  };

  const getStats = (): Array<{ value: string; label: string }> => {
    switch (item.type) {
      case "doc":
        return [
          { value: formatNumber(item.totalTokens), label: "tokens" },
          { value: formatNumber(item.totalChunks), label: "chunks" },
        ];
      case "server":
        return [
          { value: formatNumber(item.githubStars), label: "stars" },
          { value: formatNumber(item.weeklyDownloads), label: "downloads" },
        ];
      case "skill":
        return [
          { value: formatNumber(item.installCount), label: "installs" },
          { value: formatNumber(item.usageCount), label: "uses" },
        ];
      case "stack":
        return [
          { value: formatNumber(item.useCount), label: "uses" },
          { value: formatNumber(item.forkCount), label: "forks" },
        ];
      case "prompt":
        return [
          { value: formatNumber(item.usageCount), label: "uses" },
          { value: item.authorName || "System", label: "by" },
        ];
    }
  };

  const stats = getStats();

  return (
    <Link
      to={getDetailUrl()}
      className={`group flex items-center gap-3 py-3 transition-colors hover:bg-muted/30 md:gap-3 md:py-3 lg:py-3.5 ${
        !isLast ? "border-b border-border/50" : ""
      }`}
    >
      {/* Icon */}
      <div className="w-4 shrink-0 text-muted-foreground group-hover:text-foreground sm:w-4">
        {getIcon()}
      </div>

      {/* Name */}
      <div className="min-w-0 flex-1">
        <span className="truncate font-mono text-sm text-foreground transition-colors group-hover:text-accent sm:text-sm">
          {getName()}
        </span>
      </div>

      {/* Mobile: show first stat only */}
      <div className="flex items-center font-mono text-xs text-muted-foreground sm:hidden">
        <span className="tabular-nums">
          <span className="text-foreground/70">{stats[0].value}</span>
          <span className="ml-1 text-[11px] text-muted-foreground/60">{stats[0].label}</span>
        </span>
      </div>

      {/* Desktop: show all stats */}
      <div className="hidden items-center gap-3 font-mono text-xs text-muted-foreground sm:flex md:gap-4">
        {stats.map((stat, idx) => (
          <span key={idx} className="tabular-nums">
            <span className="text-foreground/70">{stat.value}</span>
            <span className="ml-1 text-[10px] text-muted-foreground/60 md:text-xs">
              {stat.label}
            </span>
          </span>
        ))}
      </div>
    </Link>
  );
}

// ============================================================================
// Skeleton for ContentRow (Loading State)
// ============================================================================

export function ContentRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/50 animate-pulse md:gap-3 md:py-3 lg:py-3.5">
      {/* Icon skeleton */}
      <div className="w-4 h-4 bg-muted rounded sm:w-4" />

      {/* Name skeleton */}
      <div className="min-w-0 flex-1">
        <div className="h-4 w-32 bg-muted rounded sm:w-48" />
      </div>

      {/* Stats skeleton - mobile */}
      <div className="flex items-center gap-1 sm:hidden">
        <div className="h-3 w-12 bg-muted rounded" />
      </div>

      {/* Stats skeleton - desktop */}
      <div className="hidden items-center gap-3 sm:flex md:gap-4">
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="h-3 w-16 bg-muted rounded" />
      </div>
    </div>
  );
}

// ============================================================================
// Skeleton List for Multiple Rows
// ============================================================================

export function ContentListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <ContentRowSkeleton key={i} />
      ))}
    </div>
  );
}
