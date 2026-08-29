import Link from "next/link";
import type { ReactNode } from "react";

import { resolveCatalogImageUrl } from "@/shared/lib/resolve-catalog-image-url";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/design-system/layout/back-link";
import { MarginCorner } from "@/shared/design-system/brand/brand-marks";
import { buttonVariants } from "@/shared/design-system/primitives/button";
import { Badge } from "@/shared/design-system/primitives/badge";

export type CatalogDetailStat = {
  label: string;
  value: ReactNode;
};

type CatalogDetailHeroProps = {
  backHref: string;
  backLabel: string;
  title: string;
  titleExtra?: ReactNode;
  eyebrow?: ReactNode;
  badges?: string[];
  summary?: ReactNode;
  stats?: CatalogDetailStat[];
  imageUrl?: string | null;
  children?: ReactNode;
  className?: string;
};

/** Hero de página de detalhe do compêndio (gradiente + back + título + stats). */
export function CatalogDetailHero({
  backHref,
  backLabel,
  title,
  titleExtra,
  eyebrow,
  badges,
  summary,
  stats,
  imageUrl,
  children,
  className,
}: CatalogDetailHeroProps) {
  const hasStats = (stats?.length ?? 0) > 0;
  const resolvedImageUrl = resolveCatalogImageUrl(imageUrl);

  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-xl border border-border",
        motion.enter,
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--muted)_75%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_16%,transparent),transparent_50%),radial-gradient(ellipse_at_bottom_left,color-mix(in_oklch,var(--accent)_10%,transparent),transparent_45%)]"
        aria-hidden
      />
      <MarginCorner className="pointer-events-none absolute top-3 left-3 size-9 sm:size-11" />
      <MarginCorner
        mirror
        className="pointer-events-none absolute right-3 bottom-3 size-9 sm:size-11"
      />
      <div className="relative space-y-6 p-5 sm:p-8">
        <BackLink href={backHref}>{backLabel}</BackLink>

        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              {title}
            </h1>
            {titleExtra}
          </div>
          {eyebrow ? (
            <p className="max-w-xl text-sm font-medium tracking-wide text-secondary uppercase sm:text-base">
              {eyebrow}
            </p>
          ) : null}
          {badges && badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Badge key={badge} variant="secondary" size="default">
                  {badge}
                </Badge>
              ))}
            </div>
          ) : null}
          {summary ? (
            <p className="max-w-2xl font-heading text-lg leading-snug text-foreground/90 sm:text-xl">
              {summary}
            </p>
          ) : null}
          {resolvedImageUrl ? (
            <img
              src={resolvedImageUrl}
              alt=""
              className="max-h-48 w-full max-w-xs rounded-lg border border-border/60 bg-muted/30 object-cover object-top"
            />
          ) : null}
        </div>

        {hasStats ? (
          <dl
            className="grid gap-px overflow-x-auto rounded-lg border border-border bg-border"
            style={{
              gridTemplateColumns: `repeat(${stats!.length}, minmax(0, 1fr))`,
            }}
          >
            {stats!.map((stat) => (
              <div
                key={stat.label}
                className="min-w-0 bg-card/80 px-2 py-3 backdrop-blur-sm sm:px-4"
              >
                <dt className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                  {stat.label}
                </dt>
                <dd className="mt-1 font-heading text-sm font-semibold leading-tight sm:text-lg">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {children}
      </div>
    </header>
  );
}

type CatalogDetailErrorProps = {
  message: string;
  backHref: string;
};

export function CatalogDetailError({
  message,
  backHref,
}: CatalogDetailErrorProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-destructive">{message}</p>
      <Link
        href={backHref}
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        Voltar ao compêndio
      </Link>
    </div>
  );
}
