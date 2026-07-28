"use client";

import {
  featInstanceKey,
  formatCharacterFeatLabel,
} from "@/entities/character/lib/character-feat";
import {
  BACKGROUND_BOOST_MODE_PLUS1X3,
} from "@/entities/character/lib/background-boost";
import {
  ABILITY_LABELS_PT,
  abilityModifier,
} from "@/entities/character/types";
import { ABILITY_KEYS } from "@/features/create-character/lib/point-buy";
import type { useStepReview } from "@/features/create-character/lib/use-step-review";
import { SPELL_LIST_LABEL } from "@/features/create-character/lib/review-labels";
import {
  ReviewChipList,
  ReviewField,
} from "@/features/create-character/ui/steps/review-ui";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";
import { FeatOptionsReadList } from "@/features/feat-catalog/ui/feat-options-read-list";

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

export function ReviewFeatsSection({ data }: { data: ReviewData }) {
  const {
    values,
    previewFeats,
    featNameBySlug,
    optionsByFeatInstance,
    asiLevelByFeatKey,
    originFeatSlug,
    resolveFeatOption,
    featOptionDefsFor,
    featOptionsLoading,
  } = data;

  return (
    <WizardFormSection title="Talentos" compact>
      {previewFeats.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum talento nesta ficha.
        </p>
      ) : (
        <ul className="space-y-2">
          {previewFeats.map((feat) => {
            const key = featInstanceKey(feat.featSlug, feat.instanceIndex);
            const options = optionsByFeatInstance[key] ?? [];
            const slotLevel = asiLevelByFeatKey.get(key) ?? null;
            const isOrigin =
              feat.featSlug === originFeatSlug ||
              values.speciesChoices?.some(
                (c) =>
                  c.choiceKind === "human_origin_feat" &&
                  c.choiceSlug === feat.featSlug,
              );
            return (
              <li
                key={key}
                className="rounded-lg border border-border/80 px-3 py-2"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">
                    {formatCharacterFeatLabel(
                      feat,
                      featNameBySlug,
                      previewFeats,
                    )}
                  </p>
                  {slotLevel != null || isOrigin ? (
                    <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
                      {slotLevel != null ? `ASI nv. ${slotLevel}` : "Origem"}
                    </span>
                  ) : null}
                </div>
                <FeatOptionsReadList
                  options={options}
                  defs={featOptionDefsFor(feat.featSlug)}
                  resolveFeatOption={resolveFeatOption}
                  loading={featOptionsLoading}
                />
              </li>
            );
          })}
        </ul>
      )}
    </WizardFormSection>
  );
}

export function ReviewEquipmentSection({ data }: { data: ReviewData }) {
  const {
    values,
    labels,
    equipmentBySource,
    resolvePackageLabel,
    resolveEquipmentItemName,
  } = data;

  return (
    <WizardFormSection title="Equipamento inicial" compact>
      {values.equipment.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum pacote selecionado.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(["class", "background"] as const).map((source) => {
            const items = equipmentBySource[source];
            if (items.length === 0) return null;
            const packageSlug = items[0]?.packageSlug ?? "";
            const packageItems = items.filter((e) => e.itemSlug);
            const sourceName =
              source === "class"
                ? (labels.identity.className ?? "Classe")
                : (labels.identity.backgroundName ?? "Antecedente");

            return (
              <div
                key={source}
                className="space-y-2 rounded-lg border border-border/80 p-3"
              >
                <div>
                  <p className="text-sm font-medium">{sourceName}</p>
                  <p className="text-xs text-muted-foreground">
                    {resolvePackageLabel(source, packageSlug)}
                  </p>
                </div>
                {packageItems.length > 0 ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {packageItems.map((item, index) => (
                      <li
                        key={`${item.itemSlug}-${index}`}
                        className="rounded-md border border-border/80 bg-background/80 px-2 py-1 text-[11px]"
                      >
                        {item.quantity && item.quantity > 1
                          ? `${item.quantity}× `
                          : null}
                        {resolveEquipmentItemName(
                          source,
                          item.packageSlug,
                          item.itemSlug,
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sem itens catalogados neste pacote.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </WizardFormSection>
  );
}

export function ReviewSpellsSection({ data }: { data: ReviewData }) {
  const { values, labels, cantrips, leveledSpells } = data;

  return (
    <WizardFormSection title="Magias" compact>
      {values.characterSpells.length === 0 ? (
        <p className="text-sm text-muted-foreground">Não se aplica.</p>
      ) : (
        <div className="space-y-3">
          {cantrips.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                Truques
              </p>
              <ReviewChipList
                items={cantrips.map((s) => ({
                  key: `c-${s.spellSlug}-${s.listType}`,
                  label: labels.resolveSpell(s.spellSlug),
                }))}
              />
            </div>
          ) : null}
          {leveledSpells.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                Magias
              </p>
              <ReviewChipList
                items={leveledSpells.map((s) => ({
                  key: `l-${s.spellSlug}-${s.listType}`,
                  label: labels.resolveSpell(s.spellSlug),
                  hint: SPELL_LIST_LABEL[s.listType] ?? s.listType,
                }))}
              />
            </div>
          ) : null}
        </div>
      )}
    </WizardFormSection>
  );
}

export function ReviewLanguagesSection({ data }: { data: ReviewData }) {
  const { values, labels, langQuota } = data;

  return (
    <WizardFormSection title="Idiomas" compact>
      <ReviewChipList
        items={values.languageSlugs.map((slug) => ({
          key: slug,
          label: labels.resolveLanguage(slug),
          hint: langQuota.granted.includes(slug) ? "Antecedente" : undefined,
        }))}
      />
      <p className="text-xs text-muted-foreground">
        {values.languageSlugs.length} / {langQuota.maxTotal}
      </p>
    </WizardFormSection>
  );
}
