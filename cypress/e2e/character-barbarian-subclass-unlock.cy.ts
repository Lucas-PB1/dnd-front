const BARBARIAN_SUBCLASSES = [
  "Trilha do Berserker",
  "Trilha da Árvore do Mundo",
  "Trilha do Coração Selvagem",
  "Trilha do Fanático",
] as const;

/** Filtra por `CYPRESS_SUBCLASS` (ex.: Berserker) para iterar trilha a trilha. */
const subclassesToRun = (() => {
  const filter = (Cypress.env("SUBCLASS") as string | undefined)?.trim();
  if (!filter) return [...BARBARIAN_SUBCLASSES];
  const exact = BARBARIAN_SUBCLASSES.filter((name) => name === filter);
  if (exact.length > 0) return exact;
  return BARBARIAN_SUBCLASSES.filter((name) =>
    name.toLowerCase().includes(filter.toLowerCase()),
  );
})();

describe("Bárbaro — unlock de subclasse (nv. 3)", () => {
  beforeEach(() => {
    cy.loginAsDevUser();
  });

  for (const subclassLabel of subclassesToRun) {
    it(`sobe até nv. 3 com ${subclassLabel}`, () => {
      cy.createLevel1AndUnlockSubclass("Bárbaro", subclassLabel);
      cy.get("[data-cy=sheet-level]").should("contain", "Nv. 3");
      cy.get("[data-cy=sheet-subclass]").should("contain", subclassLabel);
    });
  }
});
