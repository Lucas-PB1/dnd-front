"use client";

import { useWatch, type Control, type UseFormSetValue } from "react-hook-form";

import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import {
  mergeEldritchInvocationsIntoClassOptions,
  readEldritchInvocationSlugs,
} from "@/features/character/character-sheet/lib/warlock/eldritch-invocations";
import { EldritchInvocationPicker } from "@/features/character/character-sheet/ui/beyond/warlock/eldritch-invocation-picker";
import { useEldritchInvocations } from "@/features/catalog/eldritch-invocation-catalog/api/use-eldritch-invocations";
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
  const catalogQuery = useEldritchInvocations(level);
  const selected = readEldritchInvocationSlugs(classOptions);

  function onChange(slugs: string[]) {
    setValue(
      "classOptions",
      mergeEldritchInvocationsIntoClassOptions(classOptions, slugs),
      { shouldDirty: true },
    );
  }

  return (
    <WizardFormSection
      title="Invocações Místicas"
      description="Fragmentos de conhecimento proibido. No nível 1 você recebe 1 invocação (ex.: um Pacto)."
    >
      {catalogQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando catálogo…</p>
      ) : catalogQuery.isError ? (
        <p className="text-sm text-destructive">Falha ao carregar invocações.</p>
      ) : (
        <EldritchInvocationPicker
          level={level}
          catalog={catalogQuery.data ?? []}
          selectedSlugs={selected}
          onChange={onChange}
        />
      )}
    </WizardFormSection>
  );
}
