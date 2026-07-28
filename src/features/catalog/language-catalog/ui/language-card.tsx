import type { LanguageSummary } from "@/entities/language/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogListCard } from "@/shared/ui/catalog-list-card";

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
    <CatalogListCard
      href={withCatalogReturn(`/languages/${language.slug}`, listPath)}
      title={language.name}
      titleExtra={
        language.isRare ? (
          <span className="text-xs text-secondary">Raro</span>
        ) : null
      }
      eyebrow={language.script ? `Escrita: ${language.script}` : null}
      teaser={language.typicalSpeakers}
      className={className}
    />
  );
}
