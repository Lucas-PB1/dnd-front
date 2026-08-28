import { describe, expect, it } from "vitest";

import { formatTemplateSpeeds } from "@/entities/creature-template/format";

describe("formatTemplateSpeeds", () => {
  it("converts combat speed from feet to meters", () => {
    expect(formatTemplateSpeeds([{ movementKind: "walk", speedFt: 30 }])).toBe(
      "9 m",
    );
    expect(formatTemplateSpeeds([{ movementKind: "fly", speedFt: 60 }])).toBe(
      "18 m (voo)",
    );
  });

  it("converts vehicle travel speed from stored mph×10 to km/h", () => {
    expect(formatTemplateSpeeds([{ movementKind: "ar", speedFt: 80 }])).toBe(
      "12 km/h (ar)",
    );
  });
});
