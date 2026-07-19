import Link from "next/link";

import type { BackgroundSummary } from "@/entities/background/types";
import { cn } from "@/shared/lib/utils";

type BackgroundCardProps = {
  background: BackgroundSummary;
  className?: string;
};

export function BackgroundCard({ background, className }: BackgroundCardProps) {
  return (
    <Link
      href={`/backgrounds/${background.slug}`}
      className={cn(
        "group flex flex-col gap-1.5 border-b border-border px-1 py-3 transition-colors hover:bg-muted/30 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <h2 className="font-heading text-base font-semibold tracking-tight group-hover:text-primary sm:text-lg">
          {background.name}
        </h2>
        {background.tagline ? (
          <p className="text-xs font-medium tracking-wide text-primary/90 uppercase">
            {background.tagline}
          </p>
        ) : null}
        {background.summary ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {background.summary}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground sm:max-w-64 sm:justify-end">
        {background.originFeatName ? (
          <span>{background.originFeatName}</span>
        ) : null}
        {background.abilityOptionNames?.length ? (
          <span>{background.abilityOptionNames.join(" · ")}</span>
        ) : null}
      </div>
    </Link>
  );
}
