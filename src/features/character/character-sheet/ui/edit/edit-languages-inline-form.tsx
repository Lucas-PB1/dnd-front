"use client";

import {
  useSectionPatch,
  type EditFormProps,
} from "@/features/character/character-sheet/ui/edit/edit-form-shell";
import {
  LanguagePickerFields,
  useSheetLanguageSelection,
} from "@/features/character/character-sheet/ui/edit/language-picker-fields";
import { Button } from "@/shared/ui/button";

/** Idiomas no hub de Ajustes — mesma cota do wizard (fixos + N à escolha). */
export function EditLanguagesInlineForm({
  character,
  onSuccess,
}: Pick<EditFormProps, "character" | "onSuccess">) {
  const { patch, formError, submit } = useSectionPatch(character, onSuccess);
  const selection = useSheetLanguageSelection({
    backgroundSlug: character.backgroundSlug,
    initialSlugs: character.languageSlugs,
  });

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!selection.grantReady) return;
        submit({ languageSlugs: selection.syncedSelection() });
      }}
    >
      <LanguagePickerFields
        languagesPending={selection.languages.isPending}
        grantReady={selection.grantReady}
        quota={selection.quota}
        selected={selection.selected}
        chosenCount={selection.chosenCount}
        hint={selection.hint}
        onToggle={selection.toggle}
        languageRows={selection.languages.data?.data ?? []}
        variant="settings"
      />

      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}
      {selection.grantReady &&
      selection.chosenCount < selection.quota.choiceCount ? (
        <Button
          type="submit"
          size="sm"
          disabled={patch.isPending || !selection.grantReady}
        >
          {patch.isPending ? "Salvando…" : "Salvar idiomas"}
        </Button>
      ) : null}
    </form>
  );
}
