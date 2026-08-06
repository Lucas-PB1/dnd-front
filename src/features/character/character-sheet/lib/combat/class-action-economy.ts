/**
 * Catálogo de features de classe com economia de ação (turno).
 * Fonte: PHB 2024 + painéis de combate do front (slugs alinhados).
 */

export type ActionEconomyBucket =
  | "action"
  | "bonus"
  | "reaction"
  | "free";

export type ClassEconomyAction = {
  id: string;
  name: string;
  economy: ActionEconomyBucket;
  classSlug: string;
  minLevel: number;
  /** Se definido, só aparece com essa subclasse. */
  subclassSlug?: string;
  resourceSlug?: string;
  summary?: string;
};

const FIGHTER: ClassEconomyAction[] = [
  {
    id: "fighter-second-wind",
    name: "Recuperar Fôlego",
    economy: "bonus",
    classSlug: "fighter",
    minLevel: 1,
    resourceSlug: "secondWind",
    summary: "Cura 1d10 + nível de Guerreiro",
  },
  {
    id: "fighter-action-surge",
    name: "Surto de Ação",
    economy: "action",
    classSlug: "fighter",
    minLevel: 2,
    resourceSlug: "actionSurge",
    summary: "Concede uma ação adicional neste turno",
  },
  {
    id: "fighter-tactical-mind",
    name: "Mente Tática",
    economy: "free",
    classSlug: "fighter",
    minLevel: 2,
    resourceSlug: "secondWind",
    summary: "Ao falhar em teste: +1d10 (gasta Fôlego só se virar sucesso)",
  },
  {
    id: "fighter-indomitable",
    name: "Indomável",
    economy: "free",
    classSlug: "fighter",
    minLevel: 9,
    resourceSlug: "indomitable",
    summary: "Ao falhar salvaguarda: rerrola com +nível",
  },
  {
    id: "fighter-psi-protective-field",
    name: "Campo Protetor",
    economy: "reaction",
    classSlug: "fighter",
    subclassSlug: "psi-warrior",
    minLevel: 3,
    resourceSlug: "psi-energy-dice",
    summary: "Reduz dano recebido com dado psiônico",
  },
  {
    id: "fighter-psi-telekinetic-movement",
    name: "Movimento Telecinético",
    economy: "action",
    classSlug: "fighter",
    subclassSlug: "psi-warrior",
    minLevel: 3,
    resourceSlug: "psi-energy-dice",
    summary: "Mover objeto ou criatura (Usar Magia)",
  },
  {
    id: "fighter-psi-psychic-leap",
    name: "Salto Psíquico",
    economy: "bonus",
    classSlug: "fighter",
    subclassSlug: "psi-warrior",
    minLevel: 7,
    resourceSlug: "psi-energy-dice",
    summary: "Salto longo potencializado",
  },
  {
    id: "fighter-psi-mental-guard",
    name: "Resguardo Mental",
    economy: "free",
    classSlug: "fighter",
    subclassSlug: "psi-warrior",
    minLevel: 10,
    resourceSlug: "psi-energy-dice",
    summary: "Gasta dado psiônico para resistência mental",
  },
  {
    id: "fighter-psi-energy-bulwark",
    name: "Baluarte de Energia",
    economy: "bonus",
    classSlug: "fighter",
    subclassSlug: "psi-warrior",
    minLevel: 15,
    resourceSlug: "psi-energy-dice",
    summary: "PV temporários com energia psiônica",
  },
  {
    id: "fighter-bm-lunging-attack",
    name: "Ataque Estendido",
    economy: "bonus",
    classSlug: "fighter",
    subclassSlug: "battle-master",
    minLevel: 3,
    resourceSlug: "superiority-dice",
    summary: "Manobra: Correr e potencializar ataque",
  },
  {
    id: "fighter-bm-rally",
    name: "Reunir",
    economy: "bonus",
    classSlug: "fighter",
    subclassSlug: "battle-master",
    minLevel: 3,
    resourceSlug: "superiority-dice",
    summary: "Manobra: PV temporários a um aliado",
  },
  {
    id: "fighter-bm-feinting-attack",
    name: "Ataque Fintado",
    economy: "bonus",
    classSlug: "fighter",
    subclassSlug: "battle-master",
    minLevel: 3,
    resourceSlug: "superiority-dice",
    summary: "Manobra: Vantagem no próximo ataque",
  },
  {
    id: "fighter-bm-parry",
    name: "Aparar",
    economy: "reaction",
    classSlug: "fighter",
    subclassSlug: "battle-master",
    minLevel: 3,
    resourceSlug: "superiority-dice",
    summary: "Manobra: reduzir dano corpo a corpo",
  },
  {
    id: "fighter-bm-riposte",
    name: "Repostagem",
    economy: "reaction",
    classSlug: "fighter",
    subclassSlug: "battle-master",
    minLevel: 3,
    resourceSlug: "superiority-dice",
    summary: "Manobra: contra-ataque ao ser errado",
  },
];

