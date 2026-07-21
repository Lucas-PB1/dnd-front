/** Classes de motion reutilizáveis (ver `globals.css`). */
export const motion = {
  /** Entrada de página / bloco principal */
  page: "motion-page",
  /** Fade + leve subida */
  enter: "motion-enter",
  /** Filhos em cascata (usar no container) */
  stagger: "motion-stagger",
  /** Hover com elevação suave (tiles/cards) */
  hoverLift: "motion-hover-lift",
  /** Hover em linhas de lista */
  hoverRow: "motion-hover-row",
} as const;
