import { runSheetClassSuite } from "../../../support/sheet-class-suite";

runSheetClassSuite("Guerreiro", {
  tableActionPath: "**/fighter/table-action",
  economyUseCy: "sheet-economy-use-fighter-second-wind",
  expectActionName: "Recuperar Fôlego",
});
