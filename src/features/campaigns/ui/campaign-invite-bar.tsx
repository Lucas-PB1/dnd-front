"use client";

import { KeyIcon } from "@heroicons/react/24/outline";

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
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-secondary/35 bg-secondary/5 px-3 py-2 text-sm">
      <KeyIcon className="size-4 shrink-0 text-secondary" aria-hidden />
      <span>
        Código:{" "}
        <span className="font-mono font-semibold tracking-wide">{inviteCode}</span>
      </span>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => {
          void navigator.clipboard?.writeText(inviteCode);
        }}
      >
        Copiar
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
