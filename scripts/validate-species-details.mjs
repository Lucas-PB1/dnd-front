/**
 * Valida species-details.ts e origins.ts contra species-ocr.txt (PDF).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import { includesPdfTerm } from "./pdf-text-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OCR_PATH = path.join(__dirname, "../data/extracted/species-ocr.txt");

const dataModule = await import(
  pathToFileURL(
    path.join(__dirname, "../src/domain/character-sheet/species-details.ts"),
  ).href
);

const originsModule = await import(
  pathToFileURL(
    path.join(__dirname, "../src/domain/character-sheet/origins.ts"),
  ).href
);

const { PHB_2024_SPECIES_DETAILS } = dataModule;
const { PHB_2024_SPECIES, PHB_2024_BACKGROUNDS } = originsModule;

if (!fs.existsSync(OCR_PATH)) {
  console.error("Execute pnpm extract:species antes da validação.");
  process.exit(1);
}

const ocrText = fs.readFileSync(OCR_PATH, "utf8");
const issues = [];

for (const species of PHB_2024_SPECIES_DETAILS) {
  const speedNeedle = `Deslocamento: ${species.speedLabel}`;
  if (!includesPdfTerm(ocrText, speedNeedle)) {
    issues.push({
      id: species.id,
      type: "speed",
      expected: speedNeedle,
    });
  }

  for (const trait of species.traits) {
    const traitNeedle = `${trait.title}.`;
    if (!includesPdfTerm(ocrText, traitNeedle)) {
      issues.push({
        id: species.id,
        type: "trait-title",
        expected: traitNeedle,
      });
    }
  }
}

for (const species of PHB_2024_SPECIES) {
  if (!includesPdfTerm(ocrText, species.name)) {
    issues.push({
      id: species.id,
      type: "species-name",
      expected: species.name,
    });
  }
}

for (const background of PHB_2024_BACKGROUNDS) {
  if (!includesPdfTerm(ocrText, background.name)) {
    issues.push({
      id: background.id,
      type: "background-name",
      expected: background.name,
    });
  }
}

if (issues.length === 0) {
  console.log(
    "Validação OK: espécies, traços, deslocamentos e antecedentes batem com o PDF.",
  );
  process.exit(0);
}

console.error(`Divergências encontradas (${issues.length}):`);
for (const issue of issues) {
  console.error(JSON.stringify(issue));
}
process.exit(1);
