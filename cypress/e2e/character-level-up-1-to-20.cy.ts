import {
  filterPhbClasses,
  PHB_PREFERRED_SUBCLASS,
  type PhbClassName,
} from "../support/phb-classes";
import {
  createLevel1CharacterViaApi,
  levelUpCharacterViaApiTo,
} from "../support/api-level-up";

const classesToRun = filterPhbClasses();

describe("level-up 1 → 20 (API)", () => {
  for (const className of classesToRun) {
    it(`sobe um ${className} do nível 1 ao 20 (${PHB_PREFERRED_SUBCLASS[className as PhbClassName]})`, () => {
      createLevel1CharacterViaApi(className as PhbClassName).then(
        (characterId) => {
          levelUpCharacterViaApiTo(
            characterId,
            20,
            className as PhbClassName,
          )
            .its("level")
            .should("eq", 20);
        },
      );
    });
  }
});
