"use client";

import Link from "next/link";
import {
  KeyIcon,
  PlusCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { FormEvent, useState } from "react";

import {
  campaignRoleLabel,
  type CampaignSummary,
} from "@/features/campaigns/api/campaigns.api";
import {
  useCampaigns,
  useCreateCampaign,
  useJoinCampaign,
} from "@/features/campaigns/api/use-campaigns";
import { cn } from "@/shared/lib/utils";
import { EmptyMapMark } from "@/shared/ui/brand-marks";
import { Button, buttonVariants } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";

function CampaignRow({ campaign }: { campaign: CampaignSummary }) {
  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium">{campaign.name}</p>
        <p className="text-sm text-muted-foreground">
          {campaignRoleLabel(campaign.myRole)} · código {campaign.inviteCode}
        </p>
      </div>
      <Link
        href={`/campaigns/${campaign.id}`}
        className={cn(
          buttonVariants({ size: "sm", variant: "outline" }),
          "inline-flex items-center gap-1",
        )}
      >
        Abrir
        <ArrowRightIcon className="size-3.5" aria-hidden />
      </Link>
    </li>
  );
}

export function CampaignsHome() {
  const { data, isPending, isError, error } = useCampaigns();
  const create = useCreateCampaign();
  const join = useJoinCampaign();
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [joinRole, setJoinRole] = useState<"player" | "assistant">("player");

  function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    create.mutate({ name: name.trim() });
  }

  function onJoin(event: FormEvent) {
    event.preventDefault();
    if (!inviteCode.trim()) return;
    join.mutate({ inviteCode: inviteCode.trim(), role: joinRole });
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={onCreate}
          className="space-y-3 rounded-xl border border-border p-4"
        >
          <h2 className="inline-flex items-center gap-2 font-heading text-lg font-semibold">
            <PlusCircleIcon className="size-5 text-secondary" aria-hidden />
            Nova campanha
          </h2>
          <p className="text-sm text-muted-foreground">
            Você entra como mestre e recebe um código de convite.
          </p>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da campanha"
            maxLength={120}
            required
          />
          <Button type="submit" disabled={create.isPending || !name.trim()}>
            {create.isPending ? "Criando…" : "Criar"}
          </Button>
          {create.isError ? (
            <p className="text-sm text-destructive">
              {create.error instanceof Error
                ? create.error.message
                : "Erro ao criar"}
            </p>
          ) : null}
        </form>

        <form
          onSubmit={onJoin}
          className="space-y-3 rounded-xl border border-border p-4"
        >
          <h2 className="inline-flex items-center gap-2 font-heading text-lg font-semibold">
            <KeyIcon className="size-5 text-accent" aria-hidden />
            Entrar com código
          </h2>
          <Input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="Código do convite"
            maxLength={16}
            required
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Papel</span>
            <select
              className="h-9 rounded-md border border-input bg-background px-3"
              value={joinRole}
              onChange={(e) =>
                setJoinRole(e.target.value as "player" | "assistant")
              }
            >
              <option value="player">Jogador</option>
              <option value="assistant">Auxiliar</option>
            </select>
          </label>
          <Button
            type="submit"
            variant="outline"
            disabled={join.isPending || !inviteCode.trim()}
          >
            {join.isPending ? "Entrando…" : "Entrar"}
          </Button>
          {join.isError ? (
            <p className="text-sm text-destructive">
              {join.error instanceof Error
                ? join.error.message
                : "Erro ao entrar"}
            </p>
          ) : null}
        </form>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Minhas campanhas</h2>
        {isPending ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : null}
        {isError ? (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Erro ao carregar"}
          </p>
        ) : null}
        {!isPending && !isError && !data?.length ? (
          <EmptyState
            icon={<EmptyMapMark className="size-16" />}
            title="Nenhuma campanha ainda"
            description="Crie uma mesa como mestre ou entre com o código de convite de outra pessoa."
          />
        ) : null}
        {data?.length ? (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {data.map((campaign) => (
              <CampaignRow key={campaign.id} campaign={campaign} />
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
