export type OriginOption = {
  id: string;
  name: string;
};

/** Livro do Jogador 2024 (PT-BR) — Cap. 4: Espécies */
export const PHB_2024_SPECIES = [
  { id: "aasimar", name: "Aasimar" },
  { id: "dwarf", name: "Anão" },
  { id: "dragonborn", name: "Draconato" },
  { id: "elf", name: "Elfo" },
  { id: "gnome", name: "Gnomo" },
  { id: "goliath", name: "Golias" },
  { id: "human", name: "Humano" },
  { id: "orc", name: "Orc" },
  { id: "halfling", name: "Pequenino" },
  { id: "tiefling", name: "Tiferino" },
] as const satisfies ReadonlyArray<OriginOption>;

export type CharacterSpeciesId = (typeof PHB_2024_SPECIES)[number]["id"];

/** Livro do Jogador 2024 (PT-BR) — Cap. 4: Antecedentes */
export const PHB_2024_BACKGROUNDS = [
  { id: "acolyte", name: "Acólito" },
  { id: "wanderer", name: "Andarilho" },
  { id: "artisan", name: "Artesão" },
  { id: "entertainer", name: "Artista" },
  { id: "charlatan", name: "Charlatão" },
  { id: "criminal", name: "Criminoso" },
  { id: "hermit", name: "Eremita" },
  { id: "scribe", name: "Escriba" },
  { id: "farmer", name: "Fazendeiro" },
  { id: "guard", name: "Guarda" },
  { id: "guide", name: "Guia" },
  { id: "sailor", name: "Marinheiro" },
  { id: "merchant", name: "Mercador" },
  { id: "noble", name: "Nobre" },
  { id: "sage", name: "Sábio" },
  { id: "soldier", name: "Soldado" },
] as const satisfies ReadonlyArray<OriginOption>;

export type CharacterBackgroundId = (typeof PHB_2024_BACKGROUNDS)[number]["id"];

/** Alinhamentos clássicos para a ficha */
export const CHARACTER_ALIGNMENTS = [
  { id: "lg", name: "Leal e Bom" },
  { id: "ng", name: "Neutro e Bom" },
  { id: "cg", name: "Caótico e Bom" },
  { id: "ln", name: "Leal e Neutro" },
  { id: "n", name: "Neutro" },
  { id: "cn", name: "Caótico e Neutro" },
  { id: "le", name: "Leal e Mau" },
  { id: "ne", name: "Neutro e Mau" },
  { id: "ce", name: "Caótico e Mau" },
] as const satisfies ReadonlyArray<OriginOption>;

export function findSpeciesName(speciesId: string): string {
  return (
    PHB_2024_SPECIES.find((species) => species.id === speciesId)?.name ??
    speciesId
  );
}

export function findBackgroundName(backgroundId: string): string {
  return (
    PHB_2024_BACKGROUNDS.find((background) => background.id === backgroundId)
      ?.name ?? backgroundId
  );
}

export function findAlignmentName(alignmentId: string): string {
  return (
    CHARACTER_ALIGNMENTS.find((alignment) => alignment.id === alignmentId)
      ?.name ?? alignmentId
  );
}
