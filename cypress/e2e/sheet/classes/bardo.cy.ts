import { runSheetClassSuite } from "../../../support/sheet-class-suite";

runSheetClassSuite("Bardo", {
  tableActionPath: "**/bard/table-action",
  economyUseCy: "sheet-economy-use-bard-grant-inspiration",
  expectActionName: "Conceder Inspiração",
  expectSpellsTab: true,
});
