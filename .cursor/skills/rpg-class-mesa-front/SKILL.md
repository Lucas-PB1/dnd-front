---
name: rpg-class-mesa-front
description: >-
  Padrão canônico de classe jogável na mesa (front): painel de combate,
  economy Usar, table-action routing. Use when implementing or reviewing
  character combat panels, use-economy-table-action, or class sheet actions UI.
---

# Classe mesa — front

Skill irmã (API): `rpg-class-mesa-api` no repo `dnd-api`.

## Quando carregar

- Novo / ajuste de `combat/panels/<class>-panel.tsx`
- Routing de Usar / `table_action`
- Switch em `class-combat-panel.tsx`
- Alinhar ficha ao padrão mesa (gasto + nota)

## Critério (igual à API)

Mesa, não VTT. **Feito:** painel + Usar wired ao `table_action` + feedback de nota; recursos visíveis quando existirem.

## Padrão de ações

- Preferir `execute<Class>TableAction` → `POST …/<class>/table-action`.
- Aba Ações: `use-economy-table-action.ts` roteia por `economyActions[].classSlug` → `execute<Class>TableAction`.
- Protocolos no `table_action` (sem Set de slugs): `spend-resource`, `cast:…`, `arm:…`, `psi:…`.
- Fallback genérico: `spend-resource` quando a economia só gasta slug.

## Checklist “classe done” (front)

1. Painel em `…/combat/panels/<class>-panel.tsx`
2. Case em `class-combat-panel.tsx`
3. Catálogo: `useCombatMechanicalCatalog` + `resolvePanelActions`
4. `EMPTY_PANEL_ACTIONS` estável (não `?? []` em deps de `useMemo`)
5. Branch `classSlug` no router de economy (não lista paralela de slugs)
6. Feedback (`TableActionFeedback` / nota da mutation)
7. API alinhada — skill `rpg-class-mesa-api`

## References

| Situação | Arquivo |
|----------|---------|
| Quatro exemplares + paths | [`references/exemplares.md`](references/exemplares.md) |

## Anti-padrões

- `?? []` para `panelActions` (deps instáveis)
- Template string `convert-slot-${number}-…` sem literais tipados
- Botão de painel que não chama o mesmo slug do `table-action`
- Assumir endpoints dedicados por poder (use `table-action`)
- Sets hardcoded de slugs de economy no front (SSOT = catálogo + `classSlug`)
