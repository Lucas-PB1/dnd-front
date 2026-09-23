"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/shared/api/dnd-api/api-error";
import {
  charactersKeys,
  createCharacter,
  deleteCharacter,
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
        if (!input.thread?.threadSlug) {
          return character;
        }

        try {
          await attachCharacterThread(accessToken, character.id, {
            threadSlug: input.thread.threadSlug,
            goalIndex: input.thread.goalIndex,
          });
          return character;
        } catch (attachError) {
          try {
            await deleteCharacter(accessToken, character.id);
          } catch {
            throw new Error(
              "A ficha foi criada, mas a thread não foi anexada. Abra a ficha para anexar a thread ou apague-a e tente de novo.",
            );
          }
          const detail =
            attachError instanceof Error
              ? attachError.message
              : "falha ao anexar a thread";
          throw new Error(
            `Não foi possível anexar a thread (${detail}). Nenhuma ficha foi mantida — tente de novo.`,
          );
        }
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
