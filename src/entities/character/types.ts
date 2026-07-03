/** Espelha CharacterResponseDto resumido da dnd-api */
export type CharacterSummary = {
  id: string;
  name: string;
  level: number;
  classSlug: string;
  speciesSlug: string;
  backgroundSlug: string;
  subclassSlug: string | null;
  createdAt: string;
  updatedAt: string;
};
