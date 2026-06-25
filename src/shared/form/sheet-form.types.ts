import type { UseFormSetValue, UseFormWatch } from "react-hook-form";

import type { CharacterSheet } from "@/application/character-sheet/character-sheet.schema";

export type SetCharacterSheetValue = UseFormSetValue<CharacterSheet>;
export type WatchCharacterSheet = UseFormWatch<CharacterSheet>;
