"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import type { SpawnActorFromTemplatePayload } from "@/entities/actor/types";
import {
  boardCharacterVehicle,
  fetchActorById,
  fetchCharacterActors,
  linkCharacterVehicle,
  spawnActorFromTemplate,
  updateActor,
} from "@/features/catalog/creature-template-catalog/api/creature-templates.api";
import { sessionKeys } from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { useAuth } from "@/features/auth/model";
import { charactersKeys } from "@/features/character/characters/api/characters.api";

export const actorKeys = {
  all: ["actors"] as const,
  detail: (id: string) => [...actorKeys.all, "detail", id] as const,
  byCharacter: (characterId: string) =>
    [...actorKeys.all, "character", characterId] as const,
};

export function useCharacterActors(characterId: string) {
  const { accessToken, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: actorKeys.byCharacter(characterId),
    queryFn: () => {
      if (!accessToken) throw new Error("Não autenticado");
      return fetchCharacterActors(accessToken, characterId);
    },
    enabled: !authLoading && !!accessToken && !!characterId,
  });
}

export function useActorDetail(id: string) {
  const { accessToken, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: actorKeys.detail(id),
    queryFn: () => {
      if (!accessToken) throw new Error("Não autenticado");
      return fetchActorById(accessToken, id);
    },
    enabled: !authLoading && !!accessToken && !!id,
  });
}

export function useSpawnActorFromTemplate(loginNext: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken } = useGameAuth(loginNext);

  return useMutation({
    mutationFn: async (payload: SpawnActorFromTemplatePayload) => {
      if (!accessToken) {
        router.push(`/login?next=${encodeURIComponent(loginNext)}`);
        throw new Error("Faça login para vincular à ficha");
      }
      return spawnActorFromTemplate(accessToken, payload);
    },
    onSuccess: (actor) => {
      if (actor.parentCharacterId) {
        void queryClient.invalidateQueries({
          queryKey: actorKeys.byCharacter(actor.parentCharacterId),
        });
        void queryClient.invalidateQueries({
          queryKey: charactersKeys.detail(actor.parentCharacterId),
        });
      }
    },
  });
}

export function useUpdateActor(actorId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: { hitPointsCurrent?: number | null }) => {
      if (!accessToken) throw new Error("Não autenticado");
      return updateActor(accessToken, actorId, payload);
    },
    onSuccess: (actor) => {
      queryClient.setQueryData(actorKeys.detail(actor.id), actor);
      if (actor.parentCharacterId) {
        void queryClient.invalidateQueries({
          queryKey: actorKeys.byCharacter(actor.parentCharacterId),
        });
      }
    },
  });
}

export function useLinkVehicle(characterId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: {
      itemSlug?: string;
      templateSlug?: string;
    }) => {
      if (!accessToken) throw new Error("Não autenticado");
      return linkCharacterVehicle(accessToken, characterId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: actorKeys.byCharacter(characterId),
      });
      void queryClient.invalidateQueries({
        queryKey: charactersKeys.detail(characterId),
      });
    },
  });
}

export function useBoardVehicle(characterId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: async (actorId: string | null) => {
      if (!accessToken) throw new Error("Não autenticado");
      return boardCharacterVehicle(accessToken, characterId, { actorId });
    },
    onSuccess: (result) => {
      queryClient.setQueryData(
        sessionKeys.state(characterId),
        (prev: { boardedActorId?: string | null } | undefined) =>
          prev ? { ...prev, boardedActorId: result.boardedActorId } : prev,
      );
      void queryClient.invalidateQueries({
        queryKey: sessionKeys.state(characterId),
      });
    },
  });
}
