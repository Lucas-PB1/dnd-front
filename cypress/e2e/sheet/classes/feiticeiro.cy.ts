import { runSheetClassSuite } from "../../../support/sheet-class-suite";

runSheetClassSuite("Feiticeiro", {
  tableActionPath: "**/sorcerer/table-action",
  economyUseCy: "sheet-economy-use-sorcerer-innate-sorcery",
  expectActionName: "Feitiçaria Inata",
  expectSpellsTab: true,
});
