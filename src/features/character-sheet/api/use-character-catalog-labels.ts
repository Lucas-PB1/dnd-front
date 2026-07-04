"use client";

import { useMemo } from "react";

import type { CharacterDetail } from "@/entities/character/types";
import { useBackgroundDetail } from "@/features/background-catalog/api/use-backgrounds";
import {
  useClassDetail,
  useClassSubclasses,
} from "@/features/class-catalog/api/use-classes";
import {
  useAlignments,
  useFeats,
  useLanguages,
  useSkills,
} from "@/features/reference-catalog/api/use-reference";
import { useSpells } from "@/features/spell-catalog/api/use-spells";
import { useSpeciesDetail } from "@/features/species-catalog/api/use-species";

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
  resolveSkill: (slug: string) => string;
  resolveFeat: (slug: string) => string;
  resolveLanguage: (slug: string) => string;
  resolveSpell: (slug: string) => string;
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
): CharacterCatalogLabels {
  const enabled = !!character;

  const classDetail = useClassDetail(character?.classSlug ?? "", enabled);
  const speciesDetail = useSpeciesDetail(character?.speciesSlug ?? "", enabled);
  const backgroundDetail = useBackgroundDetail(
    character?.backgroundSlug ?? "",
    enabled,
  );
  const subclasses = useClassSubclasses(character?.classSlug ?? "", enabled);
  const alignments = useAlignments();
  const skills = useSkills();
  const feats = useFeats();
  const languages = useLanguages();
  const spells = useSpells();

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
    feats.isPending ||
    languages.isPending ||
    spells.isPending ||
    alignments.isPending;

  return {
    isLoading,
    identity,
    skillLabels,
    featLabels,
    languageLabels,
    spellLabels,
    resolveSkill: (slug) => skillLabels[slug] ?? slug,
    resolveFeat: (slug) => featLabels[slug] ?? slug,
    resolveLanguage: (slug) => languageLabels[slug] ?? slug,
    resolveSpell: (slug) => spellLabels[slug] ?? slug,
  };
}
