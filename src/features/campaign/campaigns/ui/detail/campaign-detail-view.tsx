"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { BoltIcon } from "@heroicons/react/24/outline";

import { useAuth } from "@/features/auth/model";
import { useCharacters } from "@/features/character/characters/api/use-characters";
import { campaignRoleLabel } from "@/features/campaign/campaigns/api/campaigns.api";
import {
  useCampaign,
  useDeleteCampaign,
  useLinkCampaignCharacter,
  useRemoveCampaignMember,
  useRotateCampaignInvite,
  useUnlinkCampaignCharacter,
  useUpdateCampaign,
  useUpdateCampaignMemberRole,
} from "@/features/campaign/campaigns/api/use-campaigns";
import { CampaignCharactersSection } from "@/features/campaign/campaigns/ui/detail/campaign-characters-section";
import { CampaignInviteBar } from "@/features/campaign/campaigns/ui/detail/campaign-invite-bar";
import { CampaignMembersSection } from "@/features/campaign/campaigns/ui/detail/campaign-members-section";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import {
  InkFlourish,
  MarginCorner,
  SealMark,
} from "@/shared/ui/brand-marks";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { SourceEditionBadge } from "@/shared/ui/source-edition-badge";

function CampaignDetailSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-busy="true"
      aria-label="Carregando campanha"
    >
      <div className="relative overflow-hidden rounded-xl border border-border bg-card/50 p-4">
        <div className="h-4 w-28 animate-pulse rounded bg-muted/40" />
        <div className="mt-4 flex gap-3">
          <div className="size-10 animate-pulse rounded-full bg-muted/40" />
          <div className="flex-1 space-y-2">
            <div className="h-8 w-56 max-w-full animate-pulse rounded bg-muted/40" />
            <div className="h-3 w-36 animate-pulse rounded bg-muted/30" />
          </div>
        </div>
      </div>
      <div className="h-24 animate-pulse rounded-xl border border-border/70 bg-card/40" />
      <div className="h-40 animate-pulse rounded-xl border border-border/70 bg-card/40" />
    </div>
  );
}