const ROGUE: ClassEconomyAction[] = [
  {
    id: "rogue-cunning-action",
    name: "Ação Ardilosa",
    economy: "bonus",
    classSlug: "rogue",
    minLevel: 2,
    summary: "Correr, Desengajar ou Esconder",
  },
  {
    id: "rogue-uncanny-dodge",
    name: "Esquiva Sobrenatural",
    economy: "reaction",
    classSlug: "rogue",
    minLevel: 5,
    summary: "Metade do dano de um ataque que o acertou",
  },
  {
    id: "rogue-soulknife-second-blade",
    name: "Segunda Lâmina Psíquica",
    economy: "bonus",
    classSlug: "rogue",
    subclassSlug: "soulknife",
    minLevel: 3,
    summary: "Ataque com a segunda lâmina (1d4)",
  },
  {
    id: "rogue-psychic-teleportation",
    name: "Teleporte Psíquico",
    economy: "bonus",
    classSlug: "rogue",
    subclassSlug: "soulknife",
    minLevel: 9,
    resourceSlug: "soulknife-psi-dice",
    summary: "Teleporte gastando dado psiônico",
  },
  {
    id: "rogue-spell-thief",
    name: "Ladrão de Magias",
    economy: "reaction",
    classSlug: "rogue",
    subclassSlug: "arcane-trickster",
    minLevel: 17,
    resourceSlug: "spell-thief",
    summary: "Negar e roubar uma magia",
  },
];

const BARBARIAN: ClassEconomyAction[] = [
  {
    id: "barbarian-rage",
    name: "Fúria",
    economy: "bonus",
    classSlug: "barbarian",
    minLevel: 1,
    resourceSlug: "rage",
    summary: "Entrar em Fúria",
  },
  {
    id: "barbarian-reckless",
    name: "Ataque Imprudente",
    economy: "free",
    classSlug: "barbarian",
    minLevel: 2,
    summary: "No seu turno, ao atacar: Vantagem (e ataques contra você também)",
  },
];

const MONK: ClassEconomyAction[] = [
  {
    id: "monk-flurry",
    name: "Torrente de Golpes",
    economy: "bonus",
    classSlug: "monk",
    minLevel: 2,
    resourceSlug: "focusPoints",
    summary: "Dois ataques desarmados (gasta Foco)",
  },
  {
    id: "monk-patient-defense",
    name: "Defesa Paciente",
    economy: "bonus",
    classSlug: "monk",
    minLevel: 2,
    resourceSlug: "focusPoints",
    summary: "Esquivar (gasta Foco)",
  },
  {
    id: "monk-step-of-the-wind",
    name: "Passo do Vento",
    economy: "bonus",
    classSlug: "monk",
    minLevel: 2,
    resourceSlug: "focusPoints",
    summary: "Correr ou Desengajar; salto dobrado (gasta Foco)",
  },
  {
    id: "monk-stunning-strike",
    name: "Golpe Atordoante",
    economy: "free",
    classSlug: "monk",
    minLevel: 5,
    resourceSlug: "focusPoints",
    summary: "Ao acertar: tentativa de Atordoar (gasta Foco)",
  },
  {
    id: "monk-deflect",
    name: "Defletir Ataques",
    economy: "reaction",
    classSlug: "monk",
    minLevel: 3,
    summary: "Reduz dano de ataque corpo a corpo ou à distância",
  },
  {
    id: "monk-slow-fall",
    name: "Queda Lenta",
    economy: "reaction",
    classSlug: "monk",
    minLevel: 4,
    summary: "Reduz dano de queda",
  },
  {
    id: "monk-hand-of-healing",
    name: "Mão de Cura",
    economy: "action",
    classSlug: "monk",
    subclassSlug: "mercy",
    minLevel: 3,
    resourceSlug: "focusPoints",
    summary: "Cura com Foco",
  },
  {
    id: "monk-shadow-step",
    name: "Passo da Sombra",
    economy: "bonus",
    classSlug: "monk",
    subclassSlug: "shadow",
    minLevel: 6,
    summary: "Teleporte entre sombras",
  },
];

