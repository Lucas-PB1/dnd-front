"use client";

import {
  EditFormShell,
  useSectionPatch,
  type EditFormProps,
} from "@/features/character/character-sheet/ui/edit/edit-form-shell";
import {
  LanguagePickerFields,
  useSheetLanguageSelection,
} from "@/features/character/character-sheet/ui/edit/language-picker-fields";

export function EditLanguagesForm({
  character,
  onSuccess,
  onCancel,
}: EditFormProps) {
  const { patch, formError, submit } = useSectionPatch(character, onSuccess);
  const selection = useSheetLanguageSelection({
    backgroundSlug: character.backgroundSlug,
    initialSlugs: character.languageSlugs,
  });

  return (
    <EditFormShell
      isPending={patch.isPending}
      formError={formError ?? selection.hint}
      onCancel={onCancel}
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
        hint={null}
        onToggle={selection.toggle}
        languageRows={selection.languages.data?.data ?? []}
        variant="settings"
      />
    </EditFormShell>
  );
}
