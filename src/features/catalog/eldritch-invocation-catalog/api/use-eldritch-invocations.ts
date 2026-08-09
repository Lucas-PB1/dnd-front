"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchEldritchInvocations } from "@/features/catalog/eldritch-invocation-catalog/api/eldritch-invocations.api";

export function useEldritchInvocations(maxMinLevel?: number) {
  return useQuery({
    queryKey: ["eldritch-invocations", maxMinLevel ?? "all"],
    queryFn: () => fetchEldritchInvocations(maxMinLevel),
    staleTime: 60_000,
  });
}
