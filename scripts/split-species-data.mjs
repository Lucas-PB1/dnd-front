import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const detailsPath = path.join(
  __dirname,
  "../src/domain/character-sheet/data/species/details.ts",
);

if (!fs.existsSync(detailsPath)) {
  console.log("Species details already split, skipping.");
  process.exit(0);
}

const content = fs.readFileSync(detailsPath, "utf8");
const arrayStart = content.indexOf("export const PHB_2024_SPECIES_DETAILS");
const arrayEnd = content.lastIndexOf("];") + 2;
const arrayBlock = content.slice(arrayStart, arrayEnd);
const header =
  'import type { SpeciesDefinition } from "@/entities/character-sheet/types/species";\n\n';
const part1End = arrayBlock.indexOf('id: "goliath"');
const splitIdx = arrayBlock.lastIndexOf("},", part1End) + 2;
const openBracket = arrayBlock.indexOf("[") + 1;
const part1Body = arrayBlock.slice(openBracket, splitIdx);
const part2Body = arrayBlock.slice(splitIdx + 1, -1);

const outDir = path.dirname(detailsPath);
fs.writeFileSync(
  path.join(outDir, "part-one.ts"),
  `${header}export const PHB_2024_SPECIES_DETAILS_PART_ONE: SpeciesDefinition[] = [${part1Body}];\n`,
);
fs.writeFileSync(
  path.join(outDir, "part-two.ts"),
  `${header}export const PHB_2024_SPECIES_DETAILS_PART_TWO: SpeciesDefinition[] = [${part2Body}];\n`,
);
fs.writeFileSync(
  path.join(outDir, "index.ts"),
  `${header}import { PHB_2024_SPECIES_DETAILS_PART_ONE } from "./part-one";
import { PHB_2024_SPECIES_DETAILS_PART_TWO } from "./part-two";

export const PHB_2024_SPECIES_DETAILS: SpeciesDefinition[] = [
  ...PHB_2024_SPECIES_DETAILS_PART_ONE,
  ...PHB_2024_SPECIES_DETAILS_PART_TWO,
];
`,
);
fs.unlinkSync(detailsPath);
console.log("Split species data into part-one, part-two, index");
