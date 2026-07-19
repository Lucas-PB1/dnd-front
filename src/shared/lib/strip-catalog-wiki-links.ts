/** Remove marcação `[[slug|rótulo]]` / `[[slug]]` para teasers de lista. */
export function stripCatalogWikiLinks(text: string): string {
  return text.replace(/\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/g, (_, slug, label) =>
    (label ?? slug).trim(),
  );
}
