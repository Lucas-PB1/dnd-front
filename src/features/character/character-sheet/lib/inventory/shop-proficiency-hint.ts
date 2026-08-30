import type { ItemSummary } from "@/entities/item/types";
import type { WeaponSummary } from "@/entities/weapon/types";
import {
  readAdvancedRequirement,
  readCatalogKind,
} from "@/entities/item/lib/catalog-item-properties";
import {
  isWeaponProficient,
  type WeaponProficiencyContext,
} from "@/entities/character/lib/weapon-proficiency";

type ShopProficiencyHintInput = {
  item: ItemSummary;
  weapon?: WeaponSummary | null;
  characterLevel: number;
  weaponProficiencySlugs: readonly string[];
  proficiencyContext: Omit<WeaponProficiencyContext, "weaponProficiencySlugs">;
};

/** Aviso curto na loja quando o personagem não atende requisitos GH. */
export function shopProficiencyHint({
  item,
  weapon,
  characterLevel,
  weaponProficiencySlugs,
  proficiencyContext,
}: ShopProficiencyHintInput): string | null {
  if (weapon?.category === "advanced") {
    const proficient = isWeaponProficient(
      {
        itemSlug: weapon.slug,
        category: weapon.category,
        propertySlugs: weapon.propertyDetails.map((row) => row.slug),
      },
      weaponProficiencySlugs,
      proficiencyContext,
    );
    if (!proficient) {
      return "Sem proficiência em Armas Avançadas (Desvantagem nos ataques)";
    }
    return null;
  }

  const requirement = readAdvancedRequirement(item.properties);
  const catalogKind = readCatalogKind(item.properties);

  if (
    catalogKind === "ammunition" ||
    requirement?.kind === "advanced-ammunition"
  ) {
    if (characterLevel < (requirement?.minLevel ?? 3)) {
      return `Exige nível ${requirement?.minLevel ?? 3}+`;
    }
    if (requirement?.requiresWeaponProficiency) {
      return "Exige proficiência na arma que dispara a munição";
    }
  }

  return null;
}
