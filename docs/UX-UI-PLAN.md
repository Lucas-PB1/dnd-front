# UX / UI — plano geral (dnd-front)

Documento de referência visual e de experiência do produto.  
Complementa [COLORS.md](./COLORS.md) (tokens) e [ARCHITECTURE.md](./ARCHITECTURE.md) (FSD).  
Não substitui [CHARACTER-SHEET-PLAN.md](./CHARACTER-SHEET-PLAN.md) (fluxo de ficha / regras via API) nem o [product-roadmap](../../dnd-api/docs/product-roadmap.md) (features de produto).

**Princípio de produto:** o front **coleta escolhas** e **exibe**; a API **valida e computa**. Zero regras PHB hardcoded no UI.

---

## 1. Objetivo e escopo

| Inclui                                                                            | Não inclui                                    |
| --------------------------------------------------------------------------------- | --------------------------------------------- |
| Branding, tipografia, layout, hierarquia, microcopy, motion, empty states, mobile | Troca de Auth/banco (Neon, Clerk, etc.)       |
| Polish das telas já existentes                                                    | Novas regras D&D no front                     |
| Critérios de aceite por fase de UX                                                | Redesign que ignore o tema Taverna / Masmorra |

**Tema:** Light = **Taverna** (pergaminho), Dark = **Masmorra** (pedra). Tokens em [`src/app/globals.css`](../src/app/globals.css) — ver [COLORS.md](./COLORS.md).

**Stack visual:** Next.js 16 · shadcn / Base UI · Tailwind 4 · Heroicons · `next-themes`.

**Nome de produto (provisório):** **Taverna** — usar na UI no lugar de `dnd-front` até decisão final de marca. Evitar expor nomes de repo (`dnd-front`, `dnd-api`) como brand.

---

## 2. Diagnóstico atual

| Área       | Hoje                                                                                                      | Dor                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Home       | [`src/app/page.tsx`](../src/app/page.tsx) — “Campanhas & fichas” + status de health                       | Parece bootstrap/dev, não produto                         |
| Header     | [`app-header.tsx`](../src/widgets/app-header/ui/app-header.tsx) — brand `dnd-front`                       | Branding fraco; sem nav Compêndio / Fichas                |
| Tipografia | Geist / Geist Mono em [`layout.tsx`](../src/app/layout.tsx)                                               | Default genérico; falta display expressivo                |
| Compêndio  | Hub + grids/cards (`compendium-hub`, `*-catalog`)                                                         | Funcional; visual homogêneo e pouco hierárquico           |
| Wizard     | [`create-character-wizard.tsx`](../src/features/create-character/ui/create-character-wizard.tsx)          | Fluxo longo; progresso/skip/revisão podem ser mais claros |
| Ficha      | [`character-sheet-view.tsx`](../src/features/character-sheet/ui/character-sheet-view.tsx) + layout widget | Densidade alta; leitura vs mesa pouco separados           |
| Auth       | login/signup + `auth-page-shell`                                                                          | Funcional; alinhar tipografia/atmosfera ao tema           |
| Status     | `HealthStatus` / `DndApiStatus` no meio da home                                                           | Ruído de produto; útil só em dev ou footer                |

---

## 3. Princípios de design

1. **Uma composição por viewport** — a home não é dashboard; hero com um job claro.
2. **Brand hero-level** — nome do produto (Taverna) deve sobreviver ao teste “sem nav, ainda é o mesmo app?”.
3. **Tipografia expressiva** — display para títulos/brand; body legível; evitar só stack system/Geist.
4. **Atmosfera** — gradientes/textura sutis com tokens Taverna/Masmorra; fundo flat único não basta.
5. **Cards só com interação** — listagens clicáveis, pickers, seções expansíveis; não cardificar texto estático.
6. **Uma job por seção** — um headline + uma frase de apoio; evitar painéis concorrentes.
7. **Motion intencional** — pelo menos 2–3: toggle de tema, transição de passo do wizard, expand/collapse na ficha.
8. **Tokens semânticos** — `primary` (carmesim), `secondary` (ouro), `accent` (arcano). Sem `bg-red-500` hardcoded.
9. **Ícones** — preferir Heroicons no app; Lucide ok dentro de shadcn.
10. **PT-BR** — microcopy consistente; nomes de catálogo vêm da API.

