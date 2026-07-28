/**
 * Idiomas iniciais PHB 2024 — concedidos pelo antecedente (API).
 */

export type BackgroundLanguageGrant = {
  grantedSlugs: string[];
  choiceCount: number;
};

const FALLBACK: BackgroundLanguageGrant = {
  grantedSlugs: ["common"],
  choiceCount: 2,
};

export function backgroundLanguageGrant(input?: {
  grantedSlugs?: string[];
  languageChoiceCount?: number;
} | null): BackgroundLanguageGrant {
  if (!input) return FALLBACK;
  const grantedSlugs =
    input.grantedSlugs?.length ? [...input.grantedSlugs] : FALLBACK.grantedSlugs;
  const choiceCount =
    input.languageChoiceCount ?? FALLBACK.choiceCount;
  return { grantedSlugs, choiceCount };
}

export function languageQuota(input?: {
  grantedSlugs?: string[];
  languageChoiceCount?: number;
} | null): {
  granted: string[];
  choiceCount: number;
  maxTotal: number;
} {
  const { grantedSlugs, choiceCount } = backgroundLanguageGrant(input);
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

export function syncLanguagesForBackground(
  selected: string[],
  grant?: {
    grantedSlugs?: string[];
    languageChoiceCount?: number;
  } | null,
): string[] {
  const { granted, choiceCount } = languageQuota(grant);
  const chosen = chosenLanguageSlugs(selected, granted).slice(0, choiceCount);
  return [...granted, ...chosen];
}

export function toggleLanguageSelection(
  selected: string[],
  slug: string,
  grant?: {
    grantedSlugs?: string[];
    languageChoiceCount?: number;
  } | null,
): { ok: true; next: string[] } | { ok: false; reason: string } {
  const { granted, choiceCount, maxTotal } = languageQuota(grant);
  const grantedSet = new Set(granted);

  if (grantedSet.has(slug)) {
    return {
      ok: false,
      reason: "Este idioma vem do antecedente e não pode ser removido.",
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
          ? "Seu antecedente não concede idiomas extras para escolher."
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
