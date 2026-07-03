"use client";

import { useQuery } from "@tanstack/react-query";

import {
  dndApiHealthKeys,
  fetchDndApiHealth,
} from "@/widgets/system-status/api/dnd-api-health.api";

export function useDndApiHealth() {
  return useQuery({
    queryKey: dndApiHealthKeys.all,
    queryFn: fetchDndApiHealth,
    retry: 1,
    staleTime: 30_000,
  });
}
