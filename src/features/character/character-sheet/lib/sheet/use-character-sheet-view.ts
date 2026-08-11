"use client";

import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { CharacterSummary } from "@/entities/character/types";
import { useCharacterDetail } from "@/features/character/characters/api/use-character-detail";
import { charactersKeys } from "@/features/character/characters/api/characters.api";
import { useCharacterCatalogLabels } from "@/features/character/character-sheet/api/use-character-catalog-labels";
import { useWarmCharacterSheetQueries } from "@/features/character/character-sheet/api/use-prefetch-character-sheet";
import type { SheetEditId } from "@/features/character/character-sheet/lib/edit/sheet-edit-types";
import { useSkills } from "@/features/catalog/reference-catalog/api/use-reference";

export function useCharacterSheetView(id: string) {
  useWarmCharacterSheetQueries(id);

  const { data, isPending, isError, error } = useCharacterDetail(id);
  const labels = useCharacterCatalogLabels(data);
  const skillsQuery = useSkills();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<SheetEditId>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const listSummary = useMemo(() => {
    const list = queryClient.getQueryData<CharacterSummary[]>(
      charactersKeys.all,
    );
    return list?.find((row) => row.id === id) ?? null;
  }, [id, queryClient]);

  const closeEdit = useCallback(() => setEditing(null), []);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const languageNames =
    data?.languageSlugs.map((slug) => labels.resolveLanguage(slug)) ?? [];

  const sectionProps = data ? { character: data, labels } : null;

  const editForms = data
    ? {
        character: data,
        onSuccess: closeEdit,
        onCancel: closeEdit,
      }
    : null;

  return {
    data,
    labels,
    skillsQuery,
    isPending,
    isError,
    error,
    listSummary,
    editing,
    setEditing,
    closeEdit,
    settingsOpen,
    openSettings,
    closeSettings,
    languageNames,
    sectionProps,
    editForms,
  };
}
