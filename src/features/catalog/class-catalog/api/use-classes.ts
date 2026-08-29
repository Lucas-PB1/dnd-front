"use client";

import { useQuery } from "@tanstack/react-query";

import {
  classKeys,
  fetchAllClasses,
  fetchClassBySlug,
  fetchClassEquipment,
  fetchClassFeatures,
  fetchClassSkills,
  fetchClassSpellSlots,
  fetchClassProgression,
  fetchClassSpells,
  fetchClassSubclasses,
  fetchSubclassMechanics,
  fetchSubclassOptions,
  fetchClassOptions,
  fetchSubclassSpells,
  fetchSubclassSpellSlots,
  fetchSubclassSpellcasting,
  subclassKeys,
} from "@/features/catalog/class-catalog/api/classes.api";
import { useCatalogSources } from "@/features/catalog/catalog-sources/model/catalog-sources-provider";
import { CATALOG_DETAIL_STALE_MS } from "@/shared/lib/catalog-query";
import { useCatalogCompendium } from "@/shared/lib/use-catalog-compendium";
import {
  useCatalogDetailQuery,
} from "@/shared/lib/use-catalog-query";

/** Listagem slim para selects do wizard (sem description). */
export function useClasses() {
  const { editionSlugsParam } = useCatalogSources();
  return useQuery({
    queryKey: [...classKeys.list(), "summary", editionSlugsParam ?? "all"],
    queryFn: () => fetchAllClasses({ editionSlugs: editionSlugsParam, fields: "summary" }),
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}

export function useClassesCatalog(params?: { q?: string }) {
  return useCatalogCompendium({
    queryKey: classKeys.all,
    fetchAll: fetchAllClasses,
    q: params?.q,
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
  const { editionSlugsParam } = useCatalogSources();
  return useCatalogDetailQuery({
    slug,
    queryKey: [...classKeys.subclasses(slug), editionSlugsParam ?? "all"],
    queryFn: () => fetchClassSubclasses(slug, 50, editionSlugsParam),
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
    // Classe sem magia responde 404: sem retry para a UI resolver o estado na hora.
    retry: false,
  });
}

export function useClassSpellSlots(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: classKeys.spellSlots(slug),
    queryFn: () => fetchClassSpellSlots(slug),
    enabled,
    retry: false,
  });
}

export function useClassProgression(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: classKeys.progression(slug),
    queryFn: () => fetchClassProgression(slug),
    enabled,
    retry: false,
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
    retry: false,
  });
}

export function useSubclassSpellSlots(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: subclassKeys.spellSlots(slug),
    queryFn: () => fetchSubclassSpellSlots(slug),
    enabled,
    retry: false,
  });
}

export function useSubclassSpellcasting(slug: string, enabled = true) {
  return useCatalogDetailQuery({
    slug,
    queryKey: subclassKeys.spellcasting(slug),
    queryFn: () => fetchSubclassSpellcasting(slug),
    enabled,
    retry: false,
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

export function useClassFeatureOptions(
  slug: string,
  level: number,
  enabled = true,
) {
  return useQuery({
    queryKey: classKeys.options(slug, level),
    queryFn: () => fetchClassOptions(slug, level),
    enabled: enabled && !!slug && level > 0,
    staleTime: CATALOG_DETAIL_STALE_MS,
  });
}
