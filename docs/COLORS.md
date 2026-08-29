# Cores — tema Grimoire / Couro

> Índice do design system: [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)

Tokens em `src/app/globals.css` (shadcn + Tailwind 4).  
**Light = Grimoire** (papel frio, tinta). **Dark = Couro** (mesa noturna; classe `.dark` no `<html>`).

Linguagem visual: grimório PHB — tipografia forte, vermelho-selo, azul-anotação. Sem ouro/carmesim/roxo do tema anterior.

## Papéis semânticos

| Token         | Light (Grimoire) | Dark (Couro)     | Uso                         |
| ------------- | ---------------- | ---------------- | --------------------------- |
| `background`  | Papel frio       | Couro escuro     | Fundo da página             |
| `foreground`  | Preto-tinta      | Marfim           | Texto principal             |
| `primary`     | Preto-tinta      | Marfim           | CTAs sólidos, tipografia    |
| `secondary`   | Vermelho-selo    | Vermelho-selo    | Carimbos, badges PHB, CTAs  |
| `accent`      | Azul-anotação    | Azul-giz         | Focus, magia, anotações     |
| `muted`       | Papel suave      | Couro médio      | Fundos secundários          |
| `destructive` | Vermelho-selo    | Vermelho         | Excluir, erro               |
| `card`        | Papel claro      | Couro elevado    | Fichas, painéis             |
| `border`      | Borda papel      | Borda sutil      | Divisórias                  |
| `ring`        | Azul-anotação    | Azul-giz         | Focus visible               |

## Charts (dados na ficha)

| Token     | Significado                    |
| --------- | ------------------------------ |
| `chart-1` | Combate / selo (vermelho)      |
| `chart-2` | Recursos (âmbar contido)       |
| `chart-3` | Natureza / cura (verde)        |
| `chart-4` | Magia / anotação (azul)        |
| `chart-5` | Frio / água (azul-acinzentado) |

## Tipografia

| Papel    | Fonte            |
| -------- | ---------------- |
| Heading  | Source Serif 4   |
| Body     | Source Sans 3    |
| Mono     | Geist Mono       |

## Uso no código

```tsx
<div className="bg-background text-foreground" />
<button className="bg-primary text-primary-foreground" />
<span className="text-secondary" /> {/* selo / carimbo */}
<span className="text-accent" /> {/* anotação / focus */}
```

**Evitar:** cores hardcoded (`bg-red-500`), purple-glow, cream+terracotta genérico. Ajustes só em `globals.css`.

## Modo escuro

Adicionar `className="dark"` no `<html>` ou usar o **ThemeToggle** (`next-themes`).

## Ícones

**Heroicons** (`@heroicons/react`) no app. Componentes shadcn podem usar Lucide internamente — ok manter os dois.
