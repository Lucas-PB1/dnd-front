"use client";

import { KeyIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { Button } from "@/shared/ui/button";

type CampaignInviteBarProps = {
  inviteCode: string;
  isDm: boolean;
  rotatePending: boolean;
  onRotate: () => void;
};

export function CampaignInviteBar({
  inviteCode,
  isDm,
  rotatePending,
  onRotate,
}: CampaignInviteBarProps) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard?.writeText(inviteCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-secondary/40 bg-secondary/8 px-3 py-2.5 text-sm">
      <KeyIcon className="size-4 shrink-0 text-secondary" aria-hidden />
      <span className="text-muted-foreground">Código</span>
      <span className="rounded-md border border-border/70 bg-background/60 px-2 py-0.5 font-mono text-sm font-semibold tracking-wide">
        {inviteCode}
      </span>
      <Button type="button" size="sm" variant="ghost" onClick={copyCode}>
        {copied ? "Copiado" : "Copiar"}
      </Button>
      {isDm ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={rotatePending}
          onClick={onRotate}
        >
          {rotatePending ? "Gerando…" : "Novo código"}
        </Button>
      ) : null}
    </div>
  );
}
