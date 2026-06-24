---
name: dnd-infra
description: Project infrastructure for dnd — src layout, pnpm scripts, Husky, lint-staged, docs, config files. Use when organizing folders, CI hooks, tooling, or repo conventions.
disable-model-invocation: true
---

# Infraestrutura do repositório

## Layout

| Pasta             | Conteúdo                                      |
| ----------------- | --------------------------------------------- |
| `src/`            | Todo código da aplicação                      |
| `cypress/`        | E2E                                           |
| `docs/`           | STACK-OPTIONS, ARCHITECTURE, SUPABASE, COLORS |
| `public/`         | Assets estáticos                              |
| `.cursor/skills/` | Skills do agente                              |
| `.cursor/rules/`  | Rules do agente                               |

## Scripts (pnpm)

| Comando                   | Uso                  |
| ------------------------- | -------------------- |
| `dev` / `build` / `start` | Next.js              |
| `lint` / `lint:fix`       | ESLint               |
| `format` / `format:check` | Prettier             |
| `test` / `test:run`       | Vitest               |
| `test:e2e`                | Cypress + dev server |

## Qualidade

- Pre-commit: Husky → `lint-staged` (ESLint fix + Prettier)
- Alias TS: `@/*` → `src/*`

## Configs na raiz

`package.json` · `tsconfig.json` · `eslint.config.mjs` · `prettier.config.mjs` · `vitest.config.ts` · `cypress.config.ts` · `components.json`

Não mover `app/` para fora de `src/` — Next espera `src/app/`.
