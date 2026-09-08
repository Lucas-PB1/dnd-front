import { filterPhbClasses } from "../support/phb-classes";

const classesToRun = filterPhbClasses();

describe("level-up 1 → 2", () => {
  beforeEach(() => {
    cy.loginAsDevUser();
  });

  for (const className of classesToRun) {
    it(`sobe um ${className} do nível 1 para o 2`, () => {
      cy.createLevel1AndLevelUpTo2(className);
    });
  }
});
