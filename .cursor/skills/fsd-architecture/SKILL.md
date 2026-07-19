---
name: fsd-architecture
description: Feature-Sliced Design for dnd-front. Use when creating features, widgets, entities, or deciding where code belongs.
disable-model-invocation: true
---

# Feature-Sliced Design — dnd-front

## Camadas

| Camada   | Pasta       | Exemplo                                              |
| -------- | ----------- | ---------------------------------------------------- |
| App      | `app/`      | `app/classes/page.tsx`, `app/characters/[id]/page.tsx` |
| Widgets  | `widgets/`  | `widgets/app-header/`                                |
| Features | `features/` | `auth`, `*-catalog`, `character-sheet`, `create-character` |
| Entities | `entities/` | `class/`, `character/`, `subclass/`, `weapon/`       |
| Shared   | `shared/`   | `ui/`, `api/`, `lib/`                                |

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

| Domínio          | entities                         | features                                      |
| ---------------- | -------------------------------- | --------------------------------------------- |
| Catálogo classes | `entities/class`                 | `features/class-catalog`                      |
| Subclasses       | `entities/subclass` (tipos canônicos; `class` reexporta) | `features/subclass-catalog` + mechanics via `class-catalog` (`useSubclassMechanics`) |
| Armas / gear     | `entities/weapon`, `entities/item` | `features/equipment-catalog`                |
| Auth             | —                                | `features/auth`                               |
| Listar fichas    | `entities/character`             | `features/characters`                         |
| Detalhe / mesa   | `entities/character`             | `features/character-sheet` (`CharacterSheetView`) |
| Criar ficha      | `entities/character`             | `features/create-character`                   |
| Status API       | —                                | `widgets/system-status`                       |

Detalhes: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
