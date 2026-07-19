import Link from "next/link";

import type { SubclassSummary } from "@/entities/subclass/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { cn } from "@/shared/lib/utils";

type SubclassCardProps = {
  subclass: SubclassSummary;
  listPath?: string;
  className?: string;
};

export function SubclassCard({
  subclass,
  listPath,
  className,
}: SubclassCardProps) {
  return (
    <Link
      href={withCatalogReturn(`/subclasses/${subclass.slug}`, listPath)}
      className={cn(
        "group flex flex-col gap-1.5 border-b border-border px-1 py-3 transition-colors hover:bg-muted/30 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <h2 className="font-heading text-base font-semibold tracking-tight group-hover:text-primary sm:text-lg">
          {subclass.name}
        </h2>
        {subclass.tagline ? (
          <p className="text-xs font-medium tracking-wide text-primary/90 uppercase">
            {subclass.tagline}
          </p>
        ) : null}
        {subclass.summary ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {subclass.summary}
          </p>
        ) : null}
      </div>
      <p className="shrink-0 text-xs text-muted-foreground sm:max-w-56 sm:text-right">
        {subclass.className}
      </p>
    </Link>
  );
}
