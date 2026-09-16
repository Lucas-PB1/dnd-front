"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import type {
  ActorDetail,
  ActorLiveState,
  CreateActorPayload,
  SpawnActorFromTemplatePayload,
} from "@/entities/actor/types";
import {
  createActor,
  deleteActor,
  fetchActorState,
  fetchActors,
} from "@/features/actor/api/actors.api";
import {
  boardCharacterVehicle,
  fetchActorById,
  fetchCharacterActors,
  linkCharacterVehicle,
  patchActorState,
  spawnActorFromTemplate,
  updateActor,
  type ActorStatePatchPayload,
} from "@/features/catalog/creature-template-catalog/api/creature-templates.api";
import { sessionKeys } from "@/features/character/character-sheet/api/character-session.api";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { useAuth } from "@/features/auth/model";
import { CHARACTER_STATE_STALE_MS } from "@/features/character/characters/api/character-query";
import { charactersKeys } from "@/features/character/characters/api/characters.api";

export const actorKeys = {
  all: ["actors"] as const,
  list: () => [...actorKeys.all, "list"] as const,
  detail: (id: string) => [...actorKeys.all, "detail", id] as const,
  byCharacter: (characterId: string) =>
    [...actorKeys.all, "character", characterId] as const,
  state: (id: string) => [...actorKeys.all, "state", id] as const,
};

function invalidateActorCaches(
  queryClient: QueryClient,
  actor: Pick<ActorDetail, "parentCharacterId">,
) {
  void queryClient.invalidateQueries({ queryKey: actorKeys.list() });
  if (!actor.parentCharacterId) return;
  void queryClient.invalidateQueries({
    queryKey: actorKeys.byCharacter(actor.parentCharacterId),
  });
  void queryClient.invalidateQueries({
    queryKey: charactersKeys.detail(actor.parentCharacterId),
  });
}

export function useActors() {
  const { accessToken, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: actorKeys.list(),
    queryFn: () => {
      if (!accessToken) throw new Error("Não autenticado");
      return fetchActors(accessToken);
    },
    enabled: !authLoading && !!accessToken,
  });
}

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

export function useActorState(actorId: string) {
  const { accessToken, handleUnauthorized } = useGameAuth(
    `/actors/${actorId}`,
  );

  return useQuery({
    queryKey: actorKeys.state(actorId),
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Faça login para ver o estado do actor");
      }
      try {
        return await fetchActorState(accessToken, actorId);
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    enabled: !!accessToken && !!actorId,
    staleTime: CHARACTER_STATE_STALE_MS,
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
      invalidateActorCaches(queryClient, actor);
    },
  });
}

export function useCreateActor() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: CreateActorPayload) => {
      if (!accessToken) throw new Error("Não autenticado");
      return createActor(accessToken, payload);
    },
    onSuccess: (actor) => {
      queryClient.setQueryData(actorKeys.detail(actor.id), actor);
      invalidateActorCaches(queryClient, actor);
    },
  });
}

export function useDeleteActor(actorId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/actors/${actorId}`,
  );

  return useMutation({
    mutationFn: async () => {
      try {
        await deleteActor(
          requireToken("Faça login para excluir o actor"),
          actorId,
        );
      } catch (error) {
        return handleUnauthorized(error);
      }
    },
    onSuccess: () => {
      const detail = queryClient.getQueryData<ActorDetail>(
        actorKeys.detail(actorId),
      );
      queryClient.removeQueries({ queryKey: actorKeys.detail(actorId) });
      queryClient.removeQueries({ queryKey: actorKeys.state(actorId) });
      invalidateActorCaches(queryClient, {
        parentCharacterId: detail?.parentCharacterId ?? null,
      });
      if (detail?.parentCharacterId) {
        router.push(`/characters/${detail.parentCharacterId}`);
        return;
      }
      router.push("/characters");
    },
  });
}

export function useUpdateActor(actorId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: {
      hitPointsCurrent?: number | null;
      hitPointsMax?: number | null;
      armorClass?: number | null;
      notes?: string | null;
    }) => {
      if (!accessToken) throw new Error("Não autenticado");
      return updateActor(accessToken, actorId, payload);
    },
    onSuccess: (actor) => {
      queryClient.setQueryData(actorKeys.detail(actor.id), actor);
      invalidateActorCaches(queryClient, actor);
    },
  });
}

export function usePatchActorState(actorId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: ActorStatePatchPayload) => {
      if (!accessToken) throw new Error("Não autenticado");
      return patchActorState(accessToken, actorId, payload);
    },
    onSuccess: (state) => {
      queryClient.setQueryData(
        actorKeys.state(state.actorId),
        (prev: ActorLiveState | undefined) =>
          prev ? { ...prev, ...state } : (state as ActorLiveState),
      );
      queryClient.setQueryData(
        actorKeys.detail(state.actorId),
        (prev: ActorDetail | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            hitPointsCurrent: state.hitPointsCurrent,
            hitPointsMax: state.hitPointsMax,
            armorClass: state.armorClass,
            state: prev.state
              ? {
                  ...prev.state,
                  tempHp: state.tempHp,
                  conditions: state.conditions,
                  concentratingOn: state.concentratingOn,
                  innateSpellUses: state.innateSpellUses,
                }
              : {
                  conditions: state.conditions,
                  tempHp: state.tempHp,
                  concentratingOn: state.concentratingOn,
                  innateSpellUses: state.innateSpellUses,
                },
          };
        },
      );
      const detail = queryClient.getQueryData<ActorDetail>(
        actorKeys.detail(state.actorId),
      );
      if (detail?.parentCharacterId) {
        void queryClient.invalidateQueries({
          queryKey: actorKeys.byCharacter(detail.parentCharacterId),
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