### Anti-padrões (evitar)

- Layout “dashboard” na primeira dobra da home
- Stats/health/status no hero
- Overlay de badges flutuantes sobre mídia
- Purple-on-white / glow / pills genéricos de AI
- Quebrar o tema Taverna/Masmorra com paleta paralela

---

## 4. Inventário de superfícies

| Rota                                   | Arquivo principal                                          | Prioridade UX                            |
| -------------------------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| `/`                                    | `src/app/page.tsx`                                         | Alta (Fase 1)                            |
| Header (global)                        | `src/widgets/app-header/ui/app-header.tsx`                 | Alta (Fase 1–2)                          |
| Theme toggle                           | `src/widgets/app-header/ui/theme-toggle.tsx`               | Média (motion)                           |
| `/login`, `/signup`                    | `features/auth/ui/*`                                       | Média (Fase 2)                           |
| `/characters`                          | `features/characters/ui/characters-list.tsx`               | Alta (Fase 2)                            |
| `/characters/new`                      | `features/create-character/ui/create-character-wizard.tsx` | Alta (Fase 4)                            |
| `/characters/[id]`                     | `features/character-sheet/` + layout widget                | Alta (Fase 5)                            |
| `/compendium`                          | `widgets/compendium-hub/`                                  | Média (Fase 3)                           |
| `/classes`, `/classes/[slug]`          | `features/class-catalog/`                                  | Média (Fase 3)                           |
| `/species`, `/species/[slug]`          | `features/species-catalog/`                                | Média (Fase 3)                           |
| `/backgrounds`, `/backgrounds/[slug]`  | `features/background-catalog/`                             | Média (Fase 3)                           |
| `/spells`, `/spells/[slug]`            | `features/spell-catalog/`                                  | Média (Fase 3)                           |
| Feats / skills / equipamento (páginas) | — (lacuna)                                                 | Ver roadmap produto; UX quando existirem |

---

## 5. Backlog por fases

Ordem de implementação. Features de regra (ASI, picker de condições) ficam no [CHARACTER-SHEET-PLAN](./CHARACTER-SHEET-PLAN.md) / [product-roadmap](../../dnd-api/docs/product-roadmap.md); aqui só o lado visual/UX.

### Fase 1 — Fundação visual

- [x] Tipografia display (ex.: serif/display via `next/font`) + body; wire em `layout.tsx` / CSS vars (`--font-heading`)
- [x] Brand **Taverna** no header (não `dnd-front`)
- [x] Home: uma composição — brand, 1 headline, 1 frase, CTAs (Compêndio / Minhas fichas / Criar ficha)
- [x] Remover health/API status do hero; opcional: footer discreto ou só em `NODE_ENV=development`
- [x] Metadata (`title` / `description`) com nome de produto

### Fase 2 — Navegação e estados vazios

- [x] Links Compêndio / Fichas no header (desktop + menu mobile simples)
- [x] Empty state em `/characters` (CTA criar ficha)
- [x] Auth shells alinhados ao tema e tipografia
- [x] Breakpoints: header e CTAs usáveis em viewport estreita

### Fase 3 — Compêndio

- [x] Hub com hierarquia tipográfica clara (não só grid de outline buttons)
- [x] Listagens: título + filtro/busca consistente entre catálogos
- [x] Páginas de detalhe: mesmo padrão de layout (título, meta, seções)
- [ ] Quando existirem rotas feats/skills/equip: mesmo padrão visual

### Fase 4 — Wizard de criação

