"use client";

import { useEffect, useMemo, useState } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import type { FeatOption } from "@/entities/character/sheet-types";
import { featInstanceKey } from "@/entities/character/lib/character-feat";
import {
  listIncompleteFeatOptionGaps,
  type IncompleteFeatOptionGap,
} from "@/features/character/create-character/lib/feats/validate-create-feat-options";
import { usePatchCharacter } from "@/features/character/character-sheet/api/use-patch-character";
import { FeatOptionsEditor } from "@/features/catalog/feat-catalog/ui/options/feat-options-editor";
import { useFeats } from "@/features/catalog/reference-catalog/api/use-reference";
import { ApiError } from "@/shared/api/dnd-api/api-error";
import { Button } from "@/shared/ui/button";

type IncompleteFeatOptionsFixPanelProps = {
  character: CharacterDetail;
  /** Quando true, bloqueia progressão até corrigir. */
  blockProgression?: boolean;
  onResolved?: () => void;
};

export function IncompleteFeatOptionsFixPanel({
  character,
  blockProgression = false,
  onResolved,
}: IncompleteFeatOptionsFixPanelProps) {
  const feats = useFeats();
  const patch = usePatchCharacter(character.id);
  const [gaps, setGaps] = useState<IncompleteFeatOptionGap[] | null>(null);
  const [draftOptions, setDraftOptions] = useState<FeatOption[] | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const featOptions = draftOptions ?? character.featOptions;

  const featNameBySlug = useMemo(
    () =>
      Object.fromEntries(
        (feats.data?.data ?? []).map((feat) => [feat.slug, feat.name]),
      ),
    [feats.data?.data],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next = await listIncompleteFeatOptionGaps(
        character.characterFeats,
        character.featOptions,
        featNameBySlug,
        character.level,
      );
      if (!cancelled) setGaps(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    character.characterFeats,
    character.featOptions,
    character.level,
    featNameBySlug,
  ]);

  const incompleteFeats = useMemo(() => {
    if (!gaps?.length) return [];
    const keys = new Set(
      gaps.map((gap) => featInstanceKey(gap.featSlug, gap.instanceIndex)),
    );
    return character.characterFeats.filter((feat) =>
      keys.has(featInstanceKey(feat.featSlug, feat.instanceIndex)),
    );
  }, [character.characterFeats, gaps]);

  if (gaps === null) {
    return (
      <p className="text-sm text-muted-foreground">
        Verificando escolhas de talentos…
      </p>
    );
  }

  if (gaps.length === 0) return null;

  async function handleSave() {
    setFormError(null);
    setSaving(true);
    try {
      const stillMissing = await listIncompleteFeatOptionGaps(
        character.characterFeats,
        featOptions,
        featNameBySlug,
        character.level,
      );
      if (stillMissing.length > 0) {
        const first = stillMissing[0];
        setFormError(
          `Ainda faltam em ${first.featName}: ${first.missingLabels.join(", ")}.`,
        );
        return;
      }
      await patch.mutateAsync({
        characterFeats: character.characterFeats,
        featOptions,
      });
      setDraftOptions(null);
      setGaps([]);
      onResolved?.();
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Erro ao salvar escolhas",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-3 text-sm">
      <div className="space-y-1">
        <p className="font-medium text-destructive">
          Escolhas de talento incompletas
        </p>
        <p className="text-muted-foreground">
          {blockProgression
            ? "Complete antes de subir de nível."
            : "Talentos já na ficha precisam dessas escolhas."}
        </p>
        <ul className="list-inside list-disc text-muted-foreground">
          {gaps.map((gap) => (
            <li key={featInstanceKey(gap.featSlug, gap.instanceIndex)}>
              <span className="font-medium text-foreground">{gap.featName}</span>
              : {gap.missingLabels.join(", ")}
            </li>
          ))}
        </ul>
      </div>

      <FeatOptionsEditor
        characterFeats={incompleteFeats}
        featNameBySlug={featNameBySlug}
        value={featOptions}
        characterLevel={character.level}
        classSlug={character.classSlug}
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
        {saving || patch.isPending ? "Salvando…" : "Salvar escolhas"}
      </Button>
    </div>
  );
}

/** Hook leve para o footer de level-up saber se ainda há lacunas. */
export function useHasIncompleteFeatOptions(character: CharacterDetail) {
  const feats = useFeats();
  const [hasGaps, setHasGaps] = useState(false);

  const featNameBySlug = useMemo(
    () =>
      Object.fromEntries(
        (feats.data?.data ?? []).map((feat) => [feat.slug, feat.name]),
      ),
    [feats.data?.data],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const gaps = await listIncompleteFeatOptionGaps(
        character.characterFeats,
        character.featOptions,
        featNameBySlug,
        character.level,
      );
      if (!cancelled) setHasGaps(gaps.length > 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    character.characterFeats,
    character.featOptions,
    character.level,
    featNameBySlug,
  ]);

  return hasGaps;
}
