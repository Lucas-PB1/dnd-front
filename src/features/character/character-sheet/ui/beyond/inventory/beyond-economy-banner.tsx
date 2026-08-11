"use client";

import {
  GiftIcon,
  ShoppingBagIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

import type { InventoryPaymentContext } from "@/entities/character/session-types";
import { cn } from "@/shared/lib/utils";

type BeyondEconomyBannerProps = {
  payment: InventoryPaymentContext | undefined;
  className?: string;
};

/** Modo pago / grátis / mestre — visível antes de qualquer CTA de compra. */
export function BeyondEconomyBanner({
  payment,
  className,
}: BeyondEconomyBannerProps) {
  if (!payment) return null;

  if (payment.chargeApplies) {
    return (
      <div
        className={cn(
          "flex gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs leading-snug text-foreground",
          className,
        )}
        role="status"
      >
        <ShoppingBagIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <p>
          <span className="font-medium">Economia ativa</span> — compras debitam
          o saldo (câmbio PHB). Venda devolve metade do preço de catálogo.
        </p>
      </div>
    );
  }

  if (payment.viewerIsDmOrAssistant) {
    return (
      <div
        className={cn(
          "flex gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs leading-snug text-muted-foreground",
          className,
        )}
        role="status"
      >
        <UserGroupIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          <span className="font-medium text-foreground">Modo mestre</span> —
          presentes sem débito. Saldo ainda editável.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs leading-snug text-muted-foreground",
        className,
      )}
      role="status"
    >
      <GiftIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>
        <span className="font-medium text-foreground">Sem campanha</span> —
        itens entram sem cobrança.
      </p>
    </div>
  );
}
