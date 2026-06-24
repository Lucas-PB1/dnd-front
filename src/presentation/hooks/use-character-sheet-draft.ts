"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { UseFormReset } from "react-hook-form";

import {
  characterSheetSchema,
  type CharacterSheet,
} from "@/application/character-sheet/character-sheet.schema";

const STORAGE_KEY = "dnd:character-sheet-draft";

function subscribeToClientMount() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function clearCharacterSheetDraft() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function readDraftFromStorage(): CharacterSheet | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return characterSheetSchema.parse(JSON.parse(raw));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function useIsClient() {
  return useSyncExternalStore(
    subscribeToClientMount,
    getClientSnapshot,
    getServerSnapshot,
  );
}

export function useCharacterSheetDraft(
  reset: UseFormReset<CharacterSheet>,
  sheet: CharacterSheet,
  enabled: boolean,
) {
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const draft = readDraftFromStorage();

    if (draft) {
      reset(draft);
    }
  }, [enabled, reset]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sheet));
      setLastSavedAt(new Date());
    }, 500);

    return () => clearTimeout(timer);
  }, [enabled, sheet]);

  return { lastSavedAt };
}
