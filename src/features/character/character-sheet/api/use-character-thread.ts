"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CharacterThreadRank } from "@/entities/character-thread/types";
import { useAuth } from "@/features/auth/model";
import { charactersKeys } from "@/features/character/characters/api/characters.api";
import {
  abandonCharacterThread,
  attachCharacterThread,
  completeCharacterThread,
  reachCharacterThreadMilestone,
  setCharacterThreadGoal,
} from "./character-thread.api";

function useInvalidateCharacter(characterId: string) {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: charactersKeys.detail(characterId),
    });
}

export function useAttachCharacterThread(characterId: string) {
  const { accessToken } = useAuth();
  const invalidate = useInvalidateCharacter(characterId);
  return useMutation({
    mutationFn: async (payload: {
      threadSlug: string;
      goalIndex?: number;
      goalText?: string;
    }) => {
      if (!accessToken) throw new Error("Faça login");
      return attachCharacterThread(accessToken, characterId, payload);
    },
    onSuccess: invalidate,
  });
}

export function useSetCharacterThreadGoal(characterId: string) {
  const { accessToken } = useAuth();
  const invalidate = useInvalidateCharacter(characterId);
  return useMutation({
    mutationFn: async (payload: {
      goalIndex?: number | null;
      goalText?: string | null;
    }) => {
      if (!accessToken) throw new Error("Faça login");
      return setCharacterThreadGoal(accessToken, characterId, payload);
    },
    onSuccess: invalidate,
  });
}

export function useReachCharacterThreadMilestone(characterId: string) {
  const { accessToken } = useAuth();
  const invalidate = useInvalidateCharacter(characterId);
  return useMutation({
    mutationFn: async (payload: {
      rank: CharacterThreadRank;
      benefitKeys?: string[];
    }) => {
      if (!accessToken) throw new Error("Faça login");
      return reachCharacterThreadMilestone(accessToken, characterId, payload);
    },
    onSuccess: invalidate,
  });
}

export function useCompleteCharacterThread(characterId: string) {
  const { accessToken } = useAuth();
  const invalidate = useInvalidateCharacter(characterId);
  return useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Faça login");
      return completeCharacterThread(accessToken, characterId);
    },
    onSuccess: invalidate,
  });
}

export function useAbandonCharacterThread(characterId: string) {
  const { accessToken } = useAuth();
  const invalidate = useInvalidateCharacter(characterId);
  return useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Faça login");
      return abandonCharacterThread(accessToken, characterId);
    },
    onSuccess: invalidate,
  });
}
