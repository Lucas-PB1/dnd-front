"use client";

import { useQuery } from "@tanstack/react-query";

import {
  classKeys,
  fetchClassBySlug,
  fetchClassEquipment,
  fetchClassFeatures,
  fetchClassSkills,
  fetchClassSpellSlots,
  fetchClassSpells,
  fetchClasses,
  fetchClassesPage,
  fetchClassSubclasses,
  fetchSubclassMechanics,
  fetchSubclassOptions,
  fetchSubclassSpells,
  subclassKeys,
} from "@/features/class-catalog/api/classes.api";
import { CATALOG_PAGE_SIZE } from "@/shared/lib/catalog-pagination";

const STALE = 60 * 60 * 1000;

export function useClasses() {
  return useQuery({
    queryKey: classKeys.list(),
    queryFn: () => fetchClasses(),
    staleTime: STALE,
  });
}

/** Compêndio: busca `q` na API (dataset pequeno). */
export function useClassesCatalog(params: { page: number; q?: string }) {
  const page = params.page;
  const q = params.q?.trim() ?? "";
  const limit = CATALOG_PAGE_SIZE;

  return useQuery({
    queryKey: classKeys.listPage({ page, limit, q }),
    queryFn: () => fetchClassesPage({ page, limit, q: q || undefined }),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useClassDetail(slug: string, enabled = true) {
  return useQuery({
    queryKey: classKeys.detail(slug),
    queryFn: () => fetchClassBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useClassSubclasses(slug: string, enabled = true) {
  return useQuery({
    queryKey: classKeys.subclasses(slug),
    queryFn: () => fetchClassSubclasses(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useClassSkills(slug: string, enabled = true) {
  return useQuery({
    queryKey: classKeys.skills(slug),
    queryFn: () => fetchClassSkills(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useClassEquipment(slug: string, enabled = true) {
  return useQuery({
    queryKey: classKeys.equipment(slug),
    queryFn: () => fetchClassEquipment(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useClassFeatures(
  slug: string,
  maxLevel?: number,
  enabled = true,
) {
  return useQuery({
    queryKey: classKeys.features(slug, maxLevel),
    queryFn: () => fetchClassFeatures(slug, maxLevel),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useClassSpells(
  slug: string,
  maxLevel?: number,
  enabled = true,
) {
  return useQuery({
    queryKey: classKeys.spells(slug, maxLevel),
    queryFn: () => fetchClassSpells(slug, maxLevel),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useClassSpellSlots(slug: string, enabled = true) {
  return useQuery({
    queryKey: classKeys.spellSlots(slug),
    queryFn: () => fetchClassSpellSlots(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useSubclassMechanics(slug: string, enabled = true) {
  return useQuery({
    queryKey: subclassKeys.mechanics(slug),
    queryFn: () => fetchSubclassMechanics(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useSubclassSpells(slug: string, enabled = true) {
  return useQuery({
    queryKey: subclassKeys.spells(slug),
    queryFn: () => fetchSubclassSpells(slug),
    enabled: enabled && !!slug,
    staleTime: STALE,
  });
}

export function useSubclassOptions(
  slug: string,
  level: number,
  enabled = true,
) {
  return useQuery({
    queryKey: subclassKeys.options(slug, level),
    queryFn: () => fetchSubclassOptions(slug, level),
    enabled: enabled && !!slug && level > 0,
    staleTime: STALE,
  });
}
