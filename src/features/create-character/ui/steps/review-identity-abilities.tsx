"use client";

import {
  BACKGROUND_BOOST_MODE_PLUS1X3,
} from "@/entities/character/lib/background-boost";
import {
  ABILITY_LABELS_PT,
  abilityModifier,
} from "@/entities/character/types";
import { ABILITY_KEYS } from "@/features/create-character/lib/point-buy";
import type { useStepReview } from "@/features/create-character/lib/use-step-review";
import {
  ReviewChipList,
  ReviewField,
} from "@/features/create-character/ui/steps/review-ui";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";

type ReviewData = ReturnType<typeof useStepReview>;

export function ReviewIdentitySection({ data }: { data: ReviewData }) {
  const {
    values,
    labels,
    methodLabel,
    boostMode,
    plus1Slugs,
    plus2,
    plus1,
  } = data;

  return (
    <WizardFormSection
      title={values.name?.trim() || "Revisão"}
      description={`${labels.identity.speciesName ?? values.speciesSlug} · ${labels.identity.className ?? values.classSlug}${labels.identity.subclassName ? ` (${labels.identity.subclassName})` : ""} · nv. ${values.level}`}
      compact
    >
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ReviewField label="Antecedente">
          {labels.identity.backgroundName ?? values.backgroundSlug}
        </ReviewField>
        <ReviewField label="Alinhamento">
          {labels.identity.alignmentName ?? (
            <span className="text-muted-foreground">—</span>
          )}
        </ReviewField>
        <ReviewField label="Atributos">{methodLabel}</ReviewField>
        {boostMode === BACKGROUND_BOOST_MODE_PLUS1X3 &&
        plus1Slugs.filter(Boolean).length === 3 ? (
          <ReviewField label="Bônus do antecedente">
            +1{" "}
            {plus1Slugs
              .map(
                (slug) =>
                  ABILITY_LABELS_PT[slug as keyof typeof ABILITY_LABELS_PT] ??
                  slug,
              )
              .join(", ")}
          </ReviewField>
        ) : plus2 && plus1 && plus2 !== plus1 ? (
          <ReviewField label="Bônus do antecedente">
            +2 {ABILITY_LABELS_PT[plus2 as keyof typeof ABILITY_LABELS_PT]}, +1{" "}
            {ABILITY_LABELS_PT[plus1 as keyof typeof ABILITY_LABELS_PT]}
          </ReviewField>
        ) : null}
      </dl>
    </WizardFormSection>
  );
}

export function ReviewAbilitiesSection({ data }: { data: ReviewData }) {
  return (
    <WizardFormSection title="Atributos finais" compact>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {ABILITY_KEYS.map((key) => {
          const score = data.finalScores[key];
          return (
            <div
              key={key}
              className="rounded-lg border border-border px-2 py-2 text-center"
            >
              <p className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
                {ABILITY_LABELS_PT[key]}
              </p>
              <p className="font-heading text-xl font-semibold tabular-nums">
                {score}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {abilityModifier(score)}
              </p>
            </div>
          );
        })}
      </div>
    </WizardFormSection>
  );
}

export function ReviewSkillsSection({ data }: { data: ReviewData }) {
  return (
    <WizardFormSection title="Perícias" compact>
      <ReviewChipList
        items={[...data.backgroundSkillChips, ...data.classSkillChips]}
      />
      {data.toolLabel ? (
        <p className="text-sm">
          <span className="text-muted-foreground">Ferramenta: </span>
          {data.toolLabel}
        </p>
      ) : null}
    </WizardFormSection>
  );
}

export function ReviewChoicesSection({ data }: { data: ReviewData }) {
  const { values, speciesChoiceLabel, subclassOptionLabel } = data;
  if (values.speciesChoices.length === 0 && values.subclassOptions.length === 0) {
    return null;
  }

  return (
    <WizardFormSection title="Escolhas" compact>
      {values.speciesChoices.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
            Espécie
          </p>
          <ReviewChipList
            items={values.speciesChoices.map((c) => ({
              key: `${c.choiceKind}-${c.choiceSlug}`,
              label: speciesChoiceLabel(c.choiceKind, c.choiceSlug),
            }))}
          />
        </div>
      ) : null}
      {values.subclassOptions.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
            Subclasse
          </p>
          <ReviewChipList
            items={values.subclassOptions.map((o) => ({
              key: `${o.optionKey}-${o.valueId}`,
              label: subclassOptionLabel(o.optionKey, o.valueId),
            }))}
          />
        </div>
      ) : null}
    </WizardFormSection>
  );
}
