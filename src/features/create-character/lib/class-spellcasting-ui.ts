import type { ClassProgressionRow } from "@/entities/class/types";
import type { ClassSpellcastingMode } from "@/features/create-character/lib/wizard-spell-selection";

export type SpellSlotPatternSlug = "full" | "half" | "pact" | string;

export type ClassSpellcastingUiProfile = {
  /** Título curto do modelo (ex.: Magia divina preparada). */
  archetypeTitle: string;
  /** Texto orientando o jogador nesta classe. */
  guide: string;
  /** Rótulo da lista de magias de círculo > 0. */
  leveledSectionTitle: string;
  leveledSectionHint: string;
  /** Como a lista da classe funciona na UI. */
  listAccessNote: string;
  /** Rótulos de cotas na barra de resumo. */
  cantripQuotaLabel: string;
  leveledPrimaryQuotaLabel: string;
  leveledSecondaryQuotaLabel: string | null;
  /** Recursos extras só informativos nesta etapa. */
  extraResourceLabel: string | null;
  extraResourceHint: string | null;
  /** Espaços de magia — texto extra (pacto, meio conjurador). */
  slotPatternNote: string | null;
  showCantripPicker: boolean;
  showWizardDualPick: boolean;
};

const CLASS_COPY: Partial<
  Record<
    string,
    Pick<
      ClassSpellcastingUiProfile,
      | "archetypeTitle"
      | "guide"
      | "leveledSectionTitle"
      | "leveledSectionHint"
      | "listAccessNote"
    >
  >
> = {
  cleric: {
    archetypeTitle: "Magia divina (preparada)",
    guide:
      "Você tem acesso à lista completa de magias de clérigo. Escolha truques fixos e quais magias de círculo estão preparadas para o dia — gasta espaços ao conjurar.",
    leveledSectionTitle: "Magias preparadas hoje",
    leveledSectionHint:
      "Marque magias da lista de clérigo. Preparadas não gastam espaço até serem conjuradas.",
    listAccessNote: "Lista completa do clérigo",
  },
  druid: {
    archetypeTitle: "Magia primal (preparada)",
    guide:
      "Prepare truques e magias da lista druídica. Você pode trocar a lista preparada após um descanso longo.",
    leveledSectionTitle: "Magias preparadas",
    leveledSectionHint: "Escolha da lista druídica o que está memorizado hoje.",
    listAccessNote: "Lista completa do druida",
  },
  wizard: {
    archetypeTitle: "Magia arcana (grimório)",
    guide:
      "Registre magias no grimório e escolha um subconjunto preparado após descanso longo. Truques não ocupam espaços.",
    leveledSectionTitle: "Grimório e preparação",
    leveledSectionHint:
      "Primeiro inclua no grimório; depois marque quais estão preparadas (limite separado).",
    listAccessNote: "Lista completa do mago",
  },
  bard: {
    archetypeTitle: "Magia de performance (conhecidas)",
    guide:
      "Escolha truques e magias que seu bardo conhece de cor. Espaços recuperam em descanso longo.",
    leveledSectionTitle: "Magias conhecidas",
    leveledSectionHint: "Magias que o personagem sabe conjurar sem grimório.",
    listAccessNote: "Escolha da lista de bardo",
  },
  sorcerer: {
    archetypeTitle: "Magia inata (conhecidas)",
    guide:
      "Truques e magias conhecidas vêm do talento innato. Você gasta espaços para conjurá-las.",
    leveledSectionTitle: "Magias conhecidas",
    leveledSectionHint: "Limite fixo de magias que você domina.",
    listAccessNote: "Escolha da lista de feiticeiro",
  },
  warlock: {
    archetypeTitle: "Magia de pacto",
    guide:
      "Poucos espaços de pacto, mas recuperam em descanso curto. Magias conhecidas são sempre as mesmas até você trocá-las ao subir de nível.",
    leveledSectionTitle: "Magias conhecidas (pacto)",
    leveledSectionHint:
      "Todos os espaços são do mesmo círculo (escala com o nível de bruxo).",
    listAccessNote: "Escolha da lista de bruxo",
  },
  ranger: {
    archetypeTitle: "Magia do guardião (conhecidas)",
    guide:
      "Meio conjurador: espaços sobem mais devagar. Escolha magias conhecidas da lista de guardião (sem truques nos níveis iniciais).",
    leveledSectionTitle: "Magias conhecidas",
    leveledSectionHint: "Magias aprendidas na patrulha e na natureza.",
    listAccessNote: "Escolha da lista de guardião",
  },
  paladin: {
    archetypeTitle: "Magia sagrada (preparada)",
    guide:
      "Meio conjurador devoto: prepare magias de paladino (sem truques). Canalizar divindade desbloqueia no nível 3.",
    leveledSectionTitle: "Magias preparadas",
    leveledSectionHint: "Marque o que está pronto para conjurar hoje.",
    listAccessNote: "Lista completa de paladino",
  },
};

