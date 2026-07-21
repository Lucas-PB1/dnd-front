"use client";

import { useMemo } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

import type { SpeciesChoice } from "@/entities/character/sheet-types";
import { featInstanceKey } from "@/entities/character/lib/character-feat";
import type { FeatOption } from "@/entities/character/sheet-types";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";
import { asiFeatSlotsToCharacterFeats } from "@/features/create-character/lib/asi-feat-slots-to-feats";
import { resolveCreateCharacterFeats } from "@/features/create-character/lib/preview-create-character-feats";
import { CatalogSelect } from "@/features/create-character/ui/catalog-select";
import { FeatOptionsEditor } from "@/features/feat-catalog/ui/feat-options-editor";
import { useBackgroundDetail } from "@/features/background-catalog/api/use-backgrounds";
import { useSpeciesTraitChoices } from "@/features/species-catalog/api/use-species";
import { useFeats } from "@/features/reference-catalog/api/use-reference";
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

const COMPACT_LIST_THRESHOLD = 8;

function traitChoiceLabel(kind: string, traitName: string): string {
  if (kind === "human_origin_feat") {
    return "Versátil — talento de origem";
  }
  return traitName;
}

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
  const backgroundSlug = useWatch({
    control,
    name: "backgroundSlug",
    defaultValue: "",
  });
  const asiFeatSlotSlugs = useWatch({
    control,
    name: "asiFeatSlotSlugs",
    defaultValue: [],
  });
  const featOptions = useWatch({
    control,
    name: "featOptions",
    defaultValue: [],
  });
  const level = useWatch({
    control,
    name: "level",
    defaultValue: 1,
  });
  const classSlug = useWatch({
    control,
    name: "classSlug",
    defaultValue: "",
  });

  const traitChoices = useSpeciesTraitChoices(speciesSlug, !!speciesSlug);
  const backgroundDetail = useBackgroundDetail(
    backgroundSlug,
    !!backgroundSlug,
  );
  const featsCatalog = useFeats();

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

  const featNameBySlug = useMemo(
    () =>
      Object.fromEntries(
        (featsCatalog.data?.data ?? []).map((feat) => [feat.slug, feat.name]),
      ),
    [featsCatalog.data?.data],
  );

  const previewFeats = useMemo(
    () =>
      resolveCreateCharacterFeats(
        backgroundDetail.data?.originFeatSlug ?? null,
        asiFeatSlotsToCharacterFeats(asiFeatSlotSlugs),
        speciesChoices,
      ),
    [
      asiFeatSlotSlugs,
      backgroundDetail.data?.originFeatSlug,
      speciesChoices,
    ],
  );

  const humanOriginFeatKeys = useMemo(() => {
    const humanFeat = speciesChoices.find(
      (c) => c.choiceKind === "human_origin_feat",
    );
    if (!humanFeat) return new Set<string>();
    const match = previewFeats.find((f) => f.featSlug === humanFeat.choiceSlug);
    if (!match) return new Set<string>();
    return new Set([
      featInstanceKey(match.featSlug, match.instanceIndex),
    ]);
  }, [previewFeats, speciesChoices]);

  function setChoice(kind: string, slug: string) {
    const next: SpeciesChoice[] = speciesChoices.filter(
      (c) => c.choiceKind !== kind,
    );
    if (slug) {
      next.push({ choiceKind: kind, choiceSlug: slug });
    }
    setValue("speciesChoices", next);

    const nextPreview = resolveCreateCharacterFeats(
      backgroundDetail.data?.originFeatSlug ?? null,
      asiFeatSlotsToCharacterFeats(asiFeatSlotSlugs),
      next,
    );
    const validKeys = new Set(
      nextPreview.map((f) => featInstanceKey(f.featSlug, f.instanceIndex)),
    );
    setValue(
      "featOptions",
      featOptions.filter((option) =>
        validKeys.has(
          featInstanceKey(option.featSlug, option.instanceIndex),
        ),
      ),
    );
  }

  function updateFeatOptions(next: FeatOption[]) {
    setValue("featOptions", next);
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
          Escolha uma opção para cada traço exigido pelo PHB (perícia, talento
          de origem, tamanho, linhagem, etc.).
        </FieldDescription>
        <FieldError errors={error ? [{ message: error }] : []} />
      </Field>

      {groups.map(([kind, group]) => {
        const selected = speciesChoices.find(
          (c) => c.choiceKind === kind,
        )?.choiceSlug;
        const useSelect = group.options.length > COMPACT_LIST_THRESHOLD;

        return (
          <Field key={kind}>
            <FieldLabel>{traitChoiceLabel(kind, group.traitName)}</FieldLabel>
            {useSelect ? (
              <CatalogSelect
                id={`species-choice-${kind}`}
                label=""
                options={[
                  { value: "", label: "Selecione…" },
                  ...group.options.map((opt) => ({
                    value: opt.choiceSlug,
                    label: opt.choiceName,
                  })),
                ]}
                value={selected ?? ""}
                onChange={(e) => setChoice(kind, e.target.value)}
              />
            ) : (
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
            )}
          </Field>
        );
      })}

      {humanOriginFeatKeys.size > 0 && previewFeats.length > 0 ? (
        <section className="space-y-3 border-t border-border pt-4">
          <div>
            <h3 className="text-sm font-semibold">
              Opções do talento (Versátil)
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure perícias, magias ou outras escolhas do talento de origem
              que você acabou de selecionar.
            </p>
          </div>
          <FeatOptionsEditor
            characterFeats={previewFeats.filter((feat) =>
              humanOriginFeatKeys.has(
                featInstanceKey(feat.featSlug, feat.instanceIndex),
              ),
            )}
            featNameBySlug={featNameBySlug}
            value={featOptions}
            characterLevel={level}
            classSlug={classSlug}
            onChange={updateFeatOptions}
          />
        </section>
      ) : null}
    </FieldGroup>
  );
}
