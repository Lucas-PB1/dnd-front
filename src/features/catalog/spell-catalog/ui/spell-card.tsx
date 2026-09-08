import type { SpellSummary } from "@/entities/spell/types";
import { withCatalogReturn } from "@/shared/lib/catalog-return";
import { CatalogEditionChip } from "@/shared/ui/catalog-edition-chip";
import { CatalogTileCard } from "@/shared/ui/catalog-list-card";
import { cn } from "@/shared/lib/utils";

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
    <CatalogTileCard
      href={withCatalogReturn(`/spells/${spell.slug}`, listPath)}
      title={spell.name}
      dense
      titleExtra={
        <span className="inline-flex shrink-0 flex-col items-end gap-1">
          <CatalogEditionChip editionSlug={spell.editionSlug} />
          <span className="font-mono text-[0.65rem] leading-none text-secondary">
            {spell.levelLabel}
          </span>
        </span>
      }
      eyebrow={spell.schoolName}
      teaser={spell.description ? spellTeaser(spell.description) : null}
      meta={
        <>
          <span>{spell.castingTime}</span>
          <span>{spell.range}</span>
          {flags.map((flag) => (
            <span key={flag} className="text-primary/90">
              {flag}
            </span>
          ))}
        </>
      }
      className={cn("h-full", className)}
    />
  );
}