const BARD: ClassEconomyAction[] = [
  {
    id: "bard-inspiration",
    name: "Inspiração Bárdica",
    economy: "bonus",
    classSlug: "bard",
    minLevel: 1,
    resourceSlug: "bardicInspiration",
    summary: "Conceder o dado a um aliado a até 18 m",
  },
  {
    id: "bard-cutting-words",
    name: "Palavras Cortantes",
    economy: "reaction",
    classSlug: "bard",
    subclassSlug: "lore",
    minLevel: 3,
    resourceSlug: "bardicInspiration",
    summary: "Subtrair o dado de ataque/teste/dano inimigo",
  },
  {
    id: "bard-agile-response",
    name: "Resposta Ágil",
    economy: "reaction",
    classSlug: "bard",
    subclassSlug: "dance",
    minLevel: 6,
    resourceSlug: "bardicInspiration",
    summary: "+CA e movimento se o ataque errar",
  },
  {
    id: "bard-combat-inspiration",
    name: "Inspiração de Combate",
    economy: "reaction",
    classSlug: "bard",
    subclassSlug: "valor",
    minLevel: 3,
    resourceSlug: "bardicInspiration",
    summary: "Aliado soma o dado ao dano ou à CA",
  },
  {
    id: "bard-mantle-of-majesty",
    name: "Manto de Majestade",
    economy: "bonus",
    classSlug: "bard",
    subclassSlug: "glamour",
    minLevel: 6,
    summary: "Conjurar Comando sem gastar espaço",
  },
];

const PALADIN: ClassEconomyAction[] = [
  {
    id: "paladin-lay-on-hands",
    name: "Mãos Consagradas",
    economy: "bonus",
    classSlug: "paladin",
    minLevel: 1,
    resourceSlug: "layOnHands",
    summary: "Cura da reserva (5 × nível)",
  },
  {
    id: "paladin-divine-sense",
    name: "Sentido Divino",
    economy: "bonus",
    classSlug: "paladin",
    minLevel: 1,
    summary: "Detectar celestiais, fiends e mortos-vivos",
  },
  {
    id: "paladin-protective-smite",
    name: "Destruição Protetora",
    economy: "reaction",
    classSlug: "paladin",
    subclassSlug: "devotion",
    minLevel: 15,
    summary: "Reduzir dano com a Reação",
  },
  {
    id: "paladin-glorious-defense",
    name: "Defesa Gloriosa",
    economy: "reaction",
    classSlug: "paladin",
    subclassSlug: "glory",
    minLevel: 15,
    summary: "Concede CA e contra-ataque",
  },
];

const RANGER: ClassEconomyAction[] = [
  {
    id: "ranger-hunters-mark",
    name: "Marca do Predador",
    economy: "bonus",
    classSlug: "ranger",
    minLevel: 1,
    resourceSlug: "favoredEnemy",
    summary: "Marcar alvo (uso gratuito disponível)",
  },
  {
    id: "ranger-natures-veil",
    name: "Véu da Natureza",
    economy: "bonus",
    classSlug: "ranger",
    minLevel: 14,
    resourceSlug: "naturesVeil",
    summary: "Tornar-se Invisível até o fim do próximo turno",
  },
  {
    id: "ranger-primal-companion",
    name: "Companheiro Primal",
    economy: "bonus",
    classSlug: "ranger",
    subclassSlug: "beast-master",
    minLevel: 3,
    summary: "Comandar a fera",
  },
  {
    id: "ranger-hunter-defense",
    name: "Defesa do Caçador Superior",
    economy: "reaction",
    classSlug: "ranger",
    subclassSlug: "hunter",
    minLevel: 15,
    summary: "Resistência ao dano neste turno",
  },
  {
    id: "ranger-gloom-stalker-dodge",
    name: "Esquiva Sombria",
    economy: "reaction",
    classSlug: "ranger",
    subclassSlug: "gloom-stalker",
    minLevel: 15,
    summary: "Desvantagem no ataque e teleporte de 9 m",
  },
];

const CLERIC: ClassEconomyAction[] = [
  {
    id: "cleric-channel",
    name: "Canalizar Divindade",
    economy: "action",
    classSlug: "cleric",
    minLevel: 2,
    resourceSlug: "channelDivinity",
    summary: "Centelha Divina, Expulsar Mortos-Vivos etc.",
  },
  {
    id: "cleric-warding-flare",
    name: "Labareda Protetora",
    economy: "reaction",
    classSlug: "cleric",
    subclassSlug: "light",
    minLevel: 3,
    resourceSlug: "warding-flare",
    summary: "Desvantagem no ataque contra você",
  },
  {
    id: "cleric-war-priest",
    name: "Sacerdote da Guerra",
    economy: "bonus",
    classSlug: "cleric",
    subclassSlug: "war",
    minLevel: 3,
    resourceSlug: "war-priest",
    summary: "Ataque com arma como Ação Bônus",
  },
  {
    id: "cleric-guided-strike",
    name: "Ataque Direcionado",
    economy: "free",
    classSlug: "cleric",
    subclassSlug: "war",
    minLevel: 3,
    resourceSlug: "channelDivinity",
    summary: "Após errar: +10 no ataque",
  },
];

