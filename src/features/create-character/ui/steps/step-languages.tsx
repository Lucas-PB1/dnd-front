"use client";

import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { WizardFormSection } from "@/features/create-character/ui/wizard-form-section";
import { useLanguages } from "@/features/reference-catalog/api/use-reference";
import { cn } from "@/shared/lib/utils";

type StepLanguagesProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
};

export function StepLanguages({ control, setValue }: StepLanguagesProps) {
  const languages = useLanguages();
  const selected = useWatch({
    control,
    name: "languageSlugs",
    defaultValue: [],
  });

  function toggle(slug: string) {
    const next = selected.includes(slug)
      ? selected.filter((item) => item !== slug)
      : [...selected, slug];
    setValue("languageSlugs", next);
  }

  return (
    <WizardFormSection
      title={`Idiomas${selected.length ? ` · ${selected.length}` : ""}`}
      compact
    >
      {languages.isPending ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(languages.data?.data ?? []).map((lang) => (
            <li key={lang.slug}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-sm",
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
    </WizardFormSection>
  );
}
