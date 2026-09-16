import { runSheetClassSuite } from "../../../support/sheet-class-suite";

runSheetClassSuite("Patrulheiro", {
  tableActionPath: "**/ranger/table-action",
  economyUseCy: "sheet-economy-use-ranger-hunters-mark",
  expectActionName: "Marca do Predador",
  expectSpellsTab: true,
});
