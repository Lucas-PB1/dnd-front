import { describe, expect, it } from "vitest";

import {
  segmentCatalogText,
  type CatalogLinkEntry,
} from "@/shared/lib/segment-catalog-text";

describe("segmentCatalogText", () => {
  const catalog: CatalogLinkEntry[] = [
    {
      slug: "caixa-para-fogo",
      name: "Caixa para Fogo",
      href: "/equipment/items/caixa-para-fogo",
    },
    { slug: "corda", name: "Corda", href: "/equipment/items/corda" },
    { slug: "tocha", name: "Tocha", href: "/equipment/items/tocha" },
  ];

  it("resolve wiki links", () => {
    const segments = segmentCatalogText(
      "Leve [[caixa-para-fogo|Caixa para Fogo]] e [[corda]].",
      catalog,
    );
    expect(segments).toEqual([
      { type: "text", value: "Leve " },
      {
        type: "link",
        href: "/equipment/items/caixa-para-fogo",
        label: "Caixa para Fogo",
      },
      { type: "text", value: " e " },
      { type: "link", href: "/equipment/items/corda", label: "Corda" },
      { type: "text", value: "." },
    ]);
  });

  it("auto-links catalog names", () => {
    const segments = segmentCatalogText("Use a Corda com cuidado.", catalog);
    expect(segments.some((s) => s.type === "link" && s.label === "Corda")).toBe(
      true,
    );
  });
});
