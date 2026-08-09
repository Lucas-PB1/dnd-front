"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/model";
import { useGameAuth } from "@/features/character/character-sheet/api/use-game-auth";
import { ApiError } from "@/shared/api/dnd-api/api-error";
import {
  addEncounterCreature,
  closeEncounter,
  createEncounter,
  encountersKeys,
  fetchActiveEncounter,
  nextEncounterTurn,
  patchEncounter,
  patchEncounterCombatant,
  removeEncounterCombatant,
  rollAllInitiative,
  rollCombatantInitiative,
  type AddCreaturePayload,
  type AdvantageMode,
  type CampaignEncounter,
  type PatchCombatantPayload,
  type PatchEncounterPayload,
} from "@/features/campaign/campaigns/api/encounters.api";

function setActive(
  queryClient: ReturnType<typeof useQueryClient>,
  campaignId: string,
  encounter: CampaignEncounter | null,
) {
  queryClient.setQueryData(encountersKeys.active(campaignId), encounter);
}

export function useActiveEncounter(campaignId: string) {
  const { accessToken, isLoading: authLoading } = useAuth();
  const { handleUnauthorized } = useGameAuth(
    `/campaigns/${campaignId}/encounter`,
  );

  return useQuery({
    queryKey: encountersKeys.active(campaignId),
    queryFn: async (): Promise<CampaignEncounter | null> => {
      if (!accessToken) throw new Error("Sessão expirada");
      try {
        return await fetchActiveEncounter(accessToken, campaignId);
      } catch (error) {
        if (error instanceof ApiError && error.isNotFound) return null;
        handleUnauthorized(error);
        throw error;
      }
    },
    enabled: !authLoading && !!accessToken && !!campaignId,
    refetchInterval: 4000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError) {
        if (error.isUnauthorized || error.isForbidden || error.isNotFound) {
          return false;
        }
      }
      return failureCount < 1;
    },
  });
}

function useEncounterMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const { requireToken, handleUnauthorized } = useGameAuth(
    `/campaigns/${campaignId}/encounter`,
  );

  async function run<T>(fn: (token: string) => Promise<T>): Promise<T> {
    try {
      return await fn(requireToken());
    } catch (error) {
      handleUnauthorized(error);
      throw error;
    }
  }

  return {
    queryClient,
    run,
    onEncounter: (encounter: CampaignEncounter) => {
      setActive(queryClient, campaignId, encounter);
    },
  };
}

export function useCreateEncounter(campaignId: string) {
  const ctx = useEncounterMutation(campaignId);
  return useMutation({
    mutationFn: (name: string) =>
      ctx.run((token) => createEncounter(token, campaignId, { name })),
    onSuccess: (encounter) => ctx.onEncounter(encounter),
  });
}

export function usePatchEncounter(campaignId: string) {
  const ctx = useEncounterMutation(campaignId);
  return useMutation({
    mutationFn: (input: {
      encounterId: string;
      payload: PatchEncounterPayload;
    }) =>
      ctx.run((token) =>
        patchEncounter(token, campaignId, input.encounterId, input.payload),
      ),
    onSuccess: (encounter) => ctx.onEncounter(encounter),
  });
}

export function useAddEncounterCreature(campaignId: string) {
  const ctx = useEncounterMutation(campaignId);
  return useMutation({
    mutationFn: (input: {
      encounterId: string;
      payload: AddCreaturePayload;
    }) =>
      ctx.run((token) =>
        addEncounterCreature(
          token,
          campaignId,
          input.encounterId,
          input.payload,
        ),
      ),
    onSuccess: (encounter) => ctx.onEncounter(encounter),
  });
}

export function useRollAllInitiative(campaignId: string) {
  const ctx = useEncounterMutation(campaignId);
  return useMutation({
    mutationFn: (input: {
      encounterId: string;
      advantage?: AdvantageMode;
    }) =>
      ctx.run((token) =>
        rollAllInitiative(
          token,
          campaignId,
          input.encounterId,
          input.advantage,
        ),
      ),
    onSuccess: (encounter) => ctx.onEncounter(encounter),
  });
}

export function useRollCombatantInitiative(campaignId: string) {
  const ctx = useEncounterMutation(campaignId);
  return useMutation({
    mutationFn: (input: {
      encounterId: string;
      combatantId: string;
      advantage?: AdvantageMode;
    }) =>
      ctx.run((token) =>
        rollCombatantInitiative(
          token,
          campaignId,
          input.encounterId,
          input.combatantId,
          input.advantage,
        ),
      ),
    onSuccess: (encounter) => ctx.onEncounter(encounter),
  });
}

export function usePatchEncounterCombatant(campaignId: string) {
  const ctx = useEncounterMutation(campaignId);
  return useMutation({
    mutationFn: (input: {
      encounterId: string;
      combatantId: string;
      payload: PatchCombatantPayload;
    }) =>
      ctx.run((token) =>
        patchEncounterCombatant(
          token,
          campaignId,
          input.encounterId,
          input.combatantId,
          input.payload,
        ),
      ),
    onSuccess: (encounter) => ctx.onEncounter(encounter),
  });
}

export function useRemoveEncounterCombatant(campaignId: string) {
  const ctx = useEncounterMutation(campaignId);
  return useMutation({
    mutationFn: (input: { encounterId: string; combatantId: string }) =>
      ctx.run((token) =>
        removeEncounterCombatant(
          token,
          campaignId,
          input.encounterId,
          input.combatantId,
        ),
      ),
    onSuccess: (encounter) => ctx.onEncounter(encounter),
  });
}

export function useNextEncounterTurn(campaignId: string) {
  const ctx = useEncounterMutation(campaignId);
  return useMutation({
    mutationFn: (encounterId: string) =>
      ctx.run((token) => nextEncounterTurn(token, campaignId, encounterId)),
    onSuccess: (encounter) => ctx.onEncounter(encounter),
  });
}

export function useCloseEncounter(campaignId: string) {
  const ctx = useEncounterMutation(campaignId);
  return useMutation({
    mutationFn: (encounterId: string) =>
      ctx.run((token) => closeEncounter(token, campaignId, encounterId)),
    onSuccess: () => setActive(ctx.queryClient, campaignId, null),
  });
}
