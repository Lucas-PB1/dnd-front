export type AdvantageMode = "normal" | "advantage" | "disadvantage";

export type LocalRollResult = {
  label: string;
  expression: string;
  total: number;
  modifier: number;
  rolls: number[];
  kept?: number[];
  critical?: boolean;
  note?: string;
};

const DICE_TOKEN =
  /(\d+)\s*d\s*(\d+)(?:\s*([+-])\s*(\d+))?/gi;

function formatSigned(n: number): string {
  if (n === 0) return "";
  return n > 0 ? `+${n}` : String(n);
}

export function normalizeDiceExpression(expression: string): string {
  const match = expression
    .replace(/\s+/g, " ")
    .trim()
    .match(/(\d+)\s*d\s*(\d+)(?:\s*([+-])\s*(\d+))?/i);
  if (!match) {
    throw new Error(`Unsupported dice expression: ${expression}`);
  }
  const count = Number(match[1]);
  const sides = Number(match[2]);
  const sign = match[3];
  const mod = match[4] ? Number(match[4]) : 0;
  const modifier = sign === "-" ? -mod : mod;
  return `${count}d${sides}${formatSigned(modifier)}`;
}

export function parseDiceExpression(expression: string): {
  count: number;
  sides: number;
  modifier: number;
} {
  const normalized = normalizeDiceExpression(expression);
  const match = /^(\d+)d(\d+)([+-]\d+)?$/i.exec(normalized);
  if (!match) {
    throw new Error(`Unsupported dice expression: ${expression}`);
  }
  return {
    count: Number(match[1]),
    sides: Number(match[2]),
    modifier: match[3] ? Number(match[3]) : 0,
  };
}

/** Extrai expressões NdM±K de prosa PHB (ex.: "15 (2d8 + 6) ... 11 (2d10)"). */
export function extractDiceExpressions(text: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  DICE_TOKEN.lastIndex = 0;
  while ((match = DICE_TOKEN.exec(text)) !== null) {
    const count = Number(match[1]);
    const sides = Number(match[2]);
    if (count < 1 || sides < 2) continue;
    const sign = match[3];
    const mod = match[4] ? Number(match[4]) : 0;
    const modifier = sign === "-" ? -mod : mod;
    const expression = `${count}d${sides}${formatSigned(modifier)}`;
    if (seen.has(expression)) continue;
    seen.add(expression);
    found.push(expression);
  }
  return found;
}

export function rollDie(sides: number, rng: () => number = Math.random): number {
  if (!Number.isInteger(sides) || sides < 2) {
    throw new Error(`Invalid die sides: ${sides}`);
  }
  return 1 + Math.floor(rng() * sides);
}

export function rollDice(
  count: number,
  sides: number,
  rng: () => number = Math.random,
): number[] {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`Invalid die count: ${count}`);
  }
  return Array.from({ length: count }, () => rollDie(sides, rng));
}

export function rollExpression(
  expression: string,
  label: string,
  options: { critical?: boolean; rng?: () => number } = {},
): LocalRollResult {
  const rng = options.rng ?? Math.random;
  const critical = Boolean(options.critical);
  const parsed = parseDiceExpression(expression);
  const count = critical ? parsed.count * 2 : parsed.count;
  const rolls = rollDice(count, parsed.sides, rng);
  const diceSum = rolls.reduce((sum, face) => sum + face, 0);
  const normalized = `${count}d${parsed.sides}${formatSigned(parsed.modifier)}`;
  return {
    label: critical ? `${label} (crítico)` : label,
    expression: normalized,
    total: diceSum + parsed.modifier,
    modifier: parsed.modifier,
    rolls,
    kept: rolls,
    critical,
  };
}

export function rollD20Check(
  modifier: number,
  label: string,
  mode: AdvantageMode = "normal",
  rng: () => number = Math.random,
): LocalRollResult {
  const first = rollDie(20, rng);
  const second = mode === "normal" ? first : rollDie(20, rng);
  const rolls = mode === "normal" ? [first] : [first, second];
  const kept =
    mode === "advantage"
      ? [Math.max(first, second)]
      : mode === "disadvantage"
        ? [Math.min(first, second)]
        : [first];
  const modeSuffix =
    mode === "advantage"
      ? " (vantagem)"
      : mode === "disadvantage"
        ? " (desvantagem)"
        : "";
  return {
    label,
    expression: `1d20${formatSigned(modifier)}${modeSuffix}`,
    total: kept[0]! + modifier,
    modifier,
    rolls,
    kept,
  };
}

export function collectActionRollTargets(action: {
  name: string;
  attackBonus?: number | null;
  damageExpression?: string | null;
  description?: string | null;
}): Array<{ kind: "attack" | "damage" | "dice"; label: string; expression?: string; modifier?: number }> {
  const targets: Array<{
    kind: "attack" | "damage" | "dice";
    label: string;
    expression?: string;
    modifier?: number;
  }> = [];

  if (action.attackBonus != null) {
    targets.push({
      kind: "attack",
      label: `Ataque · ${action.name}`,
      modifier: action.attackBonus,
    });
  }

  const corpus = [action.damageExpression, action.description]
    .filter(Boolean)
    .join(" ");
  for (const expression of extractDiceExpressions(corpus)) {
    const isFromDamage = Boolean(
      action.damageExpression &&
        extractDiceExpressions(action.damageExpression).includes(expression),
    );
    targets.push({
      kind: isFromDamage ? "damage" : "dice",
      label: `${isFromDamage ? "Dano" : "Dado"} · ${action.name}`,
      expression,
    });
  }

  return targets;
}
