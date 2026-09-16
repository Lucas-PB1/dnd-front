import { runSheetClassSuite } from "../../../support/sheet-class-suite";

runSheetClassSuite("Paladino", {
  tableActionPath: "**/paladin/table-action",
  economyUseCy: "sheet-economy-use-paladin-lay-on-hands",
  expectActionName: "Mãos Consagradas",
  expectSpellsTab: true,
});
