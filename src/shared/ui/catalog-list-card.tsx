import Link from "next/link";
import type { ReactNode } from "react";

import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

type CatalogListCardProps = {
  href: string;
  title: string;
  titleExtra?: ReactNode;
  eyebrow?: ReactNode;
  teaser?: ReactNode;
  aside?: ReactNode;
  className?: string;
};

/** Linha clicável de listagem do compêndio. */
export function CatalogListCard({
  href,
  title,
  titleExtra,
  eyebrow,
  teaser,
  aside,
  className,
}: CatalogListCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col gap-1.5 border-b border-border px-1 py-3 hover:bg-muted/30 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
        motion.hoverRow,
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h2 className="font-heading text-base font-semibold tracking-tight transition-colors duration-150 group-hover:text-primary sm:text-lg">
            {title}
          </h2>
          {titleExtra}
        </div>
        {eyebrow ? (
          <p className="text-xs font-medium tracking-wide text-primary/90 uppercase">
            {eyebrow}
          </p>
        ) : null}
        {teaser ? (
          <div className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {teaser}
          </div>
        ) : null}
      </div>
      {aside}
    </Link>
  );
}

type CatalogTileCardProps = {
  href: string;
  title: string;
  titleExtra?: ReactNode;
  eyebrow?: ReactNode;
  teaser?: ReactNode;
  meta?: ReactNode;
  className?: string;
};

/** Card em grade (classes / espécies). */
export function CatalogTileCard({
  href,
  title,
  titleExtra,
  eyebrow,
  teaser,
  meta,
  className,
}: CatalogTileCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 hover:border-ring hover:bg-muted/30",
        motion.hoverLift,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <h2 className="font-heading text-lg font-semibold tracking-tight transition-colors duration-150 group-hover:text-primary">
            {title}
          </h2>
          {eyebrow ? (
            <p className="text-xs font-medium tracking-wide text-primary/90 uppercase">
              {eyebrow}
            </p>
          ) : null}
        </div>
        {titleExtra}
      </div>

      {teaser ? (
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {teaser}
        </p>
      ) : null}

      {meta ? (
        <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          {meta}
        </div>
      ) : null}
    </Link>
  );
}
