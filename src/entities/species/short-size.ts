/**
 * Extrai rótulo curto de tamanho PHB.
 * Ex.: "Médio (cerca de 1,50 m) ou Pequeno (...)" → "Médio ou Pequeno"
 */
export function shortSpeciesSize(size: string): string {
  return size
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*escolhido.*$/i, "")
    .trim();
}
