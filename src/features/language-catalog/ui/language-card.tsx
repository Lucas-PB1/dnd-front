import Link from "next/link";

import type { LanguageSummary } from "@/entities/language/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { cn } from "@/shared/lib/utils";

type LanguageCardProps = {
  language: LanguageSummary;
  listPath?: string;
  className?: string;
};

export function LanguageCard({
  language,
  listPath,
  className,
}: LanguageCardProps) {
  return (
    <Link
      href={withCatalogReturn(`/languages/${language.slug}`, listPath)}
      className={cn(
        "group flex flex-col gap-1.5 border-b border-border px-1 py-3 transition-colors hover:bg-muted/30 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h2 className="font-heading text-base font-semibold tracking-tight group-hover:text-primary sm:text-lg">
            {language.name}
          </h2>
          {language.isRare ? (
            <span className="text-xs text-secondary">Raro</span>
          ) : null}
        </div>
        {language.script ? (
          <p className="text-xs font-medium tracking-wide text-primary/90 uppercase">
            Escrita: {language.script}
          </p>
        ) : null}
        {language.typicalSpeakers ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {language.typicalSpeakers}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
