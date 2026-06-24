"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchHealth, healthKeys } from "@/presentation/hooks/health.api";

export function useHealth() {
  return useQuery({
    queryKey: healthKeys.all,
    queryFn: fetchHealth,
  });
}
