"use client";

import { useQuery } from "@tanstack/react-query";

import {
  classKeys,
  fetchClassBySlug,
  fetchClassEquipment,
  fetchClassFeatures,
  fetchClassSkills,
  fetchClassSpellSlots,
  fetchClassProgression,
  fetchClassSpells,
  fetchClasses,
  fetchClassesPage,
  fetchClassSubclasses,
  fetchSubclassMechanics,
  fetchSubclassOptions,
  fetchSubclassSpells,
  subclassKeys,
} from "@/features/class-catalog/api/classes.api";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import {
  useCatalogDetailQuery,
  useCatalogListQuery,
} from "@/shared/lib/use-catalog-query";

export function useClasses() {
  return useQuery({
    queryKey: classKeys.list(),
    queryFn: () => fetchClasses(),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

/** Compêndio: busca `q` na API (dataset pequeno). */
export function useClassesCatalog(params: { page: number; q?: string }) {
  return useCatalogListQuery({
    page: params.page,
    filters: { q: params.q },
    queryKey: (p) =>
      classKeys.listPage({ page: p.page, limit: p.limit, q: p.q ?? "" }),
    queryFn: (p) =>
      fetchClassesPage({ page: p.page, limit: p.limit, q: p.q }),
  });
}

export function useClassDetail(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: classKeys.detail(slug),
    queryFn: () => fetchClassBySlug(slug),
    enabled,
  });
}

export function useClassSubclasses(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: classKeys.subclasses(slug),
    queryFn: () => fetchClassSubclasses(slug),
    enabled,
  });
}

export function useClassSkills(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: classKeys.skills(slug),
    queryFn: () => fetchClassSkills(slug),
    enabled,
  });
}

export function useClassEquipment(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: classKeys.equipment(slug),
    queryFn: () => fetchClassEquipment(slug),
    enabled,
  });
}

export function useClassFeatures(
  slug: string,
  maxLevel?: number,
  enabled = true,
) {
  return useCatalogDetailQuery({
    slug,
    queryKey: classKeys.features(slug, maxLevel),
    queryFn: () => fetchClassFeatures(slug, maxLevel),
    enabled,
  });
}

export function useClassSpells(
  slug: string,
  maxLevel?: number,
  enabled = true,
) {
  return useCatalogDetailQuery({
    slug,
    queryKey: classKeys.spells(slug, maxLevel),
    queryFn: () => fetchClassSpells(slug, maxLevel),
    enabled,
  });
}

export function useClassSpellSlots(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: classKeys.spellSlots(slug),
    queryFn: () => fetchClassSpellSlots(slug),
    enabled,
  });
}

export function useClassProgression(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: classKeys.progression(slug),
    queryFn: () => fetchClassProgression(slug),
    enabled,
  });
}

export function useSubclassMechanics(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: subclassKeys.mechanics(slug),
    queryFn: () => fetchSubclassMechanics(slug),
    enabled,
  });
}

export function useSubclassSpells(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: subclassKeys.spells(slug),
    queryFn: () => fetchSubclassSpells(slug),
    enabled,
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
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}
