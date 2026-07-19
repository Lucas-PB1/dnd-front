import Link from "next/link";

import type { FeatSummary } from "@/entities/feat/types";
import { cn } from "@/shared/lib/utils";

type FeatCardProps = {
  feat: FeatSummary;
  className?: string;
};

export function FeatCard({ feat, className }: FeatCardProps) {
  const teaser =
    feat.benefits
      .map((b) => b.name ?? b.description)
      .filter(Boolean)
      .slice(0, 2)
      .join(" · ") || null;

  return (
    <Link
      href={`/feats/${feat.slug}`}
      className={cn(
        "group flex flex-col gap-1.5 border-b border-border px-1 py-3 transition-colors hover:bg-muted/30 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h2 className="font-heading text-base font-semibold tracking-tight group-hover:text-primary sm:text-lg">
            {feat.name}
          </h2>
          {feat.repeatable ? (
            <span className="text-xs text-secondary">Repetível</span>
          ) : null}
        </div>
        <p className="text-xs font-medium tracking-wide text-primary/90 uppercase">
          {feat.categoryTypeLabel || feat.categoryName}
        </p>
        {teaser ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {teaser}
          </p>
        ) : null}
      </div>
      {feat.prerequisite ? (
        <p className="shrink-0 text-xs text-muted-foreground sm:max-w-56 sm:text-right">
          Pré-req.: {feat.prerequisite}
        </p>
      ) : null}
    </Link>
  );
}
