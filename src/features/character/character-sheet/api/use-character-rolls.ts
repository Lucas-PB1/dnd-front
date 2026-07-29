"use client";

import { useMutation } from "@tanstack/react-query";

import {
  rollCharacterAttack,
  rollCharacterDamage,
  rollCharacterInitiative,
  rollCharacterSavingThrow,
  rollCharacterSkill,
  type AdvantageMode,
  type CharacterRollResult,
} from "@/features/character/character-sheet/api/character-rolls.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";

export function useCharacterRolls(
  characterId: string,
  onResult: (result: CharacterRollResult) => void,
) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );

  async function run<T>(
    fn: (token: string, id: string, args: T) => Promise<CharacterRollResult>,
    args: T,
  ) {
    const token = requireToken();
    try {
      return await fn(token, characterId, args);
    } catch (error) {
      return handleUnauthorized(error);
    }
  }

  const attack = useMutation({
    mutationFn: (args: {
      itemSlug: string;
      mode: "melee" | "ranged";
      advantage?: AdvantageMode;
      automatic?: boolean;
      studiedAttack?: boolean;
      doorKick?: boolean;
      steadyAim?: boolean;
      strokeOfLuck?: boolean;
      assassinate?: boolean;
    }) => run(rollCharacterAttack, args),
    onSuccess: onResult,
  });

  const damage = useMutation({
    mutationFn: (args: {
      itemSlug: string;
      mode: "melee" | "ranged";
      critical?: boolean;
      grazeMiss?: boolean;
      headShot?: boolean;
      sightedReroll?: boolean;
      brutalStrike?: boolean;
      divineFury?: boolean;
      psiStrike?: boolean;
      monsterSlayer?: boolean;
      sneakAttack?: boolean;
      cunningStrikeEffects?: string[];
      poisonousSneak?: boolean;
      assassinSurprise?: boolean;
      assassinDeathStrike?: boolean;
      assassinPoisonFailedSave?: boolean;
      divineSmite?: boolean;
      smiteSlotLevel?: number;
      smiteVsUndeadOrFiend?: boolean;
    }) => run(rollCharacterDamage, args),
    onSuccess: onResult,
  });

  const skill = useMutation({
    mutationFn: (args: {
      skillSlug: string;
      advantage?: AdvantageMode;
      strokeOfLuck?: boolean;
    }) =>
      run(rollCharacterSkill, args),
    onSuccess: onResult,
  });

  const savingThrow = useMutation({
    mutationFn: (args: {
      abilitySlug: string;
      advantage?: AdvantageMode;
      indomitable?: boolean;
      strokeOfLuck?: boolean;
    }) =>
      run(rollCharacterSavingThrow, args),
    onSuccess: onResult,
  });

  const initiative = useMutation({
    mutationFn: (args: {
      advantage?: AdvantageMode;
      strokeOfLuck?: boolean;
    } = {}) =>
      run(rollCharacterInitiative, args),
    onSuccess: onResult,
  });

  return { attack, damage, skill, savingThrow, initiative };
}
