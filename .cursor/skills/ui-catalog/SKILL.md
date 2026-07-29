---
name: ui-catalog
description: >-
  Shared catalog/compendium UI in dnd-front — BackLink, CatalogPageHeader,
  CatalogSearch, CollapsibleCard, PhbProse, PageMain. Use when building or
  polishing catalog list/detail pages (classes, species, spells, backgrounds, feats, equipment).
disable-model-invocation: true
---

# UI do compêndio / catálogo

Componentes em `src/shared/ui/`. Dados sempre da **dnd-api** (tagline, summary, description) — não hardcodar flavor no front.

## Componentes

| Componente          | Quando                                    |
| ------------------- | ----------------------------------------- |
| `PageMain`          | Largura da página (`max-w-6xl` / `7xl`)   |
| `BackLink`          | Qualquer “voltar” de navegação            |
| `CatalogPageHeader` | Título + opcional description/meta + back |
| `CatalogSearch`     | Busca local na listagem + contagem        |
| `CollapsibleCard`   | Texto longo PHB / seções recolhíveis      |
| `PhbProse`          | Corpo de texto PHB (`parsePhbText`)       |

## Listagem

Padrão: `CatalogSearch` + grid de cards em `features/catalog/*-catalog/ui/`.

Card deve mostrar apresentação (`tagline` / `summary` da API) além de traços mecânicos.

**Paginação (20/página):** magias, antecedentes, talentos e equipamento usam busca `q` + `page`/`limit` **na API** (`skip`/`take`), com `CatalogPagination` na UI em formato de **lista**. Classes e espécies carregam a lista completa (poucos itens). Wizard/ficha continuam usando hooks de lista completa quando necessário.

Hub: `widgets/compendium-hub` — lista de seções com eyebrow + seta.

**Equipamento:** hub `/equipment` com abas Armas / Armaduras / Itens; detalhe em `/equipment/weapons|armor|items/[slug]`.

## Detalhe (classes, espécies, antecedentes, magias, talentos, equipamento)

Padrão de referência:

- `features/catalog/class-catalog/ui/class-detail-view.tsx`
- `features/catalog/species-catalog/ui/species-detail-view.tsx`
- `features/catalog/background-catalog/ui/background-detail-view.tsx`
- `features/catalog/spell-catalog/ui/spell-detail-view.tsx`
- `features/catalog/feat-catalog/ui/catalog/feat-detail-view.tsx`
- `features/catalog/equipment-catalog/ui/*-detail-view.tsx`

1. Hero com nome + faixa de stats da API
2. Corpo com `PhbProse` (largura do container; `text-justify` ok)
3. Conteúdo mecânico extra em `CollapsibleCard` quando fizer sentido

Dados de apresentação vêm da **API** — não hardcodar no front.

**Magias:** não usam `tagline`/`summary` no DB; o card usa teaser de `description` + escola/nível/flags; o hero destaca escola, círculo e stats de conjuração.

**Equipamento:** stats mecânicos (dano, CA, custo, propriedades); labels de propriedades/maestria podem ser mapeadas no front a partir dos IDs da API.

## Ícones / tema

Heroicons outline (`@heroicons/react/24/outline`); shadcn em `src/shared/ui/` (skill global `shadcn`).  
Tokens visuais: [docs/COLORS.md](docs/COLORS.md).
