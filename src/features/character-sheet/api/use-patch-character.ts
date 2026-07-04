"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import type { UpdateCharacterPayload } from "@/entities/character/types";
import { ApiError } from "@/shared/api/dnd-api/api-error";
import {
  charactersKeys,
  patchCharacter,
} from "@/features/characters/api/characters.api";
import { useAuth } from "@/features/auth/model/use-auth";

export function usePatchCharacter(characterId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: UpdateCharacterPayload) => {
      if (!accessToken) {
        throw new Error("Faça login para editar a ficha");
      }

      try {
        return await patchCharacter(accessToken, characterId, payload);
      } catch (error) {
        if (error instanceof ApiError && error.isUnauthorized) {
          router.push(`/login?next=/characters/${characterId}`);
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(charactersKeys.detail(characterId), data);
      queryClient.invalidateQueries({ queryKey: charactersKeys.all });
    },
  });
}
