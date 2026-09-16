describe("ficha Guerreiro — Ações e descanso", () => {
  before(() => {
    cy.loginAsDevUser();
    cy.createLevel1Character("Guerreiro");
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
    cy.get("[data-cy=sheet-tab-actions]").should("be.visible");
  });

  it("abre a aba Ações e usa Recuperar Fôlego", () => {
    cy.intercept("POST", "**/fighter/table-action").as("fighterTableAction");
    cy.get("[data-cy=sheet-tab-actions]").click();
    cy.contains("Recuperar Fôlego", { timeout: 20000 }).should("be.visible");
    cy.contains("li", "Recuperar Fôlego").within(() => {
      cy.contains("1/1").should("be.visible");
      cy.get("[data-cy=sheet-economy-use-fighter-second-wind]")
        .should("not.be.disabled")
        .click();
    });
    cy.wait("@fighterTableAction")
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);
    cy.contains("li", "Recuperar Fôlego").within(() => {
      cy.contains("0/1").should("be.visible");
    });
  });

  it("executa descanso longo", () => {
    cy.intercept("POST", "**/characters/*/rest").as("takeRest");
    cy.get("[data-cy=sheet-long-rest]").should("be.visible").click();
    cy.wait("@takeRest")
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);
    cy.get("[data-cy=sheet-rest-feedback]", { timeout: 20000 }).should(
      "be.visible",
    );
  });
});
