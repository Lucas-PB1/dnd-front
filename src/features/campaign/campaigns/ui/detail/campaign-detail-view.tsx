"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

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
import { cn } from "@/shared/lib/utils";
import { BackLink } from "@/shared/ui/back-link";
import { InkFlourish } from "@/shared/ui/brand-marks";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { SourceEditionBadge } from "@/shared/ui/source-edition-badge";

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
    return <p className="text-sm text-muted-foreground">Carregando campanha…</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Campanha não encontrada"}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <BackLink href="/campaigns">Campanhas</BackLink>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
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
              <>
                <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                  {data.name}
                </h1>
                <InkFlourish className="h-3 w-36 text-secondary/60 sm:w-44" />
                <p className="text-sm text-muted-foreground">
                  Seu papel: {campaignRoleLabel(data.myRole)}
                </p>
                {data.description ? (
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    {data.description}
                  </p>
                ) : null}
                <SourceEditionBadge live />
              </>
            )}
          </div>
          {isDm && !editing ? (
            <Button type="button" size="sm" variant="outline" onClick={startEdit}>
              Editar
            </Button>
          ) : null}
        </div>

        <CampaignInviteBar
          inviteCode={data.inviteCode}
          isDm={isDm}
          rotatePending={rotateInvite.isPending}
          onRotate={handleRotateInvite}
        />
      </div>

      {isDm ? (
        <section className="space-y-2 rounded-md border border-border/70 bg-muted/20 px-3 py-3">
          <h2 className="font-heading text-sm font-semibold">Inventário</h2>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
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
        </section>
      ) : null}

      {canOpenEncounter ? (
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">Combate</h2>
          <p className="text-sm text-muted-foreground">
            Tracker de iniciativa, criaturas e turnos da mesa.
          </p>
          <Link
            href={`/campaigns/${campaignId}/encounter`}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Abrir encontro
          </Link>
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
        <section className="border-t border-border pt-6">
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
