import { describe, expect, it } from "vitest";

import {
  incomingHitFromLogLine,
  sessionLogSlice,
} from "@/features/skirmish/skirmishes/lib/skirmish-combat-playback";

describe("sessionLogSlice", () => {
  const entries = [
    { at: "2026-09-17T10:00:00.000Z", text: "Início" },
    { at: "2026-09-17T10:00:02.000Z", text: "Acerto" },
    { at: "2026-09-17T10:00:04.000Z", text: "Dano" },
  ];

  it("keeps the full log visible when opening mid-fight", () => {
    expect(sessionLogSlice(entries, 3).map((row) => row.text)).toEqual([
      "Início",
      "Acerto",
      "Dano",
    ]);
  });

  it("appends only newly revealed lines after the visit baseline", () => {
    const baseline = 2;
    expect(sessionLogSlice(entries, baseline).map((row) => row.text)).toEqual([
      "Início",
      "Acerto",
    ]);
    expect(sessionLogSlice(entries, 3).map((row) => row.text)).toEqual([
      "Início",
      "Acerto",
      "Dano",
    ]);
  });
});

describe("incomingHitFromLogLine", () => {
  it("detects incoming damage to the PC", () => {
    expect(
      incomingHitFromLogLine(
        "Goblin → Aldric: acerto (1d20+4 = 16) · dano 5",
        "Goblin",
        "Aldric",
      ),
    ).toBe(true);
  });
});
