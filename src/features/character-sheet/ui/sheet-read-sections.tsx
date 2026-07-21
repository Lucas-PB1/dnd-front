"use client";

import type {
  AbilityScores,
  CharacterDetail,
} from "@/entities/character/types";
import {
  ABILITY_LABELS_PT,
  abilityModifier,
  abilityModifierValue,
  formatSkillBonus,
  skillBonus,
} from "@/entities/character";
import type { CharacterCatalogLabels } from "@/features/character-sheet/api/use-character-catalog-labels";
import type { SkillSummary } from "@/entities/skill/types";
import type { ClassFeature } from "@/entities/class/types";
import type { SubclassMechanic } from "@/entities/subclass/types";
import { useSpeciesTraitChoices, useSpeciesDetail, useSpeciesTraits } from "@/features/species-catalog/api/use-species";
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
import { FeatOptionsReadList } from "@/features/feat-catalog/ui/feat-options-read-list";
import {
  BACKGROUND_GOLD_PACKAGE_SLUG,
  backgroundEquipmentLines,
  classEquipmentLines,
  groupEquipmentPackages,
} from "@/features/create-character/lib/equipment-selection";
import { toolNameForSlug } from "@/features/create-character/lib/equipment-choice-resolve";
import { useSpells } from "@/features/spell-catalog/api/use-spells";
import { useMemo } from "react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  SheetChip,
  SheetStatTile,
} from "@/features/character-sheet/ui/sheet-ui";
import { CollapsibleCard } from "@/shared/ui/collapsible-card";
import { PhbProse } from "@/shared/ui/phb-prose";

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
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <SheetStatTile
        label="Proficiência"
        value={`+${character.proficiencyBonus}`}
      />
      <SheetStatTile
        label="Classe de armadura"
        value={character.armorClass}
        hint={character.armorClassNote ?? "sem armadura"}
        emphasize
      />
      <SheetStatTile
        label="Percepção passiva"
        value={character.passivePerception}
      />
      <SheetStatTile
        label="Pontos de vida"
        value={
          character.hitPointsMax != null
            ? `${character.hitPointsCurrent ?? character.hitPointsMax} / ${character.hitPointsMax}`
            : "—"
        }
        hint={character.hitPointsMax == null ? "Não definidos" : undefined}
      />
    </div>
  );
}

const ABILITY_ORDER = Object.keys(ABILITY_LABELS_PT) as (keyof AbilityScores)[];

