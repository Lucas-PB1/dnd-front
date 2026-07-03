"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/shared/api/dnd-api/api-error";
import {
  charactersKeys,
  fetchCharacterById,
} from "@/features/characters/api/characters.api";
import { useAuth } from "@/features/auth/model/use-auth";

export function useCharacterDetail(id: string) {
  const router = useRouter();
  const { accessToken, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: charactersKeys.detail(id),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Sessão expirada");
      }

      try {
        return await fetchCharacterById(accessToken, id);
      } catch (error) {
        if (error instanceof ApiError && error.isUnauthorized) {
          router.push(`/login?next=/characters/${id}`);
        }
        throw error;
      }
    },
    enabled: !authLoading && !!accessToken && !!id,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.isUnauthorized) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
