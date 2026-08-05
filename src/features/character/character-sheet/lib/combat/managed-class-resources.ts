/**
 * Recursos de classe que já têm botões/ações dedicadas no painel da classe.
 * O painel genérico "Recursos de Classe" não deve listá-los (evita gastar sem contexto).
 */
const MANAGED_BY_CLASS_PANEL: Readonly<Record<string, readonly string[]>> = {
  bard: ["bardicInspiration", "bardic-inspiration"],
  fighter: ["secondWind", "actionSurge", "indomitable"],
  cleric: [
    "channelDivinity",
    "divineIntervention",
    "warding-flare",
    "corona-of-light",
    "war-priest",
  ],
  sorcerer: ["sorceryPoints", "sorcery-points"],
  warlock: ["healing-light", "dark-ones-own-luck"],
  druid: ["wildShape", "wild-shape"],
  ranger: [
    "favoredEnemy",
    "tireless",
    "naturesVeil",
    "fey-reinforcements",
    "misty-wanderer",
    "dread-strike",
  ],
  paladin: ["layOnHands", "channelDivinity"],
  monk: ["focusPoints"],
  barbarian: ["rage"],
  rogue: ["strokeOfLuck", "soulknife-psi-dice"],
  wizard: [],
  gunslinger: [],
};

export function managedClassResourceSlugs(
  classSlug: string | null | undefined,
): readonly string[] {
  if (!classSlug) return [];
  return MANAGED_BY_CLASS_PANEL[classSlug] ?? [];
}
