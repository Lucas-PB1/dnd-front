"use client";

import type {
  AbilityScores,
  CharacterDetail,
} from "@/entities/character/types";
import {
  ABILITY_LABELS_PT,
  abilityModifier,
  formatSkillBonus,
  skillBonus,
} from "@/entities/character";
import type { CharacterCatalogLabels } from "@/features/character-sheet/api/use-character-catalog-labels";
import type { SkillSummary } from "@/entities/skill/types";
import type { ClassFeature, SubclassMechanic } from "@/entities/class/types";
import { useSpeciesTraitChoices } from "@/features/species-catalog/api/use-species";
import {
  useSubclassMechanics,
  useSubclassOptions,
} from "@/features/class-catalog/api/use-classes";
import {
  useBackgroundEquipment,
  useBackgroundDetail,
  useBackgroundTools,
} from "@/features/background-catalog/api/use-backgrounds";
import {
  useClassEquipment,
  useClassDetail,
  useClassFeatures,
} from "@/features/class-catalog/api/use-classes";
import { isSubclassRequired } from "@/entities/character/lib/subclass";
import {
  featInstanceKey,
  formatCharacterFeatLabel,
} from "@/entities/character/lib/character-feat";
import { useFeatOptionLabels } from "@/features/feat-catalog/api/use-feat-option-labels";
import { useFeatDetails } from "@/features/feat-catalog/api/use-feat-details";
import { FeatBenefits } from "@/features/feat-catalog/ui/feat-benefits";
import { groupEquipmentPackages } from "@/features/create-character/lib/equipment-selection";
import { useMemo } from "react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const SPELL_LIST_LABELS: Record<string, string> = {
  known: "Conhecida",
  prepared: "Preparada",
  always_prepared: "Sempre preparada",
};

type SectionProps = {
  character: CharacterDetail;
  labels: CharacterCatalogLabels;
};

type SkillsSectionProps = SectionProps & {
  skills: SkillSummary[];
};

export function CombatSection({ character }: SectionProps) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <dt className="text-xs font-medium text-muted-foreground">
          Bônus de proficiência
        </dt>
        <dd className="text-lg font-mono">+{character.proficiencyBonus}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium text-muted-foreground">
          Classe de armadura
        </dt>
        <dd className="text-lg font-mono">{character.armorClass}</dd>
        <p className="text-xs text-muted-foreground">
          {character.armorClassNote ?? "sem armadura"}
        </p>
      </div>
      <div>
        <dt className="text-xs font-medium text-muted-foreground">
          Percepção passiva
        </dt>
        <dd className="text-lg font-mono">{character.passivePerception}</dd>
      </div>
      {character.hitPointsMax != null ? (
        <div>
          <dt className="text-xs font-medium text-muted-foreground">
            Pontos de vida
          </dt>
          <dd className="text-lg">
            {character.hitPointsCurrent ?? character.hitPointsMax} /{" "}
            {character.hitPointsMax}
          </dd>
        </div>
      ) : (
        <div>
          <dt className="text-xs font-medium text-muted-foreground">
            Pontos de vida
          </dt>
          <dd className="text-sm text-muted-foreground">Não definidos</dd>
        </div>
      )}
    </dl>
  );
}

