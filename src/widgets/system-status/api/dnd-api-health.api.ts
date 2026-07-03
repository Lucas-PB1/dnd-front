import { fetchNestHealth } from "@/shared/api/dnd-api/nest-health";

export const dndApiHealthKeys = {
  all: ["dnd-api", "health"] as const,
};

export async function fetchDndApiHealth() {
  const health = await fetchNestHealth();
  if (!health) {
    throw new Error("NEXT_PUBLIC_API_URL não configurada");
  }
  return health;
}
