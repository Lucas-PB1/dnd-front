# Dados extraídos do PDF

Gerados pelos scripts em `scripts/`:

## Cap. 3 — Classes

- `classes-ocr.txt` / `classes-ocr.json` — texto do Cap. 3
- `classes-data.json` — dados tipados usados na ficha
- `classes-ocr-validation.json` — termos encontrados no OCR

```bash
pnpm extract:classes
pnpm validate:classes
pnpm parse:classes
```

Fonte: `Jogador-2024.pdf` (páginas ~55–182).

## Cap. 4 — Origens (espécies e antecedentes)

- `species-ocr.txt` / `species-ocr.json` — texto do Cap. 4
- `species-details-data.json` — traços de espécie
- `species-ocr-validation.json` — termos encontrados no OCR

```bash
pnpm extract:species
pnpm validate:species
pnpm parse:species
```

Fonte: `Jogador-2024.pdf` (páginas ~184–211).
