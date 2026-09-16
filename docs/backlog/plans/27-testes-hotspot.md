# Plano 27 — Testes no hotspot da ficha

**ID:** FR-11 · **Dificuldade:** média · **Status:** Feito

## Gap

Libs de economia / painel quase sem Vitest. Cypress pouco cobre ficha logada.

## Fazer

Vitest: `class-action-economy`, `resolve-panel-actions`, `plan-economy-table-use`. 2–3 e2e: abrir ficha, aba Ações, um table-action ou rest (se o env permitir).

## Pronto quando

Hotspot tem testes; e2e documentados se precisarem de secret/env.

## Como rodar

- Vitest: `npx vitest run tests/features/character/character-sheet/lib/combat`
- E2e (Next em `:3001`, API Nest, Supabase): credenciais em `.env.local` — `CYPRESS_LOGIN_EMAIL` / `CYPRESS_LOGIN_PASSWORD` ou `NEXT_PUBLIC_DEV_LOGIN_EMAIL` / `NEXT_PUBLIC_DEV_LOGIN_PASSWORD`, mais `NEXT_PUBLIC_SUPABASE_*`. Spec: `npm run test:e2e:sheet-actions` (sobe o Next) ou `cypress run --spec cypress/e2e/character-sheet-actions.cy.ts` com o app já no ar.
