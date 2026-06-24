/**
 * Valida classes.ts contra classes-ocr.txt (PDF = fonte de verdade).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import { includesPdfTerm } from "./pdf-text-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OCR_PATH = path.join(__dirname, "../data/extracted/classes-ocr.txt");

const classesModule = await import(
  pathToFileURL(
    path.join(__dirname, "../src/domain/character-sheet/classes.ts"),
  ).href
);

const { PHB_2024_CLASSES } = classesModule;

if (!fs.existsSync(OCR_PATH)) {
  console.error("Execute pnpm extract:classes antes da validação.");
  process.exit(1);
}

const ocrText = fs.readFileSync(OCR_PATH, "utf8");
const issues = [];

for (const characterClass of PHB_2024_CLASSES) {
  if (!includesPdfTerm(ocrText, characterClass.name)) {
    issues.push({
      id: characterClass.id,
      type: "class-name",
      expected: characterClass.name,
    });
  }

  for (const subclass of characterClass.subclasses) {
    if (!includesPdfTerm(ocrText, subclass.name)) {
      issues.push({
        id: characterClass.id,
        type: "subclass-name",
        expected: subclass.name,
      });
    }
  }
}

if (issues.length === 0) {
  console.log(
    `Validação OK: ${PHB_2024_CLASSES.length} classes e ${PHB_2024_CLASSES.length * 4} subclasses batem com o PDF.`,
  );
  process.exit(0);
}

console.error(`Divergências encontradas (${issues.length}):`);
for (const issue of issues) {
  console.error(JSON.stringify(issue));
}
process.exit(1);
