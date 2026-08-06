/**
 * Catálogo de features de classe com economia de ação (turno).
 * Fonte: PHB 2024 + painéis de combate do front (slugs alinhados).
 */

import type { EconomyTableAction } from "@/features/character/character-sheet/lib/combat/economy-table-actions";

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
  /** Pool principal (ex.: psi-energy-dice, secondWind). */
  resourceSlug?: string;
  /** Tracker 0/1 de uso gratuito por descanso (ex.: telekinetic-movement). */
  freeResourceSlug?: string;
  /** Sempre gasta o pool (sem uso gratuito). */
  alwaysSpendsResource?: boolean;
  /** Resumo de uma linha na lista. */
  summary?: string;
  /** Texto maior para o modal de detalhe (fallback: summary). */
  description?: string;
  /** Se definido, a aba Ações mostra Usar com efeito de mesa. */
  tableAction?: EconomyTableAction;
  /** Quantidade gasta por Usar quando tableAction é spend-resource (padrão 1). */
  spendAmount?: number;
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
    description:
      "Como Ação Bônus, você pode recuperar pontos de vida iguais a 1d10 + seu nível de Guerreiro. Você tem um número limitado de usos; recupere-os ao terminar um Descanso Curto ou Longo.",
    tableAction: "second-wind",
  },
  {
    id: "fighter-action-surge",
    name: "Surto de Ação",
    economy: "action",
    classSlug: "fighter",
    minLevel: 2,
    resourceSlug: "actionSurge",
    summary: "Concede uma ação adicional neste turno",
    description:
      "No seu turno, você pode se esforçar além do normal e ganhar uma Ação adicional. Depois de usar Surto de Ação, você precisa terminar um Descanso Curto ou Longo para usá-lo de novo (em níveis altos, pode ter mais usos).",
    tableAction: "action-surge",
  },
  {
    id: "fighter-tactical-mind",
    name: "Mente Tática",
    economy: "free",
    classSlug: "fighter",
    minLevel: 2,
    resourceSlug: "secondWind",
    summary: "Ao falhar em teste: +1d10 (gasta Fôlego só se virar sucesso)",
    description:
      "Quando você falha em um teste de habilidade, você pode gastar um uso de Recuperar Fôlego para rolar 1d10 e somar ao resultado. Se o teste ainda falhar, o uso de Recuperar Fôlego não é gasto.",
    tableAction: "tactical-mind",
  },
  {
    id: "fighter-indomitable",
    name: "Indomável",
    economy: "free",
    classSlug: "fighter",
    minLevel: 9,
    resourceSlug: "indomitable",
    summary: "Ao falhar salvaguarda: rerrola com +nível",
    description:
      "Se você falhar em uma salvaguarda, pode rerrolá-la com um bônus igual ao seu nível de Guerreiro. Você deve usar o novo resultado. Usos limitados; recupere-os ao terminar um Descanso Longo. Na ficha, marque a opção Indomável ao rolar a salvaguarda.",
  },
  {
    id: "fighter-psi-protective-field",
    name: "Campo Protetor",
    economy: "reaction",
    classSlug: "fighter",
    subclassSlug: "psi-warrior",
    minLevel: 3,
    resourceSlug: "psi-energy-dice",
    alwaysSpendsResource: true,
    summary: "Reação: reduz dano com 1 dado psi + INT",
    description:
      "Quando você ou uma criatura que você possa ver a até 9 metros sofrer dano, use sua Reação e gaste um Dado de Energia Psiônica: reduza o dano pelo resultado do dado + seu modificador de Inteligência. Sempre gasta um dado (não tem uso gratuito).",
    tableAction: "psi:protective-field",
  },
  {
    id: "fighter-psi-telekinetic-movement",
    name: "Movimento Telecinético",
    economy: "action",
    classSlug: "fighter",
    subclassSlug: "psi-warrior",
    minLevel: 3,
    resourceSlug: "psi-energy-dice",
    freeResourceSlug: "telekinetic-movement",
    summary: "1× gratuito por descanso; depois gasta 1 dado psi",
    description:
      "Mova um objeto solto ou uma criatura voluntária conforme a característica. O primeiro uso após um Descanso Curto ou Longo é gratuito; usos extras gastam um Dado de Energia Psiônica.",
    tableAction: "psi:telekinetic-movement",
  },
  {
    id: "fighter-psi-psychic-leap",
    name: "Salto com Impulsão Psíquica",
    economy: "bonus",
    classSlug: "fighter",
    subclassSlug: "psi-warrior",
    minLevel: 7,
    resourceSlug: "psi-energy-dice",
    freeResourceSlug: "psychic-leap",
    summary: "1× gratuito por descanso; voo = 2× deslocamento",
    description:
      "Como Ação Bônus, você ganha Deslocamento de Voo igual ao dobro do seu Deslocamento até o fim do turno. O primeiro uso após um Descanso Curto ou Longo é gratuito; depois, gaste um Dado de Energia Psiônica.",
    tableAction: "psi:psychic-leap",
  },
  {
    id: "fighter-psi-mental-guard",
    name: "Resguardo Mental",
    economy: "free",
    classSlug: "fighter",
    subclassSlug: "psi-warrior",
    minLevel: 10,
    resourceSlug: "psi-energy-dice",
    alwaysSpendsResource: true,
    summary: "Gasta 1 dado: encerra Amedrontado/Enfeitiçado",
    description:
      "Gaste um Dado de Energia Psiônica (nenhuma ação) para encerrar em você todos os efeitos que causam as condições Amedrontado ou Enfeitiçado. Sempre gasta um dado.",
    tableAction: "psi:mental-guard",
  },
  {
    id: "fighter-psi-energy-bulwark",
    name: "Baluarte de Energia",
    economy: "bonus",
    classSlug: "fighter",
    subclassSlug: "psi-warrior",
    minLevel: 15,
    resourceSlug: "psi-energy-dice",
    freeResourceSlug: "energy-bulwark",
    summary: "1× gratuito por descanso longo; Cobertura Parcial",
    description:
      "Conceda Cobertura Parcial por 1 minuto a até o seu modificador de Inteligência em criaturas (mínimo 1). O primeiro uso após um Descanso Longo é gratuito; depois, gaste um Dado de Energia Psiônica.",
    tableAction: "psi:energy-bulwark",
  },
  {
    id: "fighter-psi-telekinetic-master",
    name: "Mestre Telecinético",
    economy: "free",
    classSlug: "fighter",
    subclassSlug: "psi-warrior",
    minLevel: 18,
    resourceSlug: "psi-energy-dice",
    freeResourceSlug: "telekinetic-master",
    summary: "1× gratuito por descanso longo; Telecinese",
    description:
      "Conjure Telecinese sem espaço nem componentes (INT é o atributo). O primeiro uso após um Descanso Longo é gratuito; depois, gaste um Dado de Energia Psiônica.",
    tableAction: "psi:telekinetic-master",
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
    description:
      "Manobra do Mestre de Batalha. Gaste um dado de superioridade para potencializar um ataque com alcance ou movimento extra conforme a manobra escolhida (veja o texto completo da manobra na aba de poderes).",
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
    description:
      "Como Ação Bônus, gaste um dado de superioridade para conceder pontos de vida temporários a um aliado. O aliado ganha PV temporários iguais ao resultado do dado + seu modificador de Carisma.",
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
    description:
      "Como Ação Bônus, gaste um dado de superioridade para fintar: você ganha Vantagem no próximo ataque contra o alvo neste turno e adiciona o dado ao dano se acertar.",
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
    description:
      "Quando você é atingido por um ataque corpo a corpo, use sua Reação e gaste um dado de superioridade para reduzir o dano sofrido pelo resultado do dado + seu modificador de Destreza.",
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
    description:
      "Quando uma criatura erra um ataque corpo a corpo contra você, use sua Reação para gastar um dado de superioridade e fazer um ataque com arma contra ela, adicionando o dado ao dano se acertar.",
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
  {
    id: "bard-virtuoso-skill",
    name: "Habilidade de Virtuoso",
    economy: "free",
    classSlug: "bard",
    subclassSlug: "college-of-masks",
    minLevel: 6,
    resourceSlug: "virtuoso-skill",
    alwaysSpendsResource: true,
    summary: "1×/turno: Teste d20 com Carisma",
    description:
      "Uma vez por turno, ao fazer um Teste d20, você pode fazê-lo com Carisma se ainda não usar. Gaste 1 uso (máx. = mod. de Carisma).",
    tableAction: "spend-resource",
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
  {
    id: "ranger-beastborne-aspect",
    name: "Aspecto Bestial (mesa)",
    economy: "bonus",
    classSlug: "ranger",
    subclassSlug: "beastborne",
    minLevel: 3,
    summary: "Tracker de Aspecto Bestial (0–5) na mesa",
    description:
      "Ajuste o nível de Aspecto Bestial no painel do Guardião (+/− ou Uivo Feral). Benefícios acumulam: Carnificina, Velocidade, Frenesi, Pele, Retaliação. Zera no descanso longo (e após 1 min sem dano na mesa).",
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
  {
    id: "cleric-dragon-majesty",
    name: "Majestade Dracônica",
    economy: "action",
    classSlug: "cleric",
    subclassSlug: "dragon-domain",
    minLevel: 3,
    resourceSlug: "channelDivinity",
    alwaysSpendsResource: true,
    summary: "Canalizar: Enfeitiçar ou Amedrontar (9 m)",
    description:
      "Ação Mágica: apresente o Símbolo Sagrado e gaste Canalizar Divindade. Emanação de 9 m — Enfeitiçado ou Amedrontado (salvaguarda SAB, 1 min).",
    tableAction: "spend-resource",
  },
  {
    id: "cleric-legendary-aspect",
    name: "Aspecto Lendário",
    economy: "free",
    classSlug: "cleric",
    subclassSlug: "dragon-domain",
    minLevel: 17,
    resourceSlug: "legendary-aspect",
    alwaysSpendsResource: true,
    summary: "Ação lendária (Rasgar / Cauda / Asas)",
    description:
      "Gaste 1 uso para Rasgar, Golpe de Cauda ou Batida de Asas imediatamente após o turno de outra criatura. 3 usos/LR.",
    tableAction: "spend-resource",
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
  {
    id: "druid-city-shape",
    name: "Forma da Cidade",
    economy: "bonus",
    classSlug: "druid",
    subclassSlug: "circle-of-the-city",
    minLevel: 3,
    resourceSlug: "wildShape",
    alwaysSpendsResource: true,
    summary: "Gaste Forma Selvagem: Fundir-se / Passagem / Moldar Rocha",
    description:
      "Gaste 1 uso de Forma Selvagem para conjurar Fundir-se na Pedra, Passagem ou Moldar Rocha sem espaço de magia (mesa).",
    tableAction: "spend-resource",
  },
  {
    id: "druid-wall-warp",
    name: "Distorção de Muro",
    economy: "reaction",
    classSlug: "druid",
    subclassSlug: "circle-of-the-city",
    minLevel: 10,
    resourceSlug: "wall-warp",
    alwaysSpendsResource: true,
    summary: "Painel de Muralha de Pedra (1×/LR)",
    description:
      "Reação: ao ver um ataque causar dano a até 18 m, gaste o uso para erguer um painel 3×3 m (CA 15, 30 PV) até o fim do seu próximo turno.",
    tableAction: "spend-resource",
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
  {
    id: "sorcerer-heroic-soul",
    name: "Alma Heróica",
    economy: "free",
    classSlug: "sorcerer",
    subclassSlug: "heroic-sorcery",
    minLevel: 3,
    resourceSlug: "sorceryPoints",
    alwaysSpendsResource: true,
    spendAmount: 1,
    summary: "Início do turno: 1 SP → PV temp. 1d6 + nível",
    description:
      "No início de cada um dos seus turnos, gaste 1 Ponto de Feitiçaria para ganhar PV temporários iguais a 1d6 + seu nível de Feiticeiro (sem ação).",
    tableAction: "spend-resource",
  },
  {
    id: "sorcerer-mystical-maneuver",
    name: "Manobra Mística",
    economy: "bonus",
    classSlug: "sorcerer",
    subclassSlug: "heroic-sorcery",
    minLevel: 14,
    resourceSlug: "sorceryPoints",
    alwaysSpendsResource: true,
    spendAmount: 2,
    summary: "2 SP após acertar: Cegar / Ruinoso / Ferimento +2d8",
    description:
      "Ao acertar com arma ou Ataque Desarmado, gaste 2 Pontos de Feitiçaria como Ação Bônus: +2d8 no dano e Cegar, −3 CA ou ferimento sangrando (mesa).",
    tableAction: "spend-resource",
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
  {
    id: "wizard-mm-free",
    name: "Mísseis Mágicos Gratuitos",
    economy: "action",
    classSlug: "wizard",
    subclassSlug: "magic-missile-mage",
    minLevel: 3,
    resourceSlug: "magic-missile-free",
    alwaysSpendsResource: true,
    summary: "Conjure Mísseis sem espaço (gasta 1 uso)",
    description:
      "Gaste 1 uso para conjurar Mísseis Mágicos sem espaço de magia. Aplique dardos extras e penetração na mesa.",
    tableAction: "spend-resource",
  },
  {
    id: "wizard-missile-shield",
    name: "Escudo de Mísseis",
    economy: "action",
    classSlug: "wizard",
    subclassSlug: "magic-missile-mage",
    minLevel: 10,
    resourceSlug: "missile-shield",
    alwaysSpendsResource: true,
    summary: "Orbitar dardos (+CA) por até 1 min",
    description:
      "Ao conjurar Mísseis Mágicos, gaste o uso para orbitar os dardos (+CA até +5, Emanação 3 m, até 1 min).",
    tableAction: "spend-resource",
  },
  {
    id: "wizard-giga-missile",
    name: "Giga-Míssil",
    economy: "free",
    classSlug: "wizard",
    subclassSlug: "magic-missile-mage",
    minLevel: 14,
    resourceSlug: "giga-missile",
    alwaysSpendsResource: true,
    summary: "+mod. INT de Força por dardo",
    description:
      "Ao conjurar Mísseis Mágicos, gaste o uso para adicionar seu modificador de Inteligência (mín. 1) de dano de Força a cada dardo.",
    tableAction: "spend-resource",
  },
];

const GUNSLINGER: ClassEconomyAction[] = [
  {
    id: "gunslinger-bullet-time",
    name: "Tempo Bala",
    economy: "free",
    classSlug: "gunslinger",
    subclassSlug: "pistolero",
    minLevel: 14,
    summary: "1×/turno: Vantagem em um ataque à distância com arma",
    description:
      "Uma vez em cada um dos seus turnos, ao fazer um ataque à distância com arma, você pode ter Vantagem na jogada (mesa).",
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
  ...GUNSLINGER,
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

/** Texto do modal: description completa ou summary. */
export function economyActionDetailText(action: ClassEconomyAction): string {
  return (action.description ?? action.summary ?? "").trim();
}

export function findClassEconomyActionById(
  id: string,
): ClassEconomyAction | undefined {
  return CLASS_ECONOMY_ACTIONS.find((action) => action.id === id);
}
