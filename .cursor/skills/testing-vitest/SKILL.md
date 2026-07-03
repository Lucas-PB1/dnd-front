---
name: testing-vitest
description: Vitest unit tests for dnd-front FSD layers.
disable-model-invocation: true
---

# Vitest

## Layout

```text
tests/
├── entities/character-sheet/   # regras puras, dados
├── features/character-sheet/model/
└── shared/api/health/
```

## O que testar

- `entities/` — lógica pura, parsers, regras D&D locais
- `features/*/model/` — schemas, merge, sync
- `shared/` — utils, serializers

Rodar: `pnpm test:run`

Config: `vitest.config.ts`
