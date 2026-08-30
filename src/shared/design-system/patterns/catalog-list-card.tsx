import Link from "next/link";
import type { ReactNode } from "react";

import { CatalogMediaImage } from "@/shared/design-system/patterns/catalog-media-image";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

type CatalogListCardProps = {
  href: string;
  title: string;
  titleExtra?: ReactNode;
  eyebrow?: ReactNode;
  teaser?: ReactNode;
  aside?: ReactNode;
  imageUrl?: string | null;
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
  imageUrl,
  className,
}: CatalogListCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col gap-1.5 border-b border-border px-1 py-3 hover:bg-muted/30 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        motion.hoverRow,
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 gap-3">
        {imageUrl ? (
          <CatalogMediaImage
            src={imageUrl}
            className="mt-0.5 size-14 shrink-0 rounded-md border border-border/60 bg-muted/30 object-contain object-center p-1 sm:size-16"
          />
        ) : null}
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
  imageUrl?: string | null;
  footer?: ReactNode;
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
  imageUrl,
  footer,
  className,
}: CatalogTileCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card hover:border-ring",
        motion.hoverLift,
        className,
      )}
    >
      <Link
        href={href}
        className="flex min-h-0 flex-1 flex-col gap-3 p-4 hover:bg-muted/30"
      >
        {imageUrl ? (
          <div className="-mx-4 -mt-4 overflow-hidden border-b border-border/60">
            <CatalogMediaImage
              src={imageUrl}
              className="h-32 w-full bg-muted/30 object-cover object-top"
            />
          </div>
        ) : null}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            <h2 className="font-heading text-lg font-semibold tracking-tight transition-colors duration-150 group-hover:text-primary">
              {title}
            </h2>
            <div className="min-h-[1.25rem]">
              {eyebrow ? (
                <p className="text-xs font-medium tracking-wide text-primary/90 uppercase">
                  {eyebrow}
                </p>
              ) : null}
            </div>
          </div>
          {titleExtra}
        </div>

        <div className="min-h-[4.5rem] flex-1">
          {teaser ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {teaser}
            </p>
          ) : null}
        </div>

        {meta ? (
          <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            {meta}
          </div>
        ) : null}
      </Link>

      {footer ? (
        <div className="shrink-0 border-t border-border/60 bg-muted/10 px-4 py-3">
          {footer}
        </div>
      ) : null}
    </article>
  );
}
