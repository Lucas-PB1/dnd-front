# E2e da ficha

## Manter

| Pasta | Papel |
| --- | --- |
| `classes/<classe>.cy.ts` | Ficha nv. 1 por classe |
| `progression/level-up.cy.ts` | UI 1→2 (Guerreiro) |
| `progression/subclass.cy.ts` | Unlock de subclasse nv. 3 (uma trilha) |
| `progression/feat.cy.ts` | Talento nos ASI do Guerreiro (4 e 6) |
| `login.cy.ts` / `smoke.cy.ts` / `campaigns.cy.ts` | Auth, rotas públicas, mesa |

Talento geral: 4, 8, 12, 16, 19. Extra: Guerreiro 6 e 14, Ladino 10. O spec cobre 4 e o extra 6; o resto é o mesmo painel.

## Rodar

```bash
npm run test:e2e:sheet:guerreiro
npm run test:e2e:sheet:level-up
npm run test:e2e:sheet:subclass
npm run test:e2e:sheet:feat
npm run test:e2e:sheet:classes
```
