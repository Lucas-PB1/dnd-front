import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/design-system/layout/back-link";
import { InkFlourish, SealMark } from "@/shared/design-system/brand/brand-marks";

type CatalogPageHeaderProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  /** Selo + flourish sob o título (padrão Taverna). */
  brandMarks?: boolean;
  className?: string;
};

export function CatalogPageHeader({
  title,
  description,
  backHref,
  backLabel = "Voltar",
  meta,
  actions,
  brandMarks = true,
  className,
}: CatalogPageHeaderProps) {
  return (
    <div className={cn("space-y-3", motion.enter, className)}>
      {backHref ? <BackLink href={backHref}>{backLabel}</BackLink> : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            {brandMarks ? (
              <SealMark className="size-7 shrink-0 sm:size-8" />
            ) : null}
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
          </div>
          {brandMarks ? (
            <InkFlourish className="h-3 w-36 text-secondary/60 sm:w-44" />
          ) : null}
          {description ? (
            <p
              className={cn(
                "max-w-3xl text-sm text-muted-foreground sm:text-base",
                "motion-enter motion-delay-1",
              )}
            >
              {description}
            </p>
          ) : null}
          {meta ? (
            <div className="text-sm text-muted-foreground sm:text-base">
              {meta}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Alias — mesmo header em listas de app (fichas, campanhas) e catálogo. */
export const PageHeader = CatalogPageHeader;
