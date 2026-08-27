"use client";

import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useState, type ReactNode } from "react";

import {
  useBackgroundDetail,
  useBackgroundSkills,
} from "@/features/catalog/background-catalog/api/use-backgrounds";
import {
  useClassDetail,
  useClassFeatures,
  useSubclassMechanics,
} from "@/features/catalog/class-catalog/api/use-classes";
import {
  useSpeciesDetail,
  useSpeciesTraits,
  useSpeciesTraitChoices,
} from "@/features/catalog/species-catalog/api/use-species";
import { useSubclassDetail } from "@/features/catalog/subclass-catalog/api/use-subclasses";
import { FeatureDetailDialog } from "@/features/character/character-sheet/ui/sheet/feature-detail-dialog";
import { Button } from "@/shared/ui/button";
import { PhbProse } from "@/shared/ui/phb-prose";

type OriginPreviewProps = {
  classSlug?: string;
  subclassSlug?: string;
  speciesSlug?: string;
  backgroundSlug?: string;
  level?: number;
  showPlaceholder?: boolean;
};

function proseTeaser(tagline: string | null | undefined, summary: string | null | undefined) {
  return (tagline?.trim() || summary?.trim() || "").trim();
}

function OriginBlock({
  title,
  subtitle,
  teaser,
  detailText,
  detailBody,
  children,
}: {
  title: string;
  subtitle?: string;
  teaser?: string;
  detailText?: string | null;
  detailBody?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const detail = (detailText?.trim() || teaser || "").trim();
  const canOpen = Boolean(detail || detailBody);

  return (
    <div className="space-y-1 border-t border-border/60 pt-2 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1 space-y-0.5">{children}</div>
        {canOpen ? (
          <>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="mt-0.5 size-7 shrink-0 p-0 text-muted-foreground"
              aria-label={`Ver detalhes de ${title}`}
              title={`Ver detalhes: ${title}`}
              onClick={() => setOpen(true)}
            >
              <InformationCircleIcon className="size-4" aria-hidden />
            </Button>
            <FeatureDetailDialog
              open={open}
              onOpenChange={setOpen}
              title={title}
              subtitle={subtitle}
            >
              {detail ? <PhbProse text={detail} /> : null}
              {detailBody}
            </FeatureDetailDialog>
          </>
        ) : null}
      </div>
      {teaser ? (
        <PhbProse
          text={teaser}
          className="text-xs leading-snug text-muted-foreground [&_p]:my-0"
        />
      ) : null}
    </div>
  );
}

function ClassPreviewSection({
  classSlug,
  level,
}: {
  classSlug: string;
  level: number;
}) {
  const classDetail = useClassDetail(classSlug, true);
  const features = useClassFeatures(classSlug, level, true);
  const data = classDetail.data;
  if (!data) return null;

  const teaser = proseTeaser(data.tagline, data.summary);
  const featureList = (features.data?.data ?? []).slice(0, 12);

  return (
    <OriginBlock
      title={data.name}
      subtitle={`Classe · nv. ${level}`}
      teaser={teaser || undefined}
      detailText={data.description ?? data.summary}
      detailBody={
        featureList.length > 0 ? (
          <ul className="mt-3 space-y-2 border-t border-border/50 pt-3 text-sm">
            {featureList.map((feature) => (
              <li key={`${feature.featureLevel}-${feature.featureName}`}>
                <p className="font-medium">
                  Nv. {feature.featureLevel} · {feature.featureName}
                </p>
                {feature.featureDescription ? (
                  <PhbProse
                    text={feature.featureDescription}
                    className="text-xs text-muted-foreground [&_p]:my-0.5"
                  />
                ) : null}
              </li>
            ))}
          </ul>
        ) : null
      }
    >
      <p className="font-heading text-base font-semibold">
        {data.name}
        <span className="ml-1.5 font-mono text-xs text-secondary">
          {data.hitDie}
        </span>
      </p>
      {data.primaryAbilityLabel ? (
        <p className="text-xs text-muted-foreground">
          Principal: {data.primaryAbilityLabel}
        </p>
      ) : null}
      {data.savingThrowNames?.length ? (
        <p className="text-xs text-muted-foreground">
          ST: {data.savingThrowNames.join(", ")}
        </p>
      ) : null}
      {data.skillChoiceCount != null ? (
        <p className="text-xs text-muted-foreground">
          Perícias: {data.skillChoiceCount} à escolha
        </p>
      ) : null}
    </OriginBlock>
  );
}

function SubclassPreviewSection({ subclassSlug }: { subclassSlug: string }) {
  const detail = useSubclassDetail(subclassSlug, true);
  const mechanics = useSubclassMechanics(subclassSlug, true);
  const data = detail.data;
  if (!data) return null;

  const teaser = proseTeaser(data.tagline, data.summary);
  const featureList = (mechanics.data?.data ?? []).slice(0, 10);

  return (
    <OriginBlock
      title={data.name}
      subtitle="Subclasse"
      teaser={teaser || undefined}
      detailText={data.summary}
      detailBody={
        featureList.length > 0 ? (
          <ul className="mt-3 space-y-2 border-t border-border/50 pt-3 text-sm">
            {featureList.map((feature) => (
              <li key={`${feature.featureLevel}-${feature.featureName}`}>
                <p className="font-medium">
                  Nv. {feature.featureLevel} · {feature.featureName}
                </p>
                {feature.featureDescription ? (
                  <PhbProse
                    text={feature.featureDescription}
                    className="text-xs text-muted-foreground [&_p]:my-0.5"
                  />
                ) : null}
              </li>
            ))}
          </ul>
        ) : null
      }
    >
      <p className="font-heading font-semibold">{data.name}</p>
      {data.className ? (
        <p className="text-xs text-muted-foreground">{data.className}</p>
      ) : null}
    </OriginBlock>
  );
}

function SpeciesPreviewSection({ speciesSlug }: { speciesSlug: string }) {
  const speciesDetail = useSpeciesDetail(speciesSlug, true);
  const speciesTraits = useSpeciesTraits(speciesSlug, true);
  const speciesTraitChoices = useSpeciesTraitChoices(speciesSlug, true);
  const data = speciesDetail.data;
  if (!data) return null;

  const choiceKinds = new Set(
    (speciesTraitChoices.data?.data ?? []).map((row) => row.choiceKind),
  );
  const traits = speciesTraits.data?.data ?? [];
  const teaser = proseTeaser(data.tagline, data.summary);

  return (
    <OriginBlock
      title={data.name}
      subtitle="Espécie"
      teaser={teaser || undefined}
      detailText={data.description || data.summary}
      detailBody={
        traits.length > 0 ? (
          <ul className="mt-3 space-y-2 border-t border-border/50 pt-3 text-sm">
            {traits.map((trait) => (
              <li key={trait.name}>
                <p className="font-medium">
                  {trait.name}
                  {trait.choiceKind ? " *" : ""}
                </p>
                {trait.description ? (
                  <PhbProse
                    text={trait.description}
                    className="text-xs text-muted-foreground [&_p]:my-0.5"
                  />
                ) : null}
              </li>
            ))}
          </ul>
        ) : null
      }
    >
      <p className="font-heading font-semibold">{data.name}</p>
      <p className="text-xs text-muted-foreground">
        {data.creatureType} · {data.speed}
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
    </OriginBlock>
  );
}

function BackgroundPreviewSection({
  backgroundSlug,
}: {
  backgroundSlug: string;
}) {
  const backgroundDetail = useBackgroundDetail(backgroundSlug, true);
  const backgroundSkills = useBackgroundSkills(backgroundSlug, true);
  const data = backgroundDetail.data;
  if (!data) return null;

  const teaser = proseTeaser(data.tagline, data.summary);

  return (
    <OriginBlock
      title={data.name}
      subtitle="Antecedente"
      teaser={teaser || undefined}
      detailText={data.description ?? data.summary}
    >
      <p className="font-heading font-semibold">{data.name}</p>
      {data.originFeatName ? (
        <p className="text-xs text-muted-foreground">
          Talento: {data.originFeatName}
        </p>
      ) : null}
      {(backgroundSkills.data?.data.length ?? 0) > 0 ? (
        <p className="text-xs text-muted-foreground">
          Perícias:{" "}
          {backgroundSkills.data!.data.map((skill) => skill.name).join(", ")}
        </p>
      ) : null}
      {data.abilityOptionNames?.length ? (
        <p className="text-xs text-muted-foreground">
          Boosts: {data.abilityOptionNames.join(", ")}
        </p>
      ) : null}
    </OriginBlock>
  );
}

/** Painel estilo Beyond: preview mecânico + prose ao escolher origem/classe. */
export function OriginPreview({
  classSlug,
  subclassSlug,
  speciesSlug,
  backgroundSlug,
  level = 1,
  showPlaceholder = false,
}: OriginPreviewProps) {
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

  if (!classSlug && !speciesSlug && !backgroundSlug && !subclassSlug) {
    return null;
  }

  return (
    <div className="space-y-2.5 rounded-xl border border-border bg-muted/20 p-3 text-sm">
      <p className="text-[11px] font-medium tracking-wide text-primary uppercase">
        Prévia · nv. {level}
      </p>

      {classSlug ? (
        <ClassPreviewSection classSlug={classSlug} level={level} />
      ) : null}
      {subclassSlug ? (
        <SubclassPreviewSection subclassSlug={subclassSlug} />
      ) : null}
      {speciesSlug ? (
        <SpeciesPreviewSection speciesSlug={speciesSlug} />
      ) : null}
      {backgroundSlug ? (
        <BackgroundPreviewSection backgroundSlug={backgroundSlug} />
      ) : null}
    </div>
  );
}
