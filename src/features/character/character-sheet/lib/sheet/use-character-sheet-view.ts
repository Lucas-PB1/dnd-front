"use client";

import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { CharacterSummary } from "@/entities/character/types";
import { useCharacterDetail } from "@/features/character/characters/api/use-character-detail";
import { charactersKeys } from "@/features/character/characters/api/characters.api";
import { useCharacterCatalogLabels } from "@/features/character/character-sheet/api/use-character-catalog-labels";
import { useWarmCharacterSheetQueries } from "@/features/character/character-sheet/api/use-prefetch-character-sheet";
import type { SheetEditId } from "@/features/character/character-sheet/lib/edit/sheet-edit-types";
import type { CharacterSheetPageSectionId } from "@/features/character/character-sheet/ui/sheet/character-sheet-tab-panels";

export function useCharacterSheetView(id: string) {
  useWarmCharacterSheetQueries(id);

  const { data, isPending, isError, error } = useCharacterDetail(id);
  const [activeSection, setActiveSection] =
    useState<CharacterSheetPageSectionId>("actions");
  const [editing, setEditing] = useState<SheetEditId>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const labels = useCharacterCatalogLabels(data, {
    loadSpellLabels:
      activeSection === "spells" ||
      activeSection === "inventory" ||
      editing === "spells",
    loadFeatLabels: activeSection === "features" || editing === "feats",
    loadAlignments: settingsOpen,
  });

  const queryClient = useQueryClient();

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
    skillsQuery: labels.skillsQuery,
    isPending,
    isError,
    error,
    listSummary,
    activeSection,
    setActiveSection,
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
