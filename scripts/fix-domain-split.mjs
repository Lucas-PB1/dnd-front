import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function fixSyntax(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  const fixed = content.replace(/\[\] = \[/g, "[");
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed);
    console.log("Fixed syntax:", filePath);
  }
}

for (const file of [
  "src/domain/character-sheet/data/classes/part-one.ts",
  "src/domain/character-sheet/data/backgrounds/part-one.ts",
  "src/domain/character-sheet/data/species/part-one.ts",
]) {
  fixSyntax(path.join(root, file));
}

const classDetailsParts = [
  "src/domain/character-sheet/data/classes/part-one.ts",
  "src/domain/character-sheet/data/classes/part-two.ts",
];

for (const rel of classDetailsParts) {
  const filePath = path.join(root, rel);
  let content = fs.readFileSync(filePath, "utf8");
  if (!content.includes("SUBCLASS_UNLOCK_LEVEL")) {
    content = content.replace(
      /^(import[^\n]+\n\n)/,
      "$1const SUBCLASS_UNLOCK_LEVEL = 3;\n\n",
    );
    fs.writeFileSync(filePath, content);
    console.log("Added SUBCLASS_UNLOCK_LEVEL:", rel);
  }
}

const profSource = execSync(
  "git show HEAD:src/domain/character-sheet/class-proficiencies.ts",
  { cwd: root, encoding: "utf8" },
);

const arrayStart = profSource.indexOf(
  "export const PHB_2024_CLASS_PROFICIENCIES",
);
const arrayBlock = profSource.slice(arrayStart);
const openBracket = arrayBlock.indexOf("[") + 1;
const closeBracket = arrayBlock.lastIndexOf("];");
const inner = arrayBlock.slice(openBracket, closeBracket);
const marker = inner.indexOf('id: "sorcerer"');
const splitIdx = inner.lastIndexOf("},", marker) + 2;
const part1 = inner.slice(0, splitIdx);
const part2 = inner.slice(splitIdx + 1);

const profDir = path.join(
  root,
  "src/domain/character-sheet/data/classes/proficiencies",
);
fs.mkdirSync(profDir, { recursive: true });

const header =
  'import type { ClassProficienciesDefinition } from "@/domain/character-sheet/types/class";\n\n';

fs.writeFileSync(
  path.join(profDir, "part-one.ts"),
  `${header}export const PHB_2024_CLASS_PROFICIENCIES_PART_ONE: ClassProficienciesDefinition[] = [${part1}];\n`,
);
fs.writeFileSync(
  path.join(profDir, "part-two.ts"),
  `${header}export const PHB_2024_CLASS_PROFICIENCIES_PART_TWO: ClassProficienciesDefinition[] = [${part2}];\n`,
);
fs.writeFileSync(
  path.join(profDir, "index.ts"),
  `${header}import { PHB_2024_CLASS_PROFICIENCIES_PART_ONE } from "./part-one";
import { PHB_2024_CLASS_PROFICIENCIES_PART_TWO } from "./part-two";

export const PHB_2024_CLASS_PROFICIENCIES: ClassProficienciesDefinition[] = [
  ...PHB_2024_CLASS_PROFICIENCIES_PART_ONE,
  ...PHB_2024_CLASS_PROFICIENCIES_PART_TWO,
];
`,
);

fs.unlinkSync(
  path.join(root, "src/domain/character-sheet/data/classes/proficiencies.ts"),
);
console.log("Created proficiencies split");

const detailsDir = path.join(
  root,
  "src/domain/character-sheet/data/classes/details",
);
fs.mkdirSync(detailsDir, { recursive: true });

for (const name of ["part-one.ts", "part-two.ts", "details.ts"]) {
  const from = path.join(root, "src/domain/character-sheet/data/classes", name);
  const to = path.join(detailsDir, name === "details.ts" ? "index.ts" : name);
  if (fs.existsSync(from)) {
    let content = fs.readFileSync(from, "utf8");
    if (name === "details.ts") {
      content = content.replace(/\.\/part-/g, "./part-");
    }
    fs.writeFileSync(to, content);
    fs.unlinkSync(from);
    console.log("Moved", name, "to details/");
  }
}
