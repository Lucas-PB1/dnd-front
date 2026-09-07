"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import { sessionKeys } from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";

export function useCharacterRolls(
  characterId: string,
  onResult: (result: CharacterRollResult) => void,
) {
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/characters/${characterId}`,
  );
  const queryClient = useQueryClient();

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

  function invalidateStateIfInspiration(spent?: boolean) {
    if (!spent) return;
    void queryClient.invalidateQueries({
      queryKey: sessionKeys.state(characterId),
    });
  }

  const attack = useMutation({
    mutationFn: (args: RollAttackPayload) => run(rollCharacterAttack, args),
    onSuccess: (result, vars) => {
      if (result) onResult(result);
      invalidateStateIfInspiration(vars.spentInspiration);
    },
  });

  const damage = useMutation({
    mutationFn: (args: RollDamagePayload) => run(rollCharacterDamage, args),
    onSuccess: (result) => {
      if (result) onResult(result);
    },
  });

  const skill = useMutation({
    mutationFn: (args: RollSkillPayload) => run(rollCharacterSkill, args),
    onSuccess: (result, vars) => {
      if (result) onResult(result);
      invalidateStateIfInspiration(vars.spentInspiration);
    },
  });

  const savingThrow = useMutation({
    mutationFn: (args: RollSavingThrowPayload) =>
      run(rollCharacterSavingThrow, args),
    onSuccess: (result, vars) => {
      if (result) onResult(result);
      invalidateStateIfInspiration(vars.spentInspiration);
    },
  });

  const initiative = useMutation({
    mutationFn: (args: RollInitiativePayload = {}) =>
      run(rollCharacterInitiative, args),
    onSuccess: (result) => {
      if (result) onResult(result);
    },
  });

  return { attack, damage, skill, savingThrow, initiative };
}
