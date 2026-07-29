export type CunningStrikeOption = {
  slug: string;
  label: string;
  cost: number;
  level: number;
};

const BASE_CUNNING_STRIKES: readonly CunningStrikeOption[] = [
  { slug: "poison", label: "Envenenar", cost: 1, level: 5 },
  { slug: "withdraw", label: "Retirada", cost: 1, level: 5 },
  { slug: "trip", label: "Tropeço", cost: 1, level: 5 },
  { slug: "daze", label: "Aturdir", cost: 2, level: 14 },
  { slug: "knock-out", label: "Nocaute", cost: 6, level: 14 },
  { slug: "obscure", label: "Obscurecer", cost: 3, level: 14 },
];

export function availableCunningStrikes(input: {
  level: number;
  subclassSlug?: string | null;
}): CunningStrikeOption[] {
  const options = BASE_CUNNING_STRIKES.filter(
    (effect) => input.level >= effect.level,
  );
  if (input.subclassSlug === "thief" && input.level >= 9) {
    options.push({
      slug: "hidden-attack",
      label: "Ataque Escondido",
      cost: 1,
      level: 9,
    });
  }
  if (input.subclassSlug === "arachnoid-stalker" && input.level >= 17) {
    options.push({ slug: "paralyze", label: "Paralisar", cost: 4, level: 17 });
  }
  return options;
}
