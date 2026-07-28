"use client";

import {
  campaignRoleLabel,
  type CampaignMember,
  type CampaignRole,
} from "@/features/campaign/campaigns/api/campaigns.api";
import { Button } from "@/shared/ui/button";

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
      <ul className="divide-y divide-border rounded-xl border border-border">
        {members.map((member) => {
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
