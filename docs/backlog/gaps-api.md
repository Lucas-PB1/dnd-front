# Gaps → plano

Cada linha é **um** plano. Detalhe só no arquivo do plano.

## Contrato morto

| Gap | Plano |
| --- | --- |
| ~~Doc diz que o wizard não lê métodos de atributo~~ | [01](./plans/01-doc-api-integration.md) Feito |
| ~~Front tem `minTraitTakes`; DTO Nest não~~ | [02](./plans/02-min-trait-takes.md) Feito |
| ~~`xpThreshold` no GET levels, UI não usa~~ | [03](./plans/03-xp-threshold.md) Feito |
| ~~State: wild shape + companions sem tipo~~ | [04](./plans/04-character-state-tipos.md) Feito |
| ~~Catálogo: `strikeOptions` sem tipo~~ | [05](./plans/05-strike-options-tipo.md) Feito |
| ~~PATCH state sem add/remove conditions~~ | [06](./plans/06-patch-conditions-delta.md) Feito |
| `featEffectFlags` crítico / duas mãos / versátil | [07](./plans/07-feat-effect-flags.md) |

## Rota sem cliente

| Gap | Plano |
| --- | --- |
| `GET .../druid/wild-shape/eligible` | [08](./plans/08-wild-shape-eligible-http.md) |
| `GET` + `POST dismiss` companions | [09](./plans/09-companions-http.md) |
| `POST .../vehicles/sheet-actions` | [10](./plans/10-vehicles-sheet-actions-http.md) |
| `POST .../mounts/*` | [11](./plans/11-mounts-http.md) |
| `GET /actors` | [12](./plans/12-actors-list.md) |
| `POST /actors` | [13](./plans/13-actors-create.md) |
| `DELETE /actors/:id` | [14](./plans/14-actors-delete.md) |
| `GET /actors/:id/state` | [15](./plans/15-actors-get-state.md) |
| `POST /actors/:id/rolls/attack` | [16](./plans/16-actors-roll-attack.md) |

## UI

| Gap | Plano |
| --- | --- |
| `strikeOptions` tipado mas painel não usa | [17](./plans/17-strike-options-ui.md) |
| Forma Selvagem “polish futuro” | [18](./plans/18-forma-selvagem-ui.md) |
| Tracker companions | [19](./plans/19-companheiros-ui.md) |
| Veículo sem sheet-actions na UI | [20](./plans/20-veiculos-sheet-actions-ui.md) |
| Montaria sem cliente/UI | [21](./plans/21-montarias-ui.md) |

## Compêndio (falta endpoint de lista)

| Gap | Plano |
| --- | --- |
| Import FSD nos filtros | [22](./plans/22-fsd-catalog-filters.md) |
| Escolas hardcoded | [23](./plans/23-filtros-escolas.md) |
| Categorias hardcoded | [24](./plans/24-filtros-categorias.md) |
| Pools de tools hardcoded | [25](./plans/25-pools-ferramentas.md) |

## Qualidade / SSOT / adiado

Ver [README](./README.md) planos 26–40.
