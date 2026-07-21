import type { CharacterSpell } from "@/entities/character/sheet-types";
import type { ClassSpellOption } from "@/entities/class/types";

/** Classe prepara da lista completa (inclui mago: grimório + preparadas). */
export const PREPARED_SPELL_CLASS_SLUGS = new Set([
  "cleric",
  "druid",
  "paladin",
  "wizard",
]);

export type ClassSpellcastingMode = "prepared" | "known" | "wizard";

export function classSpellcastingMode(classSlug: string): ClassSpellcastingMode {
  if (classSlug === "wizard") return "wizard";
  if (PREPARED_SPELL_CLASS_SLUGS.has(classSlug)) return "prepared";
  return "known";
}

export function leveledSpellQuotaLabel(mode: ClassSpellcastingMode): string {
  if (mode === "known") return "Magias conhecidas";
  if (mode === "wizard") return "Magias preparadas";
  return "Magias preparadas";
}

export function countSpellsByType(
  characterSpells: CharacterSpell[],
  catalog: ClassSpellOption[],
): {
  cantrips: number;
  leveledKnown: number;
  leveledPrepared: number;
} {
  const bySlug = new Map(catalog.map((s) => [s.slug, s]));
  let cantrips = 0;
  let leveledKnown = 0;
  let leveledPrepared = 0;

  for (const entry of characterSpells) {
    if (entry.listType === "always_prepared") continue;
    const meta = bySlug.get(entry.spellSlug);
    if (!meta) continue;
    if (meta.level === 0) {
      cantrips += 1;
      continue;
    }
    if (entry.listType === "prepared") {
      leveledPrepared += 1;
      leveledKnown += 1;
    } else if (entry.listType === "known") {
      leveledKnown += 1;
    }
  }

  return { cantrips, leveledKnown, leveledPrepared };
}

