export function openSheetFeaturesTab() {
  cy.get("[data-cy=sheet-tab-features]")
    .scrollIntoView()
    .click({ force: true });
}

export function pickLevelUpFeat(
  featLabel: string,
  optionTriggerCy?: string,
  optionLabel?: string,
) {
  cy.contains("Carregando preview…").should("not.exist");
  cy.contains("Carregando talentos…").should("not.exist");
  cy.selectSearchable("level-up-feat", featLabel);
  if (optionTriggerCy && optionLabel) {
    cy.selectSearchable(optionTriggerCy, optionLabel);
  }
}

export function levelUpChoosingFeat(
  nextLevel: number,
  featLabel: string,
  optionTriggerCy?: string,
  optionLabel?: string,
) {
  cy.openSheetSettings();
  cy.contains("Carregando preview…").should("not.exist");
  cy.get("[data-cy=level-up-submit]", { timeout: 20000 }).should("exist");
  cy.fillLevelUpExpertiseIfPresent();
  cy.get("body").then(($body) => {
    const mastery = $body.find('[data-cy^="level-up-masteryWeapon"]');
    if (mastery.length === 0) return;
    cy.wrap(mastery).each(($el) => {
      const trigger = $el.attr("data-cy");
      if (!trigger) return;
      cy.get(`[data-cy=${trigger}]`)
        .scrollIntoView()
        .click({ force: true });
      cy.get('[role="option"]')
        .filter(":visible")
        .not('[aria-disabled="true"]')
        .first()
        .click({ force: true });
    });
  });
  pickLevelUpFeat(featLabel, optionTriggerCy, optionLabel);
  cy.submitLevelUp(nextLevel);
  cy.get("body").type("{esc}");
  cy.get("[data-cy=sheet-settings-dialog]").should("not.exist");
  cy.get("[data-cy=sheet-level]").should("contain", `Nv. ${nextLevel}`);
}
