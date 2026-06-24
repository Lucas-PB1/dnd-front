/**
 * Extrai texto do Jogador-2024.pdf (Cap. 3 — Classes) via texto nativo ou OCR.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFParse } from "pdf-parse";
import Tesseract from "tesseract.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PDF_PATH = path.join(ROOT, "Jogador-2024.pdf");
const OUT_DIR = path.join(ROOT, "data", "extracted");

/** Páginas do PDF (1-based) — Cap. 3 completo */
const START_PAGE = 55;
const END_PAGE = 182;

const CLASS_TERMS = [
  "Bárbaro",
  "Bardo",
  "Bruxo",
  "Clérigo",
  "Druida",
  "Feiticeiro",
  "Guardião",
  "Guerreiro",
  "Ladino",
  "Mago",
  "Monge",
  "Paladino",
  "Subclasse",
  "Traços Básicos",
];

async function ocrPageImage(buffer) {
  const { data } = await Tesseract.recognize(buffer, "por+eng", {
    logger: () => {},
  });
  return data.text.trim();
}

async function main() {
  if (!fs.existsSync(PDF_PATH)) {
    console.error("PDF não encontrado:", PDF_PATH);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const buf = fs.readFileSync(PDF_PATH);
  const parser = new PDFParse({ data: buf });
  const info = await parser.getInfo();
  const totalPages = info.total;

  console.log(
    `PDF: ${totalPages} páginas. Extraindo ${START_PAGE}–${END_PAGE}...`,
  );

  const pageNumbers = Array.from(
    { length: END_PAGE - START_PAGE + 1 },
    (_, index) => START_PAGE + index,
  );

  const nativeParser = new PDFParse({ data: buf });
  const native = await nativeParser.getText({ partial: pageNumbers });
  await nativeParser.destroy();

  const pages = [];
  for (const pageNum of pageNumbers) {
    const nativePage = native.pages.find((page) => page.num === pageNum);
    const nativeText = nativePage?.text?.trim() ?? "";

    if (nativeText.length > 200) {
      console.log(`Pág ${pageNum}: texto nativo (${nativeText.length} chars)`);
      pages.push({
        page: pageNum,
        source: "native",
        text: nativeText,
        chars: nativeText.length,
      });
      continue;
    }

    console.log(`Pág ${pageNum}: OCR...`);
    const screenshotParser = new PDFParse({ data: buf });
    const shot = await screenshotParser.getScreenshot({
      partial: [pageNum],
      desiredWidth: 1800,
      imageBuffer: true,
    });
    await screenshotParser.destroy();

    const pageShot = shot.pages[0];
    if (!pageShot?.data?.length) {
      pages.push({ page: pageNum, source: "empty", text: "", chars: 0 });
      continue;
    }

    const ocrText = await ocrPageImage(Buffer.from(pageShot.data));
    console.log(`Pág ${pageNum}: OCR ok (${ocrText.length} chars)`);
    pages.push({
      page: pageNum,
      source: "ocr",
      text: ocrText,
      chars: ocrText.length,
    });
  }

  await parser.destroy();

  const combined = pages
    .map(
      (page) =>
        `\n\n===== PÁGINA ${page.page} (${page.source}) =====\n\n${page.text}`,
    )
    .join("\n");

  const ocrLower = combined.toLowerCase();
  const validation = {
    found: CLASS_TERMS.filter((term) => ocrLower.includes(term.toLowerCase())),
    missing: CLASS_TERMS.filter(
      (term) => !ocrLower.includes(term.toLowerCase()),
    ),
  };

  fs.writeFileSync(path.join(OUT_DIR, "classes-ocr.txt"), combined, "utf8");
  fs.writeFileSync(
    path.join(OUT_DIR, "classes-ocr.json"),
    JSON.stringify(
      {
        pdfPath: "Jogador-2024.pdf",
        startPage: START_PAGE,
        endPage: END_PAGE,
        totalPages,
        validation,
        pages,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log("\nConcluído!");
  console.log(
    `Total chars: ${pages.reduce((sum, page) => sum + page.chars, 0)}`,
  );
  console.log(
    `Validação — encontrados: ${validation.found.length} | ausentes: ${validation.missing.length}`,
  );
  if (validation.missing.length > 0) {
    console.log("Ausentes:", validation.missing.join(", "));
  }
  console.log(`Arquivos em: ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
