export function openSheetActionsTab() {
  cy.get("[data-cy=sheet-tab-actions]")
    .scrollIntoView()
    .click({ force: true });
}

export function useSheetEconomyAction(dataCy: string, tableActionPath: string) {
  cy.intercept("POST", tableActionPath).as("sheetTableAction");
  openSheetActionsTab();
  cy.get(`[data-cy=${dataCy}]`, { timeout: 20000 })
    .scrollIntoView()
    .should("not.be.disabled")
    .click({ force: true });
  cy.wait("@sheetTableAction")
    .its("response.statusCode")
    .should("be.oneOf", [200, 201]);
}

export function takeSheetLongRest() {
  cy.intercept("POST", "**/characters/*/rest").as("takeRest");
  cy.get("[data-cy=sheet-long-rest]").scrollIntoView().click({ force: true });
  cy.wait("@takeRest")
    .its("response.statusCode")
    .should("be.oneOf", [200, 201]);
  cy.get("[data-cy=sheet-rest-feedback]", { timeout: 20000 }).should(
    "be.visible",
  );
}

export function takeSheetDawn() {
  cy.intercept("POST", "**/characters/*/rest").as("takeDawn");
  cy.get("[data-cy=sheet-dawn]").scrollIntoView().click({ force: true });
  cy.wait("@takeDawn")
    .its("response.statusCode")
    .should("be.oneOf", [200, 201]);
  cy.get("[data-cy=sheet-rest-feedback]", { timeout: 20000 }).should(
    "be.visible",
  );
}

export function expectSheetSpellsTab() {
  cy.get("[data-cy=sheet-tab-spells]")
    .scrollIntoView()
    .click({ force: true });
  cy.get("[data-cy=sheet-tab-spells]").should("exist");
}
