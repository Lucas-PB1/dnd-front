---
name: testing-cypress
description: Cypress E2E tests for dnd. Use when writing cypress/e2e specs or configuring end-to-end flows with start-server-and-test.
disable-model-invocation: true
---

# Cypress — E2E

## Comando

`pnpm test:e2e` — sobe dev server + roda Cypress (`start-server-and-test`)

## Specs

`cypress/e2e/*.cy.ts` — ex.: `smoke.cy.ts`

## Escopo

- Fluxos de usuário completos
- Smoke da home, navegação, tema
- Não substituir testes unitários de regra de negócio

## Config

`cypress.config.ts` na raiz

## Dados

Preferir API mockada ou seed de teste — evitar depender de Supabase prod.
