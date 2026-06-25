import type { ClassDetail } from "@/domain/character-sheet/types/class";

const SUBCLASS_UNLOCK_LEVEL = 3;

export const PHB_2024_CLASS_DETAILS_PART_ONE: ClassDetail[] = [
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
];
