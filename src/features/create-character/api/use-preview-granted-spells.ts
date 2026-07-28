"use client";

import { useQuery } from "@tanstack/react-query";

import {
  charactersKeys,
  previewGrantedSpells,
  type PreviewGrantedSpellsPayload,
} from "@/features/characters/api/characters.api";
import { useAuth } from "@/features/auth/model/use-auth";

export function usePreviewGrantedSpells(
  payload: PreviewGrantedSpellsPayload | null,
  enabled = true,
) {
  const { accessToken, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: charactersKeys.grantedPreview(payload ?? { speciesSlug: "" }),
    queryFn: async () => {
      if (!accessToken || !payload) {
        throw new Error("Sessão ou payload inválido");
      }
      return previewGrantedSpells(accessToken, payload);
    },
    enabled: enabled && !authLoading && !!accessToken && !!payload?.speciesSlug,
    staleTime: 30_000,
  });
}
