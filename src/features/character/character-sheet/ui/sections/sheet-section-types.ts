import type { CharacterDetail } from "@/entities/character/types";
import type { CharacterCatalogLabels } from "@/features/character/character-sheet/api/use-character-catalog-labels";

export type SheetReadSectionProps = {
  character: CharacterDetail;
  labels: CharacterCatalogLabels;
};
