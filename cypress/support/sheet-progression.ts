export function openSheetFeaturesTab() {
  cy.get("[data-cy=sheet-tab-features]")
    .scrollIntoView()
    .click({ force: true });
}

export function openSheetFeatsTraits() {
  openSheetFeaturesTab();
  cy.get("[data-cy=sheet-traits-tab-feats]")
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
  cy.get("[data-cy=level-up-feat]", { timeout: 20000 }).should(
    "not.be.disabled",
  );
  cy.fillLevelUpExpertiseIfPresent();
  cy.get("body").then(($body) => {
    if ($body.find('[data-cy^="level-up-masteryWeapon"]').length === 0) {
      return;
    }
    cy.get('[data-cy^="level-up-masteryWeapon"]')
      .should("not.be.disabled")
      .and(($el) => {
        expect($el.text()).to.not.include("Carregando");
      });
  });
  cy.fillLevelUpMasteryIfPresent();
  pickLevelUpFeat(featLabel, optionTriggerCy, optionLabel);
  cy.submitLevelUp(nextLevel);
  cy.get("body").type("{esc}");
  cy.get("[data-cy=sheet-settings-dialog]").should("not.exist");
  cy.get("[data-cy=sheet-level]").should("contain", `Nv. ${nextLevel}`);
}
