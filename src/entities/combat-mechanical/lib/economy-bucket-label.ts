const ECONOMY_BUCKET_LABEL: Record<string, string> = {
  action: "Ação",
  bonus: "Ação bônus",
  reaction: "Reação",
  free: "Livre",
};

export function economyBucketLabel(economy: string): string {
  return ECONOMY_BUCKET_LABEL[economy] ?? economy;
}
