"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/shared/api/dnd-api/api-error";
import { useAuth } from "@/features/auth/model";
import {
  campaignsKeys,
  createCampaign,
  deleteCampaign,
  fetchCampaignById,
  fetchCampaigns,
  joinCampaign,
  linkCampaignCharacter,
  removeCampaignMember,
  rotateCampaignInvite,
  unlinkCampaignCharacter,
  updateCampaign,
  updateCampaignMemberRole,
  type CampaignRole,
} from "@/features/campaign/campaigns/api/campaigns.api";

function useCampaignAuth(nextPath: string) {
  const router = useRouter();
  const { accessToken, isLoading: authLoading } = useAuth();

  const redirectIfUnauthorized = (error: unknown) => {
    if (error instanceof ApiError && error.isUnauthorized) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
    }
  };

  return { accessToken, authLoading, redirectIfUnauthorized, router };
}

export function useCampaigns() {
  const { accessToken, authLoading, redirectIfUnauthorized } =
    useCampaignAuth("/campaigns");

  return useQuery({
    queryKey: campaignsKeys.all,
    queryFn: async () => {
      if (!accessToken) throw new Error("Sessão expirada");
      try {
        return await fetchCampaigns(accessToken);
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

export function useCampaign(id: string) {
  const { accessToken, authLoading, redirectIfUnauthorized } =
    useCampaignAuth(`/campaigns/${id}`);

  return useQuery({
    queryKey: campaignsKeys.detail(id),
    queryFn: async () => {
      if (!accessToken) throw new Error("Sessão expirada");
      try {
        return await fetchCampaignById(accessToken, id);
      } catch (error) {
        redirectIfUnauthorized(error);
        throw error;
      }
    },
    enabled: !authLoading && !!accessToken && !!id,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.isUnauthorized) return false;
      return failureCount < 1;
    },
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { accessToken, router } = useCampaignAuth("/campaigns");

  return useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return createCampaign(accessToken, payload);
    },
    onSuccess: (campaign) => {
      void queryClient.invalidateQueries({ queryKey: campaignsKeys.all });
      router.push(`/campaigns/${campaign.id}`);
    },
  });
}

export function useJoinCampaign() {
  const queryClient = useQueryClient();
  const { accessToken, router } = useCampaignAuth("/campaigns");

  return useMutation({
    mutationFn: async (payload: {
      inviteCode: string;
      role?: "player" | "assistant";
    }) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return joinCampaign(accessToken, payload);
    },
    onSuccess: (campaign) => {
      void queryClient.invalidateQueries({ queryKey: campaignsKeys.all });
      router.push(`/campaigns/${campaign.id}`);
    },
  });
}

export function useLinkCampaignCharacter(campaignId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useCampaignAuth(`/campaigns/${campaignId}`);

  return useMutation({
    mutationFn: async (characterId: string) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return linkCampaignCharacter(accessToken, campaignId, characterId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: campaignsKeys.detail(campaignId),
      });
    },
  });
}

export function useUnlinkCampaignCharacter(campaignId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useCampaignAuth(`/campaigns/${campaignId}`);

  return useMutation({
    mutationFn: async (characterId: string) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return unlinkCampaignCharacter(accessToken, campaignId, characterId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: campaignsKeys.detail(campaignId),
      });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const { accessToken, router } = useCampaignAuth("/campaigns");

  return useMutation({
    mutationFn: async (campaignId: string) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return deleteCampaign(accessToken, campaignId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: campaignsKeys.all });
      router.push("/campaigns");
    },
  });
}

export function useUpdateCampaign(campaignId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useCampaignAuth(`/campaigns/${campaignId}`);

  return useMutation({
    mutationFn: async (payload: {
      name?: string;
      description?: string | null;
      allowPlayerSkipPayment?: boolean;
    }) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return updateCampaign(accessToken, campaignId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: campaignsKeys.all });
      void queryClient.invalidateQueries({
        queryKey: campaignsKeys.detail(campaignId),
      });
    },
  });
}

export function useRotateCampaignInvite(campaignId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useCampaignAuth(`/campaigns/${campaignId}`);

  return useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Sessão expirada");
      return rotateCampaignInvite(accessToken, campaignId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: campaignsKeys.detail(campaignId),
      });
      void queryClient.invalidateQueries({ queryKey: campaignsKeys.all });
    },
  });
}

export function useUpdateCampaignMemberRole(campaignId: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useCampaignAuth(`/campaigns/${campaignId}`);

  return useMutation({
    mutationFn: async (input: { userId: string; role: CampaignRole }) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return updateCampaignMemberRole(
        accessToken,
        campaignId,
        input.userId,
        input.role,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: campaignsKeys.detail(campaignId),
      });
    },
  });
}

export function useRemoveCampaignMember(campaignId: string) {
  const queryClient = useQueryClient();
  const { accessToken, router } = useCampaignAuth(`/campaigns/${campaignId}`);
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return removeCampaignMember(accessToken, campaignId, userId);
    },
    onSuccess: (_data, removedUserId) => {
      void queryClient.invalidateQueries({ queryKey: campaignsKeys.all });
      void queryClient.invalidateQueries({
        queryKey: campaignsKeys.detail(campaignId),
      });
      if (user?.id && removedUserId === user.id) {
        router.push("/campaigns");
      }
    },
  });
}
