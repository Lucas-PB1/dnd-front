describe("login (formulário UI)", () => {
  beforeEach(() => {
    // Garante sessão limpa — não usa loginAsDevUser (token inject).
    Cypress.session.clearAllSavedSessions();
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it("entra com e-mail e senha válidos", () => {
    cy.loginViaUi();

    cy.location("pathname", { timeout: 20000 }).should("not.eq", "/login");
    cy.get("[data-cy=auth-menu]", { timeout: 15000 }).should("be.visible");
    cy.get("[data-cy=auth-login-link]").should("not.exist");
  });

  it("respeita o redirect ?next=/characters", () => {
    cy.loginViaUi({ nextPath: "/characters" });

    cy.location("pathname", { timeout: 20000 }).should("eq", "/characters");
    cy.get("[data-cy=auth-menu]", { timeout: 15000 }).should("be.visible");
  });

  it("mostra erro com senha inválida e permanece em /login", () => {
    cy.loginViaUi({ password: "senha-invalida-e2e-nao-usar" });

    cy.location("pathname", { timeout: 10000 }).should("eq", "/login");
    cy.get("[data-cy=login-form] [role=alert]", { timeout: 15000 }).should(
      "be.visible",
    );
    cy.get("[data-cy=auth-menu]").should("not.exist");
  });

  it("sai da conta pelo menu", () => {
    cy.loginViaUi();
    cy.get("[data-cy=auth-menu]", { timeout: 15000 }).should("be.visible").click();
    cy.get("[data-cy=auth-sign-out]").should("be.visible").click();

    cy.get("[data-cy=auth-login-link]", { timeout: 15000 }).should(
      "be.visible",
    );
    cy.get("[data-cy=auth-menu]").should("not.exist");
  });
});
