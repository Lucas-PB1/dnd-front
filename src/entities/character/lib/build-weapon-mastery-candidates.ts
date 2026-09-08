import {
  isWeaponProficient,
  type WeaponProficiencyContext,
} from "@/entities/character/lib/weapon-proficiency";
import type { WeaponMasteryEligibility } from "@/entities/character/lib/class-weapon-mastery-slots";
import type { WeaponSummary } from "@/entities/weapon/types";

export type WeaponMasteryCandidateInput = Pick<
  WeaponSummary,
  "slug" | "name" | "category" | "propertyDetails" | "mastery"
>;

export type WeaponMasteryCandidate = {
  value: string;
  label: string;
  hint?: string;
  masteryName?: string | null;
  masteryDescription?: string | null;
};

type BuildWeaponMasteryCandidatesParams = {
  weapons: readonly WeaponMasteryCandidateInput[];
  /** Sem proficiências carregadas → lista vazia (não libera o catálogo inteiro). */
  weaponProficiencySlugs: readonly string[];
  proficiencyContext?: Omit<WeaponProficiencyContext, "weaponProficiencySlugs">;
  eligibility: WeaponMasteryEligibility | null;
  truncateHint?: (text: string | null | undefined) => string | undefined;
};

function matchesMasteryEligibility(
  propertySlugs: readonly string[],
  eligibility: WeaponMasteryEligibility | null,
): boolean {
  if (eligibility === "melee") {
    return !(propertySlugs.includes("ammunition") && !propertySlugs.includes("thrown"));
  }
  if (eligibility === "ranged") {
    return propertySlugs.includes("ammunition");
  }
  return true;
}

/**
 * Candidatos à Maestria em Arma: só armas com maestria em que o personagem
 * tem proficiência (e elegibilidade melee/ranged da classe, se houver).
 */
export function buildWeaponMasteryCandidates({
  weapons,
  weaponProficiencySlugs,
  proficiencyContext,
  eligibility,
  truncateHint,
}: BuildWeaponMasteryCandidatesParams): WeaponMasteryCandidate[] {
  if (weaponProficiencySlugs.length === 0) return [];

  return weapons
    .filter((weapon) => weapon.mastery)
    .filter((weapon) => {
      const props = (weapon.propertyDetails ?? []).map((p) => p.slug);
      return matchesMasteryEligibility(props, eligibility);
    })
    .filter((weapon) =>
      isWeaponProficient(
        {
          itemSlug: weapon.slug,
          category: weapon.category,
          propertySlugs: (weapon.propertyDetails ?? []).map((p) => p.slug),
        },
        weaponProficiencySlugs,
        proficiencyContext,
      ),
    )
    .map((weapon) => ({
      value: weapon.slug,
      label: `${weapon.name}${weapon.mastery ? ` · ${weapon.mastery.name}` : ""}`,
      hint: truncateHint?.(weapon.mastery?.description),
      masteryName: weapon.mastery?.name ?? null,
      masteryDescription: weapon.mastery?.description ?? null,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt"));
}
