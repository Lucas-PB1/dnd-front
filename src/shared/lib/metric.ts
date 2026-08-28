/**
 * Unidades de apresentação: SI, tabela PHB 2024 PT.
 * Persistência pode continuar imperial (`speed_ft`, `reach_ft`, `cargo_capacity_lb`).
 *
 * 1 pé = 30 cm · 1 libra = 500 g · 1 milha = 1,5 km (1 mph = 1,5 km/h)
 */

export const METERS_PER_FOOT = 0.3;
export const KG_PER_POUND = 0.5;
export const KM_PER_MILE = 1.5;

export function roundMetric(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatMetricNumber(value: number): string {
  const rounded = roundMetric(value);
  if (Number.isInteger(rounded)) return String(rounded);
  return String(rounded).replace(".", ",");
}

export function feetToMeters(feet: number): number {
  return roundMetric(feet * METERS_PER_FOOT);
}

export function poundsToKg(pounds: number): number {
  return roundMetric(pounds * KG_PER_POUND);
}

export function mphToKmh(mph: number): number {
  return roundMetric(mph * KM_PER_MILE);
}

export function milesToKm(miles: number): number {
  return roundMetric(miles * KM_PER_MILE);
}

export function formatMetersFromFeet(feet: number): string {
  return `${formatMetricNumber(feetToMeters(feet))} m`;
}

export function formatKgFromPounds(pounds: number): string {
  return `${formatMetricNumber(poundsToKg(pounds))} kg`;
}

export function formatKmhFromMph(mph: number): string {
  return `${formatMetricNumber(mphToKmh(mph))} km/h`;
}

export function formatReachFromFeet(feet: number): string {
  return `alcance ${formatMetersFromFeet(feet)}`;
}

function parseLooseNumber(raw: string): number {
  return Number(raw.replace(",", "."));
}

/**
 * Converte medidas imperiais em prosa para SI.
 * Não altera “pés” anatômico (sem número na frente).
 */
export function toMetricProse(text: string): string {
  if (!text) return text;

  return text
    .replace(
      /(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)\s*(?:pés|pes|feet|ft\.|ft)(?!\w)/gi,
      (_match, min: string, max: string) =>
        `${formatMetricNumber(feetToMeters(parseLooseNumber(min)))}/${formatMetersFromFeet(parseLooseNumber(max))}`,
    )
    .replace(
      /(\d+(?:[.,]\d+)?)\s*(?:pés|pes|feet|ft\.|ft)(?!\w)/gi,
      (_match, raw: string) => formatMetersFromFeet(parseLooseNumber(raw)),
    )
    .replace(
      /(\d+(?:[.,]\d+)?)\s*mph\b/gi,
      (_match, raw: string) => formatKmhFromMph(parseLooseNumber(raw)),
    )
    .replace(
      /(\d+(?:[.,]\d+)?)\s*(?:milhas?|miles?)\b/gi,
      (_match, raw: string) =>
        `${formatMetricNumber(milesToKm(parseLooseNumber(raw)))} km`,
    )
    .replace(
      /(\d+(?:[.,]\d+)?)\s*(?:libras?|pounds?|lbs\.|lb\.|lbs|lb)(?!\w)/gi,
      (_match, raw: string) => formatKgFromPounds(parseLooseNumber(raw)),
    );
}
