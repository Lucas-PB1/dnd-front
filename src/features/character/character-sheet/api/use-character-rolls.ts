"use client";

import { useMutation } from "@tanstack/react-query";

import {
  rollCharacterAttack,
  rollCharacterDamage,
  rollCharacterInitiative,
  rollCharacterSavingThrow,
  rollCharacterSkill,
  type CharacterRollResult,
  type RollAttackPayload,
  type RollDamagePayload,
  type RollInitiativePayload,
  type RollSavingThrowPayload,
  type RollSkillPayload,
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
    mutationFn: (args: RollAttackPayload) => run(rollCharacterAttack, args),
    onSuccess: onResult,
  });

  const damage = useMutation({
    mutationFn: (args: RollDamagePayload) => run(rollCharacterDamage, args),
    onSuccess: onResult,
  });

  const skill = useMutation({
    mutationFn: (args: RollSkillPayload) => run(rollCharacterSkill, args),
    onSuccess: onResult,
  });

  const savingThrow = useMutation({
    mutationFn: (args: RollSavingThrowPayload) =>
      run(rollCharacterSavingThrow, args),
    onSuccess: onResult,
  });

  const initiative = useMutation({
    mutationFn: (args: RollInitiativePayload = {}) =>
      run(rollCharacterInitiative, args),
    onSuccess: onResult,
  });

  return { attack, damage, skill, savingThrow, initiative };
}
