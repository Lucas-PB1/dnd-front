# Front — SSOT sem hardcode de domínio

Data: 2026-08-06  
Repos: `dnd-front` · API irmã: `dnd-api`  
Relacionado: [`../API-INTEGRATION.md`](../API-INTEGRATION.md) · catálogo mecânico na API (`GET /combat-mechanical-catalog`).

## Meta

Zero listas de domínio RPG hardcoded no front. Catálogo, opções de mesa e labels de referência vêm da **dnd-api**. O cliente só renderiza e envia intenções.

Exceção explícita (não é gap): brand (`shared/config/brand.ts`), env (`NEXT_PUBLIC_API_URL`), layout/tabs de UI, query keys.

## Contexto

No back, arrays `CATALOG` de combate saíram do domain TS e foram para o schema `rpg` + `LoadCombatMechanicalCatalog` (critério atingido 2026-08-06). O code-health da API lista como próximo PR: **expor GET do catálogo mecânico no BC Catalog**.

Hoje o front ainda espelha parte desse catálogo em TS — com drift real (ex.: máscara `persona-mask-jester` → front `"Bufão"`, seed `"Bobão"`).

Já consome API (contraste bom):

- Gunslinger: `GET /characters/:id/maneuvers`
- Battle Master: `GET /characters/:id/fighter/maneuvers`
- Condições, edições, métodos de geração (wizard), catálogo PHB clássico

---

## Inventário

### P0 — Catálogo mecânico de combate

| O quê | Status |
|-------|--------|
| Golpe Astuto | Feito — `cunningStrikeEffects` |
| Máscaras do Bardo | Feito — `personaMasks` |
| Precaução (Dungeoneer) | Feito — `precautionSpells` |
| Economia de ação (aba Ações) | Feito — `economyActions` (C009) |
| Painéis `*_ACTIONS` | Feito — `panelActions` (C010) |
| `managed-class-resources` | Removido (código morto) |
| Helpers `economy-table-actions` | Mantidos só como dispatch (`psi:`), não SSOT |

### P1 — API já existe; front ignora

| O quê | Endpoint | Status |
|-------|----------|--------|
| Labels / ordem de atributos | `GET /abilities` | Feito — `useAbilityLabels` / `useAbilities` |
| Métodos de geração (review) | `GET /ability-generation-methods` | Feito — `useStepReview` usa o catálogo |
| Proficiency bonus por nível | `GET /character-levels` | Feito — `proficiencyBonusForLevel(level, catalog)` |

### P2 — Dados no DB; falta endpoint de lista / pool

| O quê | Onde | Nota |
|-------|------|------|
| Escolas de magia (filtro) | `shared/lib/catalog-filter-options.ts` | seed escolas; só embutido em spells |
| Categorias feat / arma / armadura / item | idem + `ITEM_TYPE_LABELS_PT` / `WEAPON_CATEGORY_LABELS_PT` | seeds `S006`–`S011` |
| Pools de ferramentas (instrumento, jogo, artesão) | `create-character/lib/equipment/equipment-choice-resolve.ts` | items/tools no DB |

### P3 — Ainda TS↔TS nos dois lados (não só front)

| O quê | Front | Back |
|-------|-------|------|
| Point-buy / standard array | `point-buy.ts`, `ability-pool.ts` | `ability-generation.ts` |
| ASI / níveis de feat | `asi-feat-slots.ts` | `asi-feat-levels.ts` |
| Expertise slots | `class-expertise-slots.ts` | `class-expertise-slots.ts` |
| Subclass unlock default 3 | `entities/character/lib/subclass.ts` | regra implícita |
| `MAX_ATTUNED_ITEMS = 3` | inventory UI | não modelado como config |

Mover só no front sem SSOT no back **não** fecha o problema — coordenar com plano da API.

### Fora de escopo (OK hardcoded)

- `shared/config/brand.ts` — produto (“Taverna”)
- `shared/api/dnd-api/env.ts` — URL validada com Zod
- Hub do compêndio (navegação de seções do site)
- Constantes de UI (larguras, tabs, query keys `as const`)

---

## Gaps de API (bloqueiam P2)

| Gap | Situação atual | Precisa |
|-----|----------------|---------|
| Escolas / categorias de filtro | embutidas em recursos | endpoints de referência ou derivar de lista já paginada |
| Pools de tools | items no DB | listar por `itemType` / `toolCategory` |

