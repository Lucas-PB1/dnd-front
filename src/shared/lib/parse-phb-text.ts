export type PhbBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

const BULLET_RE = /^\s*(?:[-•*–—]|\d+[.)])\s+/;

/**
 * Normaliza texto PHB (quebras moles de página) em parágrafos e listas.
 */
export function parsePhbText(raw: string): PhbBlock[] {
  if (!raw?.trim()) return [];

  let text = raw.replace(/\r\n/g, "\n").trim();
  // Junta linhas quebradas no meio da frase (layout de livro)
  text = text.replace(/([^\n.!?…:;])\n(?!\s*(?:[-•*–—]|\d+[.)]))/g, "$1 ");
  text = text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");

  const blocks: PhbBlock[] = [];
  const chunks = text.split(/\n{2,}/);

  for (const chunk of chunks) {
    const lines = chunk
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length) continue;

    const bulletLines = lines.filter((line) => BULLET_RE.test(line));
    if (bulletLines.length >= 1 && bulletLines.length === lines.length) {
      blocks.push({
        type: "list",
        items: lines.map((line) => line.replace(BULLET_RE, "").trim()),
      });
      continue;
    }

    if (bulletLines.length > 0) {
      const prose: string[] = [];
      const items: string[] = [];
      for (const line of lines) {
        if (BULLET_RE.test(line)) {
          if (prose.length) {
            blocks.push({ type: "paragraph", text: prose.join(" ") });
            prose.length = 0;
          }
          items.push(line.replace(BULLET_RE, "").trim());
        } else if (items.length) {
          items[items.length - 1] = `${items[items.length - 1]} ${line}`;
        } else {
          prose.push(line);
        }
      }
      if (prose.length) {
        blocks.push({ type: "paragraph", text: prose.join(" ") });
      }
      if (items.length) {
        blocks.push({ type: "list", items });
      }
      continue;
    }

    blocks.push({ type: "paragraph", text: lines.join(" ") });
  }

  return blocks;
}
