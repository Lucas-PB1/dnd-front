export function parseInteger(value: string | undefined | null): number | null {
  if (value == null) {
    return null;
  }

  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
}
