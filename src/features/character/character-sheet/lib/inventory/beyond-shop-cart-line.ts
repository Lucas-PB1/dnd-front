import type { InventoryItem } from "@/entities/character/session-types";
import type { ItemSummary } from "@/entities/item/types";
import { resolveCoverageShopCostText } from "@/features/character/character-sheet/lib/inventory/coverage-tier-cost";

export type BeyondShopCartLine = {
  item: ItemSummary;
  quantity: number;
  attachToBaseSlug?: string;
  attachCoverageSlug?: string;
  attachCoverageBonus?: 1 | 2 | 3;
  /** Cobertura comprada junto com item (modo bundle). */
  coverageItem?: ItemSummary;
};

function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^[^.!?]+[.!?]?/);
  return (match?.[0] ?? trimmed.slice(0, 140)).trim();
}

function shortenCoverageName(coverageName: string, baseName: string): string {
  const normalizedBase = baseName.trim().toLowerCase();
  const normalizedCoverage = coverageName.trim();
  if (normalizedCoverage.toLowerCase().startsWith(normalizedBase)) {
    const trimmed = normalizedCoverage
      .slice(baseName.length)
      .replace(/^[\s,]+/, "")
      .trim();
    if (trimmed) return trimmed;
  }
  return normalizedCoverage;
}

/** Rótulo legível para coberturas +1/+2/+3 e nomes genéricos do catálogo. */
export function formatShopBundleLabel(
  base: ItemSummary,
  coverage: ItemSummary,
  bonus?: 1 | 2 | 3,
): string {
  if (bonus) {
    return `${base.name} +${bonus}`;
  }
  return `${base.name} com ${shortenCoverageName(coverage.name, base.name)}`;
}

export function formatShopAttachLabel(
  coverage: ItemSummary,
  baseSlug: string,
  inventoryItems: InventoryItem[],
  bonus?: 1 | 2 | 3,
): string {
  const host = inventoryItems.find((row) => row.itemSlug === baseSlug);
  const hostName = host?.itemName ?? baseSlug;
  if (bonus) {
    return `${hostName} +${bonus}`;
  }
  return `${shortenCoverageName(coverage.name, hostName)} em ${hostName}`;
}

export function formatShopBundlePreview(
  base: ItemSummary,
  coverage: ItemSummary,
  bonus?: 1 | 2 | 3,
): string {
  const effect = coverage.description?.trim();
  const tier = bonus ? `+${bonus}` : null;
  if (effect) {
    return tier
      ? `Peça mundana (${base.name}) · ${tier} · ${firstSentence(effect)}`
      : `Peça mundana (${base.name}) · ${firstSentence(effect)}`;
  }
  if (tier) {
    return `Peça mundana (${base.name}) com bônus ${tier}.`;
  }
  return `Peça mundana com cobertura ${shortenCoverageName(coverage.name, base.name)}.`;
}

export function formatShopAttachPreview(
  coverage: ItemSummary,
  bonus?: 1 | 2 | 3,
): string | null {
  const effect = coverage.description?.trim();
  if (!effect) return bonus ? `Aplicar bônus +${bonus}.` : null;
  return bonus ? `+${bonus} · ${firstSentence(effect)}` : firstSentence(effect);
}

function formatBundleUnitCost(line: BeyondShopCartLine): string | null {
  const parts: string[] = [];
  if (line.item.costText) parts.push(line.item.costText);
  if (line.coverageItem) {
    const coverageCost = resolveCoverageShopCostText(
      line.coverageItem,
      line.attachCoverageBonus,
    );
    if (coverageCost) parts.push(coverageCost);
  }
  if (parts.length === 0) return null;
  return parts.join(" + ");
}

export function formatShopLineCost(line: BeyondShopCartLine): string | null {
  if (line.attachCoverageSlug && line.coverageItem) {
    const unit = formatBundleUnitCost(line);
    if (!unit) return null;
    if (line.quantity <= 1) return unit;
    return `${line.quantity}× (${unit})`;
  }
  if (line.attachToBaseSlug) {
    return resolveCoverageShopCostText(line.item, line.attachCoverageBonus);
  }
  if (!line.item.costText) return null;
  if (line.quantity <= 1) return line.item.costText;
  return `${line.quantity}× ${line.item.costText}`;
}

export function isShopBundleLine(line: BeyondShopCartLine): boolean {
  return Boolean(line.attachCoverageSlug && line.coverageItem);
}

export function isShopAttachLine(line: BeyondShopCartLine): boolean {
  return Boolean(line.attachToBaseSlug);
}

export function isPlainShopLine(line: BeyondShopCartLine): boolean {
  return (
    !line.attachCoverageSlug &&
    !line.attachToBaseSlug &&
    !line.coverageItem
  );
}

/** Chave estável para identificar linhas no carrinho. */
export function shopCartLineKey(line: BeyondShopCartLine): string {
  if (line.attachCoverageSlug && line.coverageItem) {
    return `bundle:${line.item.slug}+${line.attachCoverageSlug}:${line.attachCoverageBonus ?? ""}`;
  }
  if (line.attachToBaseSlug) {
    return `attach:${line.item.slug}@${line.attachToBaseSlug}:${line.attachCoverageBonus ?? ""}`;
  }
  return `item:${line.item.slug}`;
}

export function supportsShopLineQuantity(line: BeyondShopCartLine): boolean {
  return !line.attachToBaseSlug;
}
