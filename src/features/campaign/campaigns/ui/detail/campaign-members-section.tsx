"use client";

import {
  campaignRoleLabel,
  type CampaignMember,
  type CampaignRole,
} from "@/features/campaign/campaigns/api/campaigns.api";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { SearchableSelect } from "@/shared/ui/searchable-select";

type CampaignMemberRoleMutation = {
  isPending: boolean;
  mutate: (input: { userId: string; role: CampaignRole }) => void;
};

type CampaignRemoveMemberMutation = {
  isPending: boolean;
  mutate: (userId: string) => void;
};

type CampaignMembersSectionProps = {
  members: CampaignMember[];
  myUserId: string | undefined;
  isDm: boolean;
  myRole: CampaignRole;
  updateRole: CampaignMemberRoleMutation;
  removeMember: CampaignRemoveMemberMutation;
};

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

function memberLabel(member: CampaignMember, isMe: boolean): string {
  if (isMe) return "Você";
  if (member.displayName?.trim()) return member.displayName.trim();
  if (member.email?.trim()) return member.email.trim();
  return `Membro ${member.userId.slice(0, 8)}…`;
}

function memberInitial(member: CampaignMember, isMe: boolean): string {
  const label = memberLabel(member, isMe);
  if (isMe && member.displayName?.trim()) {
    return member.displayName.trim().charAt(0).toUpperCase();
  }
  return label.charAt(0).toUpperCase();
}

export function CampaignMembersSection({
  members,
  myUserId,
  isDm,
  myRole,
  updateRole,
  removeMember,
}: CampaignMembersSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg font-semibold">Membros</h2>
      <ul
        className={cn(
          "divide-y divide-border overflow-hidden rounded-xl border border-border/80 bg-card/45",
          motion.stagger,
        )}
      >
        {members.map((member) => {
          const isMe = myUserId === member.userId;
          const label = memberLabel(member, isMe);
          const characterNames = member.characterNames ?? [];
          const showEmail =
            !!member.email &&
            member.email !== label &&
            (!isMe || !!member.displayName);

          return (
            <li
              key={member.userId}
              className={cn(
                "flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
                motion.hoverRow,
              )}
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className="inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-secondary/40 bg-secondary/15 font-heading text-sm font-semibold text-secondary"
                  aria-hidden
                >
                  {member.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.avatarUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    memberInitial(member, isMe)
                  )}
                </span>
                <div className="min-w-0 space-y-1.5">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{label}</p>
                    <RoleChip role={member.role} />
                  </div>
                  {showEmail ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {member.email}
                    </p>
                  ) : null}
                  {member.bio ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {member.bio}
                    </p>
                  ) : null}
                  {characterNames.length > 0 ? (
                    <p className="truncate text-xs text-muted-foreground">
                      Ficha{characterNames.length > 1 ? "s" : ""}:{" "}
                      {characterNames.join(", ")}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Sem ficha vinculada
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:pl-12">
                {isDm && !isMe ? (
                  <SearchableSelect
                    className="h-8 w-auto min-w-[8rem] text-sm"
                    value={member.role}
                    disabled={updateRole.isPending}
                    options={[
                      { value: "dm", label: "Mestre" },
                      { value: "player", label: "Jogador" },
                      { value: "assistant", label: "Auxiliar" },
                    ]}
                    onValueChange={(next) =>
                      updateRole.mutate({
                        userId: member.userId,
                        role: next as CampaignRole,
                      })
                    }
                  />
                ) : null}
                {isMe && myRole !== "dm" ? (
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
  );
}
