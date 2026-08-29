/** Primeira frase da descrição longa — fallback de teaser nos cards do compêndio. */
export function catalogTeaserFromDescription(
  description: string | null | undefined,
  maxChars = 140,
): string | null {
  const text = description?.trim();
  if (!text) return null;

  const paragraph = text.split(/\n\n|\n/)[0]?.trim() ?? "";
  if (!paragraph) return null;

  const sentence =
    paragraph.match(/^[^.!?]+[.!?]/)?.[0]?.trim() ?? paragraph;
  if (sentence.length <= maxChars) return sentence;

  return `${sentence.slice(0, maxChars - 1).trimEnd()}…`;
}
