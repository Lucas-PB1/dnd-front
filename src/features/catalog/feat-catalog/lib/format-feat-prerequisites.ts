import type { FeatSummary } from "@/entities/feat/types";
import { generalFeatMinLevelForFightingStyle } from "@/entities/feat/fighting-style-general-feat";

const DEFAULT_ABILITY_LABELS: Record<string, string> = {
  forca: "Força",
  destreza: "Destreza",
  constituicao: "Constituição",
  inteligencia: "Inteligência",
  sabedoria: "Sabedoria",
  carisma: "Carisma",
};

export type FeatPrerequisiteLabels = {
  abilityLabels?: Record<string, string>;
  featLabels?: Record<string, string>;
  skillLabels?: Record<string, string>;
  speciesLabels?: Record<string, string>;
  weaponProficiencyLabels?: Record<string, string>;
  armorTrainingLabels?: Record<string, string>;
};

export type FeatPrerequisiteInput = Pick<
  FeatSummary,
  | "slug"
  | "minimumLevel"
  | "abilityPrerequisites"
  | "requiresSpellcasting"
  | "requiredArmorTrainingSlug"
  | "requiresFightingStyle"
  | "requiresWeaponMastery"
  | "requiredFeatSlugs"
  | "requiredSkillSlugs"
  | "requiredSpeciesSlugs"
  | "requiredWeaponProficiencySlugs"
  | "requiredFeatOptions"
>;

function resolveLabel(
  labels: Record<string, string> | undefined,
  slug: string,
): string {
  return labels?.[slug] ?? slug;
}

function formatAbilityPrerequisites(
  prerequisites: FeatPrerequisiteInput["abilityPrerequisites"],
  abilityLabels: Record<string, string>,
): string | null {
  if (!prerequisites.length) return null;
  const parts = prerequisites.map(
    ({ abilitySlug, minimumScore }) =>
      `${resolveLabel(abilityLabels, abilitySlug)} ${minimumScore}+`,
  );
  return parts.length === 1
    ? parts[0]
    : `Um destes atributos: ${parts.join(" ou ")}`;
}

/** Linhas curtas para UI (compêndio, ficha, cards). */
export function formatFeatStructuredPrerequisites(
  feat: FeatPrerequisiteInput,
  labels: FeatPrerequisiteLabels = {},
): string[] {
  const lines: string[] = [];
  const abilityPrerequisites = feat.abilityPrerequisites ?? [];
  const requiredSkillSlugs = feat.requiredSkillSlugs ?? [];
  const requiredSpeciesSlugs = feat.requiredSpeciesSlugs ?? [];
  const requiredWeaponProficiencySlugs = feat.requiredWeaponProficiencySlugs ?? [];
  const requiredFeatOptions = feat.requiredFeatOptions ?? [];
  const abilityLabels = {
    ...DEFAULT_ABILITY_LABELS,
    ...labels.abilityLabels,
  };

  if (feat.minimumLevel != null) {
    lines.push(`Nível ${feat.minimumLevel}+`);
  }

  const abilityLine = formatAbilityPrerequisites(
    abilityPrerequisites,
    abilityLabels,
  );
  if (abilityLine) {
    lines.push(abilityLine);
  }

  if (feat.requiresSpellcasting) {
    lines.push("Conjuração ou Magia do Pacto");
  }

  if (feat.requiresFightingStyle) {
    const generalMin = generalFeatMinLevelForFightingStyle(feat.slug);
    lines.push(
      generalMin != null
        ? `Estilo de luta (nível ${generalMin}+ em talento geral)`
        : "Estilo de luta",
    );
  }

  if (feat.requiresWeaponMastery) {
    lines.push("Maestria com armas");
  }

  if (feat.requiredArmorTrainingSlug) {
    lines.push(
      `Treinamento em armadura: ${resolveLabel(
        labels.armorTrainingLabels,
        feat.requiredArmorTrainingSlug,
      )}`,
    );
  }

  if (requiredSkillSlugs.length > 0) {
    const skillNames = requiredSkillSlugs.map((slug) =>
      resolveLabel(labels.skillLabels, slug),
    );
    lines.push(`Perícias: ${skillNames.join(", ")}`);
  }

  if (requiredSpeciesSlugs.length > 0) {
    const speciesNames = requiredSpeciesSlugs.map((slug) =>
      resolveLabel(labels.speciesLabels, slug),
    );
    lines.push(`Espécie: ${speciesNames.join(" ou ")}`);
  }

  if (requiredWeaponProficiencySlugs.length > 0) {
    const weaponNames = requiredWeaponProficiencySlugs.map((slug) =>
      resolveLabel(labels.weaponProficiencyLabels, slug),
    );
    lines.push(`Proficiência em armas: ${weaponNames.join(", ")}`);
  }

  if (requiredFeatOptions.length > 0) {
    lines.push(
      `${requiredFeatOptions.length} escolha(s) de talento exigida(s)`,
    );
  }

  return lines;
}

export function hasStructuredFeatPrerequisites(feat: FeatPrerequisiteInput): boolean {
  return (
    formatFeatStructuredPrerequisites(feat).length > 0 ||
    (feat.requiredFeatSlugs ?? []).length > 0
  );
}

/** Uma linha para cards de listagem. */
export function formatFeatPrerequisiteTeaser(
  feat: Pick<FeatPrerequisiteInput, "prerequisite"> & FeatPrerequisiteInput,
  labels?: FeatPrerequisiteLabels,
): string | null {
  const structured = formatFeatStructuredPrerequisites(feat, labels);
  if (structured.length > 0) {
    return structured.join(" · ");
  }
  return feat.prerequisite?.trim() || null;
}
