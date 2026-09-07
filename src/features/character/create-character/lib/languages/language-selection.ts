/**
 * Idiomas iniciais PHB 2024 — antecedente + espécie (E007) + classe.
 */

import {
  DRUIDIC_LANGUAGE_SLUG,
  THIEVES_CANT_LANGUAGE_SLUG,
} from "@/entities/character/lib/class-language-grant";

export const CLASS_EXCLUSIVE_LANGUAGE_SLUGS = [
  DRUIDIC_LANGUAGE_SLUG,
  THIEVES_CANT_LANGUAGE_SLUG,
] as const;

/** Espelha dnd-api `SPECIES_LANGUAGE_CHOICE_COUNT` (grant_language ×2). */
export const SPECIES_LANGUAGE_CHOICE_COUNT = 2;

const CLASS_EXCLUSIVE_SET = new Set<string>(CLASS_EXCLUSIVE_LANGUAGE_SLUGS);

export type LanguageCatalogEntry = {
  slug: string;
  isRare: boolean;
};

/** PHB 2024: escolhas usam idiomas padrão; Druídico/Gíria só por classe. */
export function isPickableLanguage(
  slug: string,
  language: LanguageCatalogEntry,
): boolean {
  if (language.isRare) return false;
  if (CLASS_EXCLUSIVE_SET.has(slug)) return false;
  return true;
}

export function filterPickableLanguages<T extends LanguageCatalogEntry>(
  catalog: T[],
  granted: string[],
): T[] {
  const grantedSet = new Set(granted);
  return catalog.filter(
    (language) =>
      !grantedSet.has(language.slug) && isPickableLanguage(language.slug, language),
  );
}

export type BackgroundLanguageGrant = {
  grantedSlugs: string[];
  choiceCount: number;
};

const DEFAULT_GRANTED = ["common"];

/**
 * Concessões do antecedente. `languageChoiceCount` ausente → 0
 * (não inventar 2; a cota da espécie entra em `languageQuota`).
 */
export function backgroundLanguageGrant(input?: {
  grantedSlugs?: string[];
  languageChoiceCount?: number;
} | null): BackgroundLanguageGrant {
  if (!input) {
    return { grantedSlugs: DEFAULT_GRANTED, choiceCount: 0 };
  }
  const grantedSlugs =
    input.grantedSlugs?.length ? [...input.grantedSlugs] : DEFAULT_GRANTED;
  const choiceCount = input.languageChoiceCount ?? 0;
  return { grantedSlugs, choiceCount };
}

export type LanguageQuotaInput = {
  grantedSlugs?: string[];
  languageChoiceCount?: number;
  extraGrantedSlugs?: string[];
  extraChoiceCount?: number;
  /** Quando presente, soma `SPECIES_LANGUAGE_CHOICE_COUNT` às escolhas. */
  speciesSlug?: string | null;
};

export function languageQuota(input?: LanguageQuotaInput | null): {
  granted: string[];
  choiceCount: number;
  maxTotal: number;
  backgroundChoiceCount: number;
  speciesChoiceCount: number;
  classChoiceCount: number;
} {
  const { grantedSlugs, choiceCount: backgroundChoiceCount } =
    backgroundLanguageGrant(input);
  const extraGranted = [...new Set(input?.extraGrantedSlugs ?? [])];
  const granted = [...new Set([...grantedSlugs, ...extraGranted])];
  const speciesChoiceCount = input?.speciesSlug?.trim()
    ? SPECIES_LANGUAGE_CHOICE_COUNT
    : 0;
  const classChoiceCount = input?.extraChoiceCount ?? 0;
  const totalChoice =
    backgroundChoiceCount + speciesChoiceCount + classChoiceCount;
  return {
    granted,
    choiceCount: totalChoice,
    maxTotal: granted.length + totalChoice,
    backgroundChoiceCount,
    speciesChoiceCount,
    classChoiceCount,
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
  grant?: LanguageQuotaInput | null,
  catalog?: LanguageCatalogEntry[],
): string[] {
  const { granted, choiceCount } = languageQuota(grant);
  const pickable = catalog
    ? new Set(filterPickableLanguages(catalog, granted).map((row) => row.slug))
    : null;
  const chosen = chosenLanguageSlugs(selected, granted)
    .filter((slug) => !pickable || pickable.has(slug))
    .slice(0, choiceCount);
  return [...granted, ...chosen];
}

export function toggleLanguageSelection(
  selected: string[],
  slug: string,
  grant?: LanguageQuotaInput | null,
  catalog?: LanguageCatalogEntry[],
): { ok: true; next: string[] } | { ok: false; reason: string } {
  const { granted, choiceCount, maxTotal } = languageQuota(grant);
  const grantedSet = new Set(granted);

  if (grantedSet.has(slug)) {
    return {
      ok: false,
      reason: "Este idioma é concedido e não pode ser removido.",
    };
  }

  const language = catalog?.find((row) => row.slug === slug);
  if (language && !isPickableLanguage(slug, language)) {
    return {
      ok: false,
      reason: "Escolha apenas idiomas padrão do PHB (não raros).",
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
          ? "Não há idiomas extras para escolher."
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

/** Texto curto da cota (espécie + antecedente + classe). */
export function languageQuotaSummary(quota: ReturnType<typeof languageQuota>): string {
  if (quota.choiceCount === 0) {
    return "Seus idiomas vêm das concessões fixas — sem escolha extra.";
  }
  const parts: string[] = [];
  if (quota.speciesChoiceCount > 0) {
    parts.push(`${quota.speciesChoiceCount} da espécie`);
  }
  if (quota.backgroundChoiceCount > 0) {
    parts.push(`${quota.backgroundChoiceCount} do antecedente`);
  }
  if (quota.classChoiceCount > 0) {
    parts.push(`${quota.classChoiceCount} da classe`);
  }
  return `Concedidos ${quota.granted.length} + ${quota.choiceCount} à escolha (${parts.join(", ")}).`;
}
