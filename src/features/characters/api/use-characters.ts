"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/shared/api/dnd-api/api-error";
import {
  charactersKeys,
  fetchCharacters,
} from "@/features/characters/api/characters.api";
import { useAuth } from "@/features/auth/model/use-auth";

export function useCharacters() {
  const router = useRouter();
  const { accessToken, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: charactersKeys.all,
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Sessão expirada");
      }

      try {
        return await fetchCharacters(accessToken);
      } catch (error) {
        if (error instanceof ApiError && error.isUnauthorized) {
          router.push("/login?next=/characters");
        }
        throw error;
      }
    },
    enabled: !authLoading && !!accessToken,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.isUnauthorized) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
