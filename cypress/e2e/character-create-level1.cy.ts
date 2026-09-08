import { filterPhbClasses } from "../support/phb-classes";

const classesToRun = filterPhbClasses();

describe("criação de personagem nível 1", () => {
  beforeEach(() => {
    cy.loginAsDevUser();
  });

  for (const className of classesToRun) {
    it(`cria um ${className} no nível 1`, () => {
      cy.createLevel1Character(className);
    });
  }
});
