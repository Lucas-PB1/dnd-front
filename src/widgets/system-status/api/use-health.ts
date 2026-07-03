"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchHealth,
  healthKeys,
} from "@/widgets/system-status/api/health.api";

export function useHealth() {
  return useQuery({
    queryKey: healthKeys.all,
    queryFn: fetchHealth,
  });
}
