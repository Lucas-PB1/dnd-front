export const COMPANION_COMMANDS = [
  { slug: "strike", label: "Golpe da Fera" },
  { slug: "help", label: "Ajudar" },
  { slug: "dash", label: "Correr" },
  { slug: "disengage", label: "Desengajar" },
  { slug: "dodge", label: "Esquivar" },
] as const;

export type CompanionCommandSlug = (typeof COMPANION_COMMANDS)[number]["slug"];
