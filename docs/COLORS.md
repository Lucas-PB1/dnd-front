# Cores — tema Taverna / Masmorra

Tokens em `app/globals.css` (shadcn + Tailwind 4). **Light = Taverna** (pergaminho). **Dark = Masmorra** (classe `.dark` no `<html>`).

## Papéis semânticos

| Token         | Light            | Dark           | Uso                   |
| ------------- | ---------------- | -------------- | --------------------- |
| `background`  | Pergaminho       | Pedra escura   | Fundo da página       |
| `foreground`  | Marrom escuro    | Texto claro    | Texto principal       |
| `primary`     | Carmesim D&D     | Carmesim claro | CTAs, links, destaque |
| `secondary`   | Ouro             | Ouro/tocha     | Badges, XP, tesouro   |
| `accent`      | Roxo arcano      | Roxo brilhante | Magia, itens raros    |
| `muted`       | Bege suave       | Cinza masmorra | Fundos secundários    |
| `destructive` | Vermelho         | Vermelho       | Dano, excluir, erro   |
| `card`        | Pergaminho claro | Card pedra     | Fichas, painéis       |
| `border`      | Borda quente     | Borda sutil    | Divisórias            |

## Charts (dados na ficha)

| Token     | Significado             |
| --------- | ----------------------- |
| `chart-1` | HP / combate (carmesim) |
| `chart-2` | Ouro / recursos         |
| `chart-3` | Natureza / cura (verde) |
| `chart-4` | Magia (roxo)            |
| `chart-5` | Frio / água (azul)      |

## Uso no código

```tsx
// Tailwind — preferir tokens semânticos
<div className="bg-background text-foreground" />
<button className="bg-primary text-primary-foreground" />
<span className="text-muted-foreground" />
<div className="border-border bg-card" />
```

**Evitar:** cores hardcoded (`bg-red-500`). Ajustes só em `globals.css`.

## Modo escuro

Adicionar `className="dark"` no `<html>` ou usar o **ThemeToggle** (`next-themes`).

## Ícones

**Heroicons** (`@heroicons/react`) no app. Componentes shadcn podem usar Lucide internamente — ok manter os dois.

```tsx
import { SparklesIcon } from "@heroicons/react/24/outline";
```
