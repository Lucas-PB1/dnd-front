/** Utilitários para comparar texto do PDF PT-BR (fontes especiais do livro). */

const ACCENT_MAP = {
  0xf7e1: "a",
  0xf7e3: "a",
  0xf7e7: "c",
  0xf7e9: "e",
  0xf7f3: "o",
  0xf7f4: "o",
  0xf7f5: "a",
  0xf7f6: "a",
};

export function denoisePdfText(text) {
  let result = "";
  for (const char of text) {
    const code = char.codePointAt(0);
    if (code >= 0xf761 && code <= 0xf77a) {
      result += String.fromCharCode(65 + code - 0xf761);
      continue;
    }
    if (ACCENT_MAP[code]) {
      result += ACCENT_MAP[code];
      continue;
    }
    result += char;
  }

  return result.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function normalizePdfNeedle(term) {
  return term.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function includesPdfTerm(ocrText, term) {
  const haystack = denoisePdfText(ocrText);
  const needle = normalizePdfNeedle(term);
  return haystack.includes(needle);
}
