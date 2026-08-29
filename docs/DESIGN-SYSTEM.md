# Design System — Grimoire

Sistema visual do **dnd-front**: tokens, primitivos shadcn, layout, marca e padrões de compêndio reutilizáveis.

Código: `src/shared/design-system/`  
Tokens CSS: `src/app/globals.css`  
Cores (referência): [COLORS.md](./COLORS.md)  
Arquitetura FSD: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Princípios

1. **Semântico na UI** — `bg-primary`, `text-muted-foreground`; não `bg-red-500`.
2. **FSD** — design system = camada `shared`; regras de negócio ficam em `features/`.
3. **API como fonte** — textos de catálogo vêm da dnd-api; `PhbProse` só formata.
4. **Compatibilidade** — `@/shared/ui/*` reexporta o design system; migração gradual.

---

## Estrutura de pastas

```text
src/shared/design-system/
├── tokens/           # motion, contentWidthClass
├── primitives/       # shadcn / Base UI
├── layout/           # PageMain, AppPageShell, BackLink
├── brand/            # Atmosphere, marcas do grimório
├── patterns/         # Compêndio, prose, tiles, empty state
└── index.ts          # barrel (opcional)
```

| Camada | Quando usar | Exemplos |
|--------|-------------|----------|
| **tokens** | Constantes visuais em TS | `motion.page`, `contentWidthClass.sheet` |
| **primitives** | Controles genéricos | `Button`, `Input`, `Dialog`, `Field` |
| **layout** | Shell de página | `PageMain`, `AppPageShell` |
| **brand** | Identidade Grimoire/Couro | `Atmosphere`, `SealMark` |
| **patterns** | Blocos compostos transversais | `CatalogTileCard`, `PhbProse`, `DetailTileGrid` |

---

## Tokens

### CSS (`globals.css`)

Tema **Grimoire** (light) / **Couro** (dark). Variáveis shadcn: `--background`, `--primary`, `--secondary`, `--accent`, `--muted`, `--destructive`, `--card`, `--border`, `--ring`, `--chart-1`…`--chart-5`.

Ver tabela completa em [COLORS.md](./COLORS.md).

### TypeScript

| Arquivo | Export | Uso |
|---------|--------|-----|
| `tokens/motion.ts` | `motion.page`, `motion.enter`, `motion.stagger`, `motion.hoverLift`, `motion.hoverRow` | Classes em `globals.css` |
| `tokens/layout.ts` | `contentWidthClass`, `ContentWidth` | Larguras: `page`, `wide`, `sheet`, `hero`, `auth` |

`@/shared/lib/motion` reexporta `tokens/motion` (compat).

### Tipografia

| Papel | Fonte | Variável |
|-------|-------|----------|
| Heading | Source Serif 4 | `--font-heading` |
| Body | Source Sans 3 | `--font-sans` |
| Mono | Geist Mono | `--font-geist-mono` |

---

## Primitivos (shadcn)

Instalados via CLI → `src/shared/design-system/primitives/`.

| Componente | Arquivo | Notas |
|------------|---------|-------|
| Button | `button.tsx` | `buttonVariants` para links estilizados |
| Input | `input.tsx` | |
| Label | `label.tsx` | |
| Field | `field.tsx` | Wrapper RHF |
| Dialog | `dialog.tsx` | Modal acessível |
| Separator | `separator.tsx` | |
| SearchableSelect | `searchable-select.tsx` | Combobox com busca (listas longas) |
| **Badge** | `badge.tsx` | Chips/tags semânticos (`variant`, `size`) |
| **NativeSelect** | `native-select.tsx` | `<select>` estilizado (listas curtas) |

**Adicionar novo primitivo:**

```bash
cd dnd-front
pnpm dlx shadcn@latest add tabs
```

Criar reexport em `src/shared/ui/tabs.tsx`:

```ts
export * from "@/shared/design-system/primitives/tabs";
```

---

## Formulários

Stack padrão: **Field** + controle + **FieldError** (RHF).

| Caso | Componente | Quando |
|------|------------|--------|
| Texto curto | `Input` | Nome, busca simples |
| Select com busca | `SearchableSelect` | Catálogo, opções longas, hints |
| Select + label + erro | `FormSelect` | Wizard, ficha, feats (ex‑`CatalogSelect`) |
| Select nativo | `NativeSelect` | Poucas opções, sem busca (threads, vínculos) |
| Checkbox / radio | *pendente shadcn* | — |

```tsx
import { FormSelect } from "@/shared/design-system/patterns/form-select";
import { Input } from "@/shared/design-system/primitives/input";
import { Field, FieldLabel, FieldError } from "@/shared/design-system/primitives/field";
```

