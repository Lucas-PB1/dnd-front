"use client";

import { useState } from "react";

import { formatTemplateSpeeds } from "@/entities/creature-template/format";
import { formatReachFromFeet, toMetricProse } from "@/shared/lib/metric";
import {
  collectActionRollTargets,
  extractDiceExpressions,
  rollD20Check,
  rollExpression,
  type AdvantageMode,
  type LocalRollResult,
} from "@/shared/lib/dice";
import {
  LocalRollResultBanner,
  RollChip,
  RollModeToolbar,
} from "@/shared/ui/local-roll-result-banner";

type AbilityScores = Record<string, number>;

export type StatBlockAction = {
  id?: number | string;
  name: string;
  actionBucket: string;
  attackBonus?: number | null;
  damageExpression?: string | null;
  reachFt?: number | null;
  description?: string | null;
  sortOrder?: number;
};

export type StatBlockTrait = {
  name: string;
  description: string;
  sortOrder?: number;
};

export type StatBlockSpeed = {
  movementKind: string;
  speedFt: number;
};

export type StatBlockCardProps = {
  name: string;
  subtitle?: string | null;
  variant?: "creature" | "vehicle";
  armorClass?: number | null;
  initiativeModifier?: number | null;
  hitPoints?: number | null;
  hitPointsFormula?: string | null;
  hitPointsCurrent?: number | null;
  damageThreshold?: number | null;
  speeds?: StatBlockSpeed[];
  abilityScores?: Partial<AbilityScores> | null;
  crewCapacity?: number | null;
  passengerCapacity?: number | null;
  cargoCapacityLabel?: string | null;
  challengeRating?: string | null;
  proficiencyBonus?: number | null;
  traits?: StatBlockTrait[];
  actions?: StatBlockAction[];
  /** Quando false, a ficha fica só leitura (sem chips de rolagem). */
  enableRolls?: boolean;
};

const ABILITY_ORDER = [
  ["forca", "STR"],
  ["destreza", "DEX"],
  ["constituicao", "CON"],
  ["inteligencia", "INT"],
  ["sabedoria", "WIS"],
  ["carisma", "CHA"],
] as const;

const ABILITY_LABEL_PT: Record<string, string> = {
  forca: "Força",
  destreza: "Destreza",
  constituicao: "Constituição",
  inteligencia: "Inteligência",
  sabedoria: "Sabedoria",
  carisma: "Carisma",
};

function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

function formatInitiative(mod?: number | null): string | null {
  if (mod == null) return null;
  const score = 10 + mod;
  return `${formatModifier(mod)} (${score})`;
}

function groupActions(actions: StatBlockAction[]) {
  const buckets = new Map<string, StatBlockAction[]>();
  for (const action of actions) {
    const key = action.actionBucket ?? "action";
    const list = buckets.get(key) ?? [];
    list.push(action);
    buckets.set(key, list);
  }
  return buckets;
}

const BUCKET_LABELS: Record<string, string> = {
  action: "Ações",
  bonus: "Ações bônus",
  reaction: "Reações",
  legendary: "Ações lendárias",
  other: "Outras",
};

const BUCKET_ORDER = ["action", "bonus", "reaction", "legendary", "other"] as const;

const LEGENDARY_USES_PATTERN = /^Usos de Ação Lendária:?$/i;
const RECHARGE_PATTERN = /\(Recarga\s+\d+[–-]\d+\)/i;

function splitLegendaryBucket(actions: StatBlockAction[]) {
  const usesAction = actions.find((action) =>
    LEGENDARY_USES_PATTERN.test(action.name.trim()),
  );
  const abilityActions = actions.filter(
    (action) => !LEGENDARY_USES_PATTERN.test(action.name.trim()),
  );
  return { usesAction, abilityActions };
}

function orderedActionGroups(actions: StatBlockAction[]) {
  const buckets = groupActions(actions);
  return BUCKET_ORDER.flatMap((bucket) => {
    const bucketActions = buckets.get(bucket);
    return bucketActions?.length ? [[bucket, bucketActions] as const] : [];
  });
}

