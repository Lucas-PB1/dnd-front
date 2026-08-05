"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import type {
  CharacterDetail,
  UpdateCharacterPayload,
} from "@/entities/character/types";
import { usePatchCharacter } from "@/features/character/character-sheet/api/use-patch-character";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";
import { ApiError } from "@/shared/api/dnd-api/api-error";
import { Button } from "@/shared/ui/button";
import { DialogFooter } from "@/shared/ui/dialog";

export type EditFormProps = {
  character: CharacterDetail;
  onSuccess: () => void;
  onCancel: () => void;
};

export function useSectionPatch(
  character: CharacterDetail,
  onSuccess: () => void,
) {
  const patch = usePatchCharacter(character.id);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(payload: UpdateCharacterPayload) {
    setFormError(null);
    try {
      await patch.mutateAsync(payload);
      onSuccess();
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Erro ao salvar",
      );
    }
  }

  return { patch, formError, submit };
}

function FormAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

/**
 * Casca comum das edições: as seções só descrevem os campos; o corpo cresce
 * com o conteúdo até o teto do dialog e o rodapé fica fixo.
 */
export function EditFormShell({
  isPending,
  formError,
  onSubmit,
  onCancel,
  children,
}: {
  isPending: boolean;
  formError: string | null;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <form
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden"
      onSubmit={onSubmit}
    >
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {children}
      </div>
      <FormAlert message={formError} />
      <DialogFooter className="shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando…" : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function characterToFormValues(
  character: CharacterDetail,
): CreateCharacterInput {
  return {
    name: character.name,
    level: character.level,
    classSlug: character.classSlug,
    speciesSlug: character.speciesSlug,
    backgroundSlug: character.backgroundSlug,
    subclassSlug: character.subclassSlug ?? "",
    abilityGenerationMethodSlug:
      (character.abilityGenerationMethodSlug as CreateCharacterInput["abilityGenerationMethodSlug"]) ??
      "standard-array",
    abilityScores: character.abilityScores,
    backgroundAbilityBoostMode:
      character.backgroundAbilityBoostMode ?? "plus2plus1",
    backgroundAbilityBoostPlus2Slug:
      character.backgroundAbilityBoostPlus2Slug ?? undefined,
    backgroundAbilityBoostPlus1Slug:
      character.backgroundAbilityBoostPlus1Slug ?? undefined,
    backgroundAbilityBoostPlus1Slugs:
      character.backgroundAbilityBoostPlus1Slugs ?? undefined,
    backgroundToolItemSlug: character.backgroundToolItemSlug ?? undefined,
    classSkillSlugs: character.classSkillSlugs,
    alignmentSlug: character.alignmentSlug ?? "",
    languageSlugs: character.languageSlugs,
    speciesChoices: character.speciesChoices,
    subclassOptions: character.subclassOptions,
    classOptions: character.classOptions ?? [],
    featOptions: character.featOptions,
    // Hidrata slots com os feats já na ficha para o editor não podar featOptions.
    asiFeatSlotSlugs: character.characterFeats.map((feat) => feat.featSlug),
    equipment: character.equipment,
    characterSpells: character.characterSpells,
  };
}

export function SheetStepForm({
  character,
  onSuccess,
  onCancel,
  children,
  toPayload,
}: EditFormProps & {
  children: (
    ctx: ReturnType<typeof useForm<CreateCharacterInput>>,
  ) => React.ReactNode;
  toPayload: (values: CreateCharacterInput) => UpdateCharacterPayload;
}) {
  const { patch, formError, submit } = useSectionPatch(character, onSuccess);

  const defaultValues = useMemo(
    () => characterToFormValues(character),
    // Só rehidrata ao abrir outra ficha ou após save (updatedAt).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- character fields keyed by id/updatedAt
    [character.id, character.updatedAt],
  );

  const form = useForm<CreateCharacterInput>({ defaultValues });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <EditFormShell
      isPending={patch.isPending}
      formError={formError}
      onCancel={onCancel}
      onSubmit={form.handleSubmit((values) => submit(toPayload(values)))}
    >
      {children(form)}
    </EditFormShell>
  );
}
