/**
 * Exporta dados tipados de espécie e valida termos no OCR extraído.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../data/extracted/species-details-data.json");
const OCR_PATH = path.join(__dirname, "../data/extracted/species-ocr.txt");

const dataModule = await import(
  pathToFileURL(
    path.join(__dirname, "../src/domain/character-sheet/species-details.ts"),
  ).href
);

const { PHB_2024_SPECIES_DETAILS } = dataModule;

const payload = {
  source:
    "Livro do Jogador 2024 (PT-BR) — Cap. 4 (validado com OCR pág. 184–211)",
  extractedAt: new Date().toISOString(),
  species: PHB_2024_SPECIES_DETAILS,
};

fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf8");

let ocrValidation = { found: [], missing: [] };
if (fs.existsSync(OCR_PATH)) {
  const ocr = fs.readFileSync(OCR_PATH, "utf8").toLowerCase();
  const terms = [
    "aasimar",
    "anão",
    "draconato",
    "elfo",
    "gnomo",
    "golias",
    "humano",
    "orc",
    "pequenino",
    "tiferino",
    "deslocamento",
    "tamanho",
    "visão no escuro",
  ];
  for (const term of terms) {
    (ocr.includes(term) ? ocrValidation.found : ocrValidation.missing).push(
      term,
    );
  }
  fs.writeFileSync(
    path.join(__dirname, "../data/extracted/species-ocr-validation.json"),
    JSON.stringify(ocrValidation, null, 2),
    "utf8",
  );
}

console.log("Gerado:", OUT);
console.log("Espécies:", PHB_2024_SPECIES_DETAILS.length);
console.log(
  "OCR validação — encontrados:",
  ocrValidation.found.length,
  "| ausentes:",
  ocrValidation.missing.length,
);
