/** Filtra itens por texto livre em campos string. */
export function filterByQuery<T>(
  items: T[],
  query: string,
  getText: (item: T) => string,
): T[] {
  const normalized = query.trim().toLocaleLowerCase("pt-BR");
  if (!normalized) return items;
  return items.filter((item) =>
    getText(item).toLocaleLowerCase("pt-BR").includes(normalized),
  );
}
