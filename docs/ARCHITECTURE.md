# Feature-Sliced Design — dnd-front

Código em **`src/`**. Repo irmão da API: **dnd-api** (NestJS).

## Camadas FSD

```text
src/
├── app/                    # Next.js — rotas finas, providers globais
├── widgets/                # blocos compostos (header, system-status)
├── features/               # ações do usuário (grupos + slices)
├── entities/               # modelos de negócio (class, character, subclass, …)
├── shared/                 # api, lib, config, design system
│   ├── design-system/      # tokens, primitives, patterns, brand, layout
│   ├── ui/                 # reexports → design-system (compat shadcn)
│   ├── api/
│   │   ├── dnd-api/        # catalogFetch, gameFetch
│   │   ├── supabase/       # browser/server clients
│   │   └── health/         # check local /api/health
│   └── lib/
└── proxy.ts                # sessão Supabase + rotas protegidas
```

## Features (slice groups)

Pastas de grupo **não** têm public API própria — só organizam slices.
Quando uma pasta precisa de barrel público, use **`index.ts`** (sem aggregators nomeados tipo `sheet-read-sections.tsx`).

```text
features/
├── auth/                          # slice (login/sessão)
├── catalog/                       # grupo — catálogo PHB
│   ├── background-catalog/
│   ├── class-catalog/
│   ├── equipment-catalog/
│   ├── feat-catalog/
│   ├── fighting-style-catalog/
│   ├── item-catalog/
│   ├── language-catalog/
│   ├── reference-catalog/
│   ├── skill-catalog/
│   ├── species-catalog/
│   ├── spell-catalog/
│   └── subclass-catalog/
├── character/                     # grupo — fichas
│   ├── characters/                # listar
│   ├── create-character/          # wizard
│   └── character-sheet/           # detalhe / mesa
└── campaign/                      # grupo — mesas
    └── campaigns/                 # home, detalhe, encontro
        ui/home | detail | encounter
```

## Regra de imports

| Camada     | Pode importar                       |
| ---------- | ----------------------------------- |
| `app`      | widgets, features, entities, shared |
| `widgets`  | features, entities, shared          |
| `features` | entities, shared                    |
| `entities` | shared                              |
| `shared`   | apenas pacotes npm                  |

**Proibido:** importar de camada superior. Grupo não é slice — importe o slice (`@/features/catalog/class-catalog/...`), não o grupo.

## Divisão front / API / Supabase

| Assunto        | Front                                 | API / Supabase             |
| -------------- | ------------------------------------- | -------------------------- |
| Login, sessão  | `features/auth`                       | API valida JWT             |
| Catálogo PHB   | `features/catalog/*-catalog`          | `GET /classes`, …          |
| Listar fichas  | `features/character/characters`       | `GET /characters`          |
| Detalhe / mesa | `features/character/character-sheet`  | `GET/PATCH` + session etc. |
| Criar ficha    | `features/character/create-character` | `POST /characters`         |
| Campanhas      | `features/campaign/campaigns`         | campanhas / encontros      |
| Regras D&D     | **não** (exceto enums UI explícitos)  | dnd-api                    |

## Nova feature

1. `entities/<nome>/` — tipos
2. `features/<grupo>/<slice>/` — api, model, ui (ou `features/<slice>/` se standalone)
3. `widgets/` — composição (opcional)
4. `app/<rota>/page.tsx` — fino

## Slice grande (evitar poluir)

FSD não usa pastas tech (`hooks/`, `components/`). Quando um slice cresce:

1. **Subpastas por domínio dentro do segment** — ex. `ui/steps/spells/`, `lib/equipment/`
2. **Slice group** — pasta só de organização: `features/catalog/class-catalog/`
3. **Novo slice** — só se for ação/domínio independente

Exemplos:

```text
features/character/create-character/
  ui/wizard/ · ui/steps/<step>/ · lib/<domínio>/

features/character/character-sheet/
  ui/sheet/ | edit/ | level-up/ | sections/ | beyond/{layout,combat,inventory,spells}/

features/catalog/feat-catalog/
  ui/catalog/ | options/

features/campaign/campaigns/
  ui/home/ | detail/ | encounter/
```

## Stack

Next.js 16 · React 19 · TanStack Query · Supabase SSR · shadcn · Tailwind 4 · Zod · RHF · **dnd-api** Nest

Ver: [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) · [API-INTEGRATION.md](./API-INTEGRATION.md) · [COLORS.md](./COLORS.md) · [SUPABASE.md](./SUPABASE.md)