---

## Plano de entrega

| Fase | Escopo | Dependência | Status |
|------|--------|-------------|--------|
| **0** | Este doc + alinhamento com GET na API | — | Feito |
| **1** | API: expor GET catálogo mecânico | `dnd-api` code-health | Feito |
| **2** | Front P0: cunning strikes, persona masks, precaution → fetch; remover arrays locais | Fase 1 | Feito |
| **3** | Front P1: abilities, ability-generation-methods (review), character-levels → PB | endpoints já existem | Feito |
| **4** | Front P2: filtros do compêndio + pools de tools | endpoints ou query por tipo | Pendente |
| **5** | `class-action-economy` + painéis: front só consome ações disponíveis da API | modelagem / enriquecimento no back | Feito |
| **6** | P3 com a API (point-buy, ASI, expertise) quando o back sair do TS | plano conjunto | Pendente |

Critério de pronto (fases 1–3): nenhum array de domínio de combate/referência listado em P0/P1 permanece como fonte de verdade no front; labels vêm da API; drift Bufão/Bobão impossível.

---

## Qualidade atual do front (snapshot)

Nota: **B−**

| Área | Leitura |
|------|---------|
| Catálogo + HTTP + FSD documentado | Forte (A−) |
| `character-sheet` (combate / inventário / magias) | Fraco — god slice, arquivos 500–850 linhas, regras espelhadas |
| Tipagem de resposta API | Só compile-time (`gameFetch<T>`); sem Zod no boundary |
| Boundaries FSD | `shared` → `entities` em filtros/chips; barrels públicos = `index.ts` na pasta (sem aggregators nomeados) |
| Testes | ~26 Vitest vs ~450 src; ficha quase sem cobertura; Cypress smoke |

### Melhorias alinhadas a este plano

1. Contrair regras de mesa no front (fases 1–2 e 5) — maior ganho de qualidade.
2. Fatiar `character-sheet` / `character-session.api.ts` quando o catálogo deixar de viver no cliente.
3. Validação runtime nos DTOs críticos após o contrato do GET mecânico estabilizar.
4. Corrigir imports `shared` → `entities` ao mexer em `catalog-filter-options` (fase 4).
5. Testes no hotspot: libs de economia + 2–3 e2e de ficha logada.

Detalhe de arquitetura: [`../ARCHITECTURE.md`](../ARCHITECTURE.md).

---

## Histórico

| Data | Estado |
|------|--------|
| 2026-08-06 | Inventário inicial + plano de fases; espera GET mecânico na API |
| 2026-08-06 | **Fases 1–2 (P0 parcial):** `GET /combat-mechanical-catalog` na API; front remove hardcode de Golpe Astuto, máscaras e Precaução |
| 2026-08-06 | **Fase 3 (P1):** abilities, ability-generation-methods (review), character-levels → PB via API |
| 2026-08-06 | **P0 fechado (fase 5):** `economyActions` + `panelActions` (C009/C010); painéis e aba Ações sem arrays locais |

## Feito nesta entrega

| Item | API | Front |
|------|-----|-------|
| Endpoint público | `GET /combat-mechanical-catalog` | `fetchCombatMechanicalCatalog` / `useCombatMechanicalCatalog` |
| Golpe Astuto | `cunningStrikeEffects` | `available-cunning-strikes.ts` filtra catálogo (sem array local) |
| Máscaras | `personaMasks` (`slug`+`name`) | `combat-bard-panel.tsx` — drift Bufão/Bobão eliminado |
| Precaução | `precautionSpells` | `fighter-subclass-actions.tsx` |
| Economia (aba Ações) | `economyActions` (C009) | `resolveClassEconomyActions(catalog, …)` |
| Painéis de classe | `panelActions` (C010) | `resolvePanelActions` + `CombatPanelActionButtons` |

## Feito — fase 3 (P1)

| Item | Antes | Depois |
|------|-------|--------|
| Labels de atributo | `ABILITY_LABELS_PT` / `ABILITY_SHORT` | `GET /abilities` → `useAbilityLabels` |
| Filtro de perícias | `ABILITY_FILTER` estático | `buildAbilityFilter(abilities)` |
| Método de geração (review) | `ABILITY_METHOD_LABEL` | `useAbilityGenerationMethods` |
| PB por nível | tabela if/else local | `GET /character-levels` → `proficiencyBonusForLevel(level, catalog)` |

