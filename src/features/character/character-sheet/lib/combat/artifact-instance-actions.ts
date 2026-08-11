import type { InventoryItem } from "@/entities/character/session-types";
import type { ClassEconomyAction } from "@/features/character/character-sheet/lib/combat/class-action-economy";

type ArtifactBucket =
  | "minorBeneficial"
  | "majorBeneficial"
  | "minorDetrimental"
  | "majorDetrimental";

const BUCKETS: ArtifactBucket[] = [
  "minorBeneficial",
  "majorBeneficial",
  "minorDetrimental",
  "majorDetrimental",
];

export const ARTIFACT_RANDOM_CAST_TABLE_ACTION = "artifact-random-cast";
export const ARTIFACT_REGEN_TABLE_ACTION = "artifact-regen";

type RolledProp = {
  slug?: string;
  summaryPt?: string;
  effect?: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function readProps(value: unknown): RolledProp[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is RolledProp => isRecord(entry));
}

/**
 * Ações virtuais a partir de instance_properties (magias roladas + regen).
 * Só itens com efeitos ativos (equipado + sintonizado se precisar).
 */
export function artifactInstanceEconomyActions(
  items: readonly InventoryItem[],
): ClassEconomyAction[] {
  const actions: ClassEconomyAction[] = [];

  for (const item of items) {
    if (!item.effectsActive) continue;
    const instance = item.instanceProperties;
    if (!isRecord(instance)) continue;
    const artifactRandom = isRecord(instance.artifactRandom)
      ? instance.artifactRandom
      : null;
    if (!artifactRandom) continue;

    for (const bucket of BUCKETS) {
      const props = readProps(artifactRandom[bucket]);
      props.forEach((prop, index) => {
        const effect = isRecord(prop.effect) ? prop.effect : null;
        if (!effect) return;
        if (
          effect.type === "artifactSpell" &&
          typeof effect.spellSlug === "string"
        ) {
          const spent = effect.spentUntilLongRest === true;
          actions.push({
            id: `artifact-spell:${item.itemSlug}:${bucket}:${index}`,
            name: spent
              ? `${prop.summaryPt ?? effect.spellSlug} (usado até DL)`
              : (prop.summaryPt ?? `Conjurar ${effect.spellSlug}`),
            economy: "action",
            minLevel: 1,
            ...(spent
              ? {}
              : {
                  tableAction: ARTIFACT_RANDOM_CAST_TABLE_ACTION,
                  spellSlug: effect.spellSlug,
                  resourceSlug: `${bucket}:${index}`,
                }),
            itemSlug: item.itemSlug,
            summary: `CD ${Number(effect.spellSaveDc ?? 18)} · 1× até descanso longo`,
          });
        }
        if (effect.type === "artifactRegen") {
          actions.push({
            id: `artifact-regen:${item.itemSlug}`,
            name: `Regeneração ${String(effect.dice ?? "1d6")} (artefato)`,
            economy: "action",
            minLevel: 1,
            tableAction: ARTIFACT_REGEN_TABLE_ACTION,
            itemSlug: item.itemSlug,
            summary: "Role e aplique cura agora (RAW: início do turno)",
          });
        }
      });
    }
  }

  return actions;
}
