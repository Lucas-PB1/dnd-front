describe("campanhas", () => {
  beforeEach(() => {
    cy.loginAsDevUser();
  });

  it("cria campanha e mostra detalhe (mestre, código, membros)", () => {
    const name = `E2E Mesa ${Date.now().toString(36)}`;
    cy.createCampaign(name);

    cy.get("[data-cy=campaign-role]").should("contain", "Mestre");
    cy.get("[data-cy=campaign-invite-code]")
      .invoke("text")
      .should("match", /^[A-Z0-9]{4,}$/);
    cy.get("[data-cy=campaign-members-list]")
      .should("be.visible")
      .and("contain", "Você");
    cy.get("[data-cy=campaign-open-encounter]").should("be.visible");
    cy.get("[data-cy=campaign-characters]").should(
      "contain",
      "Nenhum personagem ainda",
    );
  });

  it("edita descrição e acompanha mudança na mesa", () => {
    const name = `E2E Lore ${Date.now().toString(36)}`;
    const description = "Crônica E2E: a taverna abre as portas.";
    cy.createCampaign(name);
    cy.editCampaignDescription(description);

    cy.get("[data-cy=campaign-title]").should("contain", name);
    cy.get("[data-cy=campaign-description]").should("contain", description);
  });

  it("rota o código de convite e atualiza na tela", () => {
    const name = `E2E Código ${Date.now().toString(36)}`;
    cy.createCampaign(name);

    cy.get("[data-cy=campaign-invite-code]")
      .invoke("text")
      .then((previousCode) => {
        cy.window().then((win) => {
          cy.stub(win, "confirm").as("confirmRotate").returns(true);
        });
        cy.intercept("POST", "**/invite-code/rotate").as("rotateInvite");
        cy.get("[data-cy=campaign-invite-rotate]").click();
        cy.get("@confirmRotate").should("have.been.called");
        cy.wait("@rotateInvite").its("response.statusCode").should("eq", 201);
        cy.get("[data-cy=campaign-invite-code]")
          .invoke("text")
          .should("match", /^[A-Z0-9]{4,}$/)
          .and("not.eq", previousCode.trim());
      });
  });

  it("liga setting de inventário e aparece na lista", () => {
    const name = `E2E Loot ${Date.now().toString(36)}`;
    cy.createCampaign(name);

    cy.intercept("PATCH", "**/campaigns/**").as("patchSkipPayment");
    cy.get("[data-cy=campaign-skip-payment]").should("not.be.checked").check({
      force: true,
    });
    cy.wait("@patchSkipPayment").its("response.statusCode").should("be.oneOf", [
      200, 201,
    ]);
    cy.get("[data-cy=campaign-skip-payment]").should("be.checked");

    cy.visit("/campaigns");
    cy.get("[data-cy=campaigns-list]", { timeout: 20000 })
      .contains("[data-cy=campaign-row-name]", name)
      .parents("[data-cy=campaign-row]")
      .within(() => {
        cy.get("[data-cy=campaign-open]").click();
      });
    cy.get("[data-cy=campaign-detail]", { timeout: 20000 }).should("be.visible");
    cy.get("[data-cy=campaign-title]").should("contain", name);
  });

  it("vincula personagem à campanha e acompanha na lista", () => {
    cy.createLevel1Character("Bárbaro");
    cy.get<string>("@characterName").then((characterName) => {
      const campaignName = `E2E Ficha ${Date.now().toString(36)}`;
      cy.createCampaign(campaignName);
      cy.linkCharacterToCampaign(String(characterName));
      cy.get("[data-cy=campaign-characters-list]")
        .should("contain", "Nv. 1")
        .and("contain", "barbarian");
    });
  });
});
