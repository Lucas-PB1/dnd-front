import type { PhbClassName } from "./phb-classes";
import {
  expectSheetSpellsTab,
  openSheetActionsTab,
  takeSheetLongRest,
  useSheetEconomyAction,
} from "./sheet";

export type SheetClassHotspot = {
  tableActionPath?: string;
  economyUseCy?: string;
  expectSpellsTab?: boolean;
  expectActionName?: string;
};

export function runSheetClassSuite(
  className: PhbClassName,
  hotspot: SheetClassHotspot = {},
) {
  describe(`ficha ${className}`, () => {
    before(() => {
      cy.loginAsDevUser();
      cy.createLevel1Character(className);
      cy.get("@characterId").then((id) => {
        Cypress.env("sheetCharacterId", String(id));
      });
    });

    beforeEach(() => {
      cy.loginAsDevUser();
      cy.openCharacterSheetById(String(Cypress.env("sheetCharacterId")));
    });

    it("mostra nível e a aba Ações", () => {
      cy.get("[data-cy=sheet-level]").should("contain", "Nv.");
      openSheetActionsTab();
      cy.get("[data-cy=sheet-tab-actions]").should("exist");
    });

    const economyUseCy = hotspot.economyUseCy;
    const tableActionPath = hotspot.tableActionPath;
    if (economyUseCy && tableActionPath) {
      it("usa a ação de mesa da classe", () => {
        useSheetEconomyAction(economyUseCy, tableActionPath);
      });
    }

    const actionName = hotspot.expectActionName;
    if (actionName) {
      it("mostra a característica da classe nas Ações", () => {
        openSheetActionsTab();
        cy.contains(actionName, { timeout: 20000 }).should("exist");
      });
    }

    if (hotspot.expectSpellsTab) {
      it("mostra a aba Magias", () => {
        expectSheetSpellsTab();
      });
    }

    it("executa descanso longo", () => {
      takeSheetLongRest();
    });
  });
}