export function AbilitiesSection({ character }: SectionProps) {
  const abilities = Object.entries(character.abilityScores) as [
    keyof AbilityScores,
    number,
  ][];

  const boostNote =
    character.backgroundAbilityBoostPlus2Slug &&
    character.backgroundAbilityBoostPlus1Slug
      ? `Antecedente: +2 ${ABILITY_LABELS_PT[character.backgroundAbilityBoostPlus2Slug as keyof AbilityScores] ?? character.backgroundAbilityBoostPlus2Slug}, +1 ${ABILITY_LABELS_PT[character.backgroundAbilityBoostPlus1Slug as keyof AbilityScores] ?? character.backgroundAbilityBoostPlus1Slug}`
      : null;

  return (
    <div className="space-y-3">
      {boostNote ? (
        <p className="text-sm text-muted-foreground">{boostNote}</p>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {abilities.map(([key, score]) => (
          <div
            key={key}
            className="rounded-lg border border-border px-3 py-2 text-center"
          >
            <p className="text-xs text-muted-foreground">
              {ABILITY_LABELS_PT[key]}
            </p>
            <p className="text-xl font-semibold">{score}</p>
            <p className="font-mono text-sm text-muted-foreground">
              {abilityModifier(score)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkillsSection({ character, skills }: SkillsSectionProps) {
  const proficient = new Set([
    ...character.classSkillSlugs,
    ...character.backgroundSkillSlugs,
  ]);

  const sorted = [...skills].sort((a, b) => a.name.localeCompare(b.name, "pt"));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Perícia</th>
            <th className="pb-2 pr-4 font-medium">Bônus</th>
            <th className="pb-2 font-medium">Proficiência</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((skill) => {
            const abilityKey = skill.abilitySlug as keyof AbilityScores;
            const score = character.abilityScores[abilityKey] ?? 10;
            const isProficient = proficient.has(skill.slug);
            const bonus = skillBonus(
              score,
              isProficient,
              character.proficiencyBonus,
            );
            const source =
              character.classSkillSlugs.includes(skill.slug) &&
              character.backgroundSkillSlugs.includes(skill.slug)
                ? "classe e antecedente"
                : character.classSkillSlugs.includes(skill.slug)
                  ? "classe"
                  : character.backgroundSkillSlugs.includes(skill.slug)
                    ? "antecedente"
                    : null;

            return (
              <tr
                key={skill.slug}
                className={cn(
                  "border-b border-border/60",
                  isProficient && "bg-primary/5",
                )}
              >
                <td className="py-2 pr-4">{skill.name}</td>
                <td className="py-2 pr-4 font-mono">
                  {formatSkillBonus(bonus)}
                </td>
                <td className="py-2 text-muted-foreground">
                  {isProficient ? (
                    <span>
                      Sim
                      {source ? (
                        <span className="ml-1 text-xs">({source})</span>
                      ) : null}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function BackgroundTraitsSection({
  character,
  labels,
  onEditTool,
}: SectionProps & { onEditTool?: () => void }) {
  const backgroundDetail = useBackgroundDetail(character.backgroundSlug, true);
  const backgroundTools = useBackgroundTools(
    character.backgroundSlug,
    backgroundDetail.data?.toolProficiencyKind === "choice",
  );

  if (backgroundDetail.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando antecedente…</p>
    );
  }

  const bg = backgroundDetail.data;
  const originFeat =
    bg?.originFeatName ??
    (bg?.originFeatSlug ? labels.resolveFeat(bg.originFeatSlug) : null);
  const toolSlug = character.backgroundToolItemSlug ?? bg?.toolItemSlug ?? null;
  const toolName =
    bg?.toolProficiencyKind === "fixed"
      ? (bg.toolItemName ?? toolSlug)
      : toolSlug
        ? (backgroundTools.data?.data.find((t) => t.itemSlug === toolSlug)
            ?.itemName ?? toolSlug)
        : null;
  const backgroundSkills =
    character.backgroundSkillSlugs.length > 0
      ? character.backgroundSkillSlugs.map((slug) => labels.resolveSkill(slug))
      : [];

  if (
    !originFeat &&
    !toolName &&
    backgroundSkills.length === 0 &&
    bg?.toolProficiencyKind !== "choice"
  ) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum traço de antecedente registrado.
      </p>
    );
  }

  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      {originFeat ? (
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Talento de origem</dt>
          <dd className="font-medium">{originFeat}</dd>
        </div>
      ) : null}
      {backgroundSkills.length > 0 ? (
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Perícias do antecedente</dt>
          <dd className="font-medium">{backgroundSkills.join(", ")}</dd>
        </div>
      ) : null}
      {toolName || bg?.toolProficiencyKind === "choice" ? (
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">Ferramenta</dt>
            {bg?.toolProficiencyKind === "choice" && onEditTool ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={onEditTool}
              >
                Editar
              </Button>
            ) : null}
          </div>
          <dd className="font-medium">{toolName ?? "—"}</dd>
        </div>
      ) : null}
    </dl>
  );
}

export function SpeciesChoicesSection({ character }: SectionProps) {
  const traitChoices = useSpeciesTraitChoices(
    character.speciesSlug,
    character.speciesChoices.length > 0,
  );

  const resolved = useMemo(() => {
    const rows = traitChoices.data?.data ?? [];
    return character.speciesChoices.map((choice) => {
      const match = rows.find(
        (r) =>
          r.choiceKind === choice.choiceKind &&
          r.choiceSlug === choice.choiceSlug,
      );
      return {
        ...choice,
        traitName: match?.traitName ?? choice.choiceKind,
        choiceName: match?.choiceName ?? choice.choiceSlug,
      };
    });
  }, [character.speciesChoices, traitChoices.data?.data]);

  if (character.speciesChoices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma escolha de traço registrada.
      </p>
    );
  }

  if (traitChoices.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando traços…</p>;
  }

  return (
    <ul className="space-y-3">
      {resolved.map((item) => (
        <li
          key={`${item.choiceKind}-${item.choiceSlug}`}
          className="rounded-lg border border-border px-3 py-2"
        >
          <p className="text-xs text-muted-foreground">{item.traitName}</p>
          <p className="font-medium">{item.choiceName}</p>
        </li>
      ))}
    </ul>
  );
}

export function ClassFeaturesSection({ character }: SectionProps) {
  const featuresQuery = useClassFeatures(
    character.classSlug,
    character.level,
    !!character.classSlug,
  );

  const byLevel = useMemo(() => {
    const map = new Map<number, ClassFeature[]>();
    for (const feature of featuresQuery.data?.data ?? []) {
      const list = map.get(feature.featureLevel) ?? [];
      list.push(feature);
      map.set(feature.featureLevel, list);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [featuresQuery.data?.data]);

  if (featuresQuery.isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Carregando características…
      </p>
    );
  }

  if (featuresQuery.isError || byLevel.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma característica de classe disponível.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {byLevel.map(([level, features]) => (
        <section key={level} className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Nível {level}
          </h4>
          <ul className="space-y-3">
            {features.map((feature) => (
              <li
                key={`${level}-${feature.featureName}`}
                className="rounded-lg border border-border px-3 py-2"
              >
                <p className="font-medium">{feature.featureName}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {feature.featureDescription}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function SubclassOptionsSection({ character }: SectionProps) {
  const enabled =
    isSubclassRequired(character.level) && !!character.subclassSlug;
  const optionsQuery = useSubclassOptions(
    character.subclassSlug ?? "",
    character.level,
    enabled && character.subclassOptions.length > 0,
  );

  const resolved = useMemo(() => {
    const groups = optionsQuery.data?.data ?? [];
    return character.subclassOptions.map((opt) => {
      const group = groups.find((g) => g.optionKey === opt.optionKey);
      const value = group?.values.find((v) => v.valueId === opt.valueId);
      return {
        ...opt,
        label: group?.label ?? opt.optionKey,
        valueLabel: value?.label ?? opt.valueId,
        unlockLevel: group?.unlockLevel,
      };
    });
  }, [character.subclassOptions, optionsQuery.data?.data]);

  if (!enabled || character.subclassOptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma opção de subclasse registrada.
      </p>
    );
  }

  if (optionsQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando opções…</p>;
  }

  return (
    <ul className="space-y-3">
      {resolved.map((item) => (
        <li
          key={item.optionKey}
          className="rounded-lg border border-border px-3 py-2"
        >
          <p className="text-xs text-muted-foreground">
            {item.label}
            {item.unlockLevel != null ? ` (nv. ${item.unlockLevel})` : null}
          </p>
          <p className="font-medium">{item.valueLabel}</p>
        </li>
      ))}
    </ul>
  );
}

function formatSubclassMechanicDetail(
  mechanic: SubclassMechanic,
): string | null {
  const parts: string[] = [];
  if (mechanic.featureKind) {
    parts.push(mechanic.featureKind);
  }
  if (mechanic.resourceName) {
    let resource = mechanic.resourceName;
    if (mechanic.resourceUnlockLevel != null) {
      resource += ` (nv. ${mechanic.resourceUnlockLevel})`;
    }
    parts.push(resource);
  }
  if (mechanic.fixedMax != null) {
    parts.push(`máx. ${mechanic.fixedMax}`);
  } else if (mechanic.maxFormula) {
    parts.push(`máx. ${mechanic.maxFormula}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function SubclassMechanicsSection({ character }: SectionProps) {
  const enabled =
    isSubclassRequired(character.level) && !!character.subclassSlug;
  const mechanicsQuery = useSubclassMechanics(
    character.subclassSlug ?? "",
    enabled,
  );

  const selectedOptionKeys = useMemo(
    () => new Set(character.subclassOptions.map((o) => o.optionKey)),
    [character.subclassOptions],
  );

  const byLevel = useMemo(() => {
    const map = new Map<number, SubclassMechanic[]>();
    for (const mechanic of mechanicsQuery.data?.data ?? []) {
      if (mechanic.featureLevel > character.level) continue;
      const list = map.get(mechanic.featureLevel) ?? [];
      list.push(mechanic);
      map.set(mechanic.featureLevel, list);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [character.level, mechanicsQuery.data?.data]);

  if (!enabled) {
    return (
      <p className="text-sm text-muted-foreground">
        Subclasse disponível a partir do nível 3.
      </p>
    );
  }

  if (mechanicsQuery.isPending) {
    return (
      <p className="text-sm text-muted-foreground">
        Carregando mecânicas de subclasse…
      </p>
    );
  }

  if (byLevel.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma mecânica de subclasse até o nível atual.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {byLevel.map(([level, mechanics]) => (
        <section key={level} className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Nível {level}
          </h4>
          <ul className="space-y-3">
            {mechanics.map((mechanic) => {
              const detail = formatSubclassMechanicDetail(mechanic);
              const matchesOption =
                mechanic.optionKey != null &&
                selectedOptionKeys.has(mechanic.optionKey);

              return (
                <li
                  key={`${level}-${mechanic.featureName}-${mechanic.optionKey ?? ""}`}
                  className={cn(
                    "rounded-lg border border-border px-3 py-2",
                    matchesOption && "border-primary/40 bg-primary/5",
                  )}
                >
                  <p className="font-medium">{mechanic.featureName}</p>
                  {detail ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {detail}
                    </p>
                  ) : null}
                  {matchesOption ? (
                    <p className="mt-1 text-xs text-primary">
                      Relacionada a uma opção escolhida
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function SpellsSection({ character, labels }: SectionProps) {
  if (character.characterSpells.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhuma magia registrada.</p>
    );
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {character.characterSpells.map((spell) => (
        <li
          key={spell.spellSlug}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          <span className="font-medium">
            {labels.resolveSpell(spell.spellSlug)}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">
            {SPELL_LIST_LABELS[spell.listType] ?? spell.listType}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function EquipmentSection({ character }: SectionProps) {
  const classEquipment = useClassEquipment(character.classSlug, true);
  const backgroundEquipment = useBackgroundEquipment(
    character.backgroundSlug,
    true,
  );
  const classDetail = useClassDetail(character.classSlug, true);
  const backgroundDetail = useBackgroundDetail(character.backgroundSlug, true);

  const classPackages = useMemo(
    () => groupEquipmentPackages(classEquipment.data?.data ?? []),
    [classEquipment.data?.data],
  );
  const backgroundPackages = useMemo(
    () => groupEquipmentPackages(backgroundEquipment.data?.data ?? []),
    [backgroundEquipment.data?.data],
  );

  if (character.equipment.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum equipamento inicial registrado.
      </p>
    );
  }

  if (classEquipment.isPending || backgroundEquipment.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando equipamento…</p>
    );
  }

  const classRows = classEquipment.data?.data ?? [];
  const backgroundRows = backgroundEquipment.data?.data ?? [];

  const bySource = {
    class: character.equipment.filter((e) => e.source === "class"),
    background: character.equipment.filter((e) => e.source === "background"),
  };

  function resolveItemName(
    source: "class" | "background",
    packageSlug: string,
    itemSlug?: string,
  ) {
    const rows = source === "class" ? classRows : backgroundRows;
    const row = rows.find(
      (r) =>
        r.packageSlug === packageSlug &&
        (itemSlug ? r.itemSlug === itemSlug : true),
    );
    return row?.itemName ?? itemSlug ?? packageSlug;
  }

  function resolvePackageLabel(
    source: "class" | "background",
    packageSlug: string,
  ) {
    const packages = source === "class" ? classPackages : backgroundPackages;
    const pkg = packages.find((p) => p.packageSlug === packageSlug);
    return pkg?.packageLabel ?? packageSlug;
  }

  return (
    <div className="space-y-4">
      {(["class", "background"] as const).map((source) => {
        const items = bySource[source];
        if (items.length === 0) return null;

        const sourceLabel =
          source === "class"
            ? (classDetail.data?.name ?? "Classe")
            : (backgroundDetail.data?.name ?? "Antecedente");

        const packageSlug = items[0]?.packageSlug;
        const packageItems = items.filter((e) => e.itemSlug);
        const packageOnly = items.filter((e) => !e.itemSlug);

        return (
          <div key={source} className="space-y-2">
            <p className="text-sm font-medium">{sourceLabel}</p>
            {packageOnly.length > 0 && packageSlug ? (
              <p className="text-sm text-muted-foreground">
                Pacote: {resolvePackageLabel(source, packageSlug)}
              </p>
            ) : null}
            {packageItems.length > 0 ? (
              <ul className="list-inside list-disc text-sm">
                {packageItems.map((item, index) => (
                  <li key={`${item.itemSlug}-${index}`}>
                    {resolveItemName(source, item.packageSlug, item.itemSlug)}
                    {item.quantity && item.quantity > 1
                      ? ` × ${item.quantity}`
                      : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function FeatsSection({ character, labels }: SectionProps) {
  const featSlugs = character.characterFeats.map((feat) => feat.featSlug);
  const { featBySlug, isLoading: featDetailsLoading } =
    useFeatDetails(featSlugs);
  const { resolveFeatOption, isLoading: featOptionsLoading } =
    useFeatOptionLabels({
      characterFeats: character.characterFeats,
      labelContext: {
        resolveSpell: labels.resolveSpell,
        resolveSkill: labels.resolveSkill,
      },
    });

  if (character.characterFeats.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum talento registrado.
      </p>
    );
  }

  const optionsByInstance = character.featOptions.reduce<
    Record<string, typeof character.featOptions>
  >((acc, option) => {
    const key = featInstanceKey(option.featSlug, option.instanceIndex);
    const list = acc[key] ?? [];
    list.push(option);
    acc[key] = list;
    return acc;
  }, {});

  return (
    <ul className="space-y-3">
      {character.characterFeats.map((feat) => {
        const key = featInstanceKey(feat.featSlug, feat.instanceIndex);
        const options = optionsByInstance[key] ?? [];
        return (
          <li key={key} className="rounded-md border border-border px-3 py-2">
            <p className="text-sm font-medium">
              {formatCharacterFeatLabel(
                feat,
                { [feat.featSlug]: labels.resolveFeat(feat.featSlug) },
                character.characterFeats,
              )}
            </p>
            {featDetailsLoading ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Carregando descrição…
              </p>
            ) : (
              <FeatBenefits
                benefits={featBySlug[feat.featSlug]?.benefits ?? []}
                prerequisite={featBySlug[feat.featSlug]?.prerequisite}
              />
            )}
            {options.length > 0 ? (
              <dl className="mt-2 grid gap-1 text-xs text-muted-foreground">
                {options.map((option) => {
                  const display = resolveFeatOption(option);
                  return (
                    <div key={option.optionKey} className="flex gap-2">
                      <dt>{display.label}:</dt>
                      <dd className="text-foreground">
                        {featOptionsLoading ? option.valueId : display.value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function LanguagesSection({ character, labels }: SectionProps) {
  if (character.languageSlugs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhum idioma registrado.</p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {character.languageSlugs.map((language) => (
        <li
          key={language}
          className="rounded-md border border-border px-2 py-1 text-sm"
        >
          {labels.resolveLanguage(language)}
        </li>
      ))}
    </ul>
  );
}