export function CampaignDetailView({ campaignId }: { campaignId: string }) {
  const { user } = useAuth();
  const { data, isPending, isError, error } = useCampaign(campaignId);
  const { data: myCharacters } = useCharacters();
  const link = useLinkCampaignCharacter(campaignId);
  const unlink = useUnlinkCampaignCharacter(campaignId);
  const remove = useDeleteCampaign();
  const update = useUpdateCampaign(campaignId);
  const rotateInvite = useRotateCampaignInvite(campaignId);
  const updateRole = useUpdateCampaignMemberRole(campaignId);
  const removeMember = useRemoveCampaignMember(campaignId);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const linkedIds = useMemo(
    () => new Set(data?.characters.map((c) => c.characterId) ?? []),
    [data?.characters],
  );
  const available = (myCharacters ?? []).filter((c) => !linkedIds.has(c.id));
  const isDm = data?.myRole === "dm";
  const canOpenEncounter =
    data?.myRole === "dm" ||
    data?.myRole === "assistant" ||
    data?.myRole === "player";
  const myUserId = user?.id;

  function startEdit() {
    if (!data) return;
    setName(data.name);
    setDescription(data.description ?? "");
    setEditing(true);
  }

  function onSaveMeta(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    update.mutate(
      {
        name: name.trim(),
        description: description.trim() || null,
      },
      { onSuccess: () => setEditing(false) },
    );
  }

  function handleRotateInvite() {
    if (
      window.confirm("Gerar novo código? O anterior deixa de funcionar.")
    ) {
      rotateInvite.mutate();
    }
  }

  if (isPending) {
    return <CampaignDetailSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="space-y-3">
        <BackLink href="/campaigns">Campanhas</BackLink>
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Campanha não encontrada"}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", motion.enter)}>
      <header className="relative overflow-hidden rounded-xl border border-border bg-card/50 shadow-sm backdrop-blur-sm">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklch,var(--muted)_75%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklch,var(--secondary)_16%,transparent),transparent_50%)]"
          aria-hidden
        />
        <MarginCorner className="pointer-events-none absolute top-2 left-2 size-7 sm:size-8" />
        <MarginCorner
          mirror
          className="pointer-events-none absolute right-2 bottom-2 size-7 sm:size-8"
        />

        <div className="relative flex flex-col gap-3 p-4 sm:gap-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <BackLink href="/campaigns">Campanhas</BackLink>
            <div className="flex flex-wrap items-center gap-2">
              <SourceEditionBadge live />
              {isDm && !editing ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={startEdit}
                >
                  Editar
                </Button>
              ) : null}
            </div>
          </div>

          {editing ? (
            <form onSubmit={onSaveMeta} className="space-y-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                required
              />
              <textarea
                className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                placeholder="Descrição (opcional)"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={update.isPending}>
                  Salvar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex min-w-0 flex-wrap items-start gap-3">
              <SealMark className="size-10 shrink-0 text-secondary sm:size-11" />
              <div className="min-w-0 space-y-1.5">
                <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                  {data.name}
                </h1>
                <InkFlourish className="h-3 w-36 text-secondary/60 sm:w-44" />
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="inline-flex rounded-md border border-secondary/50 bg-secondary/10 px-2 py-0.5 text-xs font-medium">
                    {campaignRoleLabel(data.myRole)}
                  </span>
                </div>
                {data.description ? (
                  <p className="max-w-2xl pt-1 text-sm text-muted-foreground">
                    {data.description}
                  </p>
                ) : null}
              </div>
            </div>
          )}

          <CampaignInviteBar
            inviteCode={data.inviteCode}
            isDm={isDm}
            rotatePending={rotateInvite.isPending}
            onRotate={handleRotateInvite}
          />
        </div>
      </header>

      {canOpenEncounter ? (
        <section className="relative overflow-hidden rounded-xl border border-secondary/40 bg-secondary/8 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="inline-flex items-center gap-2 font-heading text-lg font-semibold">
                <BoltIcon className="size-5 text-secondary" aria-hidden />
                Combate
              </h2>
              <p className="text-sm text-muted-foreground">
                Tracker de iniciativa, criaturas e turnos da mesa.
              </p>
            </div>
            <Link
              href={`/campaigns/${campaignId}/encounter`}
              className={cn(
                buttonVariants({ size: "default" }),
                "inline-flex shrink-0 items-center gap-1.5",
              )}
            >
              Abrir encontro
              <BoltIcon className="size-4" aria-hidden />
            </Link>
          </div>
        </section>
      ) : null}

      {isDm ? (
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">Inventário</h2>
          <div className="rounded-xl border border-border/80 bg-card/45 px-4 py-3">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-secondary"
                checked={data.allowPlayerSkipPayment}
                disabled={update.isPending}
                onChange={(e) =>
                  update.mutate({ allowPlayerSkipPayment: e.target.checked })
                }
              />
              <span>
                Players podem pegar item sem pagar
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Libera o checkbox “Não pagar” no inventário Beyond.
                </span>
              </span>
            </label>
          </div>
        </section>
      ) : null}

      <CampaignMembersSection
        members={data.members}
        myUserId={myUserId}
        isDm={isDm}
        myRole={data.myRole}
        updateRole={updateRole}
        removeMember={removeMember}
      />

      <CampaignCharactersSection
        characters={data.characters}
        available={available}
        myCharactersCount={myCharacters?.length}
        link={link}
        unlink={unlink}
      />

      {isDm ? (
        <section className="space-y-3 border-t border-border pt-6">
          <h2 className="font-heading text-lg font-semibold text-destructive">
            Zona de perigo
          </h2>
          <p className="text-sm text-muted-foreground">
            Exclui a mesa. Os personagens das fichas não são apagados.
          </p>
          <Button
            type="button"
            variant="destructive"
            disabled={remove.isPending}
            onClick={() => {
              if (
                window.confirm(
                  `Excluir a campanha "${data.name}"? Os personagens não são apagados.`,
                )
              ) {
                remove.mutate(campaignId);
              }
            }}
          >
            {remove.isPending ? "Excluindo…" : "Excluir campanha"}
          </Button>
        </section>
      ) : null}
    </div>
  );
}
