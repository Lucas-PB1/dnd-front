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
} from "@/features/character-sheet/api/character-rolls.api";
import { useGameAuth } from "@/features/character-sheet/api/use-game-auth";

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
    }) => run(rollCharacterAttack, args),
    onSuccess: onResult,
  });

  const damage = useMutation({
    mutationFn: (args: {
      itemSlug: string;
      mode: "melee" | "ranged";
      critical?: boolean;
      grazeMiss?: boolean;
    }) => run(rollCharacterDamage, args),
    onSuccess: onResult,
  });

  const skill = useMutation({
    mutationFn: (args: { skillSlug: string; advantage?: AdvantageMode }) =>
      run(rollCharacterSkill, args),
    onSuccess: onResult,
  });

  const savingThrow = useMutation({
    mutationFn: (args: { abilitySlug: string; advantage?: AdvantageMode }) =>
      run(rollCharacterSavingThrow, args),
    onSuccess: onResult,
  });

  const initiative = useMutation({
    mutationFn: (args: { advantage?: AdvantageMode } = {}) =>
      run(rollCharacterInitiative, args),
    onSuccess: onResult,
  });

  return { attack, damage, skill, savingThrow, initiative };
}
