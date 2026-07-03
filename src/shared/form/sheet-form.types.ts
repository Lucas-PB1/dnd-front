import type { UseFormSetValue, UseFormWatch } from "react-hook-form";

import type { CharacterSheet } from "@/features/character-sheet/model/character-sheet.schema";

export type SetCharacterSheetValue = UseFormSetValue<CharacterSheet>;
export type WatchCharacterSheet = UseFormWatch<CharacterSheet>;
