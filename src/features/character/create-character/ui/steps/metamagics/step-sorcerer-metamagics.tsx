"use client";

import { useWatch, type Control, type UseFormSetValue } from "react-hook-form";

import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import {
  mergeMetamagicIntoClassOptions,
  readMetamagicSlugs,
} from "@/features/character/character-sheet/lib/sorcerer/metamagic";
import { MetamagicPicker } from "@/features/character/character-sheet/ui/beyond/sorcerer/metamagic-picker";
import { useMetamagics } from "@/features/catalog/metamagic-catalog/api/use-metamagics";
import { WizardFormSection } from "@/features/character/create-character/ui/wizard/wizard-form-section";

type StepSorcererMetamagicsProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
};

export function StepSorcererMetamagics({
  control,
  setValue,
}: StepSorcererMetamagicsProps) {
  const level = useWatch({ control, name: "level" }) ?? 1;
  const classOptions = useWatch({ control, name: "classOptions" }) ?? [];
  const selected = readMetamagicSlugs(classOptions);
  const catalogQuery = useMetamagics();

  return (
    <WizardFormSection
      title="Metamagia"
      description="Escolha as opções de Metamagia que seu Feiticeiro conhece."
    >
      {catalogQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando catálogo…</p>
      ) : catalogQuery.isError ? (
        <p className="text-sm text-destructive">Falha ao carregar Metamagias.</p>
      ) : (
        <MetamagicPicker
          level={level}
          catalog={catalogQuery.data ?? []}
          selectedSlugs={selected}
          onChange={(slugs) => {
            setValue(
              "classOptions",
              mergeMetamagicIntoClassOptions(classOptions, slugs),
              { shouldDirty: true, shouldValidate: true },
            );
          }}
        />
      )}
    </WizardFormSection>
  );
}