- [x] Indicador de passos mais legível (etapa atual, restantes, skips)
- [x] Feedback visual em skip (subclasse / magias N/A)
- [x] Tela de revisão: resumo escaneável antes do submit
- [x] Erros de validação próximos ao campo/seção (já via API — polish de apresentação)

### Fase 5 — Ficha (leitura vs mesa)

- [x] Hierarquia clara: bloco identidade → combate/atributos → seções PHB → mesa
- [x] Separar visualmente **leitura/edição** de **mesa** (PV, slots, descanso)
- [x] Densidade: menos “parede de cards”; seções colapsáveis com motion leve
- [ ] Alinhar polish visual ao picker de condições / ASI quando forem implementados (roadmap funcional)

### Fase 6 — Polish final

- [ ] Motion nos 2–3 pontos definidos (tema, wizard, ficha)
- [ ] Microcopy PT revisada (botões, empty states, erros)
- [ ] Contraste e foco teclado nos CTAs principais
- [ ] Smoke visual light + dark nas rotas críticas

---

## 6. Critérios de aceite (por fase)

### Fase 1

- [x] Brand na UI ≠ `dnd-front`
- [x] Home: sem status de health no primeiro viewport
- [x] Home: brand + headline + frase + grupo de CTAs (sem stats/dashboard)
- [x] Display font distinta do body

### Fase 2

- [x] Header leva a Compêndio e Fichas sem passar só pela home
- [x] Lista vazia de fichas explica o próximo passo
- [x] Layout usável ~375px de largura no header e home

### Fase 3

- [x] Hub e detalhe de catálogo compartilham padrão tipográfico
- [x] Cards de listagem são clicáveis e não decorativos

### Fase 4

- [x] Usuário sabe em qual passo está e quantos faltam
- [x] Skips não parecem “bug” (rótulo/estado explícito)

### Fase 5

- [x] Em 5s dá para achar PV / atributos / magias na ficha
- [x] Mesa não compete visualmente com seções de leitura no mesmo peso

### Fase 6

- [ ] Tema light/dark sem regressão óbvia de contraste
- [ ] Pelo menos 2 motions perceptíveis e úteis (não decoração aleatória)

---

## 7. Arquivos-chave

| Assunto               | Caminho                                                   |
| --------------------- | --------------------------------------------------------- |
| Tokens / tema         | `src/app/globals.css`                                     |
| Fontes                | `src/app/layout.tsx`                                      |
| Home                  | `src/app/page.tsx`                                        |
| Header                | `src/widgets/app-header/`                                 |
| Compêndio hub         | `src/widgets/compendium-hub/`                             |
| Catalog shell / busca | `src/widgets/catalog-shell/`, `src/shared/ui/catalog-*`   |
| Largura de conteúdo   | `src/shared/ui/page-main.tsx` (`max-w-6xl` / `max-w-7xl`) |
| Wizard                | `src/features/create-character/`                          |
| Ficha                 | `src/features/character-sheet/`                           |
| Layout ficha          | `src/widgets/character-sheet-layout/`                     |
| Cores (doc)           | [COLORS.md](./COLORS.md)                                  |

---

## 8. Relação com outros docs

| Doc                                                              | Papel                          |
| ---------------------------------------------------------------- | ------------------------------ |
| Este arquivo                                                     | UX/UI visual e experiência     |
| [COLORS.md](./COLORS.md)                                         | Tokens e papéis de cor         |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                             | Camadas FSD e imports          |
| [CHARACTER-SHEET-PLAN.md](./CHARACTER-SHEET-PLAN.md)             | Wizard/ficha/mesa — funcional  |
| [dnd-api product-roadmap](../../dnd-api/docs/product-roadmap.md) | Prioridade de produto / deploy |

Ao implementar uma fase deste plano, atualizar checklists acima e, se afetar ficha/mesa, uma linha no CHARACTER-SHEET-PLAN.
