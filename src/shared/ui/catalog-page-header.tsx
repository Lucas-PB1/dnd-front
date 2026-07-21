import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";

type CatalogPageHeaderProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  meta?: React.ReactNode;
  className?: string;
};

export function CatalogPageHeader({
  title,
  description,
  backHref,
  backLabel = "Voltar",
  meta,
  className,
}: CatalogPageHeaderProps) {
  return (
    <div className={cn("space-y-3", motion.enter, className)}>
      {backHref ? <BackLink href={backHref}>{backLabel}</BackLink> : null}
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
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
    </div>
  );
}
