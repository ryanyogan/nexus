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
  Star,
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
// ContentCard Component - Grid View
// ============================================================================

interface ContentCardProps {
  item: ContentItem;
}

export function ContentCard({ item }: ContentCardProps) {
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
    const iconClass = "h-5 w-5";

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

  const getTypeLabel = (): string => {
    switch (item.type) {
      case "doc":
        return "LIBRARY";
      case "server":
        return "MCP SERVER";
      case "skill":
        return "SKILL";
      case "stack":
        return "STACK";
      case "prompt":
        return "PROMPT";
    }
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

  const isFeatured = "isFeatured" in item ? item.isFeatured : false;
  const stats = getStats();

  return (
    <Link
      to={getDetailUrl()}
      className="group flex flex-col bg-background p-6 transition-colors hover:bg-muted/30"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-muted/50 text-muted-foreground transition-colors group-hover:text-accent">
            {getIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {getTypeLabel()}
              </span>
              {isFeatured && <Star className="h-3 w-3 fill-accent text-accent" />}
            </div>
            <h3 className="truncate font-mono text-sm font-bold text-foreground transition-colors group-hover:text-accent">
              {getName()}
            </h3>
          </div>
        </div>
      </div>

      {/* Description (if available) */}
      {item.description && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
      )}

      {/* Stats */}
      <div className="mt-auto flex items-center gap-4 pt-4 font-mono text-xs text-muted-foreground">
        {stats.map((stat, idx) => (
          <span key={idx} className="tabular-nums">
            <span className="font-bold text-foreground/70">{stat.value}</span>
            <span className="ml-1 text-[10px] text-muted-foreground/60">{stat.label}</span>
          </span>
        ))}
      </div>
    </Link>
  );
}

// ============================================================================
// Skeleton for ContentCard (Loading State)
// ============================================================================

export function ContentCardSkeleton() {
  return (
    <div className="flex flex-col bg-background p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 bg-muted" />
        <div className="min-w-0 flex-1">
          <div className="h-3 w-16 bg-muted mb-2" />
          <div className="h-4 w-32 bg-muted" />
        </div>
      </div>

      {/* Description */}
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full bg-muted" />
        <div className="h-3 w-3/4 bg-muted" />
      </div>

      {/* Stats */}
      <div className="mt-auto flex items-center gap-4 pt-4">
        <div className="h-3 w-16 bg-muted" />
        <div className="h-3 w-16 bg-muted" />
      </div>
    </div>
  );
}

// ============================================================================
// Skeleton Grid for Multiple Cards
// ============================================================================

export function ContentGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-px bg-border border border-border md:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <ContentCardSkeleton key={i} />
      ))}
    </div>
  );
}