function extractSkillBonuses(description: string) {
  const skills: Array<{ name: string; modifier: number }> = [];
  const re = /([A-Za-zÀ-ú][A-Za-zÀ-ú\s]*?)\s*([+-]\d+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(description)) !== null) {
    skills.push({
      name: match[1]!.trim(),
      modifier: Number(match[2]),
    });
  }
  return skills;
}

function AbilityTable({
  abilityScores,
  onRollAbility,
}: {
  abilityScores: Partial<AbilityScores>;
  onRollAbility?: (key: string, label: string, modifier: number) => void;
}) {
  const physical = ABILITY_ORDER.slice(0, 3);
  const mental = ABILITY_ORDER.slice(3);

  function renderColumn(entries: ReadonlyArray<(typeof ABILITY_ORDER)[number]>) {
    return (
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-muted/60 text-left">
            <th className="px-2 py-1 font-semibold">Atributo</th>
            <th className="px-2 py-1 font-semibold">Valor</th>
            <th className="px-2 py-1 font-semibold">Mod</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, label]) => {
            const score = abilityScores[key as keyof AbilityScores];
            if (score == null) return null;
            const mod = abilityModifier(score);
            return (
              <tr key={key} className="border-t border-border/60">
                <th className="px-2 py-1 font-semibold">{label}</th>
                <td className="px-2 py-1 tabular-nums">{score}</td>
                <td className="px-2 py-1 tabular-nums">
                  {onRollAbility ? (
                    <RollChip
                      title={`Rolar teste de ${ABILITY_LABEL_PT[key] ?? label}`}
                      onClick={() =>
                        onRollAbility(key, ABILITY_LABEL_PT[key] ?? label, mod)
                      }
                    >
                      {formatModifier(mod)}
                    </RollChip>
                  ) : (
                    formatModifier(mod)
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {renderColumn(physical)}
      {renderColumn(mental)}
    </div>
  );
}

function StatLine({
  label,
  value,
  onRoll,
  rollTitle,
}: {
  label: string;
  value: string | null | undefined;
  onRoll?: () => void;
  rollTitle?: string;
}) {
  if (!value) return null;
  return (
    <p className="text-sm leading-relaxed">
      <span className="font-semibold">{label}</span>{" "}
      {onRoll ? (
        <RollChip title={rollTitle} onClick={onRoll}>
          {value}
        </RollChip>
      ) : (
        value
      )}
    </p>
  );
}

function ActionRollChips({
  action,
  advantage,
  critical,
  onResult,
}: {
  action: StatBlockAction;
  advantage: AdvantageMode;
  critical: boolean;
  onResult: (result: LocalRollResult) => void;
}) {
  const targets = collectActionRollTargets(action);
  const hasRecharge = RECHARGE_PATTERN.test(action.name);

  if (!targets.length && !hasRecharge) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {targets.map((target) => {
        if (target.kind === "attack" && target.modifier != null) {
          return (
            <RollChip
              key={`attack-${action.name}-${target.modifier}`}
              title={target.label}
              onClick={() =>
                onResult(
                  rollD20Check(target.modifier!, target.label, advantage),
                )
              }
            >
              Ataque {formatModifier(target.modifier)}
            </RollChip>
          );
        }

        if (!target.expression) return null;
        const isDamage = target.kind === "damage";
        const chipLabel = isDamage
          ? `Dano ${target.expression}${critical ? " crit" : ""}`
          : target.expression;
        return (
          <RollChip
            key={`${target.kind}-${action.name}-${target.expression}`}
            title={target.label}
            onClick={() =>
              onResult(
                rollExpression(target.expression!, target.label, {
                  critical: isDamage ? critical : false,
                }),
              )
            }
          >
            {chipLabel}
          </RollChip>
        );
      })}
      {hasRecharge ? (
        <RollChip
          title={`Recarga · ${action.name}`}
          onClick={() =>
            onResult(rollExpression("1d6", `Recarga · ${action.name}`))
          }
        >
          Recarga 1d6
        </RollChip>
      ) : null}
    </div>
  );
}

function TraitRollChips({
  trait,
  advantage,
  onResult,
}: {
  trait: StatBlockTrait;
  advantage: AdvantageMode;
  onResult: (result: LocalRollResult) => void;
}) {
  const isSkills = /perícias|skills/i.test(trait.name);
  const skillBonuses = isSkills ? extractSkillBonuses(trait.description) : [];
  const dice = extractDiceExpressions(trait.description);

  if (!skillBonuses.length && !dice.length) return null;

  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {skillBonuses.map((skill) => (
        <RollChip
          key={`${skill.name}-${skill.modifier}`}
          title={`Perícia · ${skill.name}`}
          onClick={() =>
            onResult(
              rollD20Check(
                skill.modifier,
                `Perícia · ${skill.name}`,
                advantage,
              ),
            )
          }
        >
          {skill.name} {formatModifier(skill.modifier)}
        </RollChip>
      ))}
      {dice.map((expression) => (
        <RollChip
          key={`${trait.name}-${expression}`}
          title={`Dado · ${trait.name}`}
          onClick={() =>
            onResult(rollExpression(expression, `Dado · ${trait.name}`))
          }
        >
          {expression}
        </RollChip>
      ))}
    </div>
  );
}

export function StatBlockCard({
  name,
  subtitle,
  variant = "creature",
  armorClass,
  initiativeModifier,
  hitPoints,
  hitPointsFormula,
  hitPointsCurrent,
  damageThreshold,
  speeds = [],
  abilityScores,
  crewCapacity,
  passengerCapacity,
  cargoCapacityLabel,
  challengeRating,
  proficiencyBonus,
  traits = [],
  actions = [],
  enableRolls = true,
}: StatBlockCardProps) {
  const [latestRoll, setLatestRoll] = useState<LocalRollResult | null>(null);
  const [advantage, setAdvantage] = useState<AdvantageMode>("normal");
  const [critical, setCritical] = useState(false);

  const titleColor =
    variant === "vehicle" ? "text-sky-900 dark:text-sky-200" : "text-rose-900 dark:text-rose-200";
  const borderColor =
    variant === "vehicle" ? "border-sky-800/30" : "border-rose-800/30";

  const hpText =
    hitPointsCurrent != null && hitPoints != null
      ? `${hitPointsCurrent} / ${hitPoints}${hitPointsFormula ? ` (${hitPointsFormula})` : ""}`
      : hitPoints != null
        ? `${hitPoints}${hitPointsFormula ? ` (${hitPointsFormula})` : ""}`
        : null;

  const acText =
    armorClass != null
      ? damageThreshold != null
        ? `${armorClass} (limiar ${damageThreshold})`
        : String(armorClass)
      : null;

  const speedText =
    speeds.length > 0 ? formatTemplateSpeeds(speeds) : null;

  const actionGroups = orderedActionGroups(actions);
  const turnRules = traits.find((t) => t.name === "Regras de turno");
  const displayTraits = traits.filter((t) => t.name !== "Regras de turno");

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-card shadow-sm ${borderColor}`}
    >
      <header className={`border-b px-4 py-3 ${borderColor}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className={`font-heading text-xl font-bold tracking-wide uppercase ${titleColor}`}>
              {name}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm italic text-muted-foreground">
                {toMetricProse(subtitle)}
              </p>
            ) : null}
          </div>
          {enableRolls ? (
            <RollModeToolbar
              advantage={advantage}
              onAdvantageChange={setAdvantage}
              critical={critical}
              onCriticalChange={setCritical}
            />
          ) : null}
        </div>
      </header>

      <div className="grid gap-0 md:grid-cols-2">
        <section className="space-y-3 border-b p-4 md:border-b-0 md:border-r md:border-border/60">
          <StatLine label="CA" value={acText} />
          <StatLine
            label="Iniciativa"
            value={formatInitiative(initiativeModifier)}
            onRoll={
              enableRolls && initiativeModifier != null
                ? () =>
                    setLatestRoll(
                      rollD20Check(
                        initiativeModifier,
                        `Iniciativa · ${name}`,
                        advantage,
                      ),
                    )
                : undefined
            }
            rollTitle={`Rolar iniciativa de ${name}`}
          />
          <StatLine label="PV" value={hpText} />
          {enableRolls && hitPointsFormula ? (
            <div className="flex flex-wrap gap-1.5">
              {extractDiceExpressions(hitPointsFormula).map((expression) => (
                <RollChip
                  key={`hp-${expression}`}
                  title={`PV · ${name}`}
                  onClick={() =>
                    setLatestRoll(rollExpression(expression, `PV · ${name}`))
                  }
                >
                  PV {expression}
                </RollChip>
              ))}
            </div>
          ) : null}
          <StatLine label="Desloc." value={speedText} />
          {crewCapacity != null ? (
            <StatLine
              label="Tripulação"
              value={[
                String(crewCapacity),
                passengerCapacity != null ? `Passageiros ${passengerCapacity}` : null,
                cargoCapacityLabel ? toMetricProse(cargoCapacityLabel) : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            />
          ) : null}
          {abilityScores ? (
            <AbilityTable
              abilityScores={abilityScores}
              onRollAbility={
                enableRolls
                  ? (_key, label, modifier) =>
                      setLatestRoll(
                        rollD20Check(modifier, `Teste · ${label}`, advantage),
                      )
                  : undefined
              }
            />
          ) : null}
          {displayTraits.map((trait) => (
            <div key={`${trait.name}-${trait.sortOrder ?? 0}`}>
              <p className="text-sm leading-relaxed">
                <span className="font-semibold italic">{trait.name}.</span>{" "}
                <span className="text-muted-foreground">
                  {toMetricProse(trait.description)}
                </span>
              </p>
              {enableRolls ? (
                <TraitRollChips
                  trait={trait}
                  advantage={advantage}
                  onResult={setLatestRoll}
                />
              ) : null}
            </div>
          ))}
          {challengeRating ? (
            <StatLine
              label="ND"
              value={[
                challengeRating,
                proficiencyBonus != null ? `PB +${proficiencyBonus}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            />
          ) : null}
        </section>

        <section className="space-y-4 p-4">
          {turnRules ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {toMetricProse(turnRules.description)}
            </p>
          ) : null}
          {actionGroups.map(([bucket, bucketActions]) => {
            const legendarySplit =
              bucket === "legendary"
                ? splitLegendaryBucket(bucketActions)
                : null;

            return (
              <div key={bucket}>
                <h3 className="mb-2 rounded bg-sky-100 px-2 py-1 text-xs font-bold tracking-wider text-sky-900 uppercase dark:bg-sky-950 dark:text-sky-100">
                  {BUCKET_LABELS[bucket] ?? bucket}
                </h3>
                {legendarySplit?.usesAction?.description ? (
                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {legendarySplit.usesAction.name}.
                    </span>{" "}
                    {toMetricProse(legendarySplit.usesAction.description)}
                  </p>
                ) : null}
                <ul className="space-y-3">
                  {(legendarySplit?.abilityActions ?? bucketActions).map(
                    (action) => (
                      <li
                        key={`${action.name}-${action.sortOrder ?? 0}`}
                        className="text-sm"
                      >
                        <p className="font-semibold italic">{action.name}.</p>
                        <p className="text-muted-foreground">
                          {action.description
                            ? toMetricProse(action.description)
                            : ([
                                action.attackBonus != null
                                  ? `+${action.attackBonus} ataque`
                                  : null,
                                action.damageExpression,
                                action.reachFt != null
                                  ? formatReachFromFeet(action.reachFt)
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(" · ") ||
                              "—")}
                        </p>
                        {enableRolls ? (
                          <ActionRollChips
                            action={action}
                            advantage={advantage}
                            critical={critical}
                            onResult={setLatestRoll}
                          />
                        ) : null}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            );
          })}
        </section>
      </div>

      <LocalRollResultBanner
        result={latestRoll}
        onDismiss={() => setLatestRoll(null)}
      />
    </article>
  );
}
