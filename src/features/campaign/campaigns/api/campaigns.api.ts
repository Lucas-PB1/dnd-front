import { gameFetch } from "@/shared/api/dnd-api/api-client";

export type CampaignRole = "dm" | "player" | "assistant";

export type CampaignSummary = {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  myRole: CampaignRole;
  allowPlayerSkipPayment: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CampaignMember = {
  userId: string;
  role: CampaignRole;
  joinedAt: string;
  displayName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  characterNames?: string[];
};

export type CampaignCharacterSummary = {
  characterId: string;
  name: string;
  level: number;
  classSlug: string;
  speciesSlug: string;
  linkedAt: string;
};

export type CampaignDetail = CampaignSummary & {
  members: CampaignMember[];
  characters: CampaignCharacterSummary[];
};

export const campaignsKeys = {
  all: ["campaigns"] as const,
  detail: (id: string) => [...campaignsKeys.all, "detail", id] as const,
};

export async function fetchCampaigns(accessToken: string) {
  return gameFetch<CampaignSummary[]>("/campaigns", accessToken);
}

export async function fetchCampaignById(accessToken: string, id: string) {
  return gameFetch<CampaignDetail>(`/campaigns/${id}`, accessToken);
}

export async function createCampaign(
  accessToken: string,
  payload: { name: string; description?: string },
) {
  return gameFetch<CampaignSummary>("/campaigns", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function joinCampaign(
  accessToken: string,
  payload: { inviteCode: string; role?: "player" | "assistant" },
) {
  return gameFetch<CampaignSummary>("/campaigns/join", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function linkCampaignCharacter(
  accessToken: string,
  campaignId: string,
  characterId: string,
) {
  return gameFetch<CampaignCharacterSummary>(
    `/campaigns/${campaignId}/characters`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ characterId }),
    },
  );
}

export async function unlinkCampaignCharacter(
  accessToken: string,
  campaignId: string,
  characterId: string,
) {
  return gameFetch<void>(
    `/campaigns/${campaignId}/characters/${characterId}`,
    accessToken,
    { method: "DELETE" },
  );
}

export async function deleteCampaign(accessToken: string, campaignId: string) {
  return gameFetch<void>(`/campaigns/${campaignId}`, accessToken, {
    method: "DELETE",
  });
}

export async function updateCampaign(
  accessToken: string,
  campaignId: string,
  payload: {
    name?: string;
    description?: string | null;
    allowPlayerSkipPayment?: boolean;
  },
) {
  return gameFetch<CampaignSummary>(`/campaigns/${campaignId}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function rotateCampaignInvite(
  accessToken: string,
  campaignId: string,
) {
  return gameFetch<CampaignSummary>(
    `/campaigns/${campaignId}/invite-code/rotate`,
    accessToken,
    { method: "POST" },
  );
}

export async function updateCampaignMemberRole(
  accessToken: string,
  campaignId: string,
  userId: string,
  role: CampaignRole,
) {
  return gameFetch<{ userId: string; role: CampaignRole; joinedAt: string }>(
    `/campaigns/${campaignId}/members/${userId}`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify({ role }),
    },
  );
}

export async function removeCampaignMember(
  accessToken: string,
  campaignId: string,
  userId: string,
) {
  return gameFetch<void>(
    `/campaigns/${campaignId}/members/${userId}`,
    accessToken,
    { method: "DELETE" },
  );
}

export function campaignRoleLabel(role: CampaignRole): string {
  if (role === "dm") return "Mestre";
  if (role === "assistant") return "Auxiliar";
  return "Jogador";
}
