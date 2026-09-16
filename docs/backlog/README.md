# Backlog — dnd-front

Um **plano = um gap**. Não agrupar. Pegue o menor número ainda aberto.

Revisão: **2026-09-16**. Mesa A–P na API está fechada; aqui é consumo/UI.

| Arquivo | Papel |
| --- | --- |
| [items.md](./items.md) | ID → plano |
| [gaps-api.md](./gaps-api.md) | Índice dos gaps (aponta para o plano) |
| [plans/](./plans/) | Planos **01 → 40**, um gap cada, fácil → difícil |
| [../plans/frontend-hardcode-ssot.md](../plans/frontend-hardcode-ssot.md) | Histórico SSOT P0/P1 |

Blocked não vira Ready só espelhando TS. Adiado só com pedido explícito.

---

## Fila (fácil → difícil)

### Contrato morto (a API já manda)

| # | Status | Plano |
| --- | --- | --- |
| [01](./plans/01-doc-api-integration.md) | Feito | Corrigir `API-INTEGRATION.md` |
| [02](./plans/02-min-trait-takes.md) | Feito | Alinhar `minTraitTakes` |
| [03](./plans/03-xp-threshold.md) | Feito | `xpThreshold` na ficha ou fora do tipo |
| [04](./plans/04-character-state-tipos.md) | Feito | Tipar wild shape + companions no state |
| [05](./plans/05-strike-options-tipo.md) | Feito | Tipar `strikeOptions` |
| [06](./plans/06-patch-conditions-delta.md) | Feito | PATCH `addConditions` / `removeConditions` |
| [07](./plans/07-feat-effect-flags.md) | Feito | Ligar flags de feat mortos na UI |

### Cliente HTTP (rota existe, fetch não)

| # | Status | Plano |
| --- | --- | --- |
| [08](./plans/08-wild-shape-eligible-http.md) | Feito | `GET .../wild-shape/eligible` |
| [09](./plans/09-companions-http.md) | Feito | `GET` + `POST dismiss` companions |
| [10](./plans/10-vehicles-sheet-actions-http.md) | Feito | `POST .../vehicles/sheet-actions` |
| [11](./plans/11-mounts-http.md) | Feito | `POST .../mounts/*` |
| [12](./plans/12-actors-list.md) | Ready | `GET /actors` |
| [13](./plans/13-actors-create.md) | Ready | `POST /actors` |
| [14](./plans/14-actors-delete.md) | Ready | `DELETE /actors/:id` |
| [15](./plans/15-actors-get-state.md) | Ready | `GET /actors/:id/state` |
| [16](./plans/16-actors-roll-attack.md) | Ready | `POST /actors/:id/rolls/attack` |

### UI sobre contrato

| # | Status | Plano |
| --- | --- | --- |
| [17](./plans/17-strike-options-ui.md) | Ready | Usar `strikeOptions` no painel |
| [18](./plans/18-forma-selvagem-ui.md) | Ready | Seletor Forma Selvagem |
| [19](./plans/19-companheiros-ui.md) | Ready | Tracker de companheiros na ficha |
| [20](./plans/20-veiculos-sheet-actions-ui.md) | Ready | Leme / carga / tripulação |
| [21](./plans/21-montarias-ui.md) | Ready | Montaria: board + sheet-actions |

### Compêndio / wizard

| # | Status | Plano |
| --- | --- | --- |
| [22](./plans/22-fsd-catalog-filters.md) | Ready | FSD em `catalog-filter-options` |
| [23](./plans/23-filtros-escolas.md) | Blocked | Escolas de magia via API |
| [24](./plans/24-filtros-categorias.md) | Blocked | Categorias feat/arma/armadura/item |
| [25](./plans/25-pools-ferramentas.md) | Blocked | Pools instrumento/jogo/artesão |

### Qualidade

| # | Status | Plano |
| --- | --- | --- |
| [26](./plans/26-zod-dtos.md) | Ready | Zod nos DTOs críticos |
| [27](./plans/27-testes-hotspot.md) | Ready | Vitest economia + e2e ficha |
| [28](./plans/28-fatiar-character-sheet.md) | Ready | Remodelar slice da ficha |

### SSOT regras (level-up já usa preview)

| # | Status | Plano |
| --- | --- | --- |
| [29](./plans/29-point-buy-ssot.md) | Blocked | Point-buy / standard array |
| [30](./plans/30-asi-wizard.md) | Blocked | ASI no create wizard |
| [31](./plans/31-expertise-create.md) | Blocked | Expertise no create + Jack of All Trades |
| [32](./plans/32-subclass-unlock-create.md) | Blocked | Unlock de subclasse no create |
| [33](./plans/33-max-attuned.md) | Blocked | Limite de sintonias |

### Adiado (pedido explícito)

| # | Status | Plano |
| --- | --- | --- |
| [34](./plans/34-paladino-cobertura-lembrete.md) | Adiado | Lembrete Destruição Protetora |
| [35](./plans/35-misseis-modal-boost.md) | Adiado | Modal Escudo/Giga no cast |
| [36](./plans/36-gh-cap1-tracos.md) | Adiado | GH Cap. 1 sub-escolhas |
| [37](./plans/37-pistoleiro-polish.md) | Adiado | Pistoleiro polish |
| [38](./plans/38-dawn-vs-descanso.md) | Adiado | Evento dawn ≠ DL |
| [39](./plans/39-companheiro-primal.md) | Adiado | Companheiro Primal |
| [40](./plans/40-combate-real.md) | Adiado | Combate real |
