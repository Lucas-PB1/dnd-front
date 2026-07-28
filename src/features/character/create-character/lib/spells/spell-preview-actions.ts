import type { ClassSpellOption } from "@/entities/class/types";
import type { resolveSpellcastingUiProfile } from "@/features/character/create-character/lib/spells/class-spellcasting-ui";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import type { SpellPreviewAction } from "@/features/character/create-character/ui/spell-preview-dialog";

export type SpellPreviewTarget = {
  slug: string;
  kind: "cantrip" | "leveled" | "subclass";
};

type BuildSpellPreviewActionsInput = {
  target: SpellPreviewTarget;
  availableClass: ClassSpellOption[];
  characterSpells: CreateCharacterInput["characterSpells"];
  selectedSlugs: Set<string>;
  mode: string;
  uiProfile: ReturnType<typeof resolveSpellcastingUiProfile>;
  atCantripLimit: boolean;
  atLeveledKnownLimit: boolean;
  atLeveledPreparedLimit: boolean;
  onCantrip: (spell: ClassSpellOption) => void;
  onLeveled: (spell: ClassSpellOption, intent: "known" | "prepared") => void;
  onSubclass: (slug: string) => void;
};

export function buildSpellPreviewActions({
  target,
  availableClass,
  characterSpells,
  selectedSlugs,
  mode,
  uiProfile,
  atCantripLimit,
  atLeveledKnownLimit,
  atLeveledPreparedLimit,
  onCantrip,
  onLeveled,
  onSubclass,
}: BuildSpellPreviewActionsInput): SpellPreviewAction[] {
  if (target.kind === "subclass") {
    const selected = selectedSlugs.has(target.slug);
    return [
      {
        label: selected ? "Remover seleção" : "Selecionar",
        variant: selected ? "outline" : "default",
        onClick: () => onSubclass(target.slug),
      },
    ];
  }

  const spell = availableClass.find((s) => s.slug === target.slug);
  if (!spell) return [];

  if (target.kind === "cantrip") {
    const selected = selectedSlugs.has(spell.slug);
    return [
      {
        label: selected ? "Remover seleção" : "Selecionar",
        variant: selected ? "outline" : "default",
        disabled: !selected && atCantripLimit,
        onClick: () => onCantrip(spell),
      },
    ];
  }

  if (uiProfile.showWizardDualPick) {
    const entry = characterSpells.find((s) => s.spellSlug === spell.slug);
    const inBook =
      entry?.listType === "known" || entry?.listType === "prepared";
    const prepared = entry?.listType === "prepared";
    const actions: SpellPreviewAction[] = [
      {
        label: inBook ? "Remover do grimório" : "Adicionar ao grimório",
        variant: inBook ? "outline" : "default",
        disabled: !inBook && atLeveledKnownLimit,
        onClick: () => onLeveled(spell, "known"),
      },
    ];
    if (inBook) {
      actions.push({
        label: prepared ? "Despreparar" : "Preparar",
        variant: "secondary",
        disabled: !prepared && atLeveledPreparedLimit,
        onClick: () => onLeveled(spell, "prepared"),
      });
    }
    return actions;
  }

  const selected = selectedSlugs.has(spell.slug);
  const atLimit =
    mode === "known" ? atLeveledKnownLimit : atLeveledPreparedLimit;
  return [
    {
      label: selected ? "Remover seleção" : "Selecionar",
      variant: selected ? "outline" : "default",
      disabled: !selected && atLimit,
      onClick: () => onLeveled(spell, mode === "known" ? "known" : "prepared"),
    },
  ];
}
