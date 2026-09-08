"use client";

import { useEffect, useMemo, useState } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import type { SubclassOption } from "@/entities/character/sheet-types";
import { fetchSubclassOptions } from "@/features/catalog/class-catalog/api/classes.api";
import { usePatchCharacter } from "@/features/character/character-sheet/api/use-patch-character";
import {
  SubclassOptionsEditor,
  subclassOptionsComplete,
} from "@/features/character/character-sheet/ui/level-up/subclass-options-editor";
import { ApiError } from "@/shared/api/dnd-api/api-error";
import { Button } from "@/shared/ui/button";

type IncompleteGap = {
  optionKey: string;
  label: string;
};

type IncompleteSubclassOptionsFixPanelProps = {
  character: CharacterDetail;
  blockProgression?: boolean;
  onResolved?: () => void;
};

export function IncompleteSubclassOptionsFixPanel({
  character,
  blockProgression = false,
  onResolved,
}: IncompleteSubclassOptionsFixPanelProps) {
  const patch = usePatchCharacter(character.id);
  const [gaps, setGaps] = useState<IncompleteGap[] | null>(null);
  const [draftOptions, setDraftOptions] = useState<SubclassOption[] | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const subclassOptions = draftOptions ?? character.subclassOptions;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!character.subclassSlug) {
        if (!cancelled) setGaps([]);
        return;
      }
      try {
        const response = await fetchSubclassOptions(
          character.subclassSlug,
          character.level,
        );
        const groups = response.data ?? [];
        const provided = new Set(
          character.subclassOptions
            .filter((option) => option.valueId)
            .map((option) => option.optionKey),
        );
        const next = groups
          .filter((group) => !provided.has(group.optionKey))
          .map((group) => ({
            optionKey: group.optionKey,
            label: group.label?.trim() || group.optionKey,
          }));
        if (!cancelled) setGaps(next);
      } catch {
        if (!cancelled) setGaps([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [character.level, character.subclassOptions, character.subclassSlug]);

  const optionKeys = useMemo(
    () => gaps?.map((gap) => gap.optionKey) ?? [],
    [gaps],
  );

  if (!character.subclassSlug) return null;
  if (gaps === null) {
    return (
      <p className="text-sm text-muted-foreground">
        Verificando opções de subclasse…
      </p>
    );
  }
  if (gaps.length === 0) return null;

  async function handleSave() {
    setFormError(null);
    setSaving(true);
    try {
      if (!subclassOptionsComplete(optionKeys, subclassOptions)) {
        setFormError("Complete todas as opções de subclasse pendentes.");
        return;
      }
      await patch.mutateAsync({ subclassOptions });
      setDraftOptions(null);
      setGaps([]);
      onResolved?.();
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Erro ao salvar opções",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-3 text-sm">
      <div className="space-y-1">
        <p className="font-medium text-destructive">
          Opções de subclasse incompletas
        </p>
        <p className="text-muted-foreground">
          {blockProgression
            ? "Complete antes de subir de nível."
            : "Escolhas já desbloqueadas na ficha ainda faltam."}
        </p>
        <ul className="list-inside list-disc text-muted-foreground">
          {gaps.map((gap) => (
            <li key={gap.optionKey}>{gap.label}</li>
          ))}
        </ul>
      </div>

      <SubclassOptionsEditor
        character={character}
        optionsLevel={character.level}
        optionKeys={optionKeys}
        value={subclassOptions}
        onChange={setDraftOptions}
      />

      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}

      <Button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving || patch.isPending}
      >
        {saving || patch.isPending ? "Salvando…" : "Salvar opções"}
      </Button>
    </div>
  );
}

export function useHasIncompleteSubclassOptions(character: CharacterDetail) {
  const [hasGaps, setHasGaps] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!character.subclassSlug) {
        if (!cancelled) setHasGaps(false);
        return;
      }
      try {
        const response = await fetchSubclassOptions(
          character.subclassSlug,
          character.level,
        );
        const groups = response.data ?? [];
        const provided = new Set(
          character.subclassOptions
            .filter((option) => option.valueId)
            .map((option) => option.optionKey),
        );
        if (!cancelled) {
          setHasGaps(groups.some((group) => !provided.has(group.optionKey)));
        }
      } catch {
        if (!cancelled) setHasGaps(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [character.level, character.subclassOptions, character.subclassSlug]);

  return hasGaps;
}
