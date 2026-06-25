import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function writeSplit({
  sourcePath,
  typeName,
  exportName,
  partOneExport,
  partTwoExport,
  splitAfterId,
  header,
  indexPath,
}) {
  if (!fs.existsSync(sourcePath)) {
    console.log("Skip", sourcePath);
    return;
  }

  const content = fs.readFileSync(sourcePath, "utf8");
  const arrayStart = content.indexOf(`export const ${exportName}`);
  const arrayEnd = content.lastIndexOf("];") + 2;
  const arrayBlock = content.slice(arrayStart, arrayEnd);
  const equalsArray = arrayBlock.indexOf("= [");
  const openBracket = equalsArray + 3;
  const part1Body = arrayBlock.slice(openBracket, splitIdx);
  const part2Body = arrayBlock.slice(splitIdx + 1, -1);
  const outDir = path.dirname(sourcePath);

  fs.writeFileSync(
    path.join(outDir, "part-one.ts"),
    `${header}export const ${partOneExport}: ${typeName}[] = [${part1Body}];\n`,
  );
  fs.writeFileSync(
    path.join(outDir, "part-two.ts"),
    `${header}export const ${partTwoExport}: ${typeName}[] = [${part2Body}];\n`,
  );
  fs.writeFileSync(
    indexPath,
    `${header}import { ${partOneExport} } from "./part-one";
import { ${partTwoExport} } from "./part-two";

export const ${exportName}: ${typeName}[] = [
  ...${partOneExport},
  ...${partTwoExport},
];
`,
  );
  fs.unlinkSync(sourcePath);
  console.log("Split", sourcePath);
}

writeSplit({
  sourcePath: path.join(
    root,
    "src/domain/character-sheet/data/classes/proficiencies-data.ts",
  ),
  typeName: "ClassProficienciesDefinition",
  exportName: "PHB_2024_CLASS_PROFICIENCIES",
  partOneExport: "PHB_2024_CLASS_PROFICIENCIES_PART_ONE",
  partTwoExport: "PHB_2024_CLASS_PROFICIENCIES_PART_TWO",
  splitAfterId: "sorcerer",
  header:
    'import type { ClassProficienciesDefinition } from "@/domain/character-sheet/types/class";\n\n',
  indexPath: path.join(
    root,
    "src/domain/character-sheet/data/classes/proficiencies.ts",
  ),
});

writeSplit({
  sourcePath: path.join(
    root,
    "src/domain/character-sheet/data/classes/details-data.ts",
  ),
  typeName: "ClassDetail",
  exportName: "PHB_2024_CLASS_DETAILS",
  partOneExport: "PHB_2024_CLASS_DETAILS_PART_ONE",
  partTwoExport: "PHB_2024_CLASS_DETAILS_PART_TWO",
  splitAfterId: "sorcerer",
  header:
    'import type { ClassDetail } from "@/domain/character-sheet/types/class";\n\n',
  indexPath: path.join(
    root,
    "src/domain/character-sheet/data/classes/details.ts",
  ),
});

writeSplit({
  sourcePath: path.join(
    root,
    "src/domain/character-sheet/data/backgrounds/details-data.ts",
  ),
  typeName: "BackgroundDefinition",
  exportName: "PHB_2024_BACKGROUND_DETAILS",
  partOneExport: "PHB_2024_BACKGROUND_DETAILS_PART_ONE",
  partTwoExport: "PHB_2024_BACKGROUND_DETAILS_PART_TWO",
  splitAfterId: "scribe",
  header:
    'import type { BackgroundDefinition } from "@/domain/character-sheet/types/background";\n\n',
  indexPath: path.join(
    root,
    "src/domain/character-sheet/data/backgrounds/details.ts",
  ),
});
