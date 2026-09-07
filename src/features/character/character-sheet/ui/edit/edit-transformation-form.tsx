"use client";

import { useMemo, useState } from "react";

import type {
  CharacterTransformation,
  SpeciesChoice,
} from "@/entities/character/sheet-types";
import {
  filterValuesForMatch,
  requiredChoiceKeysForStage,
  siblingPickKeys,
} from "@/features/character/character-sheet/lib/transformation/cap6-choice-rules";
import {
  EditFormShell,
  useSectionPatch,
  type EditFormProps,
} from "@/features/character/character-sheet/ui/edit/edit-form-shell";
import { useFeatOptions } from "@/features/catalog/feat-catalog/api/use-feat-options";
import { useFeatsCatalog } from "@/features/catalog/feat-catalog/api/use-feats";
import { Button } from "@/shared/ui/button";
import { NativeSelect } from "@/shared/ui/native-select";

export function EditTransformationForm({
  character,
  onSuccess,
  onCancel,
}: EditFormProps) {
  const { patch, formError, submit } = useSectionPatch(character, onSuccess);
  const catalog = useFeatsCatalog({ category: "gh-transformation" });
  const initial = character.transformation ?? null;

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [stage, setStage] = useState(initial?.stage ?? 1);
  const [choices, setChoices] = useState<SpeciesChoice[]>(
    initial?.choices ?? [],
  );

  const optionsQuery = useFeatOptions(slug, !!slug);
  const byKind = useMemo(() => {
    const map = new Map<string, string>();
    for (const choice of choices) map.set(choice.choiceKind, choice.choiceSlug);
    return map;
  }, [choices]);

  const requiredKeys = useMemo(
    () => (slug ? requiredChoiceKeysForStage(slug, stage, byKind) : []),
    [slug, stage, byKind],
  );

  const optionsByKey = useMemo(() => {
    const map = new Map<
      string,
      { valueId: string; label: string; sortOrder: number }[]
    >();
    for (const def of optionsQuery.data?.data ?? []) {
      map.set(
        def.optionKey,
        (def.values ?? []).map((v) => ({
          valueId: v.valueId,
          label: v.label,
          sortOrder: v.sortOrder,
        })),
      );
    }
    return map;
  }, [optionsQuery.data?.data]);

  function setChoice(kind: string, value: string) {
    setChoices((prev) => {
      const next = prev.filter((c) => c.choiceKind !== kind);
      if (value) next.push({ choiceKind: kind, choiceSlug: value });
      return next;
    });
  }

  function valuesForKey(kind: string) {
    const raw = optionsByKey.get(kind) ?? [];
    let filtered = filterValuesForMatch(slug, kind, raw, byKind);
    const siblings = siblingPickKeys(kind).filter((k) => k !== kind);
    const taken = new Set(
      siblings.map((k) => byKind.get(k)).filter(Boolean) as string[],
    );
    if (taken.size > 0) {
      filtered = filtered.filter((v) => !taken.has(v.valueId));
    }
    return filtered;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!slug) {
      await submit({ transformation: null });
      return;
    }
    const payload: CharacterTransformation = {
      slug,
      stage,
      choices: requiredKeys.map((kind) => ({
        choiceKind: kind,
        choiceSlug: byKind.get(kind) ?? "",
      })),
    };
    await submit({ transformation: payload });
  }

  const transformations = catalog.data?.data ?? [];

  return (
    <EditFormShell
      isPending={patch.isPending}
      formError={formError}
      onSubmit={onSubmit}
      onCancel={onCancel}
    >
      <div className="space-y-3">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Transformação</span>
          <NativeSelect
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setStage(1);
              setChoices([]);
            }}
          >
            <option value="">Nenhuma</option>
            {transformations.map((feat) => (
              <option key={feat.slug} value={feat.slug}>
                {feat.name}
              </option>
            ))}
          </NativeSelect>
        </label>

        {slug ? (
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Estágio</span>
            <NativeSelect
              value={String(stage)}
              onChange={(e) => setStage(Number(e.target.value))}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </NativeSelect>
          </label>
        ) : null}

        {slug
          ? requiredKeys.map((kind) => {
              const values = valuesForKey(kind);
              return (
                <label key={kind} className="block space-y-1 text-sm">
                  <span className="font-medium">{kind}</span>
                  <NativeSelect
                    value={byKind.get(kind) ?? ""}
                    onChange={(e) => setChoice(kind, e.target.value)}
                    required
                  >
                    <option value="">Escolha…</option>
                    {values.map((v) => (
                      <option key={v.valueId} value={v.valueId}>
                        {v.label}
                      </option>
                    ))}
                  </NativeSelect>
                </label>
              );
            })
          : null}

        {slug ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSlug("");
              setChoices([]);
            }}
          >
            Remover transformação
          </Button>
        ) : null}
      </div>
    </EditFormShell>
  );
}
