"use client";

import { inferActorKindFromCreatureSlug } from "@/entities/creature-template/format";
import { useCreatureTemplateDetail } from "@/features/catalog/creature-template-catalog/api/use-creature-templates";
import { LinkTemplateToCharacter } from "@/features/catalog/template-link/ui/link-template-to-character";
import { StatBlockCard } from "@/features/catalog/template-stat-block/ui/stat-block-card";
import { TemplateSpellsList } from "@/features/catalog/template-stat-block/ui/template-stat-block-sections";
import { useCatalogBackHref } from "@/shared/lib/use-catalog-back-href";
import {
  CatalogDetailError,
  CatalogDetailHero,
} from "@/shared/ui/catalog-detail-hero";

type CreatureTemplateDetailViewProps = {
  slug: string;
};

export function CreatureTemplateDetailView({
  slug,
}: CreatureTemplateDetailViewProps) {
  const backHref = useCatalogBackHref("/creatures");
  const detail = useCreatureTemplateDetail(slug);

  if (detail.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando…</p>;
  }

  if (detail.isError || !detail.data) {
    return (
      <CatalogDetailError
        backHref={backHref}
        message="Criatura não encontrada."
      />
    );
  }

  const template = detail.data;

  return (
    <div className="space-y-6">
      <CatalogDetailHero
        backHref={backHref}
        backLabel="Criaturas"
        title={template.name}
        eyebrow={template.creatureType}
      />

      <StatBlockCard
        variant="creature"
        name={template.name}
        subtitle={
          template.subtitle ??
          [template.sizeSlug, template.creatureType, template.alignment]
            .filter(Boolean)
            .join(", ")
        }
        armorClass={template.armorClass}
        initiativeModifier={template.initiativeModifier}
        hitPoints={template.hitPointsAvg}
        hitPointsFormula={template.hitPointsFormula}
        speeds={template.speeds}
        abilityScores={template.abilityScores}
        challengeRating={template.challengeRating}
        proficiencyBonus={template.proficiencyBonus}
        traits={template.traits}
        actions={template.actions}
      />

      <LinkTemplateToCharacter
        templateSlug={template.slug}
        templateName={template.name}
        actorKind={inferActorKindFromCreatureSlug(template.slug)}
        loginNext={`/creatures/${slug}`}
      />

      <TemplateSpellsList spells={template.spells} />
    </div>
  );
}
