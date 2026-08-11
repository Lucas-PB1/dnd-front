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
  type CampaignRole,
  type CampaignSummary,
} from "@/features/campaign/campaigns/api/campaigns.api";
import {
  useCampaigns,
  useCreateCampaign,
  useJoinCampaign,
} from "@/features/campaign/campaigns/api/use-campaigns";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";
import { EmptyMapMark } from "@/shared/ui/brand-marks";
import { Button, buttonVariants } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { Input } from "@/shared/ui/input";
import { SearchableSelect } from "@/shared/ui/searchable-select";

function RoleChip({ role }: { role: CampaignRole }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
        role === "dm"
          ? "border-secondary/50 bg-secondary/10 text-secondary"
          : role === "assistant"
            ? "border-accent/40 bg-accent/10 text-accent"
            : "border-border/80 bg-muted/30 text-muted-foreground",
      )}
    >
      {campaignRoleLabel(role)}
    </span>
  );
}

function CampaignRow({ campaign }: { campaign: CampaignSummary }) {
  return (
    <li
      className={cn(
        "flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        motion.hoverRow,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-heading font-medium">{campaign.name}</p>
          <RoleChip role={campaign.myRole} />
        </div>
        <p className="text-sm text-muted-foreground">
          Código{" "}
          <span className="font-mono tracking-wide">{campaign.inviteCode}</span>
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

function CampaignsListSkeleton() {
  return (
    <ul
      className="divide-y divide-border overflow-hidden rounded-xl border border-border/80"
      role="status"
      aria-busy="true"
      aria-label="Carregando campanhas"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-muted/40" />
            <div className="h-3 w-28 animate-pulse rounded bg-muted/30" />
          </div>
          <div className="h-8 w-16 animate-pulse rounded bg-muted/35" />
        </li>
      ))}
    </ul>
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
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-0">
        <form onSubmit={onCreate} className="space-y-3 lg:pr-10">
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
          className="space-y-3 border-t border-border pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10"
        >
          <h2 className="inline-flex items-center gap-2 font-heading text-lg font-semibold">
            <KeyIcon className="size-5 text-accent" aria-hidden />
            Entrar com código
          </h2>
          <p className="text-sm text-muted-foreground">
            Use o código que o mestre compartilhou com a mesa.
          </p>
          <Input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="Código do convite"
            maxLength={16}
            required
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Papel</span>
            <SearchableSelect
              className="h-9"
              value={joinRole}
              options={[
                { value: "player", label: "Jogador" },
                { value: "assistant", label: "Auxiliar" },
              ]}
              onValueChange={(next) =>
                setJoinRole(next as "player" | "assistant")
              }
            />
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
        {isPending ? <CampaignsListSkeleton /> : null}
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
          <ul
            className={cn(
              "divide-y divide-border overflow-hidden rounded-xl border border-border/80 bg-card/45",
              motion.stagger,
            )}
          >
            {data.map((campaign) => (
              <CampaignRow key={campaign.id} campaign={campaign} />
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
