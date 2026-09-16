import { runSheetClassSuite } from "../../../support/sheet-class-suite";

runSheetClassSuite("Bárbaro", {
  tableActionPath: "**/barbarian/table-action",
  economyUseCy: "sheet-economy-use-barbarian-rage",
  expectActionName: "Fúria",
});
