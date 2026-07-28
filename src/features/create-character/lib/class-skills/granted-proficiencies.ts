/** Proficiências já concedidas — regra PHB: escolher outra. */

export function filterOptionsExcludingTaken<T extends { value: string }>(
  options: T[],
  takenSlugs: Iterable<string>,
  /** Mantém a seleção atual visível no select (mesmo se estiver em taken). */
  keepValue?: string,
): T[] {
  const taken = new Set(
    [...takenSlugs].filter((slug) => slug && slug !== keepValue),
  );
  if (taken.size === 0) return options;
  return options.filter((option) => !taken.has(option.value));
}

export function siblingFeatOptionValueIds(
  featOptions: {
    featSlug: string;
    instanceIndex: number;
    optionKey: string;
    valueId: string;
  }[],
  featSlug: string,
  instanceIndex: number,
  currentOptionKey: string,
): string[] {
  return featOptions
    .filter(
      (option) =>
        option.featSlug === featSlug &&
        option.instanceIndex === instanceIndex &&
        option.optionKey !== currentOptionKey &&
        option.valueId,
    )
    .map((option) => option.valueId);
}

export function skillChoiceKinds(): ReadonlySet<string> {
  return new Set(["human_skill", "elf_keen_senses"]);
}
