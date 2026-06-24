describe("home", () => {
  it("carrega a página inicial", () => {
    cy.visit("/");
    cy.contains("To get started").should("be.visible");
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