/** Salvaguardas no estilo Beyond: todas as 6, com proficiência da classe. */
export function SavingThrowsSection({ character }: SectionProps) {
  const classDetail = useClassDetail(
    character.classSlug,
    !!character.classSlug,
  );
  const proficient = new Set(classDetail.data?.savingThrowSlugs ?? []);
  const pb = character.proficiencyBonus;

  if (classDetail.isPending) {
    return (
      <p className="text-sm text-muted-foreground">Carregando salvaguardas…</p>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ABILITY_ORDER.map((slug) => {
          const mod = abilityModifierValue(character.abilityScores[slug]);
          const isProficient = proficient.has(slug);
          const total = mod + (isProficient ? pb : 0);
          return (
            <li
              key={slug}
              className={cn(
                "flex items-center justify-between rounded-xl border px-3 py-2",
                isProficient
                  ? "border-primary/40 bg-primary/8"
                  : "border-border/70 bg-background/40",
              )}
            >
              <span className="text-sm font-medium">
                {ABILITY_LABELS_PT[slug]}
                {isProficient ? (
                  <span className="ml-1.5 text-[0.65rem] tracking-wide text-primary uppercase">
                    Prof.
                  </span>
                ) : null}
              </span>
              <span className="font-mono text-base font-semibold">
                {formatSkillBonus(total)}
              </span>
            </li>
          );
        })}
      </ul>
      {(classDetail.data?.armorTrainingNames?.length ||
        classDetail.data?.weaponProficiencyNames?.length) ? (
        <dl className="grid gap-3 border-t border-border pt-3 text-sm sm:grid-cols-2">
          {classDetail.data?.armorTrainingNames?.length ? (
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Armaduras
              </dt>
              <dd>{classDetail.data.armorTrainingNames.join(", ")}</dd>
            </div>
          ) : null}
          {classDetail.data?.weaponProficiencyNames?.length ? (
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Armas
              </dt>
              <dd>{classDetail.data.weaponProficiencyNames.join(", ")}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </div>
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
        <p className="text-xs text-muted-foreground">{boostNote}</p>
      ) : null}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {abilities.map(([key, score]) => (
          <SheetStatTile
            key={key}
            label={ABILITY_LABELS_PT[key]}
            value={score}
            hint={abilityModifier(score)}
          />
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

  const sorted = [...skills].sort((a, b) => {
    const aProf = proficient.has(a.slug) ? 0 : 1;
    const bProf = proficient.has(b.slug) ? 0 : 1;
    if (aProf !== bProf) return aProf - bProf;
    return a.name.localeCompare(b.name, "pt");
  });

  return (
    <ul className="grid gap-1.5 sm:grid-cols-2">
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
            ? "Classe + ant."
            : character.classSkillSlugs.includes(skill.slug)
              ? "Classe"
              : character.backgroundSkillSlugs.includes(skill.slug)
                ? "Antecedente"
                : null;

        return (
          <li
            key={skill.slug}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg border px-3 py-2",
              isProficient
                ? "border-primary/35 bg-primary/6"
                : "border-border/70 bg-background/40",
            )}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{skill.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {ABILITY_LABELS_PT[abilityKey] ?? skill.abilitySlug}
                {source ? ` · ${source}` : null}
              </p>
            </div>
            <span
              className={cn(
                "font-mono text-sm font-semibold tabular-nums",
                isProficient ? "text-primary" : "text-muted-foreground",
              )}
            >
              {formatSkillBonus(bonus)}
            </span>
          </li>
        );
      })}
    </ul>
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
    !bg?.description &&
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
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Toque em um item para ver detalhes.
      </p>
      <div className="space-y-1.5">
        {bg?.description ? (
          <CollapsibleCard
            title="Sobre o antecedente"
            size="compact"
            defaultOpen={false}
            className="bg-background/50"
          >
            <PhbProse text={bg.description} />
          </CollapsibleCard>
        ) : null}
        {originFeat ? (
          <CollapsibleCard
            title="Talento de origem"
            subtitle={originFeat}
            size="compact"
            defaultOpen={false}
            className="bg-background/50"
          >
            <p className="text-sm text-muted-foreground">
              Talento concedido pelo antecedente:{" "}
              <span className="font-medium text-foreground">{originFeat}</span>
            </p>
          </CollapsibleCard>
        ) : null}
        {backgroundSkills.length > 0 ? (
          <CollapsibleCard
            title="Perícias"
            subtitle={`${backgroundSkills.length} perícia${backgroundSkills.length > 1 ? "s" : ""}`}
            size="compact"
            defaultOpen
            className="bg-background/50"
          >
            <ul className="flex flex-wrap gap-1.5">
              {backgroundSkills.map((name) => (
                <li key={name}>
                  <SheetChip active>{name}</SheetChip>
                </li>
              ))}
            </ul>
          </CollapsibleCard>
        ) : null}
        {toolName || bg?.toolProficiencyKind === "choice" ? (
          <CollapsibleCard
            title="Ferramenta"
            subtitle={toolName ?? "Escolher"}
            size="compact"
            defaultOpen
            className="bg-background/50"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{toolName ?? "—"}</p>
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
          </CollapsibleCard>
        ) : null}
      </div>
    </div>
  );
}

export function SpeciesChoicesSection({ character }: SectionProps) {
  const speciesDetail = useSpeciesDetail(
    character.speciesSlug,
    !!character.speciesSlug,
  );
  const traitsQuery = useSpeciesTraits(
    character.speciesSlug,
    !!character.speciesSlug,
  );
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
        level1Benefit: match?.level1Benefit ?? null,
      };
    });
  }, [character.speciesChoices, traitChoices.data?.data]);

  const fixedTraits = (traitsQuery.data?.data ?? []).filter(
    (trait) => !trait.choiceKind,
  );

  return (
    <div className="space-y-5">
      {speciesDetail.data ? (
        <dl className="grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Tipo
            </dt>
            <dd className="text-sm font-medium">
              {speciesDetail.data.creatureType}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Tamanho
            </dt>
            <dd className="text-sm font-medium">{speciesDetail.data.size}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Deslocamento
            </dt>
            <dd className="text-sm font-medium">{speciesDetail.data.speed}</dd>
          </div>
        </dl>
      ) : null}

      {traitsQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando traços…</p>
      ) : fixedTraits.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Traços fixos
          </p>
          <div className="space-y-2">
            {fixedTraits.map((trait) => (
              <CollapsibleCard
                key={trait.name}
                title={trait.name}
                size="compact"
                defaultOpen={false}
                className="bg-background/50"
              >
                {trait.description ? (
                  <PhbProse text={trait.description} />
                ) : (
                  <p className="text-sm text-muted-foreground">Sem descrição.</p>
                )}
              </CollapsibleCard>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Escolhas
        </p>
        {character.speciesChoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma escolha de traço registrada.
          </p>
        ) : traitChoices.isPending ? (
          <p className="text-sm text-muted-foreground">Carregando escolhas…</p>
        ) : (
          <ul className="space-y-1.5">
            {resolved.map((item) => (
              <li key={`${item.choiceKind}-${item.choiceSlug}`}>
                <CollapsibleCard
                  title={item.choiceName}
                  subtitle={item.traitName}
                  size="compact"
                  defaultOpen={false}
                  className="bg-background/50"
                >
                  {item.level1Benefit ? (
                    <PhbProse text={item.level1Benefit} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Sem descrição adicional.
                    </p>
                  )}
                </CollapsibleCard>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
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
      <p className="text-xs text-muted-foreground">
        Toque em uma característica para ler o texto.
      </p>
      {byLevel.map(([level, features]) => (
        <section key={level} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold tabular-nums text-muted-foreground">
              Nv. {level}
            </span>
            <span className="h-px flex-1 bg-border/50" aria-hidden />
          </div>
          <div className="space-y-1.5">
            {features.map((feature) => (
              <CollapsibleCard
                key={`${level}-${feature.featureName}`}
                title={feature.featureName}
                size="compact"
                defaultOpen={false}
                className="bg-background/50"
              >
                <PhbProse text={feature.featureDescription} />
              </CollapsibleCard>
            ))}
          </div>
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
    <div className="space-y-1.5">
      {resolved.map((item) => (
        <CollapsibleCard
          key={item.optionKey}
          title={item.valueLabel}
          subtitle={
            item.unlockLevel != null
              ? `${item.label} · nv. ${item.unlockLevel}`
              : item.label
          }
          size="compact"
          defaultOpen={false}
          className="bg-background/50"
        >
          <p className="text-sm text-muted-foreground">
            Opção de subclasse selecionada.
          </p>
        </CollapsibleCard>
      ))}
    </div>
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
          <ul className="space-y-1.5">
            {mechanics.map((mechanic) => {
              const detail = formatSubclassMechanicDetail(mechanic);
              const matchesOption =
                mechanic.optionKey != null &&
                selectedOptionKeys.has(mechanic.optionKey);

              return (
                <li key={`${level}-${mechanic.featureName}-${mechanic.optionKey ?? ""}`}>
                  <CollapsibleCard
                    title={mechanic.featureName}
                    subtitle={
                      matchesOption ? "Opção escolhida" : detail ?? undefined
                    }
                    size="compact"
                    defaultOpen={false}
                    className={cn(
                      "bg-background/50",
                      matchesOption && "border-primary/40",
                    )}
                  >
                    {detail ? (
                      <p className="text-sm text-muted-foreground">{detail}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Sem detalhes adicionais.
                      </p>
                    )}
                  </CollapsibleCard>
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
  const spellsCatalog = useSpells();
  const levelBySlug = useMemo(() => {
    const map = new Map<string, number>();
    for (const spell of spellsCatalog.data?.data ?? []) {
      map.set(spell.slug, spell.level);
    }
    return map;
  }, [spellsCatalog.data?.data]);

  if (character.characterSpells.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhuma magia registrada.</p>
    );
  }

  const cantrips = character.characterSpells.filter(
    (s) => (levelBySlug.get(s.spellSlug) ?? -1) === 0,
  );
  const leveled = character.characterSpells.filter(
    (s) => (levelBySlug.get(s.spellSlug) ?? 1) > 0,
  );
  const unknownLevel =
    spellsCatalog.isPending &&
    cantrips.length === 0 &&
    leveled.length === 0;

  function spellChip(spell: (typeof character.characterSpells)[number]) {
    const level = levelBySlug.get(spell.spellSlug);
    const listHint = SPELL_LIST_LABELS[spell.listType] ?? spell.listType;
    const levelHint =
      level == null
        ? listHint
        : level === 0
          ? listHint
          : `${level}º · ${listHint}`;
    return (
      <li key={`${spell.spellSlug}-${spell.listType}`}>
        <SheetChip hint={levelHint}>
          {labels.resolveSpell(spell.spellSlug)}
        </SheetChip>
      </li>
    );
  }

  if (unknownLevel) {
    return (
      <p className="text-sm text-muted-foreground">Carregando magias…</p>
    );
  }

  // Catálogo ainda carregando: mostra lista plana; depois agrupa.
  if (spellsCatalog.isPending || levelBySlug.size === 0) {
    return (
      <ul className="flex flex-wrap gap-1.5">
        {character.characterSpells.map(spellChip)}
      </ul>
    );
  }

  return (
    <div className="space-y-3">
      {cantrips.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
            Truques
          </p>
          <ul className="flex flex-wrap gap-1.5">{cantrips.map(spellChip)}</ul>
        </div>
      ) : null}
      {leveled.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
            Magias
          </p>
          <ul className="flex flex-wrap gap-1.5">{leveled.map(spellChip)}</ul>
        </div>
      ) : null}
    </div>
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
  const resolveCtx = {
    backgroundToolItemSlug: character.backgroundToolItemSlug ?? undefined,
  };

  const bySource = {
    class: character.equipment.filter((e) => e.source === "class"),
    background: character.equipment.filter((e) => e.source === "background"),
  };

  function resolveItemName(
    source: "class" | "background",
    packageSlug: string,
    itemSlug?: string,
  ) {
    if (!itemSlug) return null;
    const rows = source === "class" ? classRows : backgroundRows;
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
      return gold != null ? `${gold} PO` : "Ouro";
    }
    const packages = source === "class" ? classPackages : backgroundPackages;
    const pkg = packages.find((p) => p.packageSlug === packageSlug);
    return pkg?.packageLabel ?? packageSlug;
  }

  function linesForSource(source: "class" | "background") {
    const items = bySource[source];
    if (items.length === 0) return null;

    const packageSlug = items[0]?.packageSlug ?? "";
    const storedItems = items.filter((e) => e.itemSlug);
    const packages = source === "class" ? classPackages : backgroundPackages;
    const pkg = packages.find((p) => p.packageSlug === packageSlug);

    const catalogLines = pkg
      ? source === "class"
        ? classEquipmentLines(pkg, resolveCtx)
        : backgroundEquipmentLines(pkg, resolveCtx)
      : [];

    // Catálogo do pacote é a fonte de verdade na leitura (marcadores TEMP
    // e choice_text resolvem aqui). Persistidos cobrem fallback sem catálogo.
    const displayLines =
      catalogLines.length > 0
        ? catalogLines.map((line, index) => ({
            key: `${line.kind}-${line.itemSlug ?? line.label}-${index}`,
            label: line.label,
            quantity: line.quantity,
            kind: line.kind,
          }))
        : storedItems.map((item) => ({
            key: `${item.itemSlug}-${item.sortOrder ?? 0}`,
            label:
              resolveItemName(source, item.packageSlug, item.itemSlug) ??
              item.itemSlug!,
            quantity: item.quantity,
            kind: "item" as const,
          }));

    return {
      packageSlug,
      displayLines,
      sourceLabel:
        source === "class"
          ? (classDetail.data?.name ?? "Classe")
          : (backgroundDetail.data?.name ?? "Antecedente"),
    };
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(["class", "background"] as const).map((source) => {
        const block = linesForSource(source);
        if (!block) return null;

        return (
          <div
            key={source}
            className="space-y-2 rounded-xl border border-border/70 bg-background/40 p-3"
          >
            <div>
              <p className="text-sm font-medium">{block.sourceLabel}</p>
              <p className="text-xs text-muted-foreground">
                Pacote {resolvePackageLabel(source, block.packageSlug)}
              </p>
            </div>
            {block.displayLines.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {block.displayLines.map((line) => (
                  <li key={line.key}>
                    <SheetChip
                      hint={
                        line.kind === "gold"
                          ? "ouro"
                          : line.kind === "text" || line.kind === "pick-tool"
                            ? "escolha"
                            : line.kind === "mirror-tool"
                              ? "ferramenta"
                              : undefined
                      }
                    >
                      {line.quantity && line.quantity > 1
                        ? `${line.quantity}× `
                        : null}
                      {line.label}
                    </SheetChip>
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
  );
}

export function FeatsSection({ character, labels }: SectionProps) {
  const featDetailSlugs = character.characterFeats.map((feat) => feat.featSlug);
  const { featBySlug, isLoading: featDetailsLoading } =
    useFeatDetails(featDetailSlugs);
  const { resolveFeatOption, featOptionDefsFor, isLoading: featOptionsLoading } =
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
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Toque em um talento para ler o texto.
      </p>
      <ul className="space-y-1.5">
        {character.characterFeats.map((feat) => {
          const key = featInstanceKey(feat.featSlug, feat.instanceIndex);
          const options = optionsByInstance[key] ?? [];
          const detail = featBySlug[feat.featSlug];
          const title = formatCharacterFeatLabel(
            feat,
            { [feat.featSlug]: labels.resolveFeat(feat.featSlug) },
            character.characterFeats,
          );
          return (
            <li key={key}>
              <CollapsibleCard
                title={title}
                subtitle={
                  detail?.categoryName
                    ? detail.categoryName
                    : options.length > 0
                      ? `${options.length} escolha${options.length > 1 ? "s" : ""}`
                      : undefined
                }
                size="compact"
                defaultOpen={false}
                className="bg-background/50"
              >
                {featDetailsLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Carregando descrição…
                  </p>
                ) : (
                  <div className="space-y-3">
                    <FeatBenefits
                      benefits={detail?.benefits ?? []}
                      prerequisite={detail?.prerequisite}
                    />
                    {options.length > 0 ? (
                      <FeatOptionsReadList
                        options={options}
                        defs={featOptionDefsFor(feat.featSlug)}
                        resolveFeatOption={resolveFeatOption}
                        loading={featOptionsLoading}
                      />
                    ) : null}
                  </div>
                )}
              </CollapsibleCard>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function LanguagesSection({ character, labels }: SectionProps) {
  if (character.languageSlugs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhum idioma registrado.</p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-1.5">
      {character.languageSlugs.map((language) => (
        <li key={language}>
          <SheetChip>{labels.resolveLanguage(language)}</SheetChip>
        </li>
      ))}
    </ul>
  );
}
