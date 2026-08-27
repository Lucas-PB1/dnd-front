"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/shared/api/dnd-api/api-error";
import {
  charactersKeys,
  createCharacter,
} from "@/features/character/characters/api/characters.api";
import { attachCharacterThread } from "@/features/character/character-sheet/api/character-thread.api";
import type { CreateCharacterPayload } from "@/entities/character/types";
import { useAuth } from "@/features/auth/model";

export type CreateCharacterMutationInput = {
  payload: CreateCharacterPayload;
  thread?: {
    threadSlug: string;
    goalIndex?: number;
  };
};

export function useCreateCharacter() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateCharacterMutationInput) => {
      if (!accessToken) {
        throw new Error("Faça login para criar uma ficha");
      }

      try {
        const character = await createCharacter(accessToken, input.payload);
        if (input.thread?.threadSlug) {
          await attachCharacterThread(accessToken, character.id, {
            threadSlug: input.thread.threadSlug,
            goalIndex: input.thread.goalIndex,
          });
        }
        return character;
      } catch (error) {
        if (error instanceof ApiError && error.isUnauthorized) {
          router.push("/login?next=/characters/new");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: charactersKeys.all });
      router.push("/characters");
    },
  });
}
