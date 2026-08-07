import type { AbilitySummary } from "@/entities/ability/types";

export function abilityLabelMap(
  abilities: readonly AbilitySummary[],
): Record<string, string> {
  return Object.fromEntries(
    abilities.map((ability) => [ability.slug, ability.name]),
  );
}

export function resolveAbilityLabel(
  labels: Record<string, string>,
  slug: string,
): string {
  return labels[slug] ?? slug;
}

/** Abreviação de 3 letras a partir do nome PT do catálogo. */
export function abilityShortFromName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .slice(0, 3)
    .toUpperCase();
}

export function abilityShortMap(
  abilities: readonly AbilitySummary[],
): Record<string, string> {
  return Object.fromEntries(
    abilities.map((ability) => [
      ability.slug,
      abilityShortFromName(ability.name),
    ]),
  );
}

/** Ordem canônica do catálogo (`sortOrder`). */
export function sortedAbilitySlugs(
  abilities: readonly AbilitySummary[],
): string[] {
  return [...abilities]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((ability) => ability.slug);
}
