# Feature-Sliced Design — dnd-front

Código em **`src/`**. Repo irmão da API: **`dnd-api`** (NestJS).

## Camadas FSD

```text
src/
├── app/                    # Next.js — rotas finas, providers globais
├── widgets/                # blocos compostos (header, system-status)
├── features/               # ações do usuário (auth, *-catalog, characters, …)
├── entities/               # modelos de negócio (class, character, subclass, …)
├── shared/                 # ui, api, lib, config
│   ├── ui/                 # shadcn / Base UI
│   ├── api/
│   │   ├── dnd-api/        # catalogFetch, gameFetch
│   │   ├── supabase/       # browser/server clients
│   │   └── health/         # check local /api/health
│   └── lib/
└── proxy.ts                # sessão Supabase + rotas protegidas
```

## Regra de imports

| Camada     | Pode importar                       |
| ---------- | ----------------------------------- |
| `app`      | widgets, features, entities, shared |
| `widgets`  | features, entities, shared          |
| `features` | entities, shared                    |
| `entities` | shared                              |
| `shared`   | apenas pacotes npm                  |

**Proibido:** importar de camada superior.

## Divisão front / API / Supabase

| Assunto        | Front                                                      | API / Supabase              |
| -------------- | ---------------------------------------------------------- | --------------------------- |
| Login, sessão  | `features/auth`                                            | API valida JWT              |
| Catálogo PHB   | `features/*-catalog`                                       | `GET /classes`, …           |
| Listar fichas  | `features/characters`                                      | `GET /characters`           |
| Detalhe / mesa | `features/character-sheet`                                 | `GET/PATCH` + session etc.  |
| Criar ficha    | `features/create-character`                                | `POST /characters`          |
| Regras D&D     | **não** (exceto enums UI explícitos, ex. métodos atributo) | dnd-api                     |

## Nova feature

1. `entities/<nome>/` — tipos
2. `features/<nome>/` — api, model, ui
3. `widgets/` — composição (opcional)
4. `app/<rota>/page.tsx` — fino

## Slice grande (evitar poluir)

FSD não usa pastas tech (`hooks/`, `components/`). Quando um slice cresce:

1. **Subpastas por domínio dentro do segment** (preferido aqui) — ex. `ui/steps/spells/`, `lib/equipment/`, `ui/level-up/`
2. **Slice group** — pasta só de organização, sem public API própria: `features/catalog/class-catalog/`
3. **Novo slice** — só se for ação/domínio independente (ex. extrair inventário da ficha)

Exemplos atuais:

```text
features/create-character/
  ui/wizard/          # shell do wizard
  ui/steps/<step>/    # um domínio por etapa
  lib/<domínio>/      # hooks/helpers alinhados ao domínio

features/character-sheet/
  ui/sheet/ | edit/ | level-up/ | sections/ | beyond/

features/feat-catalog/
  ui/catalog/ | options/
```

## Stack

Next.js 16 · React 19 · TanStack Query · Supabase SSR · shadcn · Tailwind 4 · Zod · RHF · **dnd-api** Nest

Ver: [STACK-OPTIONS.md](./STACK-OPTIONS.md) · [API-INTEGRATION.md](./API-INTEGRATION.md) · [CHARACTER-SHEET-PLAN.md](./CHARACTER-SHEET-PLAN.md) · [UX-UI-PLAN.md](./UX-UI-PLAN.md) · [COLORS.md](./COLORS.md) · [SUPABASE.md](./SUPABASE.md)
