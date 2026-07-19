import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import { buttonVariants } from "@/shared/ui/button";

export type CatalogDetailStat = {
  label: string;
  value: ReactNode;
};

function defaultStatsGridClass(count: number): string {
  if (count >= 5) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
  if (count >= 4) return "grid-cols-2 sm:grid-cols-4";
  if (count === 3) return "grid-cols-1 sm:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2";
}

type CatalogDetailHeroProps = {
  backHref: string;
  backLabel: string;
  title: string;
  titleExtra?: ReactNode;
  eyebrow?: ReactNode;
  badges?: string[];
  summary?: ReactNode;
  stats?: CatalogDetailStat[];
  /** Override do grid de stats (senão deriva da quantidade). */
  statsClassName?: string;
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
  statsClassName,
  children,
  className,
}: CatalogDetailHeroProps) {
  const hasStats = (stats?.length ?? 0) > 0;

  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-xl border border-border",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_14%,transparent),transparent_50%)]"
        aria-hidden
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
            <p className="max-w-xl text-sm font-medium tracking-wide text-primary uppercase sm:text-base">
              {eyebrow}
            </p>
          ) : null}
          {badges && badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-md bg-secondary/25 px-2.5 py-1 text-xs font-semibold text-secondary-foreground"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
          {summary ? (
            <p className="max-w-2xl font-heading text-lg leading-snug text-foreground/90 sm:text-xl">
              {summary}
            </p>
          ) : null}
        </div>

        {hasStats ? (
          <dl
            className={cn(
              "grid gap-px overflow-hidden rounded-lg border border-border bg-border",
              statsClassName ?? defaultStatsGridClass(stats!.length),
            )}
          >
            {stats!.map((stat) => (
              <div
                key={stat.label}
                className="bg-card/80 px-3 py-3 backdrop-blur-sm sm:px-4"
              >
                <dt className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                  {stat.label}
                </dt>
                <dd className="mt-1 font-heading text-base font-semibold leading-tight sm:text-lg">
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
