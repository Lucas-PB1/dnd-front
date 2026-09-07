import rulesJson from "./cap6-choice-rules.json";

export type Cap6StageMode =
  | "auto_all"
  | "pick1"
  | "pick2"
  | "fixed_plus_pick1"
  | "auto_single";

export type Cap6SubOptionRule = {
  key: string;
  fromStage: number;
  whenChoice?: { key: string; value: string };
  values: readonly { id: string; label: string }[];
};

export type Cap6StageRule = {
  mode: Cap6StageMode;
  autoBoons: readonly string[];
  pickKeys: readonly string[];
};

export type Cap6TransformationRule = {
  stages: Record<string, Cap6StageRule>;
  subOptions: readonly Cap6SubOptionRule[];
  requireMatch: readonly {
    laterKey: string;
    earlierKey: string;
    pairs: Record<string, string>;
  }[];
};

export const CAP6_CHOICE_RULES = rulesJson as Record<
  string,
  Cap6TransformationRule
>;

/** Keys de escolha exigidas até o estágio (picks + subOptions ativos). */
export function requiredChoiceKeysForStage(
  slug: string,
  stage: number,
  currentByKind: ReadonlyMap<string, string>,
): string[] {
  const rules = CAP6_CHOICE_RULES[slug];
  if (!rules || stage < 1) return [];
  const keys: string[] = [];
  for (let s = 1; s <= stage; s += 1) {
    const stageRule = rules.stages[String(s)];
    if (!stageRule) continue;
    keys.push(...stageRule.pickKeys);
  }
  for (const sub of rules.subOptions) {
    if (stage < sub.fromStage) continue;
    if (sub.whenChoice) {
      if (currentByKind.get(sub.whenChoice.key) !== sub.whenChoice.value) {
        continue;
      }
    }
    keys.push(sub.key);
  }
  return keys;
}

export function filterValuesForMatch(
  slug: string,
  optionKey: string,
  values: readonly { valueId: string; label: string }[],
  currentByKind: ReadonlyMap<string, string>,
): { valueId: string; label: string }[] {
  const rules = CAP6_CHOICE_RULES[slug];
  if (!rules) return [...values];
  const match = rules.requireMatch.find((row) => row.laterKey === optionKey);
  if (!match) return [...values];
  const earlier = currentByKind.get(match.earlierKey);
  if (!earlier) return [...values];
  const expected = match.pairs[earlier];
  if (!expected) return [...values];
  return values.filter((v) => v.valueId === expected);
}

export function siblingPickKeys(optionKey: string): string[] {
  const match = /^(stage\d+Boon)(2)?$/.exec(optionKey);
  if (!match) return [optionKey];
  const base = match[1];
  return [base, `${base}2`];
}
