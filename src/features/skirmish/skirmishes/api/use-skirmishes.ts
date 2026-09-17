"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/shared/api/dnd-api/api-error";
import { useAuth } from "@/features/auth/model";
import {
  actionSurgeInSkirmish,
  appendSkirmishLog,
  attackInSkirmish,
  castInSkirmish,
  changeSkirmishCondition,
  createSkirmish,
  deleteSkirmish,
  endSkirmishTurn,
  fetchSkirmishById,
  fetchSkirmishes,
  finishSkirmish,
  secondWindInSkirmish,
  skirmishesKeys,
  type CreateSkirmishPayload,
  type ResolveSkirmishAttackPayload,
  type SkirmishDetail,
} from "@/features/skirmish/skirmishes/api/skirmishes.api";

function useSkirmishAuth(nextPath: string) {
  const router = useRouter();
  const { accessToken, isLoading: authLoading } = useAuth();

  const redirectIfUnauthorized = (error: unknown) => {
    if (error instanceof ApiError && error.isUnauthorized) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
    }
  };

  return { accessToken, authLoading, redirectIfUnauthorized, router };
}

export function useSkirmishes() {
  const { accessToken, authLoading, redirectIfUnauthorized } =
    useSkirmishAuth("/skirmishes");

  return useQuery({
    queryKey: skirmishesKeys.all,
    queryFn: async () => {
      if (!accessToken) throw new Error("Sessão expirada");
      try {
        return await fetchSkirmishes(accessToken);
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

export function useSkirmish(id: string) {
  const { accessToken, authLoading, redirectIfUnauthorized } = useSkirmishAuth(
    `/skirmishes/${id}`,
  );

  return useQuery({
    queryKey: skirmishesKeys.detail(id),
    queryFn: async () => {
      if (!accessToken) throw new Error("Sessão expirada");
      try {
        return await fetchSkirmishById(accessToken, id);
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

function invalidateSkirmish(
  queryClient: ReturnType<typeof useQueryClient>,
  skirmishId: string,
) {
  void queryClient.invalidateQueries({ queryKey: skirmishesKeys.all });
  void queryClient.invalidateQueries({
    queryKey: skirmishesKeys.detail(skirmishId),
  });
}

export function useCreateSkirmish() {
  const queryClient = useQueryClient();
  const { accessToken, router, redirectIfUnauthorized } =
    useSkirmishAuth("/skirmishes");

  return useMutation({
    mutationFn: async (payload: CreateSkirmishPayload) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return createSkirmish(accessToken, payload);
    },
    onSuccess: (skirmish) => {
      void queryClient.invalidateQueries({ queryKey: skirmishesKeys.all });
      router.push(`/skirmishes/${skirmish.id}`);
    },
    onError: redirectIfUnauthorized,
  });
}

export function useSkirmishAttack(skirmishId: string) {
  const queryClient = useQueryClient();
  const { accessToken, redirectIfUnauthorized } = useSkirmishAuth(
    `/skirmishes/${skirmishId}`,
  );

  return useMutation({
    mutationFn: async (payload: ResolveSkirmishAttackPayload) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return attackInSkirmish(accessToken, skirmishId, payload);
    },
    onSuccess: (result) => {
      queryClient.setQueryData(
        skirmishesKeys.detail(skirmishId),
        result.skirmish,
      );
      invalidateSkirmish(queryClient, skirmishId);
    },
    onError: redirectIfUnauthorized,
  });
}

export function useFinishSkirmish(skirmishId: string) {
  const queryClient = useQueryClient();
  const { accessToken, redirectIfUnauthorized } = useSkirmishAuth(
    `/skirmishes/${skirmishId}`,
  );

  return useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Sessão expirada");
      return finishSkirmish(accessToken, skirmishId);
    },
    onSuccess: (detail) => {
      queryClient.setQueryData(skirmishesKeys.detail(skirmishId), detail);
      invalidateSkirmish(queryClient, skirmishId);
    },
    onError: redirectIfUnauthorized,
  });
}

export function useDeleteSkirmish(options?: { goToList?: boolean }) {
  const queryClient = useQueryClient();
  const { accessToken, router, redirectIfUnauthorized } =
    useSkirmishAuth("/skirmishes");

  return useMutation({
    mutationFn: async (skirmishId: string) => {
      if (!accessToken) throw new Error("Sessão expirada");
      await deleteSkirmish(accessToken, skirmishId);
      return skirmishId;
    },
    onSuccess: (skirmishId) => {
      queryClient.removeQueries({ queryKey: skirmishesKeys.detail(skirmishId) });
      void queryClient.invalidateQueries({ queryKey: skirmishesKeys.all });
      if (options?.goToList) {
        router.push("/skirmishes");
      }
    },
    onError: redirectIfUnauthorized,
  });
}

export function useEndSkirmishTurn(skirmishId: string) {
  const queryClient = useQueryClient();
  const { accessToken, redirectIfUnauthorized } = useSkirmishAuth(
    `/skirmishes/${skirmishId}`,
  );

  return useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Sessão expirada");
      return endSkirmishTurn(accessToken, skirmishId);
    },
    onSuccess: (detail) => {
      queryClient.setQueryData(skirmishesKeys.detail(skirmishId), detail);
      invalidateSkirmish(queryClient, skirmishId);
    },
    onError: redirectIfUnauthorized,
  });
}

function useSkirmishDetailMutation<T>(
  skirmishId: string,
  fn: (token: string, payload: T) => Promise<SkirmishDetail>,
) {
  const queryClient = useQueryClient();
  const { accessToken, redirectIfUnauthorized } = useSkirmishAuth(
    `/skirmishes/${skirmishId}`,
  );
  return useMutation({
    mutationFn: async (payload: T) => {
      if (!accessToken) throw new Error("Sessão expirada");
      return fn(accessToken, payload);
    },
    onSuccess: (detail) => {
      queryClient.setQueryData(skirmishesKeys.detail(skirmishId), detail);
      invalidateSkirmish(queryClient, skirmishId);
    },
    onError: redirectIfUnauthorized,
  });
}

export function useSkirmishCast(skirmishId: string) {
  return useSkirmishDetailMutation(
    skirmishId,
    (token, payload: { spellSlug: string; slotLevel?: number }) =>
      castInSkirmish(token, skirmishId, payload),
  );
}

export function useAppendSkirmishLog(skirmishId: string) {
  return useSkirmishDetailMutation(skirmishId, (token, text: string) =>
    appendSkirmishLog(token, skirmishId, text),
  );
}

export function useSkirmishCondition(skirmishId: string) {
  return useSkirmishDetailMutation(
    skirmishId,
    (
      token,
      payload: {
        action: "add" | "remove";
        target: "self" | "opponent";
        condition: string;
      },
    ) => changeSkirmishCondition(token, skirmishId, payload),
  );
}

export function useSkirmishSecondWind(skirmishId: string) {
  const queryClient = useQueryClient();
  const { accessToken, redirectIfUnauthorized } = useSkirmishAuth(
    `/skirmishes/${skirmishId}`,
  );
  return useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Sessão expirada");
      return secondWindInSkirmish(accessToken, skirmishId);
    },
    onSuccess: (detail) => {
      queryClient.setQueryData(skirmishesKeys.detail(skirmishId), detail);
      invalidateSkirmish(queryClient, skirmishId);
    },
    onError: redirectIfUnauthorized,
  });
}

export function useSkirmishActionSurge(skirmishId: string) {
  const queryClient = useQueryClient();
  const { accessToken, redirectIfUnauthorized } = useSkirmishAuth(
    `/skirmishes/${skirmishId}`,
  );
  return useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Sessão expirada");
      return actionSurgeInSkirmish(accessToken, skirmishId);
    },
    onSuccess: (detail) => {
      queryClient.setQueryData(skirmishesKeys.detail(skirmishId), detail);
      invalidateSkirmish(queryClient, skirmishId);
    },
    onError: redirectIfUnauthorized,
  });
}
