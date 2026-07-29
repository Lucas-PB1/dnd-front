import type { SpellSummary } from "@/entities/spell/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogEditionChip } from "@/shared/ui/catalog-edition-chip";
import { CatalogListCard } from "@/shared/ui/catalog-list-card";

type SpellCardProps = {
  spell: SpellSummary;
  listPath?: string;
  className?: string;
};

function spellTeaser(description: string): string {
  return description.replace(/\s+/g, " ").trim();
}

export function SpellCard({ spell, listPath, className }: SpellCardProps) {
  const flags = [
    spell.concentration ? "Concentração" : null,
    spell.ritual ? "Ritual" : null,
  ].filter(Boolean);

  return (
    <CatalogListCard
      href={withCatalogReturn(`/spells/${spell.slug}`, listPath)}
      title={spell.name}
      titleExtra={
        <span className="inline-flex items-center gap-1.5">
          <CatalogEditionChip editionSlug={spell.editionSlug} />
          <span className="font-mono text-xs text-secondary">
            {spell.levelLabel}
          </span>
        </span>
      }
      eyebrow={spell.schoolName}
      teaser={spell.description ? spellTeaser(spell.description) : null}
      aside={
        <div className="flex shrink-0 flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground sm:max-w-56 sm:justify-end">
          <span>{spell.castingTime}</span>
          <span>{spell.range}</span>
          {flags.map((flag) => (
            <span key={flag} className="text-primary/90">
              {flag}
            </span>
          ))}
        </div>
      }
      className={className}
    />
  );
}
