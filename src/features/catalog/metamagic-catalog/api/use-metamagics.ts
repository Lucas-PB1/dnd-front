"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMetamagics } from "@/features/catalog/metamagic-catalog/api/metamagics.api";

export function useMetamagics() {
  return useQuery({
    queryKey: ["metamagics"],
    queryFn: fetchMetamagics,
    staleTime: 60_000,
  });
}
