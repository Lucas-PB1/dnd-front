import { describe, expect, it } from "vitest";

import {
  isSafeCatalogReturn,
  appendReturnParam,
} from "@/shared/lib/catalog-return";

describe("catalog-return", () => {
  it("accepts internal paths only", () => {
    expect(isSafeCatalogReturn("/equipment?tab=items")).toBe(true);
    expect(isSafeCatalogReturn("//evil.com")).toBe(false);
    expect(isSafeCatalogReturn("https://evil.com")).toBe(false);
  });

  it("appends return query", () => {
    expect(
      appendReturnParam("/equipment/items/corda", "/equipment?tab=items&q=kit"),
    ).toBe(
      "/equipment/items/corda?return=%2Fequipment%3Ftab%3Ditems%26q%3Dkit",
    );
  });
});
