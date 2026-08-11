"use client";

import { useMemo } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import { useBackgroundDetail } from "@/features/catalog/background-catalog/api/use-backgrounds";
import {
  useClassDetail,
  useClassSubclasses,
} from "@/features/catalog/class-catalog/api/use-classes";
import {
  useAlignments,
  useFeatLabels,
  useLanguages,
  useSkills,
} from "@/features/catalog/reference-catalog/api/use-reference";
import { useSpellLabels } from "@/features/catalog/spell-catalog/api/use-spells";
import { useSpeciesDetail } from "@/features/catalog/species-catalog/api/use-species";

export type CharacterIdentityLabels = {
  className: string | null;
  speciesName: string | null;
  backgroundName: string | null;
  subclassName: string | null;
  alignmentName: string | null;
};

export type CharacterCatalogLabels = {
  isLoading: boolean;
  identity: CharacterIdentityLabels;
  skillLabels: Record<string, string>;
  featLabels: Record<string, string>;
  languageLabels: Record<string, string>;
  spellLabels: Record<string, string>;
  skillsQuery: ReturnType<typeof useSkills>;
  resolveSkill: (slug: string) => string;
  resolveFeat: (slug: string) => string;
  resolveLanguage: (slug: string) => string;
  resolveSpell: (slug: string) => string;
};

export type CharacterCatalogLabelsOptions = {
  /** Labels de magia (aba Magias / inventário com magias). Default true (review/wizard). */
  loadSpellLabels?: boolean;
  /** Labels de talentos (aba Traços). Default true. */
  loadFeatLabels?: boolean;
  /** Alinhamentos (quase só edit). Default true. */
  loadAlignments?: boolean;
};

function toLabelMap<T extends { slug: string; name: string }>(
  items: T[] | undefined,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of items ?? []) {
    map[item.slug] = item.name;
  }
  return map;
}

function resolveFromMap(
  map: Record<string, string>,
  slug: string | null | undefined,
): string | null {
  if (!slug) return null;
  return map[slug] ?? slug;
}

export function useCharacterCatalogLabels(
  character: CharacterDetail | undefined,
  options: CharacterCatalogLabelsOptions = {},
): CharacterCatalogLabels {
  const enabled = !!character;
  const loadSpellLabels = options.loadSpellLabels ?? true;
  const loadFeatLabels = options.loadFeatLabels ?? true;
  const loadAlignments = options.loadAlignments ?? true;

  const classDetail = useClassDetail(character?.classSlug ?? "", enabled);
  const speciesDetail = useSpeciesDetail(character?.speciesSlug ?? "", enabled);
  const backgroundDetail = useBackgroundDetail(
    character?.backgroundSlug ?? "",
    enabled,
  );
  const subclasses = useClassSubclasses(character?.classSlug ?? "", enabled);
  const alignments = useAlignments({
    enabled: enabled && loadAlignments,
  });
  const skills = useSkills();
  const feats = useFeatLabels({ enabled: enabled && loadFeatLabels });
  const languages = useLanguages();
  const spells = useSpellLabels({ enabled: enabled && loadSpellLabels });

  const skillLabels = useMemo(
    () => toLabelMap(skills.data?.data),
    [skills.data?.data],
  );
  const featLabels = useMemo(
    () => toLabelMap(feats.data?.data),
    [feats.data?.data],
  );
  const languageLabels = useMemo(
    () => toLabelMap(languages.data?.data),
    [languages.data?.data],
  );
  const spellLabels = useMemo(
    () => toLabelMap(spells.data?.data),
    [spells.data?.data],
  );
  const alignmentLabels = useMemo(
    () => toLabelMap(alignments.data?.data),
    [alignments.data?.data],
  );

  const subclassName = useMemo(() => {
    if (!character?.subclassSlug) return null;
    const match = subclasses.data?.data.find(
      (s) => s.slug === character.subclassSlug,
    );
    return match?.name ?? character.subclassSlug;
  }, [character, subclasses.data?.data]);

  const identity: CharacterIdentityLabels = {
    className: classDetail.data?.name ?? character?.classSlug ?? null,
    speciesName: speciesDetail.data?.name ?? character?.speciesSlug ?? null,
    backgroundName:
      backgroundDetail.data?.name ?? character?.backgroundSlug ?? null,
    subclassName,
    alignmentName: resolveFromMap(alignmentLabels, character?.alignmentSlug),
  };

  const isLoading =
    (enabled && classDetail.isPending) ||
    (enabled && speciesDetail.isPending) ||
    (enabled && backgroundDetail.isPending) ||
    (enabled && subclasses.isPending) ||
    skills.isPending ||
    (loadFeatLabels && feats.isPending) ||
    languages.isPending ||
    (loadSpellLabels && spells.isPending) ||
    (loadAlignments && alignments.isPending);

  return {
    isLoading,
    identity,
    skillLabels,
    featLabels,
    languageLabels,
    spellLabels,
    skillsQuery: skills,
    resolveSkill: (slug) => skillLabels[slug] ?? slug,
    resolveFeat: (slug) => featLabels[slug] ?? slug,
    resolveLanguage: (slug) => languageLabels[slug] ?? slug,
    resolveSpell: (slug) => spellLabels[slug] ?? slug,
  };
}
