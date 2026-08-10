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

Mesa, não VTT. **Feito:** painel + Usar wired ao `table_action` + feedback de nota.

**Controle de recurso (Economia de Ação):**

- `resource_slug` + pool no estado → sempre mostrar − / `remaining/max` / + (não depende de `table_action`)
- `table_action` → botão Usar
- Não usar `CombatResourceSummary` no topo do painel para pools que a Economia já controla

Detalhe: skill API `references/economia-painel.md` § Controle de recursos.

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
6. Economia: ± visível para linhas com `resourceSlug` (`plan-economy-table-use` + `beyond-actions-tab`)
7. Feedback (`TableActionFeedback` / nota da mutation)
8. API alinhada — skill `rpg-class-mesa-api`

## References

| Situação | Arquivo |
|----------|---------|
| Classes concluídas + paths | [`references/exemplares.md`](references/exemplares.md) |

## Anti-padrões

- `?? []` para `panelActions` (deps instáveis)
- Template string `convert-slot-${number}-…` sem literais tipados
- Botão de painel que não chama o mesmo slug do `table-action`
- Assumir endpoints dedicados por poder (use `table-action`)
- Sets hardcoded de slugs de economy **ou de subclass** no front (SSOT = catálogo + `classSlug` / `subclassSlug` vindos da API)
- **Hardcode de feature de classe no front** (`classSlug === "paladin" && level >= 6`, Aura, Indomável, etc.) — números/flags vêm da API; o front só exibe
- Espelhar no front listas de manobras/opções que já existem em `GET /combat-mechanical-catalog` ou endpoints de personagem
- `CombatResourceSummary` no Ferramentas espelhando pools que a Economia já controla
- Esconder −/`remaining/max`/+ na Economia quando falta `tableAction` (contador segue o `resourceSlug`)
