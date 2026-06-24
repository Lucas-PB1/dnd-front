/**
 * Exporta dados tipados de classes e valida termos no OCR extraído.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import { includesPdfTerm } from "./pdf-text-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../data/extracted/classes-data.json");
const OCR_PATH = path.join(__dirname, "../data/extracted/classes-ocr.txt");

const classesModule = await import(
  pathToFileURL(
    path.join(__dirname, "../src/domain/character-sheet/classes.ts"),
  ).href
);

const { PHB_2024_CLASSES } = classesModule;

const payload = {
  source:
    "Livro do Jogador 2024 (PT-BR) — Cap. 3 (validado com OCR pág. 55–182)",
  extractedAt: new Date().toISOString(),
  classes: PHB_2024_CLASSES,
};

fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf8");

let ocrValidation = { found: [], missing: [] };
if (fs.existsSync(OCR_PATH)) {
  const ocrText = fs.readFileSync(OCR_PATH, "utf8");
  const terms = PHB_2024_CLASSES.flatMap((characterClass) => [
    characterClass.name,
    ...characterClass.subclasses.map((subclass) => subclass.name),
  ]);

  for (const term of terms) {
    (includesPdfTerm(ocrText, term)
      ? ocrValidation.found
      : ocrValidation.missing
    ).push(term);
  }

  fs.writeFileSync(
    path.join(__dirname, "../data/extracted/classes-ocr-validation.json"),
    JSON.stringify(ocrValidation, null, 2),
    "utf8",
  );
}

console.log("Gerado:", OUT);
console.log("Classes:", PHB_2024_CLASSES.length);
console.log(
  "OCR validação — encontrados:",
  ocrValidation.found.length,
  "| ausentes:",
  ocrValidation.missing.length,
);