`CatalogSelect` no wizard é alias de `FormSelect` — prefira `FormSelect` em código novo.

---

## Badges e chips

| Componente | Camada | Uso |
|------------|--------|-----|
| `Badge` | primitivo | Qualquer tag/chip reutilizável |
| `CatalogEditionChip` | pattern | PHB / Valdas / Northlands em cards |
| `SourceEditionBadge` | pattern | Badge vivo com fontes do compêndio |
| `SheetChip` | feature (ficha) | Wrapper fino sobre `Badge` |
| `RollChip` | pattern | Chip clicável de rolagem |

**Variantes de `Badge`:** `default`, `muted`, `secondary`, `primary`, `accent`, `destructive`, `magic`, `warn`, `coverage`, `edition`, `outline`.

**Tamanhos:** `default`, `sm`, `xs` (mono/tabular para stats).

Para tons de item de loja: `badgeVariantFromTone(tone)` mapeia `ItemCatalogBadgeTone` → variante semântica (sem cores hardcoded).

**Evitar:** `<span className="rounded border border-violet-500/...">` — use `Badge variant="magic"`.

**Ainda duplicado (migrar depois):** chips de filtro da loja (`beyond-shop-filters`), seções de ações (`beyond-actions-tab`), alguns heroes inline.

---

| Componente | Props principais | Uso |
|------------|------------------|-----|
| `PageMain` | `width`, `muteMotion` | Container central das páginas |
| `AppPageShell` | `width`, `atmosphere` | Header + grain + PageMain |
| `BackLink` | `href`, `label` | Navegação “voltar” |

---

## Brand

| Componente | Uso |
|------------|-----|
| `Atmosphere` | Grain + gradiente de fundo |
| `SealMark`, `MarginCorner`, `InkFlourish` | Ornamentos PHB |

---

## Padrões de compêndio

Fluxo listagem: `CatalogShell` (widget) → `CatalogSearch` + grid → `CatalogTileCard` / `CatalogListCard`.

| Componente | Uso |
|------------|-----|
| `CatalogPageHeader` | Título + back + selo |
| `CatalogDetailHero` | Hero de detalhe (stats, imagem) |
| `CatalogSearch` | Busca + contagem |
| `CatalogFilters` | Filtros com `SearchableSelect` |
| `CatalogPagination` | Paginação cursor |
| `CatalogEmptyMessage` | Lista vazia |
| `CatalogEditionChip` | Badge estático de edição |
| `SourceEditionBadge` | Badge com query de fonte |
| `CollapsibleCard` | Seção recolhível |
| `PhbProse` | Texto PHB (`parsePhbText`, métrico) |
| `EmptyState` | Estado vazio genérico |
| `DetailTileGrid` | Grade de tiles → modal de detalhe |
| `LevelGroupedDetailTiles` | Tiles agrupados por nível |
| `LocalRollResultBanner` | Resultado de rolagem local |

**Detalhe de referência:** `features/catalog/class-catalog/ui/class-detail-view.tsx`

Cards de domínio (`class-card`, `species-card`…) permanecem em `features/catalog/*-catalog/ui/` — são finos wrappers sobre `CatalogTileCard`.

---

## Ficha de personagem (fora do DS)

Layout **Beyond** é proprietário da feature:

- `beyond-panel`, `beyond-main-tabs`
- Painéis de combate por classe
- Shop / inventário

Não mover para o design system até haver reuso real em campanha/actor.

---

## Ícones

- **App:** Heroicons (`@heroicons/react/24/outline`)
- **Primitivos shadcn:** Lucide internamente — ok manter os dois

---

## Checklist ao criar UI

- [ ] Componente genérico? → `design-system/` (primitives, patterns ou layout)
- [ ] Regra de negócio ou entidade? → `features/<slice>/ui/`
- [ ] Composição de página? → `widgets/`
- [ ] Cores via tokens semânticos
- [ ] Texto de catálogo da API, não hardcoded
- [ ] Reexport em `shared/ui/` se o shadcn CLI ou imports legados precisarem

---

## Documentação relacionada

| Doc | Assunto |
|-----|---------|
| [COLORS.md](./COLORS.md) | Paleta Grimoire/Couro |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | FSD e camadas |
| `.cursor/skills/ui-catalog/SKILL.md` | Fluxo compêndio |
| `.cursor/rules/31-ui-screen-quality.mdc` | Qualidade de tela |
| `.cursor/rules/32-ui-character-sheet.mdc` | Ficha Beyond |
