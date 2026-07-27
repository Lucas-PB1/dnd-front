"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { useAuth } from "@/features/auth/model/use-auth";
import { useCharacters } from "@/features/characters/api/use-characters";
import {
  campaignRoleLabel,
  type CampaignRole,
} from "@/features/campaigns/api/campaigns.api";
import {
  useCampaign,
  useDeleteCampaign,
  useLinkCampaignCharacter,
  useRemoveCampaignMember,
  useRotateCampaignInvite,
  useUnlinkCampaignCharacter,
  useUpdateCampaign,
  useUpdateCampaignMemberRole,
} from "@/features/campaigns/api/use-campaigns";
import { cn } from "@/shared/lib/utils";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

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

  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const linkedIds = useMemo(
    () => new Set(data?.characters.map((c) => c.characterId) ?? []),
    [data?.characters],
  );
  const available = (myCharacters ?? []).filter((c) => !linkedIds.has(c.id));
  const isDm = data?.myRole === "dm";
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
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
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
                <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                  {data.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Seu papel: {campaignRoleLabel(data.myRole)}
                </p>
                {data.description ? (
                  <p className="text-sm text-muted-foreground">
                    {data.description}
                  </p>
                ) : null}
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {isDm && !editing ? (
              <Button type="button" size="sm" variant="outline" onClick={startEdit}>
                Editar
              </Button>
            ) : null}
            <Link
              href="/campaigns"
              className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
            >
              Voltar
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm">
          <span>
            Código:{" "}
            <span className="font-mono font-semibold tracking-wide">
              {data.inviteCode}
            </span>
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              void navigator.clipboard?.writeText(data.inviteCode);
            }}
          >
            Copiar
          </Button>
          {isDm ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={rotateInvite.isPending}
              onClick={() => {
                if (
                  window.confirm(
                    "Gerar novo código? O anterior deixa de funcionar.",
                  )
                ) {
                  rotateInvite.mutate();
                }
              }}
            >
              {rotateInvite.isPending ? "Gerando…" : "Novo código"}
            </Button>
          ) : null}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Membros</h2>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {data.members.map((member) => {
            const isMe = myUserId === member.userId;
            return (
              <li
                key={member.userId}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {isMe ? "Você" : `Membro ${member.userId.slice(0, 8)}…`}
                  </p>
                  {!isDm || isMe ? (
                    <p className="text-sm text-muted-foreground">
                      {campaignRoleLabel(member.role)}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isDm && !isMe ? (
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                      value={member.role}
                      disabled={updateRole.isPending}
                      onChange={(e) =>
                        updateRole.mutate({
                          userId: member.userId,
                          role: e.target.value as CampaignRole,
                        })
                      }
                    >
                      <option value="dm">Mestre</option>
                      <option value="player">Jogador</option>
                      <option value="assistant">Auxiliar</option>
                    </select>
                  ) : null}
                  {isMe && data.myRole !== "dm" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={removeMember.isPending}
                      onClick={() => {
                        if (window.confirm("Sair desta campanha?")) {
                          removeMember.mutate(member.userId);
                        }
                      }}
                    >
                      Sair
                    </Button>
                  ) : null}
                  {isDm && !isMe ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={removeMember.isPending}
                      onClick={() => {
                        if (window.confirm("Remover este membro?")) {
                          removeMember.mutate(member.userId);
                        }
                      }}
                    >
                      Remover
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Personagens</h2>
        <p className="text-sm text-muted-foreground">
          Fichas vinculadas à mesa. Continuam em{" "}
          <Link href="/characters" className="underline underline-offset-2">
            Minhas fichas
          </Link>
          .
        </p>

        {data.characters.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum personagem ainda.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {data.characters.map((character) => (
              <li
                key={character.characterId}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{character.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Nv. {character.level} · {character.speciesSlug} ·{" "}
                    {character.classSlug}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/characters/${character.characterId}`}
                    className={cn(
                      buttonVariants({ size: "sm", variant: "outline" }),
                    )}
                  >
                    Abrir ficha
                  </Link>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={unlink.isPending}
                    onClick={() => unlink.mutate(character.characterId)}
                  >
                    Desvincular
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {available.length > 0 ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="text-muted-foreground">
                Vincular minha ficha
              </span>
              <select
                className="h-9 rounded-md border border-input bg-background px-3"
                value={selectedCharacterId}
                onChange={(e) => setSelectedCharacterId(e.target.value)}
              >
                <option value="">Escolher…</option>
                {available.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                  </option>
                ))}
              </select>
            </label>
            <Button
              type="button"
              disabled={!selectedCharacterId || link.isPending}
              onClick={() => {
                if (!selectedCharacterId) return;
                link.mutate(selectedCharacterId, {
                  onSuccess: () => setSelectedCharacterId(""),
                });
              }}
            >
              Vincular
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {myCharacters?.length
              ? "Todas as suas fichas já estão nesta campanha."
              : "Crie uma ficha para vincular."}
          </p>
        )}
        {link.isError ? (
          <p className="text-sm text-destructive">
            {link.error instanceof Error ? link.error.message : "Erro ao vincular"}
          </p>
        ) : null}
      </section>

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
