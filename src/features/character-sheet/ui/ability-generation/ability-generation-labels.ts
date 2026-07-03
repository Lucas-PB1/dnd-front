export const ABILITY_GENERATION_UI = {
  pageHint:
    "Cap. 2 do Livro do Jogador 2024 — escolha um método e distribua os seis valores.",
  methods: {
    pointBuy: "Compra de pontos",
    roll: "Rolagem 4d6",
    standardArray: "Conjunto padrão",
  },
  rollHint:
    "Role 4d6 seis vezes, descartando o menor dado. A soma deve ficar entre 72 e 80.",
  standardHint: "Distribua 15, 14, 13, 12, 10 e 8 entre os atributos.",
  pointBuyHint: "27 pontos no total · cada atributo entre 8 e 15.",
  rollButton: "Rolar seis atributos",
  reroll: "Rolar de novo",
  resetArray: "Recomeçar distribuição",
  resetPointBuy: "Resetar pontos",
  availablePool: "Valores disponíveis",
  assignLabel: "Atribuir",
  unassigned: "—",
  totalSum: "Soma total",
  pointsRemaining: "pontos restantes",
  pointsSpent: "gastos",
  costTable: "Tabela de custos",
  lastRolls: "Últimas rolagens",
  dropped: "descartado",
  rollOutOfRange:
    "Soma fora do intervalo 72–80. Role novamente antes de distribuir.",
  pointBuyIncomplete: "Gaste os 27 pontos antes de continuar.",
  applied: "Atributos aplicados à ficha.",
} as const;

export type AbilityScoreMethod = keyof typeof ABILITY_GENERATION_UI.methods;
