import type { CharacterClassId } from "@/domain/character-sheet/classes";
import { findCharacterClass } from "@/domain/character-sheet/classes";

export type SubclassDetail = {
  id: string;
  summary: string;
};

export type ClassDetail = {
  id: CharacterClassId;
  tagline: string;
  summary: string;
  primaryAbility: string;
  hitDie: string;
  savingThrows: string;
  subclassUnlockLevel: number;
  subclasses: SubclassDetail[];
};

/** PHB 2024 — subclasses adquiridas no nível 3 (Cap. 3) */
export const SUBCLASS_UNLOCK_LEVEL = 3;

/** Livro do Jogador 2024 (PT-BR) — Cap. 3: resumos da visão geral (p. 49) e traços básicos */
export const PHB_2024_CLASS_DETAILS: ClassDetail[] = [
  {
    id: "barbarian",
    tagline: "Combatente feroz da Fúria primitiva",
    summary: "Avance com Fúria e entre em combate corpo a corpo.",
    primaryAbility: "Força",
    hitDie: "d12",
    savingThrows: "Força e Constituição",
    subclassUnlockLevel: SUBCLASS_UNLOCK_LEVEL,
    subclasses: [
      { id: "world-tree", summary: "Acessar a vitalidade cósmica." },
      { id: "berserker", summary: "Liberar violência bruta." },
      { id: "wild-heart", summary: "Manifestar seu instinto animal." },
      { id: "zealot", summary: "Enfurecer-se em união com um deus." },
    ],
  },
  {
    id: "bard",
    tagline: "Inspirador performista de música, dança e magia",
    summary:
      "Conjure magias que inspiram e curam aliados ou confundem inimigos.",
    primaryAbility: "Carisma",
    hitDie: "d8",
    savingThrows: "Destreza e Carisma",
    subclassUnlockLevel: SUBCLASS_UNLOCK_LEVEL,
    subclasses: [
      { id: "valor", summary: "Brandir armas com magias." },
      { id: "dance", summary: "Aproveitar a agilidade no combate." },
      { id: "lore", summary: "Colecionar saberes e segredos mágicos." },
      { id: "glamour", summary: "Tecer a magia fascinante de Faéria." },
    ],
  },
  {
    id: "warlock",
    tagline: "Ocultista fortalecido com pactos sobrenaturais",
    summary: "Conjure magias derivadas de conhecimento oculto.",
    primaryAbility: "Carisma",
    hitDie: "d8",
    savingThrows: "Sabedoria e Carisma",
    subclassUnlockLevel: SUBCLASS_UNLOCK_LEVEL,
    subclasses: [
      { id: "archfey", summary: "Teleportar-se e manipular magia feérica." },
      { id: "celestial", summary: "Curar com magia celestial." },
      { id: "great-old-one", summary: "Mergulhar em conhecimentos proibidos." },
      { id: "fiend", summary: "Invocar poderes sinistros." },
    ],
  },
  {
    id: "cleric",
    tagline: "Campeão divino da magia sagrada",
    summary: "Invoque magia divina para curar, fortalecer e castigar.",
    primaryAbility: "Sabedoria",
    hitDie: "d8",
    savingThrows: "Sabedoria e Carisma",
    subclassUnlockLevel: SUBCLASS_UNLOCK_LEVEL,
    subclasses: [
      { id: "war", summary: "Inspirar bravura e punir inimigos." },
      { id: "light", summary: "Empunhar luz ardente e protetora." },
      { id: "trickery", summary: "Atormentar inimigos com artimanhas." },
      { id: "life", summary: "Ser um mestre da cura." },
    ],
  },
  {
    id: "druid",
    tagline: "Guardião da natureza e da magia primal",
    summary:
      "Canalize a magia da natureza para curar, moldar e controlar os elementos.",
    primaryAbility: "Sabedoria",
    hitDie: "d8",
    savingThrows: "Inteligência e Sabedoria",
    subclassUnlockLevel: SUBCLASS_UNLOCK_LEVEL,
    subclasses: [
      { id: "moon", summary: "Adotar formas de animais poderosos." },
      { id: "land", summary: "Aproveitar a magia do ambiente." },
      { id: "stars", summary: "Obter poderes em uma forma estelar." },
      { id: "sea", summary: "Canalizar marés e tempestades." },
    ],
  },
  {
    id: "sorcerer",
    tagline: "Conjurador de magia inata e instável",
    summary: "Use magia inerente ao seu ser, moldando o poder à sua vontade.",
    primaryAbility: "Carisma",
    hitDie: "d6",
    savingThrows: "Constituição e Carisma",
    subclassUnlockLevel: SUBCLASS_UNLOCK_LEVEL,
    subclasses: [
      { id: "aberrant", summary: "Usar estranha magia psiônica." },
      { id: "draconic", summary: "Emanar a magia dos dragões." },
      { id: "clockwork", summary: "Aproveitar forças cósmicas da ordem." },
      { id: "wild-magic", summary: "Liberar magia caótica." },
    ],
  },
  {
    id: "ranger",
    tagline: "Patrulheiro marcial das fronteiras selvagens",
    summary:
      "Una proezas marciais, magia da natureza e habilidades de sobrevivência.",
    primaryAbility: "Destreza e Sabedoria",
    hitDie: "d10",
    savingThrows: "Força e Destreza",
    subclassUnlockLevel: SUBCLASS_UNLOCK_LEVEL,
    subclasses: [
      {
        id: "fey-wanderer",
        summary: "Manifestar a alegria e a fúria feérica.",
      },
      {
        id: "hunter",
        summary: "Proteger a natureza com versatilidade marcial.",
      },
      {
        id: "beast-master",
        summary: "Formar um laço com uma fera primitiva.",
      },
      {
        id: "gloom-stalker",
        summary: "Perseguir inimigos que se escondem nas trevas.",
      },
    ],
  },
  {
    id: "fighter",
    tagline: "Mestre de armas e armaduras",
    summary: "Domine todas as armas e armaduras.",
    primaryAbility: "Força ou Destreza",
    hitDie: "d10",
    savingThrows: "Força e Constituição",
    subclassUnlockLevel: SUBCLASS_UNLOCK_LEVEL,
    subclasses: [
      { id: "champion", summary: "Buscar o auge da proeza no combate." },
      {
        id: "eldritch-knight",
        summary: "Aprender magias que auxiliem no combate.",
      },
      { id: "psi-warrior", summary: "Aumentar os ataques com poder psiônico." },
      { id: "battle-master", summary: "Usar manobras de combate especiais." },
    ],
  },
  {
    id: "rogue",
    tagline: "Especialista furtivo e mortal",
    summary:
      "Desfira Ataques Furtivos mortais enquanto evita danos através da furtividade.",
    primaryAbility: "Destreza",
    hitDie: "d8",
    savingThrows: "Destreza e Inteligência",
    subclassUnlockLevel: SUBCLASS_UNLOCK_LEVEL,
    subclasses: [
      { id: "soulknife", summary: "Golpear inimigos com lâminas psíquicas." },
      { id: "assassin", summary: "Realizar emboscadas e envenenamentos." },
      { id: "thief", summary: "Dominar infiltração e caça ao tesouro." },
      { id: "arcane-trickster", summary: "Melhorar a furtividade com magia." },
    ],
  },
  {
    id: "wizard",
    tagline: "Estudioso da magia arcana",
    summary: "Estude magia arcana e domine magias para todos os propósitos.",
    primaryAbility: "Inteligência",
    hitDie: "d6",
    savingThrows: "Inteligência e Sabedoria",
    subclassUnlockLevel: SUBCLASS_UNLOCK_LEVEL,
    subclasses: [
      { id: "abjurer", summary: "Proteger aliados e banir inimigos." },
      { id: "diviner", summary: "Aprender os segredos do multiverso." },
      { id: "evoker", summary: "Criar efeitos explosivos." },
      { id: "illusionist", summary: "Tecer magias de ilusão." },
    ],
  },
  {
    id: "monk",
    tagline: "Artista marcial de velocidade e precisão",
    summary: "Entre e saia do combate corpo a corpo com velocidade e precisão.",
    primaryAbility: "Destreza e Sabedoria",
    hitDie: "d8",
    savingThrows: "Força e Destreza",
    subclassUnlockLevel: SUBCLASS_UNLOCK_LEVEL,
    subclasses: [
      { id: "open-hand", summary: "Dominar o combate desarmado." },
      { id: "mercy", summary: "Curar ou ferir com um toque." },
      { id: "shadow", summary: "Utilizar sombras em estratagemas." },
      { id: "elements", summary: "Manejar poder elemental." },
    ],
  },
  {
    id: "paladin",
    tagline: "Guerreiro sagrado vinculado a um juramento",
    summary: "Destrua inimigos e proteja aliados com poder divino e marcial.",
    primaryAbility: "Força e Carisma",
    hitDie: "d10",
    savingThrows: "Sabedoria e Carisma",
    subclassUnlockLevel: SUBCLASS_UNLOCK_LEVEL,
    subclasses: [
      { id: "devotion", summary: "Comportar-se como os anjos da justiça." },
      { id: "glory", summary: "Alcançar os picos do heroísmo." },
      { id: "vengeance", summary: "Perseguir os malfeitores." },
      { id: "ancients", summary: "Preservar a vida, a alegria e a natureza." },
    ],
  },
];

export function findClassDetails(classId: string): ClassDetail | undefined {
  return PHB_2024_CLASS_DETAILS.find((entry) => entry.id === classId);
}

export function findSubclassDetail(
  classId: string,
  subclassId: string,
): SubclassDetail | undefined {
  return findClassDetails(classId)?.subclasses.find(
    (entry) => entry.id === subclassId,
  );
}

export function isSubclassUnlocked(characterLevel: string): boolean {
  const level = Number.parseInt(characterLevel, 10);
  return Number.isFinite(level) && level >= SUBCLASS_UNLOCK_LEVEL;
}

export function formatSubclassChoiceLabel(
  classId: string,
  subclassId: string,
): string {
  const classDefinition = findCharacterClass(classId);
  const subclassDefinition = findSubclassDetail(classId, subclassId);

  if (!classDefinition || !subclassDefinition) {
    return subclassId;
  }

  const subclassName = classDefinition.subclasses.find(
    (entry) => entry.id === subclassId,
  )?.name;

  return subclassName ?? subclassId;
}
