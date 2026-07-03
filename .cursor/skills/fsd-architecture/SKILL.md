---
name: fsd-architecture
description: Feature-Sliced Design for dnd-front. Use when creating features, widgets, entities, or deciding where code belongs.
disable-model-invocation: true
---

# Feature-Sliced Design — dnd-front

## Camadas

| Camada   | Pasta       | Exemplo                                     |
| -------- | ----------- | ------------------------------------------- |
| App      | `app/`      | `app/classes/page.tsx`                      |
| Widgets  | `widgets/`  | `widgets/app-header/`                       |
| Features | `features/` | `auth`, `class-catalog`, `create-character` |
| Entities | `entities/` | `class/`, `character/`, `species/`          |
| Shared   | `shared/`   | `ui/`, `api/`, `lib/`                       |

## Segmentos

```text
features/foo/
├── ui/
├── api/
├── model/
└── index.ts
```

## Imports

Só para baixo: `features` → `entities` → `shared`

## Exemplos no repo

| Feature          | entities             | features                                  |
| ---------------- | -------------------- | ----------------------------------------- |
| Catálogo classes | `entities/class`     | `features/class-catalog`                  |
| Auth             | —                    | `features/auth`                           |
| Fichas           | `entities/character` | `features/characters`, `create-character` |
| Status API       | —                    | `widgets/system-status`                   |

Detalhes: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
