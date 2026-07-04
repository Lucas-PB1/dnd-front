"use client";

import { useMemo } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { SpeciesChoice } from "@/entities/character/sheet-types";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { useSpeciesTraitChoices } from "@/features/species-catalog/api/use-species";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
import { cn } from "@/shared/lib/utils";

type StepSpeciesChoicesProps = {
  control: Control<CreateCharacterInput>;
  setValue: UseFormSetValue<CreateCharacterInput>;
  error?: string;
};

export function StepSpeciesChoices({
  control,
  setValue,
  error,
}: StepSpeciesChoicesProps) {
  const speciesSlug = useWatch({
    control,
    name: "speciesSlug",
    defaultValue: "",
  });
  const speciesChoices = useWatch({
    control,
    name: "speciesChoices",
    defaultValue: [],
  });
  const traitChoices = useSpeciesTraitChoices(speciesSlug, !!speciesSlug);

  const groups = useMemo(() => {
    const map = new Map<
      string,
      {
        traitName: string;
        options: { choiceSlug: string; choiceName: string }[];
      }
    >();

    for (const row of traitChoices.data?.data ?? []) {
      const group = map.get(row.choiceKind) ?? {
        traitName: row.traitName,
        options: [],
      };
      group.options.push({
        choiceSlug: row.choiceSlug,
        choiceName: row.choiceName,
      });
      map.set(row.choiceKind, group);
    }

    return [...map.entries()];
  }, [traitChoices.data?.data]);

  function setChoice(kind: string, slug: string) {
    const next: SpeciesChoice[] = speciesChoices.filter(
      (c) => c.choiceKind !== kind,
    );
    next.push({ choiceKind: kind, choiceSlug: slug });
    setValue("speciesChoices", next);
  }

  if (!speciesSlug) {
    return (
      <p className="text-sm text-muted-foreground">
        Volte à identidade e escolha uma espécie.
      </p>
    );
  }

  if (traitChoices.isPending) {
    return <p className="text-sm text-muted-foreground">Carregando traços…</p>;
  }

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta espécie não exige escolhas adicionais de traço.
      </p>
    );
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Traços da espécie</FieldLabel>
        <FieldDescription>
          Escolha uma opção para cada traço exigido pelo PHB.
        </FieldDescription>
        <FieldError errors={error ? [{ message: error }] : []} />
      </Field>

      {groups.map(([kind, group]) => {
        const selected = speciesChoices.find(
          (c) => c.choiceKind === kind,
        )?.choiceSlug;

        return (
          <Field key={kind}>
            <FieldLabel>{group.traitName}</FieldLabel>
            <div className="flex flex-col gap-2">
              {group.options.map((opt) => (
                <label
                  key={opt.choiceSlug}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                    selected === opt.choiceSlug &&
                      "border-primary bg-primary/5",
                  )}
                >
                  <input
                    type="radio"
                    name={`species-${kind}`}
                    checked={selected === opt.choiceSlug}
                    onChange={() => setChoice(kind, opt.choiceSlug)}
                    className="size-4"
                  />
                  {opt.choiceName}
                </label>
              ))}
            </div>
          </Field>
        );
      })}
    </FieldGroup>
  );
}
