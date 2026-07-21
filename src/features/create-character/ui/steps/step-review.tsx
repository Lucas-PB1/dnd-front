"use client";

import { useMemo, type ReactNode } from "react";
import { useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";

import { ABILITY_LABELS_PT, abilityModifier } from "@/entities/character/types";
import { previewBackgroundAbilityBoosts } from "@/entities/character/lib/background-boost";
import { previewFeatAbilityBoosts } from "@/entities/character/lib/feat-ability-boost";
import { epicBoonFeatSlugsFromCatalog } from "@/entities/character/lib/epic-boon-feat-options";
import { resolveCreateCharacterFeats } from "@/features/create-character/lib/preview-create-character-feats";
import { abilityModifierValue } from "@/entities/character";
import { ABILITY_KEYS } from "@/features/create-character/lib/point-buy";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { useCharacterCatalogLabels } from "@/features/character-sheet/api/use-character-catalog-labels";
import type { CharacterDetail } from "@/entities/character/types";
import { useSpeciesTraitChoices } from "@/features/species-catalog/api/use-species";
import {
  useClassEquipment,
  useSubclassOptions,
} from "@/features/class-catalog/api/use-classes";
import {
  useBackgroundDetail,
  useBackgroundEquipment,
  useBackgroundSkills,
  useBackgroundTools,
} from "@/features/background-catalog/api/use-backgrounds";
import {
  appendCharacterFeat,
  featInstanceKey,
  formatCharacterFeatLabel,
} from "@/entities/character/lib/character-feat";
import { asiFeatLevelsUpTo } from "@/features/create-character/lib/asi-feat-slots";
import { asiFeatSlotsToCharacterFeats } from "@/features/create-character/lib/asi-feat-slots-to-feats";
import {
  BACKGROUND_GOLD_PACKAGE_SLUG,
  groupEquipmentPackages,
} from "@/features/create-character/lib/equipment-selection";
import { toolNameForSlug } from "@/features/create-character/lib/equipment-choice-resolve";
import { languageQuota } from "@/features/create-character/lib/language-selection";
import { useFeatOptionLabels } from "@/features/feat-catalog/api/use-feat-option-labels";
import { FeatOptionsReadList } from "@/features/feat-catalog/ui/feat-options-read-list";
import { useFeats } from "@/features/reference-catalog/api/use-reference";
import { useSpells } from "@/features/spell-catalog/api/use-spells";
import { isSubclassRequired } from "@/entities/character/lib/subclass";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";

type StepReviewProps = {
  control: Control<CreateCharacterInput>;
};

const SPELL_LIST_LABEL: Record<string, string> = {
  known: "Conhecida",
  prepared: "Preparada",
  always_prepared: "Sempre preparada",
};

const METHOD_LABEL: Record<string, string> = {
  "point-buy": "Compra de pontos",
  "standard-array": "Array padrão",
  roll: "Rolagem",
};

function previewCharacter(
  values: CreateCharacterInput,
  epicBoonFeatSlugs: ReadonlySet<string>,
): CharacterDetail {
  const plus2 = values.backgroundAbilityBoostPlus2Slug;
  const plus1 = values.backgroundAbilityBoostPlus1Slug;
  const afterBackground =
    plus2 && plus1 && plus2 !== plus1
      ? previewBackgroundAbilityBoosts(
          values.abilityScores,
          plus2 as keyof typeof values.abilityScores,
          plus1 as keyof typeof values.abilityScores,
        )
      : values.abilityScores;
  const finalScores = previewFeatAbilityBoosts(
    afterBackground,
    values.featOptions ?? [],
    epicBoonFeatSlugs,
  );

  return {
    id: "",
    name: values.name,
    level: values.level,
    classSlug: values.classSlug,
    speciesSlug: values.speciesSlug,
    backgroundSlug: values.backgroundSlug,
    subclassSlug: values.subclassSlug?.trim() ? values.subclassSlug : null,
    alignmentSlug: values.alignmentSlug?.trim()
      ? values.alignmentSlug.trim()
      : null,
    abilityScores: finalScores,
    hitPointsMax: null,
    hitPointsCurrent: null,
    proficiencyBonus: 0,
    classSkillSlugs: values.classSkillSlugs,
    backgroundSkillSlugs: [],
    speciesChoices: values.speciesChoices,
    subclassOptions: values.subclassOptions,
    characterFeats: [],
    featOptions: values.featOptions,
    characterSpells: values.characterSpells,
    equipment: values.equipment,
    languageSlugs: values.languageSlugs,
    abilityGenerationMethodSlug: values.abilityGenerationMethodSlug,
    backgroundAbilityBoostPlus2Slug:
      values.backgroundAbilityBoostPlus2Slug ?? null,
    backgroundAbilityBoostPlus1Slug:
      values.backgroundAbilityBoostPlus1Slug ?? null,
    backgroundToolItemSlug: values.backgroundToolItemSlug?.trim()
      ? values.backgroundToolItemSlug.trim()
      : null,
    abilityModifiers: {
      forca: abilityModifierValue(finalScores.forca),
      destreza: abilityModifierValue(finalScores.destreza),
      constituicao: abilityModifierValue(finalScores.constituicao),
      inteligencia: abilityModifierValue(finalScores.inteligencia),
      sabedoria: abilityModifierValue(finalScores.sabedoria),
      carisma: abilityModifierValue(finalScores.carisma),
    },
    passivePerception: 10 + abilityModifierValue(finalScores.sabedoria),
    armorClass: 10 + abilityModifierValue(finalScores.destreza),
    armorClassNote: "Sem armadura",
    createdAt: "",
    updatedAt: "",
  };
}

function ChipList({
  items,
}: {
  items: { key: string; label: string; hint?: string }[];
}) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">Nenhum</p>;
  }

  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item.key}
          className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-xs"
        >
          <span className="font-medium">{item.label}</span>
          {item.hint ? (
            <span className="text-muted-foreground"> · {item.hint}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

export function StepReview({ control }: StepReviewProps) {
  const values = useWatch({ control }) as CreateCharacterInput;
  const featsQuery = useFeats();
  const epicBoonFeatSlugs = useMemo(
    () => epicBoonFeatSlugsFromCatalog(featsQuery.data?.data ?? []),
    [featsQuery.data?.data],
  );
  const plus2 = values.backgroundAbilityBoostPlus2Slug;
  const plus1 = values.backgroundAbilityBoostPlus1Slug;
  const preview = useMemo(
    () => previewCharacter(values, epicBoonFeatSlugs),
    [values, epicBoonFeatSlugs],
  );
  const labels = useCharacterCatalogLabels(preview);
  const finalScores = preview.abilityScores;

  const speciesTraits = useSpeciesTraitChoices(
    values.speciesSlug,
    !!values.speciesSlug,
  );
  const subclassOpts = useSubclassOptions(
    values.subclassSlug ?? "",
    values.level,
    isSubclassRequired(values.level) && !!values.subclassSlug,
  );
  const backgroundDetail = useBackgroundDetail(
    values.backgroundSlug,
    !!values.backgroundSlug,
  );
  const backgroundSkills = useBackgroundSkills(
    values.backgroundSlug,
    !!values.backgroundSlug,
  );
  const needsToolChoice =
    backgroundDetail.data?.toolProficiencyKind === "choice";
  const backgroundTools = useBackgroundTools(
    values.backgroundSlug,
    needsToolChoice,
  );
  const classEquipment = useClassEquipment(
    values.classSlug,
    !!values.classSlug,
  );
  const backgroundEquipment = useBackgroundEquipment(
    values.backgroundSlug,
    !!values.backgroundSlug,
  );
  const spellsCatalog = useSpells();

  const originFeatSlug = backgroundDetail.data?.originFeatSlug ?? "";
  const allFeats = useFeats();
  const previewFeats = resolveCreateCharacterFeats(
    originFeatSlug || null,
    asiFeatSlotsToCharacterFeats(values.asiFeatSlotSlugs ?? []),
    values.speciesChoices ?? [],
  );
  const featNameBySlug = Object.fromEntries(
    (allFeats.data?.data ?? []).map((feat) => [feat.slug, feat.name]),
  );
  const { resolveFeatOption, featOptionDefsFor, isLoading: featOptionsLoading } =
    useFeatOptionLabels({
      characterFeats: previewFeats,
      labelContext: {
        resolveSpell: labels.resolveSpell,
        resolveSkill: labels.resolveSkill,
      },
    });

  const langQuota = languageQuota(
    values.speciesSlug,
    values.speciesChoices ?? [],
  );

  const classPackages = useMemo(
    () => groupEquipmentPackages(classEquipment.data?.data ?? []),
    [classEquipment.data?.data],
  );
  const backgroundPackages = useMemo(
    () => groupEquipmentPackages(backgroundEquipment.data?.data ?? []),
    [backgroundEquipment.data?.data],
  );

  const spellLevelBySlug = useMemo(() => {
    const map = new Map<string, number>();
    for (const spell of spellsCatalog.data?.data ?? []) {
      map.set(spell.slug, spell.level);
    }
    return map;
  }, [spellsCatalog.data?.data]);

  const toolLabel =
    backgroundDetail.data?.toolProficiencyKind === "fixed"
      ? (backgroundDetail.data.toolItemName ??
        backgroundDetail.data.toolItemSlug)
      : values.backgroundToolItemSlug
        ? (backgroundTools.data?.data.find(
            (t) => t.itemSlug === values.backgroundToolItemSlug,
          )?.itemName ??
          toolNameForSlug(values.backgroundToolItemSlug) ??
          values.backgroundToolItemSlug)
        : null;

  function speciesChoiceLabel(kind: string, slug: string) {
    const row = speciesTraits.data?.data.find(
      (r) => r.choiceKind === kind && r.choiceSlug === slug,
    );
    return row?.choiceName ?? slug;
  }

  function subclassOptionLabel(optionKey: string, valueId: string) {
    const group = subclassOpts.data?.data.find(
      (g) => g.optionKey === optionKey,
    );
    const value = group?.values.find((v) => v.valueId === valueId);
    return `${group?.label ?? optionKey}: ${value?.label ?? valueId}`;
  }

  function resolveEquipmentItemName(
    source: "class" | "background",
    packageSlug: string,
    itemSlug?: string,
  ) {
    if (!itemSlug) return null;
    const rows =
      source === "class"
        ? (classEquipment.data?.data ?? [])
        : (backgroundEquipment.data?.data ?? []);
    const row = rows.find(
      (r) => r.packageSlug === packageSlug && r.itemSlug === itemSlug,
    );
    return row?.itemName ?? toolNameForSlug(itemSlug) ?? itemSlug;
  }

  function resolvePackageLabel(
    source: "class" | "background",
    packageSlug: string,
  ) {
    if (
      source === "background" &&
      packageSlug === BACKGROUND_GOLD_PACKAGE_SLUG
    ) {
      const gold = backgroundDetail.data?.equipmentGoldOption;
      return gold != null ? `${gold} PO (em vez dos itens)` : "Ouro";
    }
    const packages = source === "class" ? classPackages : backgroundPackages;
    const pkg = packages.find((p) => p.packageSlug === packageSlug);
    return `Pacote ${pkg?.packageLabel ?? packageSlug.toUpperCase()}`;
  }

  const optionsByFeatInstance = (values.featOptions ?? []).reduce<
    Record<string, typeof values.featOptions>
  >((acc, option) => {
    const key = featInstanceKey(option.featSlug, option.instanceIndex);
    const list = acc[key] ?? [];
    list.push(option);
    acc[key] = list;
    return acc;
  }, {});

  const asiLevels = asiFeatLevelsUpTo(values.level);
  const asiLevelByFeatKey = useMemo(() => {
    const map = new Map<string, number>();
    let built: ReturnType<typeof asiFeatSlotsToCharacterFeats> = [];
    (values.asiFeatSlotSlugs ?? []).forEach((slug, index) => {
      if (!slug.trim()) return;
      built = appendCharacterFeat(built, slug.trim());
      const last = built[built.length - 1];
      if (!last) return;
      const level = asiLevels[index];
      if (level != null) {
        map.set(featInstanceKey(last.featSlug, last.instanceIndex), level);
      }
    });
    return map;
  }, [values.asiFeatSlotSlugs, asiLevels]);
  const methodLabel =
    METHOD_LABEL[values.abilityGenerationMethodSlug] ??
    values.abilityGenerationMethodSlug;

  const classSkillChips = values.classSkillSlugs.map((slug) => ({
    key: `class-${slug}`,
    label: labels.resolveSkill(slug),
    hint: "Classe",
  }));
  const backgroundSkillChips = (backgroundSkills.data?.data ?? []).map(
    (skill) => ({
      key: `bg-${skill.slug}`,
      label: skill.name,
      hint: "Antecedente",
    }),
  );

  const cantrips = values.characterSpells.filter(
    (s) => (spellLevelBySlug.get(s.spellSlug) ?? -1) === 0,
  );
  const leveledSpells = values.characterSpells.filter(
    (s) => (spellLevelBySlug.get(s.spellSlug) ?? 1) > 0,
  );

  const equipmentBySource = {
    class: values.equipment.filter((e) => e.source === "class"),
    background: values.equipment.filter((e) => e.source === "background"),
  };

  return (
    <div className="space-y-3">
      <WizardFormSection
        title={values.name?.trim() || "Revisão"}
        description={`${labels.identity.speciesName ?? values.speciesSlug} · ${labels.identity.className ?? values.classSlug}${labels.identity.subclassName ? ` (${labels.identity.subclassName})` : ""} · nv. ${values.level}`}
        compact
      >
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Antecedente">
            {labels.identity.backgroundName ?? values.backgroundSlug}
          </Field>
          <Field label="Alinhamento">
            {labels.identity.alignmentName ?? (
              <span className="text-muted-foreground">—</span>
            )}
          </Field>
          <Field label="Atributos">{methodLabel}</Field>
          {plus2 && plus1 && plus2 !== plus1 ? (
            <Field label="Bônus do antecedente">
              +2 {ABILITY_LABELS_PT[plus2 as keyof typeof ABILITY_LABELS_PT]}, +1{" "}
              {ABILITY_LABELS_PT[plus1 as keyof typeof ABILITY_LABELS_PT]}
            </Field>
          ) : null}
        </dl>
      </WizardFormSection>

      <WizardFormSection title="Atributos finais" compact>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {ABILITY_KEYS.map((key) => {
            const score = finalScores[key];
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

      <WizardFormSection title="Perícias" compact>
        <ChipList items={[...backgroundSkillChips, ...classSkillChips]} />
        {toolLabel ? (
          <p className="text-sm">
            <span className="text-muted-foreground">Ferramenta: </span>
            {toolLabel}
          </p>
        ) : null}
      </WizardFormSection>

      {(values.speciesChoices.length > 0 ||
        values.subclassOptions.length > 0) && (
        <WizardFormSection title="Escolhas" compact>
          {values.speciesChoices.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
                Espécie
              </p>
              <ChipList
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
              <ChipList
                items={values.subclassOptions.map((o) => ({
                  key: `${o.optionKey}-${o.valueId}`,
                  label: subclassOptionLabel(o.optionKey, o.valueId),
                }))}
              />
            </div>
          ) : null}
        </WizardFormSection>
      )}

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
                        {slotLevel != null
                          ? `ASI nv. ${slotLevel}`
                          : "Origem"}
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
                <ChipList
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
                <ChipList
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

      <WizardFormSection title="Idiomas" compact>
        <ChipList
          items={values.languageSlugs.map((slug) => ({
            key: slug,
            label: labels.resolveLanguage(slug),
            hint: langQuota.granted.includes(slug) ? "Espécie" : undefined,
          }))}
        />
        <p className="text-xs text-muted-foreground">
          {values.languageSlugs.length} / {langQuota.maxTotal}
        </p>
      </WizardFormSection>
    </div>
  );
}
