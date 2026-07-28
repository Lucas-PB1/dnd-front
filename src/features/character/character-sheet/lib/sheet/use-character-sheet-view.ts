"use client";

import { useCallback, useState } from "react";

import { useCharacterDetail } from "@/features/character/characters/api/use-character-detail";
import { useCharacterCatalogLabels } from "@/features/character/character-sheet/api/use-character-catalog-labels";
import type { SheetEditId } from "@/features/character/character-sheet/lib/edit/sheet-edit-types";
import { useSkills } from "@/features/catalog/reference-catalog/api/use-reference";

export function useCharacterSheetView(id: string) {
  const { data, isPending, isError, error } = useCharacterDetail(id);
  const labels = useCharacterCatalogLabels(data);
  const skillsQuery = useSkills();
  const [editing, setEditing] = useState<SheetEditId>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
