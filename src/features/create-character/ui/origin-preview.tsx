"use client";

import { useClassDetail } from "@/features/class-catalog/api/use-classes";
import { useBackgroundDetail } from "@/features/background-catalog/api/use-backgrounds";
import {
  useSpeciesDetail,
  useSpeciesTraits,
  useSpeciesTraitChoices,
} from "@/features/species-catalog/api/use-species";

type OriginPreviewProps = {
  classSlug?: string;
  speciesSlug?: string;
  backgroundSlug?: string;
};

/** Painel estilo Beyond: preview mecânico ao escolher origem/classe. */
export function OriginPreview({
  classSlug,
  speciesSlug,
  backgroundSlug,
}: OriginPreviewProps) {
  const classDetail = useClassDetail(classSlug ?? "", !!classSlug);
  const speciesDetail = useSpeciesDetail(speciesSlug ?? "", !!speciesSlug);
  const speciesTraits = useSpeciesTraits(speciesSlug ?? "", !!speciesSlug);
  const speciesTraitChoices = useSpeciesTraitChoices(
    speciesSlug ?? "",
    !!speciesSlug,
  );
  const backgroundDetail = useBackgroundDetail(
    backgroundSlug ?? "",
    !!backgroundSlug,
  );

  if (!classSlug && !speciesSlug && !backgroundSlug) return null;

  const choiceKinds = new Set(
    (speciesTraitChoices.data?.data ?? []).map((r) => r.choiceKind),
  );
  const traits = speciesTraits.data?.data ?? [];

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
      <p className="text-xs font-medium tracking-wide text-primary uppercase">
        Prévia da origem
      </p>

      {classSlug && classDetail.data ? (
        <div className="space-y-1.5">
          <p className="font-heading text-lg font-semibold">
            {classDetail.data.name}
            <span className="ml-2 font-mono text-sm text-secondary">
              {classDetail.data.hitDie}
            </span>
          </p>
          {classDetail.data.primaryAbilityLabel ? (
            <p className="text-sm text-muted-foreground">
              Atributo principal: {classDetail.data.primaryAbilityLabel}
            </p>
          ) : null}
          {classDetail.data.savingThrowNames?.length ? (
            <p className="text-sm text-muted-foreground">
              Salvaguardas: {classDetail.data.savingThrowNames.join(", ")}
            </p>
          ) : null}
          {classDetail.data.armorTrainingNames?.length ? (
            <p className="text-sm text-muted-foreground">
              Armaduras: {classDetail.data.armorTrainingNames.join(", ")}
            </p>
          ) : null}
          {classDetail.data.skillChoiceCount != null ? (
            <p className="text-sm text-muted-foreground">
              Perícias à escolha: {classDetail.data.skillChoiceCount}
            </p>
          ) : null}
        </div>
      ) : null}

      {speciesSlug && speciesDetail.data ? (
        <div className="space-y-2 border-t border-border/60 pt-3">
          <p className="font-heading text-base font-semibold">
            {speciesDetail.data.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {speciesDetail.data.creatureType} · {speciesDetail.data.speed}
          </p>
          {traits.length > 0 ? (
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {traits.map((trait) => (
                <li key={trait.name}>
                  <span className="font-medium text-foreground">
                    {trait.name}
                  </span>
                  {trait.choiceKind ? (
                    <span className="text-primary">
                      {" "}
                      — escolha na etapa Espécie
                    </span>
                  ) : null}
                  {trait.description ? (
                    <p className="mt-0.5 text-xs leading-relaxed">
                      {trait.description.length > 160
                        ? `${trait.description.slice(0, 160)}…`
                        : trait.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
          {choiceKinds.size > 0 ? (
            <p className="text-xs text-muted-foreground">
              {choiceKinds.size} escolha(s) obrigatória(s) na etapa Espécie.
            </p>
          ) : null}
        </div>
      ) : null}

      {backgroundSlug && backgroundDetail.data ? (
        <div className="space-y-1.5 border-t border-border/60 pt-3">
          <p className="font-heading text-base font-semibold">
            {backgroundDetail.data.name}
          </p>
          {backgroundDetail.data.originFeatName ? (
            <p className="text-sm text-muted-foreground">
              Talento de origem: {backgroundDetail.data.originFeatName}
            </p>
          ) : null}
          {backgroundDetail.data.abilityOptionNames?.length ? (
            <p className="text-sm text-muted-foreground">
              Boosts: {backgroundDetail.data.abilityOptionNames.join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
