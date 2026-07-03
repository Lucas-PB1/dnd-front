"use client";

import { useQuery } from "@tanstack/react-query";

import {
  classKeys,
  fetchClassBySlug,
  fetchClasses,
  fetchClassSubclasses,
} from "@/features/class-catalog/api/classes.api";

export function useClasses() {
  return useQuery({
    queryKey: classKeys.list(),
    queryFn: () => fetchClasses(),
    staleTime: 60 * 60 * 1000,
  });
}

export function useClassDetail(slug: string) {
  return useQuery({
    queryKey: classKeys.detail(slug),
    queryFn: () => fetchClassBySlug(slug),
    staleTime: 60 * 60 * 1000,
  });
}

export function useClassSubclasses(slug: string) {
  return useQuery({
    queryKey: classKeys.subclasses(slug),
    queryFn: () => fetchClassSubclasses(slug),
    staleTime: 60 * 60 * 1000,
  });
}
