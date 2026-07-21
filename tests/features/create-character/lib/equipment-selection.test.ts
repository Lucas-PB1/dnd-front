import { describe, expect, it } from "vitest";

import {
  resolveEquipmentChoiceText,
  toolNameForSlug,
} from "@/features/create-character/lib/equipment-choice-resolve";
import {
  BACKGROUND_GOLD_PACKAGE_SLUG,
  automaticPackageItemSlugs,
  backgroundEquipmentLines,
  buildBackgroundEquipmentPayload,
  buildClassEquipmentPayload,
  classEquipmentLines,
  formatClassEquipmentLine,
  isGoldOnlyClassPackage,
} from "@/features/create-character/lib/equipment-selection";
import type { ClassEquipmentOption } from "@/entities/class/types";

describe("equipment-choice-resolve", () => {
  it("maps fixed choice texts to catalog items", () => {
    expect(resolveEquipmentChoiceText("2 Adagas")).toEqual({
      kind: "fixed",
      itemSlug: "dagger",
      quantity: 2,
      label: "2× Adaga",
    });
    expect(resolveEquipmentChoiceText("2 Fantasias")).toEqual({
      kind: "fixed",
      itemSlug: "roupas-fantasia",
      quantity: 2,
      label: "2× Roupas, Fantasia",
    });
  });

  it("detects mirror and pick tool choices", () => {
    expect(
      resolveEquipmentChoiceText("Instrumento Musical (o mesmo que acima)"),
    ).toMatchObject({ kind: "mirror-tool", pool: "instrument" });
    expect(
      resolveEquipmentChoiceText("Instrumento Musical (escolha)"),
    ).toMatchObject({ kind: "pick-tool", pool: "instrument" });
    expect(
      resolveEquipmentChoiceText("Kit de Jogos (qualquer um)"),
    ).toMatchObject({ kind: "pick-tool", pool: "gaming" });
  });

  it("resolves tool display names", () => {
    expect(toolNameForSlug("alaude", "instrument")).toBe("Alaúde");
  });
});

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

  it("resolves fixed choice texts into item lines and payload", () => {
    const rows: ClassEquipmentOption[] = [
      {
        packageSlug: "a",
        packageLabel: "A",
        sortOrder: 1,
        itemSlug: null,
        itemName: null,
        quantity: 1,
        choiceText: "2 Adagas",
        goldAmount: null,
      },
      {
        packageSlug: "a",
        packageLabel: "A",
        sortOrder: 2,
        itemSlug: "foco-arcano",
        itemName: "Foco Arcano",
        quantity: 1,
        choiceText: null,
        goldAmount: null,
      },
    ];

    const lines = classEquipmentLines({
      packageSlug: "a",
      packageLabel: "A",
      rows,
    });
    expect(lines[0]).toMatchObject({
      kind: "item",
      label: "2× Adaga",
      itemSlug: "dagger",
      quantity: 2,
    });

    const payload = buildClassEquipmentPayload("a", rows);
    expect(payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ itemSlug: "foco-arcano", quantity: 1 }),
        expect.objectContaining({ itemSlug: "dagger", quantity: 2 }),
      ]),
    );
  });

  it("mirrors background tool into equipment lines", () => {
    const lines = backgroundEquipmentLines(
      {
        packageSlug: "a",
        packageLabel: "A",
        rows: [
          {
            packageSlug: "a",
            packageLabel: "A",
            packageGold: 11,
            sortOrder: 1,
            itemSlug: null,
            itemName: null,
            quantity: 1,
            choiceText: "Instrumento Musical (o mesmo que acima)",
          },
        ],
      },
      { backgroundToolItemSlug: "alaude" },
    );

    expect(lines[0]).toMatchObject({
      kind: "item",
      itemSlug: "alaude",
      label: "Alaúde",
    });
  });

  it("detects gold-only class packages", () => {
    expect(
      isGoldOnlyClassPackage({
        packageSlug: "b",
        packageLabel: "B",
        rows: [
          {
            packageSlug: "b",
            packageLabel: "B",
            sortOrder: 1,
            itemSlug: null,
            itemName: null,
            quantity: 1,
            choiceText: null,
            goldAmount: 155,
          },
        ],
      }),
    ).toBe(true);
  });

  it("includes package gold on background lines", () => {
    expect(
      backgroundEquipmentLines({
        packageSlug: "a",
        packageLabel: "A",
        rows: [
          {
            packageSlug: "a",
            packageLabel: "A",
            packageGold: 11,
            sortOrder: 1,
            itemSlug: "espelho",
            itemName: "Espelho",
            quantity: 1,
            choiceText: null,
          },
        ],
      }),
    ).toEqual([
      expect.objectContaining({ kind: "item", label: "Espelho" }),
      { kind: "gold", label: "11 PO" },
    ]);
  });
});
