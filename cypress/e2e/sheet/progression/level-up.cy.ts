import {
  createLevel1CharacterViaApi,
  levelUpCharacterViaApiTo,
} from "../../../support/api-level-up";

describe("ficha — subir de nível", () => {
  it("sobe um Guerreiro de 1 para 2 pela UI", () => {
    cy.loginAsDevUser();
    createLevel1CharacterViaApi("Guerreiro").then((characterId) => {
      cy.openCharacterSheetById(characterId);
    });
    cy.get("[data-cy=sheet-level]").should("contain", "Nv. 1");
    cy.levelUpCharacterTo(2);
  });
});
