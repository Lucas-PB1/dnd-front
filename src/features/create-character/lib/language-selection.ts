/**
 * Idiomas iniciais PHB 2024 por espécie (até a API expor concessões).
 */

export type SpeciesLanguageGrant = {
  /** Idiomas fixos da espécie (sempre incluídos). */
  grantedSlugs: string[];
  /** Quantas línguas extras o jogador escolhe. */
  choiceCount: number;
};

const SPECIES_LANGUAGE_GRANTS: Record<string, SpeciesLanguageGrant> = {
  aasimar: { grantedSlugs: ["common", "celestial"], choiceCount: 0 },
  dragonborn: { grantedSlugs: ["common", "draconic"], choiceCount: 0 },
  dwarf: { grantedSlugs: ["common", "dwarvish"], choiceCount: 0 },
  elf: { grantedSlugs: ["common", "elvish"], choiceCount: 0 },
  gnome: { grantedSlugs: ["common", "gnomish"], choiceCount: 0 },
  goliath: { grantedSlugs: ["common", "giant"], choiceCount: 0 },
  halfling: { grantedSlugs: ["common", "halfling"], choiceCount: 0 },
  human: { grantedSlugs: ["common"], choiceCount: 1 },
  orc: { grantedSlugs: ["common", "orc"], choiceCount: 0 },
  tiefling: { grantedSlugs: ["common", "infernal"], choiceCount: 0 },
};

const FALLBACK: SpeciesLanguageGrant = {
  grantedSlugs: ["common"],
  choiceCount: 1,
};

const TIEFLING_LEGACY_LANGUAGE: Record<string, string> = {
  abyssal: "abyssal",
  infernal: "infernal",
  chthonic: "infernal",
};

export function speciesLanguageGrant(
  speciesSlug: string | undefined | null,
  speciesChoices?: { choiceKind: string; choiceSlug: string }[],
): SpeciesLanguageGrant {
  if (!speciesSlug?.trim()) return FALLBACK;
  const base = SPECIES_LANGUAGE_GRANTS[speciesSlug] ?? FALLBACK;

  if (speciesSlug === "tiefling") {
    const legacy = speciesChoices?.find(
      (c) => c.choiceKind === "infernal_legacy",
    )?.choiceSlug;
    const lang = legacy ? TIEFLING_LEGACY_LANGUAGE[legacy] : "infernal";
    return {
      grantedSlugs: ["common", lang ?? "infernal"],
      choiceCount: 0,
    };
  }

  return base;
}

export function languageQuota(
  speciesSlug: string | undefined | null,
  speciesChoices?: { choiceKind: string; choiceSlug: string }[],
): {
  granted: string[];
  choiceCount: number;
  maxTotal: number;
} {
  const { grantedSlugs, choiceCount } = speciesLanguageGrant(
    speciesSlug,
    speciesChoices,
  );
  return {
    granted: grantedSlugs,
    choiceCount,
    maxTotal: grantedSlugs.length + choiceCount,
  };
}

/** Idiomas escolhidos pelo jogador (exclui concedidos). */
export function chosenLanguageSlugs(
  selected: string[],
  granted: string[],
): string[] {
  const grantedSet = new Set(granted);
  return selected.filter((slug) => !grantedSet.has(slug));
}

export function ensureGrantedLanguages(
  selected: string[],
  granted: string[],
): string[] {
  const chosen = chosenLanguageSlugs(selected, granted);
  return [...granted, ...chosen];
}

export function syncLanguagesForSpecies(
  selected: string[],
  speciesSlug: string | undefined | null,
  speciesChoices?: { choiceKind: string; choiceSlug: string }[],
): string[] {
  const { granted, choiceCount } = languageQuota(speciesSlug, speciesChoices);
  const chosen = chosenLanguageSlugs(selected, granted).slice(0, choiceCount);
  return [...granted, ...chosen];
}

export function toggleLanguageSelection(
  selected: string[],
  slug: string,
  speciesSlug: string | undefined | null,
  speciesChoices?: { choiceKind: string; choiceSlug: string }[],
): { ok: true; next: string[] } | { ok: false; reason: string } {
  const { granted, choiceCount, maxTotal } = languageQuota(
    speciesSlug,
    speciesChoices,
  );
  const grantedSet = new Set(granted);

  if (grantedSet.has(slug)) {
    return {
      ok: false,
      reason: "Este idioma vem da espécie e não pode ser removido.",
    };
  }

  if (selected.includes(slug)) {
    return {
      ok: true,
      next: ensureGrantedLanguages(
        selected.filter((s) => s !== slug),
        granted,
      ),
    };
  }

  const chosen = chosenLanguageSlugs(selected, granted);
  if (chosen.length >= choiceCount) {
    return {
      ok: false,
      reason:
        choiceCount === 0
          ? "Sua espécie não concede idiomas extras para escolher."
          : `Limite de idiomas extras: ${choiceCount}.`,
    };
  }

  if (selected.length >= maxTotal && !selected.includes(slug)) {
    return {
      ok: false,
      reason: `Limite de idiomas: ${maxTotal}.`,
    };
  }

  return {
    ok: true,
    next: ensureGrantedLanguages([...selected, slug], granted),
  };
}
