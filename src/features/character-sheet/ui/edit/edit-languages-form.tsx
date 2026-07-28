"use client";

import { useState } from "react";

import {
  EditFormShell,
  useSectionPatch,
  type EditFormProps,
} from "@/features/character-sheet/ui/edit/edit-form-shell";
import { useLanguages } from "@/features/reference-catalog/api/use-reference";
import { cn } from "@/shared/lib/utils";

export function EditLanguagesForm({
  character,
  onSuccess,
  onCancel,
}: EditFormProps) {
  const { patch, formError, submit } = useSectionPatch(character, onSuccess);
  const languages = useLanguages();
  const [selected, setSelected] = useState<string[]>(character.languageSlugs);

  function toggle(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  return (
    <EditFormShell
      isPending={patch.isPending}
      formError={formError}
      onCancel={onCancel}
      onSubmit={(e) => {
        e.preventDefault();
        submit({ languageSlugs: selected });
      }}
    >
      {languages.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando idiomas…</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {(languages.data?.data ?? []).map((lang) => (
            <li key={lang.slug}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                  selected.includes(lang.slug) && "border-primary bg-primary/5",
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(lang.slug)}
                  onChange={() => toggle(lang.slug)}
                  className="size-4 rounded border-input"
                />
                {lang.name}
              </label>
            </li>
          ))}
        </ul>
      )}
    </EditFormShell>
  );
}
