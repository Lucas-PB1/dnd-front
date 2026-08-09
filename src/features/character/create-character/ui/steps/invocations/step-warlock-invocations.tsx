"use client";

import { useMemo } from "react";
import { useWatch, type Control, type UseFormSetValue } from "react-hook-form";

import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import {
  mergeEldritchInvocationsIntoClassOptions,
  readEldritchInvocationPicks,
} from "@/features/character/character-sheet/lib/warlock/eldritch-invocations";
import {
  EldritchInvocationPicker,
  type EldritchCantripOption,
} from "@/features/character/character-sheet/ui/beyond/warlock/eldritch-invocation-picker";
import { useEldritchInvocations } from "@/features/catalog/eldritch-invocation-catalog/api/use-eldritch-invocations";
import { useSpellLabels } from "@/features/catalog/spell-catalog/api/use-spells";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";

type StepWarlockInvocationsProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
};

export function StepWarlockInvocations({
  control,
  setValue,
}: StepWarlockInvocationsProps) {
  const level = useWatch({ control, name: "level" }) ?? 1;
  const classOptions = useWatch({ control, name: "classOptions" }) ?? [];
  const characterSpells = useWatch({ control, name: "characterSpells" }) ?? [];
  const catalogQuery = useEldritchInvocations(level);
  const spellLabels = useSpellLabels();
  const selected = readEldritchInvocationPicks(classOptions);

  const cantripOptions = useMemo((): EldritchCantripOption[] => {
    const nameBySlug = new Map(
      (spellLabels.data?.data ?? []).map((spell) => [spell.slug, spell.name]),
    );
    const seen = new Set<string>();
    const options: EldritchCantripOption[] = [];
    for (const spell of characterSpells) {
      if (seen.has(spell.spellSlug)) continue;
      seen.add(spell.spellSlug);
      options.push({
        value: spell.spellSlug,
        label: nameBySlug.get(spell.spellSlug) ?? spell.spellSlug,
        dealsDamage: true,
        requiresAttackRoll: true,
        rangeMeters: 36,
      });
    }
    return options;
  }, [characterSpells, spellLabels.data]);

  return (
    <WizardFormSection
      title="Invocações Místicas"
      description="Fragmentos de conhecimento proibido. No nível 1 você recebe 1 invocação (ex.: um Pacto). Invocações de blast pedem um truque vinculado."
    >
      {catalogQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando catálogo…</p>
      ) : catalogQuery.isError ? (
        <p className="text-sm text-destructive">Falha ao carregar invocações.</p>
      ) : (
        <EldritchInvocationPicker
          level={level}
          catalog={catalogQuery.data ?? []}
          selectedPicks={selected}
          cantripOptions={cantripOptions}
          onChange={(picks) => {
            setValue(
              "classOptions",
              mergeEldritchInvocationsIntoClassOptions(classOptions, picks),
              { shouldDirty: true },
            );
          }}
        />
      )}
    </WizardFormSection>
  );
}