export function filterClassSpells(
  spells: ClassSpellOption[],
  filters: {
    q: string;
    schoolSlug: string;
    circle: string;
  },
): ClassSpellOption[] {
  const q = filters.q.trim().toLowerCase();
  return spells.filter((spell) => {
    if (filters.schoolSlug && spell.schoolSlug !== filters.schoolSlug) {
      return false;
    }
    if (filters.circle !== "") {
      const circle = Number(filters.circle);
      if (spell.level !== circle) return false;
    }
    if (q && !spell.name.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function formatSpellSlotsForLevel(
  spellSlots: Record<string, number> | undefined,
): { level: string; count: number }[] {
  if (!spellSlots) return [];
  return Object.entries(spellSlots)
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([level, count]) => ({ level, count }));
}

export function wizardSpellbookLimitAtLevel(
  level: number,
  preparedQuota: number | null,
): number {
  if (preparedQuota == null) return 6;
  if (level === 1) return Math.max(preparedQuota + 2, 6);
  return preparedQuota + level;
}

export type SpellToggleResult =
  | { ok: true; next: CharacterSpell[] }
  | { ok: false; reason: string };

function withoutSlug(spells: CharacterSpell[], slug: string) {
  return spells.filter((s) => s.spellSlug !== slug);
}

function findEntry(spells: CharacterSpell[], slug: string) {
  return spells.find((s) => s.spellSlug === slug);
}

export function toggleCantrip(
  characterSpells: CharacterSpell[],
  spell: ClassSpellOption,
  catalog: ClassSpellOption[],
  cantripMax: number | null,
): SpellToggleResult {
  if (spell.level !== 0) {
    return { ok: false, reason: "Não é um truque." };
  }
  if (findEntry(characterSpells, spell.slug)) {
    return { ok: true, next: withoutSlug(characterSpells, spell.slug) };
  }
  const { cantrips } = countSpellsByType(characterSpells, catalog);
  if (cantripMax != null && cantrips >= cantripMax) {
    return {
      ok: false,
      reason: `Limite de truques (${cantripMax}) atingido.`,
    };
  }
  return {
    ok: true,
    next: [
      ...characterSpells,
      { spellSlug: spell.slug, listType: "known" as const },
    ],
  };
}

export function toggleLeveledSpell(
  characterSpells: CharacterSpell[],
  spell: ClassSpellOption,
  catalog: ClassSpellOption[],
  mode: ClassSpellcastingMode,
  limits: {
    leveledKnownMax: number | null;
    leveledPreparedMax: number | null;
  },
  intent: "known" | "prepared",
): SpellToggleResult {
  if (spell.level === 0) {
    return { ok: false, reason: "Use a seção de truques." };
  }

  const entry = findEntry(characterSpells, spell.slug);
  const counts = countSpellsByType(characterSpells, catalog);

  if (mode === "known") {
    if (entry) {
      return { ok: true, next: withoutSlug(characterSpells, spell.slug) };
    }
    if (
      limits.leveledKnownMax != null &&
      counts.leveledKnown >= limits.leveledKnownMax
    ) {
      return {
        ok: false,
        reason: `Limite de magias conhecidas (${limits.leveledKnownMax}) atingido.`,
      };
    }
    return {
      ok: true,
      next: [
        ...characterSpells,
        { spellSlug: spell.slug, listType: "known" as const },
      ],
    };
  }

  if (mode === "prepared") {
    if (entry?.listType === "prepared") {
      return { ok: true, next: withoutSlug(characterSpells, spell.slug) };
    }
    if (entry?.listType === "known") {
      return { ok: true, next: withoutSlug(characterSpells, spell.slug) };
    }
    if (
      limits.leveledPreparedMax != null &&
      counts.leveledPrepared >= limits.leveledPreparedMax
    ) {
      return {
        ok: false,
        reason: `Limite de magias preparadas (${limits.leveledPreparedMax}) atingido.`,
      };
    }
    return {
      ok: true,
      next: [
        ...characterSpells,
        { spellSlug: spell.slug, listType: "prepared" as const },
      ],
    };
  }

  if (intent === "known") {
    if (entry?.listType === "known") {
      return { ok: true, next: withoutSlug(characterSpells, spell.slug) };
    }
    if (entry?.listType === "prepared") {
      const next = characterSpells.map((s) =>
        s.spellSlug === spell.slug
          ? { ...s, listType: "known" as const }
          : s,
      );
      return { ok: true, next };
    }
    if (
      limits.leveledKnownMax != null &&
      counts.leveledKnown >= limits.leveledKnownMax
    ) {
      return {
        ok: false,
        reason: `Limite do grimório (${limits.leveledKnownMax}) atingido.`,
      };
    }
    return {
      ok: true,
      next: [
        ...characterSpells,
        { spellSlug: spell.slug, listType: "known" as const },
      ],
    };
  }

  if (!entry) {
    return {
      ok: false,
      reason: "Marque a magia no grimório antes de prepará-la.",
    };
  }
  if (entry.listType === "prepared") {
    return {
      ok: true,
      next: characterSpells.map((s) =>
        s.spellSlug === spell.slug
          ? { ...s, listType: "known" as const }
          : s,
      ),
    };
  }
  if (
    limits.leveledPreparedMax != null &&
    counts.leveledPrepared >= limits.leveledPreparedMax
  ) {
    return {
      ok: false,
      reason: `Limite de magias preparadas (${limits.leveledPreparedMax}) atingido.`,
    };
  }
  return {
    ok: true,
    next: characterSpells.map((s) =>
      s.spellSlug === spell.slug
        ? { ...s, listType: "prepared" as const }
        : s,
    ),
  };
}

export function toggleSubclassSpell(
  characterSpells: CharacterSpell[],
  slug: string,
): CharacterSpell[] {
  if (characterSpells.some((s) => s.spellSlug === slug)) {
    return withoutSlug(characterSpells, slug);
  }
  return [
    ...characterSpells,
    { spellSlug: slug, listType: "always_prepared" as const },
  ];
}