function slotPatternNote(
  patternSlug: SpellSlotPatternSlug | undefined,
  classSlug: string,
): string | null {
  if (patternSlug === "pact" || classSlug === "warlock") {
    return "Espaços de pacto: poucos slots, mesmo círculo, recuperam em descanso curto.";
  }
  if (patternSlug === "half") {
    return "Conjurador parcial: menos espaços e acesso a círculos altos mais tarde.";
  }
  if (patternSlug === "full") {
    return "Conjurador completo: progressão plena de espaços por círculo.";
  }
  return null;
}

export function resolveSpellcastingUiProfile(
  classSlug: string,
  patternSlug: SpellSlotPatternSlug | undefined,
  mode: ClassSpellcastingMode,
  progression: ClassProgressionRow | undefined,
): ClassSpellcastingUiProfile {
  const custom = CLASS_COPY[classSlug];
  const cantrips = progression?.cantrips ?? null;
  const prepared = progression?.preparedSpells ?? null;
  const channel = progression?.channelDivinity ?? null;

  const base: ClassSpellcastingUiProfile = {
    archetypeTitle: custom?.archetypeTitle ?? "Conjuração de classe",
    guide:
      custom?.guide ??
      "Escolha truques e magias permitidas para o seu nível na lista da classe.",
    leveledSectionTitle:
      custom?.leveledSectionTitle ??
      (mode === "known" ? "Magias conhecidas" : "Magias preparadas"),
    leveledSectionHint:
      custom?.leveledSectionHint ?? "Marque as magias desejadas na lista abaixo.",
    listAccessNote: custom?.listAccessNote ?? "Lista da classe",
    cantripQuotaLabel: "Truques conhecidos",
    leveledPrimaryQuotaLabel:
      mode === "known"
        ? "Magias conhecidas"
        : mode === "wizard"
          ? "No grimório"
          : "Magias preparadas",
    leveledSecondaryQuotaLabel:
      mode === "wizard" ? "Preparadas hoje" : null,
    extraResourceLabel:
      channel != null && channel > 0 ? "Canalizar divindade" : null,
    extraResourceHint:
      channel != null && channel > 0
        ? "Usos por descanso longo (informação — não escolhe magia aqui)."
        : null,
    slotPatternNote: slotPatternNote(patternSlug, classSlug),
    showCantripPicker: cantrips != null && cantrips > 0,
    showWizardDualPick: mode === "wizard",
  };

  if (classSlug === "warlock") {
    base.leveledPrimaryQuotaLabel = "Magias de pacto conhecidas";
  }

  if (classSlug === "paladin" || classSlug === "ranger") {
    base.showCantripPicker = (cantrips ?? 0) > 0;
  }

  if (prepared == null && mode === "known") {
    base.leveledPrimaryQuotaLabel = "Magias conhecidas";
  }

  return base;
}

export type SpellListView = "all" | "cantrips" | "leveled" | "selected";

export function spellsForView(
  view: SpellListView,
  cantrips: { slug: string }[],
  leveled: { slug: string }[],
  all: { slug: string }[],
  selectedSlugs: Set<string>,
): { slug: string }[] {
  switch (view) {
    case "cantrips":
      return cantrips;
    case "leveled":
      return leveled;
    case "selected":
      return all.filter((s) => selectedSlugs.has(s.slug));
    default:
      return all;
  }
}
