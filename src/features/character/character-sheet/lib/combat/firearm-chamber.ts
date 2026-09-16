export function firearmAttackShots(automatic: boolean): number {
  return automatic ? 2 : 1;
}

export function canSpendFirearmChamber(input: {
  remaining: number | null | undefined;
  shots: number;
}): boolean {
  if (input.remaining == null) return true;
  return input.remaining >= input.shots;
}

export function canReloadFirearmChamber(input: {
  remaining: number | null | undefined;
  capacity: number | null | undefined;
}): boolean {
  if (input.capacity == null) return false;
  const remaining = input.remaining ?? input.capacity;
  return remaining < input.capacity;
}
