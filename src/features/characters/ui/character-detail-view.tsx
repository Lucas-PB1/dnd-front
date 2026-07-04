"use client";

import { CharacterSheetView } from "@/features/character-sheet/ui/character-sheet-view";

type CharacterDetailViewProps = {
  id: string;
};

/** @deprecated Use CharacterSheetView — mantido como alias da rota /characters/[id] */
export function CharacterDetailView({ id }: CharacterDetailViewProps) {
  return <CharacterSheetView id={id} />;
}
