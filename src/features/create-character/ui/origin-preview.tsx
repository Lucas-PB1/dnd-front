"use client";

import { useClassDetail } from "@/features/class-catalog/api/use-classes";
import {
  useBackgroundDetail,
  useBackgroundSkills,
} from "@/features/background-catalog/api/use-backgrounds";
import {
  useSpeciesDetail,
  useSpeciesTraits,
  useSpeciesTraitChoices,
} from "@/features/species-catalog/api/use-species";

type OriginPreviewProps = {
  classSlug?: string;
  speciesSlug?: string;
  backgroundSlug?: string;
  level?: number;
  showPlaceholder?: boolean;
};

/** Painel estilo Beyond: preview mecânico ao escolher origem/classe. */
export function OriginPreview({
  classSlug,
  speciesSlug,
  backgroundSlug,
  level = 1,
  showPlaceholder = false,
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
  const backgroundSkills = useBackgroundSkills(
    backgroundSlug ?? "",
    !!backgroundSlug,
  );

  if (showPlaceholder) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-3 text-xs text-muted-foreground">
        <p className="font-medium tracking-wide text-primary uppercase">
          Prévia
        </p>
        <p className="mt-1.5">
          Escolha classe, espécie ou antecedente para ver o resumo.
        </p>
      </div>
    );
  }

  if (!classSlug && !speciesSlug && !backgroundSlug) return null;

  const choiceKinds = new Set(
    (speciesTraitChoices.data?.data ?? []).map((r) => r.choiceKind),
  );
  const traits = speciesTraits.data?.data ?? [];

  return (
    <div className="space-y-2.5 rounded-xl border border-border bg-muted/20 p-3 text-sm">
      <p className="text-[11px] font-medium tracking-wide text-primary uppercase">
        Prévia · nv. {level}
      </p>

      {classSlug && classDetail.data ? (
        <div className="space-y-0.5">
          <p className="font-heading text-base font-semibold">
            {classDetail.data.name}
            <span className="ml-1.5 font-mono text-xs text-secondary">
              {classDetail.data.hitDie}
            </span>
          </p>
          {classDetail.data.primaryAbilityLabel ? (
            <p className="text-xs text-muted-foreground">
              Principal: {classDetail.data.primaryAbilityLabel}
            </p>
          ) : null}
          {classDetail.data.savingThrowNames?.length ? (
            <p className="text-xs text-muted-foreground">
              ST: {classDetail.data.savingThrowNames.join(", ")}
            </p>
          ) : null}
          {classDetail.data.skillChoiceCount != null ? (
            <p className="text-xs text-muted-foreground">
              Perícias: {classDetail.data.skillChoiceCount} à escolha
            </p>
          ) : null}
        </div>
      ) : null}

      {speciesSlug && speciesDetail.data ? (
        <div className="space-y-1 border-t border-border/60 pt-2">
          <p className="font-heading font-semibold">
            {speciesDetail.data.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {speciesDetail.data.creatureType} · {speciesDetail.data.speed}
          </p>
          {traits.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Traços:{" "}
              {traits
                .map((trait) =>
                  trait.choiceKind ? `${trait.name}*` : trait.name,
                )
                .join(", ")}
              {choiceKinds.size > 0 ? " (* escolha depois)" : null}
            </p>
          ) : null}
        </div>
      ) : null}

      {backgroundSlug && backgroundDetail.data ? (
        <div className="space-y-0.5 border-t border-border/60 pt-2">
          <p className="font-heading font-semibold">
            {backgroundDetail.data.name}
          </p>
          {backgroundDetail.data.originFeatName ? (
            <p className="text-xs text-muted-foreground">
              Talento: {backgroundDetail.data.originFeatName}
            </p>
          ) : null}
          {(backgroundSkills.data?.data.length ?? 0) > 0 ? (
            <p className="text-xs text-muted-foreground">
              Perícias:{" "}
              {backgroundSkills.data!.data.map((s) => s.name).join(", ")}
            </p>
          ) : null}
          {backgroundDetail.data.abilityOptionNames?.length ? (
            <p className="text-xs text-muted-foreground">
              Boosts: {backgroundDetail.data.abilityOptionNames.join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
