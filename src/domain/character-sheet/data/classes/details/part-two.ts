import type { ClassDetail } from "@/domain/character-sheet/types/class";

const SUBCLASS_UNLOCK_LEVEL = 3;

export const PHB_2024_CLASS_DETAILS_PART_TWO: ClassDetail[] = [
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
