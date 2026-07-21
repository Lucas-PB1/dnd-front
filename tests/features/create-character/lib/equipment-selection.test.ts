import { describe, expect, it } from "vitest";

import {
  BACKGROUND_GOLD_PACKAGE_SLUG,
  automaticPackageItemSlugs,
  buildBackgroundEquipmentPayload,
  buildClassEquipmentPayload,
  formatClassEquipmentLine,
} from "@/features/create-character/lib/equipment-selection";
import type { ClassEquipmentOption } from "@/entities/class/types";

describe("equipment-selection", () => {
  const clericRows: ClassEquipmentOption[] = [
    {
      packageSlug: "a",
      packageLabel: "A",
      sortOrder: 1,
      itemSlug: "leather",
      itemName: "Couro",
      quantity: 1,
      choiceText: null,
      goldAmount: null,
    },
    {
      packageSlug: "a",
      packageLabel: "A",
      sortOrder: 6,
      itemSlug: null,
      itemName: null,
      quantity: 1,
      choiceText: null,
      goldAmount: 7,
    },
  ];

  it("includes all catalog items when selecting a package", () => {
    expect(automaticPackageItemSlugs(clericRows)).toEqual(["leather"]);
    const payload = buildClassEquipmentPayload("a", clericRows);
    expect(payload.map((p) => p.itemSlug)).toEqual([undefined, "leather"]);
  });

  it("formats gold-only package lines", () => {
    expect(
      formatClassEquipmentLine({
        ...clericRows[1]!,
        goldAmount: 110,
        packageSlug: "b",
      }),
    ).toBe("110 PO");
  });

  it("supports background gold virtual package", () => {
    const payload = buildBackgroundEquipmentPayload(
      BACKGROUND_GOLD_PACKAGE_SLUG,
      [],
    );
    expect(payload).toEqual([
      { source: "background", packageSlug: "gold", sortOrder: 0 },
    ]);
  });
});
