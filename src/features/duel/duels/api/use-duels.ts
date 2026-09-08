"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/shared/api/dnd-api/api-error";
import { useAuth } from "@/features/auth/model";
import { patchCharacter, charactersKeys } from "@/features/character/characters/api/characters.api";
import { uploadCharacterPortrait } from "@/features/character/characters/api/upload-character-portrait";
import {
  attackInDuel,
  castInDuel,
  changeDuelCondition,
  createDuel,
  duelsKeys,
  fetchDuelById,
  fetchDuels,
  forfeitDuel,
  joinDuel,
  setDuelReady,
} from "@/features/duel/duels/api/duels.api";

function useDuelAuth(nextPath: string) {
  const router = useRouter();
  const { accessToken, isLoading: authLoading } = useAuth();

  const redirectIfUnauthorized = (error: unknown) => {
    if (error instanceof ApiError && error.isUnauthorized) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
    }
  };

  return { accessToken, authLoading, redirectIfUnauthorized, router };
}

export function useDuels() {
  const { accessToken, authLoading, redirectIfUnauthorized } =
    useDuelAuth("/duels");

  return useQuery({
    queryKey: duelsKeys.all,
    queryFn: async () => {
      if (!accessToken) throw new Error("Sessão expirada");
      try {
        return await fetchDuels(accessToken);
      } catch (error) {
        redirectIfUnauthorized(error);
        throw error;
      }
    },
    enabled: !authLoading && !!accessToken,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.isUnauthorized) return false;
      return failureCount < 1;
    },
  });
}

export function useDuel(id: string) {
  const { accessToken, authLoading, redirectIfUnauthorized } = useDuelAuth(
    `/duels/${id}`,
  );

  return useQuery({
    queryKey: duelsKeys.detail(id),
    queryFn: async () => {
      if (!accessToken) throw new Error("Sessão expirada");
      try {
        return await fetchDuelById(accessToken, id);
      } catch (error) {
        redirectIfUnauthorized(error);
        throw error;
      }
    },
    enabled: !authLoading && !!accessToken && !!id,
    refetchInterval: 4000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.isUnauthorized) return false;
      return failureCount < 1;
    },
  });
}

function invalidateDuel(
  queryClient: ReturnType<typeof useQueryClient>,
  duelId: string,
) {
  void queryClient.invalidateQueries({ queryKey: duelsKeys.all });
  void queryClient.invalidateQueries({ queryKey: duelsKeys.detail(duelId) });
}

export function useCreateDuel() {
  const queryClient = useQueryClient();
  const { accessToken, router } = useDuelAuth("/duels");

  return useMutation({
    mutationFn: async (payload: { characterId: string }) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return createDuel(accessToken, payload);
    },
    onSuccess: (duel) => {
      void queryClient.invalidateQueries({ queryKey: duelsKeys.all });
      router.push(`/duels/${duel.id}`);
    },
  });
}

export function useJoinDuel() {
  const queryClient = useQueryClient();
  const { accessToken, router } = useDuelAuth("/duels");

  return useMutation({
    mutationFn: async (payload: {
      inviteCode: string;
      characterId: string;
    }) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return joinDuel(accessToken, payload);
    },
    onSuccess: (duel) => {
      void queryClient.invalidateQueries({ queryKey: duelsKeys.all });
      router.push(`/duels/${duel.id}`);
    },
  });
}

export function useSetDuelReady(duelId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useDuelAuth(`/duels/${duelId}`);

  return useMutation({
    mutationFn: async (ready: boolean) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return setDuelReady(accessToken, duelId, ready);
    },
    onSuccess: () => invalidateDuel(queryClient, duelId),
  });
}

export function useDuelAttack(duelId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useDuelAuth(`/duels/${duelId}`);

  return useMutation({
    mutationFn: async (payload: {
      itemSlug: string;
      mode: "melee" | "ranged";
    }) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return attackInDuel(accessToken, duelId, payload);
    },
    onSuccess: () => invalidateDuel(queryClient, duelId),
  });
}

export function useDuelCast(duelId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useDuelAuth(`/duels/${duelId}`);

  return useMutation({
    mutationFn: async (payload: { spellSlug: string; slotLevel?: number }) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return castInDuel(accessToken, duelId, payload);
    },
    onSuccess: () => invalidateDuel(queryClient, duelId),
  });
}

export function useDuelCondition(duelId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useDuelAuth(`/duels/${duelId}`);

  return useMutation({
    mutationFn: async (payload: {
      action: "add" | "remove";
      target: "self" | "opponent";
      condition: string;
    }) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return changeDuelCondition(accessToken, duelId, payload);
    },
    onSuccess: () => invalidateDuel(queryClient, duelId),
  });
}

export function useForfeitDuel(duelId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useDuelAuth(`/duels/${duelId}`);

  return useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Sessão expirada");
      return forfeitDuel(accessToken, duelId);
    },
    onSuccess: () => invalidateDuel(queryClient, duelId),
  });
}

export function useUploadDuelPortrait(duelId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { accessToken } = useDuelAuth(`/duels/${duelId}`);

  return useMutation({
    mutationFn: async (input: { characterId: string; file: File }) => {
      if (!accessToken || !user?.id) throw new Error("Sessão expirada");
      const portraitUrl = await uploadCharacterPortrait(
        user.id,
        input.characterId,
        input.file,
      );
      await patchCharacter(accessToken, input.characterId, { portraitUrl });
      return portraitUrl;
    },
    onSuccess: (_url, input) => {
      invalidateDuel(queryClient, duelId);
      void queryClient.invalidateQueries({ queryKey: charactersKeys.all });
      void queryClient.invalidateQueries({
        queryKey: charactersKeys.detail(input.characterId),
      });
    },
  });
}