const DRUID: ClassEconomyAction[] = [
  {
    id: "druid-wild-shape",
    name: "Forma Selvagem",
    economy: "bonus",
    classSlug: "druid",
    minLevel: 2,
    resourceSlug: "wildShape",
    summary: "Assumir forma de besta",
  },
  {
    id: "druid-lunar-healing",
    name: "Cura Lunar",
    economy: "bonus",
    classSlug: "druid",
    subclassSlug: "moon",
    minLevel: 3,
    summary: "Na Forma Selvagem: gastar slot para curar",
  },
  {
    id: "druid-wrath-of-the-sea",
    name: "Ira do Mar",
    economy: "bonus",
    classSlug: "druid",
    subclassSlug: "sea",
    minLevel: 3,
    resourceSlug: "wildShape",
    summary: "Aura de tempestade",
  },
];

const SORCERER: ClassEconomyAction[] = [
  {
    id: "sorcerer-innate-sorcery",
    name: "Ira Feiticeira",
    economy: "bonus",
    classSlug: "sorcerer",
    minLevel: 1,
    summary: "+1 na CD e Vantagem em ataques de truque (1 min)",
  },
  {
    id: "sorcerer-metamagic",
    name: "Metamágica",
    economy: "free",
    classSlug: "sorcerer",
    minLevel: 2,
    resourceSlug: "sorceryPoints",
    summary: "Ao conjurar: gastar pontos de feitiçaria",
  },
  {
    id: "sorcerer-dragon-wings",
    name: "Asas Dracônicas",
    economy: "bonus",
    classSlug: "sorcerer",
    subclassSlug: "draconic",
    minLevel: 14,
    summary: "Deslocamento de voo",
  },
];

const WARLOCK: ClassEconomyAction[] = [
  {
    id: "warlock-magical-cunning",
    name: "Contato Arcano",
    economy: "bonus",
    classSlug: "warlock",
    minLevel: 5,
    summary: "Recupera 1 Slot de Pacto (1×/Descanso Longo)",
  },
  {
    id: "warlock-healing-light",
    name: "Luz Curativa",
    economy: "bonus",
    classSlug: "warlock",
    subclassSlug: "celestial",
    minLevel: 3,
    resourceSlug: "healing-light",
    summary: "Cura com reserva de d6s",
  },
  {
    id: "warlock-dark-ones-luck",
    name: "Sorte do Próprio Inferno",
    economy: "free",
    classSlug: "warlock",
    subclassSlug: "fiend",
    minLevel: 3,
    resourceSlug: "dark-ones-own-luck",
    summary: "+1d10 em teste ou salvaguarda",
  },
];

const WIZARD: ClassEconomyAction[] = [
  {
    id: "wizard-improved-illusions",
    name: "Ilusão Aprimorada",
    economy: "bonus",
    classSlug: "wizard",
    subclassSlug: "illusionist",
    minLevel: 3,
    summary: "Conjurar ilusões como Ação Bônus (sem componente V)",
  },
];

/** Catálogo completo — ordem estável por classe. */
export const CLASS_ECONOMY_ACTIONS: readonly ClassEconomyAction[] = [
  ...FIGHTER,
  ...ROGUE,
  ...BARBARIAN,
  ...MONK,
  ...BARD,
  ...PALADIN,
  ...RANGER,
  ...CLERIC,
  ...DRUID,
  ...SORCERER,
  ...WARLOCK,
  ...WIZARD,
];

export type ResolveClassEconomyInput = {
  classSlug: string;
  level: number;
  subclassSlug?: string | null;
};

export function resolveClassEconomyActions(
  input: ResolveClassEconomyInput,
): ClassEconomyAction[] {
  const subclass = input.subclassSlug ?? null;
  return CLASS_ECONOMY_ACTIONS.filter((action) => {
    if (action.classSlug !== input.classSlug) return false;
    if (input.level < action.minLevel) return false;
    if (action.subclassSlug != null && action.subclassSlug !== subclass) {
      return false;
    }
    return true;
  });
}

export function groupClassEconomyActions(
  actions: ClassEconomyAction[],
): Record<ActionEconomyBucket, ClassEconomyAction[]> {
  return {
    action: actions.filter((a) => a.economy === "action"),
    bonus: actions.filter((a) => a.economy === "bonus"),
    reaction: actions.filter((a) => a.economy === "reaction"),
    free: actions.filter((a) => a.economy === "free"),
  };
}
