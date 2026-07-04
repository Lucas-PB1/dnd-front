"use client";

import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { CharacterSpell } from "@/entities/character/sheet-types";
import {
  useClassSpells,
  useSubclassSpells,
} from "@/features/class-catalog/api/use-classes";
import { isSubclassRequired } from "@/entities/character/lib/subclass";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
import { cn } from "@/shared/lib/utils";

type StepSpellsProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
};

function spellMaxLevelForCharacter(level: number): number {
  return level >= 1 ? 1 : 0;
}

export function StepSpells({ control, setValue }: StepSpellsProps) {
  const level = useWatch({ control, name: "level", defaultValue: 1 });
  const classSlug = useWatch({ control, name: "classSlug", defaultValue: "" });
  const subclassSlug = useWatch({
    control,
    name: "subclassSlug",
    defaultValue: "",
  });
  const characterSpells = useWatch({
    control,
    name: "characterSpells",
    defaultValue: [],
  });

  const maxLevel = spellMaxLevelForCharacter(level);
  const classSpells = useClassSpells(classSlug, maxLevel, !!classSlug);
  const subclassSpells = useSubclassSpells(
    subclassSlug ?? "",
    isSubclassRequired(level) && !!subclassSlug,
  );

  const availableClass = classSpells.data?.data ?? [];
  const availableSubclass = (subclassSpells.data?.data ?? []).filter(
    (s) => s.unlockLevel <= level,
  );

  const selectedSlugs = new Set(characterSpells.map((s) => s.spellSlug));

  function toggleSpell(
    slug: string,
    listType: CharacterSpell["listType"] = "known",
  ) {
    const exists = characterSpells.some((s) => s.spellSlug === slug);
    const next = exists
      ? characterSpells.filter((s) => s.spellSlug !== slug)
      : [...characterSpells, { spellSlug: slug, listType }];
    setValue("characterSpells", next);
  }

  if (classSpells.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando magias…</p>;
  }

  if (availableClass.length === 0 && availableSubclass.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta combinação classe/nível não exige escolha de magias na criação.
      </p>
    );
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Magias iniciais</FieldLabel>
        <FieldDescription>
          Selecione truques e magias de 1º círculo disponíveis (opcional — pode
          ajustar depois na ficha).
        </FieldDescription>
      </Field>

      {availableClass.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Magias da classe</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {availableClass.map((spell) => (
              <li key={spell.slug}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                    selectedSlugs.has(spell.slug) &&
                      "border-primary bg-primary/5",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedSlugs.has(spell.slug)}
                    onChange={() => toggleSpell(spell.slug, "known")}
                  />
                  <span>
                    {spell.name}
                    <span className="ml-1 text-xs text-muted-foreground">
                      (círculo {spell.level})
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {availableSubclass.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Magias da subclasse</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {availableSubclass.map((spell) => (
              <li key={spell.slug}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                    selectedSlugs.has(spell.slug) &&
                      "border-primary bg-primary/5",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedSlugs.has(spell.slug)}
                    onChange={() => toggleSpell(spell.slug, "always_prepared")}
                  />
                  <span>
                    {spell.name}
                    <span className="ml-1 text-xs text-muted-foreground">
                      (nv. {spell.unlockLevel})
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </FieldGroup>
  );
}
