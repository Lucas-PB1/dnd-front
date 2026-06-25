import type { SpeciesDefinition } from "@/domain/character-sheet/types/species";

export const PHB_2024_SPECIES_DETAILS_PART_TWO: SpeciesDefinition[] = [
  {
    id: "human",
    creatureType: "Humanoide",
    speedFeet: 30,
    speedLabel: "9 metros",
    sizeLabel: "Médio ou Pequeno (escolhido ao selecionar esta espécie)",
    traits: [
      {
        title: "Eficiente",
        summary: "Inspiração Heroica ao completar descanso longo.",
      },
      {
        title: "Hábil",
        summary: "Proficiência em uma perícia à escolha.",
      },
      {
        title: "Versátil",
        summary: "Um talento de Origem à escolha (Habilidoso recomendado).",
      },
    ],
  },
  {
    id: "orc",
    creatureType: "Humanoide",
    speedFeet: 30,
    speedLabel: "9 metros",
    sizeLabel: "Médio",
    traits: [
      {
        title: "Pico de Adrenalina",
        summary:
          "Correr como ação bônus + PV temporários (usos = proficiência/descanso curto ou longo).",
      },
      {
        title: "Visão no Escuro",
        summary: "Alcance de 36 metros.",
      },
      {
        title: "Vigor Implacável",
        summary: "Cai a 1 PV em vez de 0 (1/descanso longo).",
      },
    ],
  },
  {
    id: "halfling",
    creatureType: "Humanoide",
    speedFeet: 30,
    speedLabel: "9 metros",
    sizeLabel: "Pequeno",
    traits: [
      {
        title: "Corajoso",
        summary: "Vantagem em salvaguardas contra Amedrontado.",
      },
      {
        title: "Agilidade Pequenina",
        summary: "Atravessa o espaço de criaturas um tamanho maior.",
      },
      {
        title: "Sorte",
        summary: "Rerrola natural 1 em Testes de D20.",
      },
      {
        title: "Furtividade Natural",
        summary: "Pode Esconder-se atrás de criatura um tamanho maior.",
      },
    ],
  },
  {
    id: "tiefling",
    creatureType: "Humanoide",
    speedFeet: 30,
    speedLabel: "9 metros",
    sizeLabel: "Médio ou Pequeno (escolhido ao selecionar esta espécie)",
    traits: [
      {
        title: "Visão no Escuro",
        summary: "Alcance de 18 metros.",
      },
      {
        title: "Legado Ínfero",
        summary: "Abissal, Ctônico ou Infernal (magias nos níveis 1, 3 e 5).",
      },
      {
        title: "Presença Sobrenatural",
        summary: "Truque Taumaturgia.",
      },
    ],
  },
];
