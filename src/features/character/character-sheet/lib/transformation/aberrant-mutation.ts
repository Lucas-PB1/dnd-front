/** Mutações Aberrantes (Horror Aberrante Cap. 6) — espelha dnd-api aberrant-mutation.ts */

export const ABERRANT_MUTATION_ACTION =
  "gh-transformation-aberrant-horror/aberrant-mutation" as const;

export const ABERRANT_MUTATION_SLUGS = [
  "chitinous-shell",
  "eldritch-limbs",
  "slimy-form",
] as const;

export type AberrantMutationSlug = (typeof ABERRANT_MUTATION_SLUGS)[number];

const LABELS: Record<AberrantMutationSlug, string> = {
  "chitinous-shell": "Casca Quitinosa",
  "eldritch-limbs": "Membros Eldritch",
  "slimy-form": "Forma Viscosa",
};

const NOTES: Record<AberrantMutationSlug, string> = {
  "chitinous-shell":
    "CA +2 (sem armadura pesada); Deslocamento −3 m. Duração 1 min (declare na mesa).",
  "eldritch-limbs":
    "Ataque C/C 1d8 (Contundente/Perfurante/Cortante à escolha). Pode substituir ataques; BA para atacar. Não segura itens. 1 min.",
  "slimy-form":
    "Vantagem para escapar de Agarrar; Dash como BA; Resistência Ácido/Fogo/Frio. 1 min.",
};

export function isAberrantMutationSlug(
  value: string | null | undefined,
): value is AberrantMutationSlug {
  return (
    value != null &&
    (ABERRANT_MUTATION_SLUGS as readonly string[]).includes(value)
  );
}

export function aberrantMutationLabel(slug: AberrantMutationSlug): string {
  return LABELS[slug];
}

export function aberrantMutationNote(slug: AberrantMutationSlug): string {
  return NOTES[slug];
}

export function isAberrantMutationAction(
  tableAction: string | null | undefined,
): boolean {
  return tableAction === ABERRANT_MUTATION_ACTION;
}
