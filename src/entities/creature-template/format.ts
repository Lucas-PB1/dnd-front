/** mph armazenado como speed_ft × 10 quando movement_kind é vela|remo|ar */
const VEHICLE_SPEED_KINDS = new Set(['vela', 'remo', 'ar']);

const VEHICLE_SPEED_LABEL: Record<string, string> = {
  vela: 'vela',
  remo: 'remo',
  ar: 'ar',
};

function formatSpeedEntry(speed: {
  movementKind: string;
  speedFt: number;
}): string {
  if (VEHICLE_SPEED_KINDS.has(speed.movementKind)) {
    const mph = speed.speedFt / 10;
    const mphText = Number.isInteger(mph) ? String(mph) : mph.toFixed(1);
    return `${mphText} mph (${VEHICLE_SPEED_LABEL[speed.movementKind]})`;
  }
  return `${speed.speedFt} pés (${speed.movementKind})`;
}

export function formatTemplateSpeeds(
  speeds: Array<{ movementKind: string; speedFt: number }>,
): string {
  if (!speeds.length) return "—";
  return speeds.map(formatSpeedEntry).join(", ");
}

export function inferActorKindFromCreatureSlug(slug: string): "companion" | "creature" {
  if (slug.startsWith("primal-companion")) return "companion";
  return "creature";
}
