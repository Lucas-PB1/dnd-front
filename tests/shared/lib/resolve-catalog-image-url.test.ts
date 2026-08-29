import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { resolveCatalogImageUrl } from "@/shared/lib/resolve-catalog-image-url";

describe("resolveCatalogImageUrl", () => {
  const original = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
  });

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = original;
    }
  });

  it("prefixes catalog paths with API base URL", () => {
    expect(resolveCatalogImageUrl("/catalog/equipment/club.png")).toBe(
      "http://localhost:3000/catalog/equipment/club.png",
    );
    expect(resolveCatalogImageUrl("/catalog/mounts/camelo.png")).toBe(
      "http://localhost:3000/catalog/mounts/camelo.png",
    );
  });

  it("returns absolute URLs unchanged", () => {
    expect(
      resolveCatalogImageUrl("https://cdn.example.com/item.png"),
    ).toBe("https://cdn.example.com/item.png");
  });

  it("returns null for empty values", () => {
    expect(resolveCatalogImageUrl(null)).toBeNull();
    expect(resolveCatalogImageUrl("")).toBeNull();
    expect(resolveCatalogImageUrl("   ")).toBeNull();
  });
});
