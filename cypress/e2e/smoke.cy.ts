describe("home", () => {
  it("carrega a página inicial", () => {
    cy.visit("/");
    cy.contains("Taverna").should("be.visible");
    cy.contains("Fichas prontas para a mesa").should("be.visible");
    cy.contains("Abrir compêndio").should("be.visible");
  });
});

describe("health API", () => {
  it("retorna status de saúde", () => {
    cy.request("/api/health").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("status");
      expect(response.body).to.have.property("database");
      expect(response.body).to.have.property("timestamp");
    });
  });
});

describe("rotas públicas e auth", () => {
  it("abre o compêndio sem login", () => {
    cy.visit("/compendium");
    cy.contains("Compêndio").should("be.visible");
  });

  it("abre a página de login", () => {
    cy.visit("/login");
    cy.contains("Entrar").should("be.visible");
  });

  it("protege /campaigns redirecionando para login", () => {
    cy.visit("/campaigns");
    cy.location("pathname").should("eq", "/login");
  });

  it("protege /characters redirecionando para login", () => {
    cy.visit("/characters");
    cy.location("pathname").should("eq", "/login");
  });
});
