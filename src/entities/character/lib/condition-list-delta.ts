export function conditionListDelta(
  current: readonly string[],
  next: readonly string[],
): { addConditions: string[]; removeConditions: string[] } {
  const currentSet = new Set(current);
  const nextSet = new Set(next);
  return {
    addConditions: next.filter((slug) => !currentSet.has(slug)),
    removeConditions: current.filter((slug) => !nextSet.has(slug)),
  };
}
