---
name: testing-vitest
description: Vitest unit tests for dnd-front FSD layers.
disable-model-invocation: true
---

# Vitest

## Layout

```text
tests/
└── shared/api/health/   # schemas e utilitários compartilhados
```

## O que testar

- `entities/` — tipos e helpers puros (quando existirem)
- `features/*/model/` — schemas Zod, transformações de formulário
- `shared/` — utils, serializers, validação de API

Rodar: `pnpm test:run`

Config: `vitest.config.ts`
