import { describe, expect, it } from "vitest";

import type { ClassEconomyActionRecord } from "@/entities/combat-mechanical/types";
import {
  gunslingerPanelReminders,
} from "@/features/character/character-sheet/lib/combat/gunslinger-panel-reminders";

const catalog: ClassEconomyActionRecord[] = [
  {
    id: "gunslinger-white-hat-steel-eyes",
    name: "Aura de Olhos de Aço",
    economy: "free",
    classSlug: "gunslinger",
    subclassSlug: "white-hat",
    minLevel: 3,
    summary: "Aura 3 m: Vantagem vs Amedrontado",
  },
  {
    id: "gunslinger-risk-taker",
    name: "Assumidor de risco",
    economy: "free",
    classSlug: "gunslinger",
    subclassSlug: "high-roller",
    minLevel: 10,
    summary: "Espírito Independente / Por um Triz: d6 sem gastar risk",
  },
  {
    id: "gunslinger-bang-youre-dead",
    name: "Bang, você está morto!",
    economy: "free",
    classSlug: "gunslinger",
    subclassSlug: "spellslinger",
    minLevel: 3,
    summary: "Truque Pistolas de Dedo",
  },
  {
    id: "gunslinger-risk",
    name: "Dados de Risco",
    economy: "free",
    classSlug: "gunslinger",
    minLevel: 2,
    summary: "Pool",
  },
];

describe("gunslingerPanelReminders", () => {
  it("mostra White Hat no painel a partir do nível de desbloqueio", () => {
    const reminders = gunslingerPanelReminders(catalog, {
      level: 3,
      subclassSlug: "white-hat",
    });
    expect(reminders.map((row) => row.id)).toEqual([
      "gunslinger-white-hat-steel-eyes",
    ]);
  });

  it("mostra Assumidor de risco só no Grande Apostador nv. 10+", () => {
    expect(
      gunslingerPanelReminders(catalog, {
        level: 9,
        subclassSlug: "high-roller",
      }).map((row) => row.id),
    ).toEqual([]);
    expect(
      gunslingerPanelReminders(catalog, {
        level: 10,
        subclassSlug: "high-roller",
      }).map((row) => row.id),
    ).toEqual(["gunslinger-risk-taker"]);
  });

  it("mostra Bang no Spellslinger e ignora a pool genérica", () => {
    expect(
      gunslingerPanelReminders(catalog, {
        level: 5,
        subclassSlug: "spellslinger",
      }).map((row) => row.id),
    ).toEqual(["gunslinger-bang-youre-dead"]);
  });
});
