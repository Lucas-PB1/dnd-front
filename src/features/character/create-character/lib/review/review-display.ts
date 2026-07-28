import {
  appendCharacterFeat,
  featInstanceKey,
} from "@/entities/character/lib/character-feat";
import { BACKGROUND_GOLD_PACKAGE_SLUG } from "@/features/character/create-character/lib/equipment/equipment-selection";
import { toolNameForSlug } from "@/features/character/create-character/lib/equipment/equipment-choice-resolve";
import { asiFeatSlotsToCharacterFeats } from "@/features/character/create-character/lib/feats/asi-feat-slots-to-feats";
import type { CreateCharacterInput } from "@/features/character/create-character/model/create-character.schema";

type EquipmentRow = {
  packageSlug: string;
  itemSlug?: string | null;
  itemName?: string | null;
};

type PackageGroup = {
  packageSlug: string;
  packageLabel?: string | null;
};

export function buildAsiLevelByFeatKey(
  asiFeatSlotSlugs: string[] | undefined,
  asiLevels: number[],
): Map<string, number> {
  const map = new Map<string, number>();
  let built: ReturnType<typeof asiFeatSlotsToCharacterFeats> = [];
  (asiFeatSlotSlugs ?? []).forEach((slug, index) => {
    if (!slug.trim()) return;
    built = appendCharacterFeat(built, slug.trim());
    const last = built[built.length - 1];
    if (!last) return;
    const level = asiLevels[index];
    if (level != null) {
      map.set(featInstanceKey(last.featSlug, last.instanceIndex), level);
    }
  });
  return map;
}

export function groupFeatOptionsByInstance(
  featOptions: CreateCharacterInput["featOptions"] | undefined,
) {
  return (featOptions ?? []).reduce<
    Record<string, NonNullable<CreateCharacterInput["featOptions"]>>
  >((acc, option) => {
    const key = featInstanceKey(option.featSlug, option.instanceIndex);
    const list = acc[key] ?? [];
    list.push(option);
    acc[key] = list;
    return acc;
  }, {});
}

export function resolveReviewEquipmentItemName(args: {
  source: "class" | "background";
  packageSlug: string;
  itemSlug?: string;
  classRows: EquipmentRow[];
  backgroundRows: EquipmentRow[];
}): string | null {
  const { itemSlug } = args;
  if (!itemSlug) return null;
  const rows = args.source === "class" ? args.classRows : args.backgroundRows;
  const row = rows.find(
    (r) => r.packageSlug === args.packageSlug && r.itemSlug === itemSlug,
  );
  return row?.itemName ?? toolNameForSlug(itemSlug) ?? itemSlug;
}

export function resolveReviewPackageLabel(args: {
  source: "class" | "background";
  packageSlug: string;
  equipmentGoldOption?: number | null;
  classPackages: PackageGroup[];
  backgroundPackages: PackageGroup[];
}): string {
  if (
    args.source === "background" &&
    args.packageSlug === BACKGROUND_GOLD_PACKAGE_SLUG
  ) {
    const gold = args.equipmentGoldOption;
    return gold != null ? `${gold} PO (em vez dos itens)` : "Ouro";
  }
  const packages =
    args.source === "class" ? args.classPackages : args.backgroundPackages;
  const pkg = packages.find((p) => p.packageSlug === args.packageSlug);
  return `Pacote ${pkg?.packageLabel ?? args.packageSlug.toUpperCase()}`;
}
