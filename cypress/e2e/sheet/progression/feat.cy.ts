import {
  createLevel1CharacterViaApi,
  levelUpCharacterViaApiTo,
} from "../../../support/api-level-up";
import {
  levelUpChoosingFeat,
  openSheetFeaturesTab,
} from "../../../support/sheet-progression";

describe("ficha — talento nos níveis de ASI", () => {
  it("escolhe talento no nv. 4 e no nv. 6 do Guerreiro", () => {
    cy.loginAsDevUser();
    createLevel1CharacterViaApi("Guerreiro").then((characterId) => {
      levelUpCharacterViaApiTo(characterId, 3, "Guerreiro").then(() => {
        cy.wrap(characterId).as("characterId");
        cy.openCharacterSheetById(characterId);
      });
    });

    levelUpChoosingFeat(4, "Chef", "chef-0-abilityIncrease", "Constituição");
    openSheetFeaturesTab();
    cy.contains("Chef").should("exist");

    cy.get<string>("@characterId").then((characterId) => {
      levelUpCharacterViaApiTo(characterId, 5, "Guerreiro").then(() => {
        cy.openCharacterSheetById(characterId);
      });
    });

    levelUpChoosingFeat(
      6,
      "Resistente",
      "durable-0-abilityIncrease",
      "Constituição",
    );
    openSheetFeaturesTab();
    cy.contains("Chef").should("exist");
    cy.contains("Resistente").should("exist");
  });
});
