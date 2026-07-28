"use client";

import { useEffect } from "react";
import type { UseFormSetValue } from "react-hook-form";

import type { CharacterFeat } from "@/entities/character/sheet-types";
import { isSubclassRequired } from "@/entities/character/lib/subclass";
import { usePreviewGrantedSpells } from "@/features/create-character/api/use-preview-granted-spells";
import type { CreateCharacterInput } from "@/features/create-character/model/create-character.schema";

type SyncGrantedSpellsInput = {
  speciesSlug: string;
  level: number;
  subclassSlug: string;
  speciesChoices: CreateCharacterInput["speciesChoices"];
  featOptions: CreateCharacterInput["featOptions"];
  characterFeats: CharacterFeat[];
  characterSpells: CreateCharacterInput["characterSpells"];
  playerPickedSpells: CreateCharacterInput["characterSpells"];
  setValue: UseFormSetValue<CreateCharacterInput>;
};

/** Mantém magias always_prepared sincronizadas com o preview da API. */
export function useSyncGrantedSpells({
  speciesSlug,
  level,
  subclassSlug,
  speciesChoices,
  featOptions,
  characterFeats,
  characterSpells,
  playerPickedSpells,
  setValue,
}: SyncGrantedSpellsInput) {
  const grantedPreview = usePreviewGrantedSpells(
    speciesSlug
      ? {
          speciesSlug,
          level,
          subclassSlug:
            isSubclassRequired(level) && subclassSlug
              ? subclassSlug
              : undefined,
          speciesChoices,
          featOptions,
          characterFeats,
          characterSpells: playerPickedSpells,
        }
      : null,
    !!speciesSlug,
  );

  useEffect(() => {
    const granted = grantedPreview.data?.grantedOnly;
    if (!granted) return;

    const nextGrantedKey = granted
      .map((spell) => spell.spellSlug)
      .sort()
      .join("|");
    const currentGrantedKey = (characterSpells ?? [])
      .filter((spell) => spell.listType === "always_prepared")
      .map((spell) => spell.spellSlug)
      .sort()
      .join("|");
    if (nextGrantedKey === currentGrantedKey) return;

    setValue("characterSpells", [
      ...playerPickedSpells,
      ...granted.map((spell) => ({
        spellSlug: spell.spellSlug,
        listType: "always_prepared" as const,
      })),
    ]);
  }, [grantedPreview.data, characterSpells, playerPickedSpells, setValue]);
}
