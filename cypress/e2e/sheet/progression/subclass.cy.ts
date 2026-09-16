import {
  createLevel1CharacterViaApi,
  levelUpCharacterViaApiTo,
} from "../../../support/api-level-up";

describe("ficha — subclasse", () => {
  it("escolhe Combatente Psíquico no nv. 3", () => {
    cy.loginAsDevUser();
    createLevel1CharacterViaApi("Guerreiro").then((characterId) => {
      levelUpCharacterViaApiTo(characterId, 2, "Guerreiro").then(() => {
        cy.openCharacterSheetById(characterId);
      });
    });
    cy.levelUpCharacterTo(3, { subclassLabel: "Combatente Psíquico" });
    cy.get("[data-cy=sheet-subclass]").should("contain", "Combatente Psíquico");
  });
});
