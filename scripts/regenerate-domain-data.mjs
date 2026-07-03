import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function gitShow(relativePath) {
  return execSync(`git show HEAD:${relativePath}`, {
    cwd: root,
    encoding: "utf8",
  });
}

function extractArrayBlock(source, exportName) {
  const start = source.indexOf(`export const ${exportName}`);
  const block = source.slice(start);
  const equalsArray = block.indexOf("= [");
  if (equalsArray < 0) {
    throw new Error(`Array not found for ${exportName}`);
  }

  let depth = 0;
  let close = -1;
  for (let index = equalsArray + 2; index < block.length; index += 1) {
    const char = block[index];
    if (char === "[") {
      depth += 1;
    } else if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        close = index;
        break;
      }
    }
  }

  if (close < 0) {
    throw new Error(`Array close not found for ${exportName}`);
  }

  return block.slice(equalsArray + 3, close);
}

function splitArrayInner(inner, splitAfterId) {
  const marker = inner.indexOf(`id: "${splitAfterId}"`);
  if (marker < 0) {
    throw new Error(`Split id not found: ${splitAfterId}`);
  }
  const splitIdx = inner.lastIndexOf("},", marker) + 2;
  return {
    part1: inner.slice(0, splitIdx),
    part2: inner.slice(splitIdx + 1).trim(),
  };
}

function writeParts({
  outDir,
  typeName,
  exportName,
  partOneExport,
  partTwoExport,
  header,
  inner,
}) {
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, "part-one.ts"),
    `${header}export const ${partOneExport}: ${typeName}[] = [${inner.part1}];\n`,
  );
  fs.writeFileSync(
    path.join(outDir, "part-two.ts"),
    `${header}export const ${partTwoExport}: ${typeName}[] = [${inner.part2}];\n`,
  );
  fs.writeFileSync(
    path.join(outDir, "index.ts"),
    `${header}import { ${partOneExport} } from "./part-one";
import { ${partTwoExport} } from "./part-two";

export const ${exportName}: ${typeName}[] = [
  ...${partOneExport},
  ...${partTwoExport},
];
`,
  );
}

const profSource = gitShow("src/domain/character-sheet/class-proficiencies.ts");
const profInner = extractArrayBlock(profSource, "PHB_2024_CLASS_PROFICIENCIES");
writeParts({
  outDir: path.join(
    root,
    "src/domain/character-sheet/data/classes/proficiencies",
  ),
  typeName: "ClassProficienciesDefinition",
  exportName: "PHB_2024_CLASS_PROFICIENCIES",
  partOneExport: "PHB_2024_CLASS_PROFICIENCIES_PART_ONE",
  partTwoExport: "PHB_2024_CLASS_PROFICIENCIES_PART_TWO",
  header:
    'import type { ClassProficienciesDefinition } from "@/entities/character-sheet/types/class";\n\n',
  inner: splitArrayInner(profInner, "sorcerer"),
});

const detailsSource = gitShow("src/domain/character-sheet/class-details.ts");
const detailsInner = extractArrayBlock(detailsSource, "PHB_2024_CLASS_DETAILS");
const detailsParts = splitArrayInner(detailsInner, "sorcerer");
const detailsHeader =
  'import type { ClassDetail } from "@/entities/character-sheet/types/class";\n\nconst SUBCLASS_UNLOCK_LEVEL = 3;\n\n';
const detailsDir = path.join(
  root,
  "src/domain/character-sheet/data/classes/details",
);
writeParts({
  outDir: detailsDir,
  typeName: "ClassDetail",
  exportName: "PHB_2024_CLASS_DETAILS",
  partOneExport: "PHB_2024_CLASS_DETAILS_PART_ONE",
  partTwoExport: "PHB_2024_CLASS_DETAILS_PART_TWO",
  header: detailsHeader,
  inner: detailsParts,
});

const bgSource = gitShow("src/domain/character-sheet/background-details.ts");
const bgInner = extractArrayBlock(bgSource, "PHB_2024_BACKGROUND_DETAILS");
writeParts({
  outDir: path.join(root, "src/domain/character-sheet/data/backgrounds"),
  typeName: "BackgroundDefinition",
  exportName: "PHB_2024_BACKGROUND_DETAILS",
  partOneExport: "PHB_2024_BACKGROUND_DETAILS_PART_ONE",
  partTwoExport: "PHB_2024_BACKGROUND_DETAILS_PART_TWO",
  header:
    'import type { BackgroundDefinition } from "@/entities/character-sheet/types/background";\n\n',
  inner: splitArrayInner(bgInner, "scribe"),
});

const speciesSource = gitShow("src/domain/character-sheet/species-details.ts");
const speciesInner = extractArrayBlock(
  speciesSource,
  "PHB_2024_SPECIES_DETAILS",
);
writeParts({
  outDir: path.join(root, "src/domain/character-sheet/data/species"),
  typeName: "SpeciesDefinition",
  exportName: "PHB_2024_SPECIES_DETAILS",
  partOneExport: "PHB_2024_SPECIES_DETAILS_PART_ONE",
  partTwoExport: "PHB_2024_SPECIES_DETAILS_PART_TWO",
  header:
    'import type { SpeciesDefinition } from "@/entities/character-sheet/types/species";\n\n',
  inner: splitArrayInner(speciesInner, "human"),
});

for (const stale of [
  path.join(root, "src/domain/character-sheet/data/backgrounds/details.ts"),
]) {
  if (fs.existsSync(stale)) {
    fs.unlinkSync(stale);
  }
}

console.log("Regenerated all domain data splits");
