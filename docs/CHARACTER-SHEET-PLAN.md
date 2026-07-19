# Ficha de personagem — status e evolução

**Marco MVP:** concluído (jul/2026). Wizard PHB, ficha leitura/edição, mesa de jogo.

Roadmap geral do monorepo: [`dnd-api/docs/product-roadmap.md`](../../dnd-api/docs/product-roadmap.md)

**Próximo foco (catálogo → ficha):** [`dnd-api/docs/sheet-readiness-plan.md`](../../dnd-api/docs/sheet-readiness-plan.md) — salvaguardas, proficiências, traits de espécie, condições, progressão/magias, ASI no level-up.

**Princípio:** o front **coleta escolhas** e **exibe**; a API **valida e computa**. Evitar regras PHB no front.

**Exceção explícita:** métodos de geração de atributos no wizard usam enum local (`standard-array` / `roll` / `point-buy`); `GET /ability-generation-methods` existe na API mas o front não consome o catálogo.

Ver também: [ARCHITECTURE.md](./ARCHITECTURE.md) · [API-INTEGRATION.md](./API-INTEGRATION.md) · [UX-UI-PLAN.md](./UX-UI-PLAN.md)

---

## O que está pronto

| Camada     | Entregue                                                                                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Criar**  | Wizard multi-step: identidade, atributos, perícias, antecedente, talentos (origem + ASI), espécie, subclasse (skip se N/A), equipamento, magias (skip se não conjura), idiomas, revisão |
| **Ver**    | Nomes PT, perícias com bônus, traços com benefício, subclasse, features de classe, magias, equipamento, talentos com benefícios PHB, idiomas, CA derivada                               |
| **Editar** | PATCH por seção; DELETE com redirect                                                                                                                                                    |
| **Mesa**   | PV, slots, concentração (picker), condições, descanso, conjurar, inventário com picker, level-up                                                                                        |
| **Compêndio** | Hub: classes, espécies, antecedentes, perícias, talentos, subclasses, equipamento, idiomas, magias (filtros + URL sync)                                                              |

### Sprints entregues (histórico)

Fases 0–4 + Sprints 6–9: fundação, wizard, ficha leitura, edição, mesa, polish subclasse/ASI/inventário/CA, feats com opções (`characterFeats` + `instanceIndex`), skip de etapas do wizard, benefícios de traço, picker de concentração.

---

## Verificação

```bash
pnpm lint && pnpm test && pnpm build
```

### Checklist manual (implementação confirmada no código)

- [x] Criar ficha nível 1 com perícias e trait choices — wizard `step-class-skills`, `step-species-choices`
- [x] Criar ficha nível 5+ com subclasse e `subclassOptions` — `step-subclass-options`, skip quando N/A
- [x] Ficha exibe nomes PT — `useCharacterCatalogLabels`, seções em `sheet-read-sections.tsx`
- [x] PATCH de perícias persiste e invalida cache — `usePatchCharacter` + `invalidateQueries`
- [x] DELETE remove ficha e redireciona — `useDeleteCharacter` → `/characters`
- [x] Erro 401 redireciona para login com `next=` — hooks game (`use-characters`, `use-create-character`, etc.)

> Validação manual em browser ainda recomendada antes de deploy.

---

## Lacunas conhecidas (não bloqueiam MVP)

Detalhamento e fases: **[`sheet-readiness-plan.md`](../../dnd-api/docs/sheet-readiness-plan.md)**.

| Item | Estado | Notas |
|------|--------|-------|
| Salvaguardas / prof. arma-armadura | Pendente | Seed no DB; não no `ClassResponseDto` nem na ficha |
| Traços fixos de espécie na ficha | Parcial | API `/species/:slug/traits` existe; UI foca em choices |
| Level-up ASI +2/+1 guiado | Parcial | Aviso no level-up; edição via seção Atributos |
| Condições na mesa | Texto livre | `phb_condition` seedado; falta `GET /conditions` + picker |
| Cotas cantrip / prepared | Pendente | `phb_class_progression` no DB; wizard sem quota |
| Mais feats PHB com opções | API parcial | Seeds: Magic Initiate, Skilled, Fey/Shadow Touched |
| E2E browser | Pendente | Só testes unitários Vitest |
| Deploy | Pendente | Fase 6 do roadmap |

---

## Próximas melhorias (front)

| Prioridade | Melhoria |
| ---------- | -------- |
| Alta | Sheet readiness Fases 2–3 (ST/traits na ficha; picker de condições) — ver plano |
| Alta | Deploy + smoke em prod |
| Média | Cotas de magia no wizard (Fase 4 do plano) |
| Média | Fluxo ASI no level-up (Fase 5 do plano) |
| Baixa | Testes E2E dos fluxos críticos (criar → ver → editar → deletar) |

**Polish visual / UX** (home, brand, tipografia, hierarquia ficha/wizard/compêndio): ver **[UX-UI-PLAN.md](./UX-UI-PLAN.md)** — não duplicar aqui.

---

## Referências

| Assunto | Caminho |
| -------- | ------- |
| Sheet readiness | [`dnd-api/docs/sheet-readiness-plan.md`](../../dnd-api/docs/sheet-readiness-plan.md) |
| UX / UI | [UX-UI-PLAN.md](./UX-UI-PLAN.md) |
| Wizard | `src/features/create-character/` |
| Ficha | `src/features/character-sheet/` |
| Tipos | `src/entities/character/types.ts` |
| API DTO | `dnd-api/src/game/sheet/dto/character-response.dto.ts` |
| Contrato | `.cursor/skills/dnd-api-contract/references/api-endpoints.md` |
