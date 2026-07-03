export function formatAbilityModifier(score: string): string | null {
  const parsed = Number.parseInt(score.trim(), 10);

  if (Number.isNaN(parsed)) {
    return null;
  }

  const modifier = Math.floor((parsed - 10) / 2);

  if (modifier >= 0) {
    return `+${modifier}`;
  }

  return String(modifier);
}
