import Link from "next/link";

import { cn } from "@/shared/lib/utils";

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
    <div className={cn("space-y-3", className)}>
      {backHref ? (
        <Link
          href={backHref}
          className="inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← {backLabel}
        </Link>
      ) : null}
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
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
