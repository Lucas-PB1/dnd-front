import {
  formatKmhFromMph,
  formatMetersFromFeet,
} from "@/shared/lib/metric";

/** mph armazenado como speed_ft × 10 quando movement_kind é vela|remo|ar|mph */
const TRAVEL_SPEED_KINDS = new Set(["vela", "remo", "ar", "mph"]);

const SPEED_KIND_LABEL: Record<string, string> = {
  vela: "vela",
  remo: "remo",
  ar: "ar",
  fly: "voo",
  swim: "natação",
  climb: "escalada",
  burrow: "escavação",
};

function formatSpeedEntry(speed: {
  movementKind: string;
  speedFt: number;
}): string {
  const value = TRAVEL_SPEED_KINDS.has(speed.movementKind)
    ? formatKmhFromMph(speed.speedFt / 10)
    : formatMetersFromFeet(speed.speedFt);
  const kindLabel = SPEED_KIND_LABEL[speed.movementKind];
  return kindLabel ? `${value} (${kindLabel})` : value;
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
