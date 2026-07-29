import { asiFeatSlotsToCharacterFeats } from "@/features/character/create-character/lib/feats/asi-feat-slots-to-feats";
import { resolveCreateCharacterFeats } from "@/features/character/create-character/lib/feats/preview-create-character-feats";

/**
 * Talentos já garantidos fora da escolha de espécie (antecedente + marcos ASI).
 * A seleção atual fica de fora para não sumir do próprio campo.
 */
export function featSlugsGrantedOutsideSpecies(args: {
  backgroundOriginFeatSlug: string | null | undefined;
  asiFeatSlotSlugs: string[];
  selectedOriginFeatSlug?: string;
}): Set<string> {
  const granted = resolveCreateCharacterFeats(
    args.backgroundOriginFeatSlug ?? null,
    asiFeatSlotsToCharacterFeats(args.asiFeatSlotSlugs),
  );

  return new Set(
    granted
      .map((feat) => feat.featSlug)
      .filter((slug) => slug !== args.selectedOriginFeatSlug),
  );
}
