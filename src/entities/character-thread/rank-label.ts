import type { CharacterThreadRank } from "@/entities/character-thread/types";

/** Rótulos PT dos marcos do Character Thread (Northlands). */
export const CHARACTER_THREAD_RANK_LABEL: Record<CharacterThreadRank, string> = {
  least: "Menor",
  lesser: "Inferior",
  greater: "Maior",
  superior: "Superior",
};

export function characterThreadRankLabel(rank: string): string {
  return (
    CHARACTER_THREAD_RANK_LABEL[rank as CharacterThreadRank] ?? rank
  );
}
