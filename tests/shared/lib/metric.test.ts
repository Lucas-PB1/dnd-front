import { describe, expect, it } from "vitest";

import {
  feetToMeters,
  formatKgFromPounds,
  formatKmhFromMph,
  formatMetersFromFeet,
  formatReachFromFeet,
  mphToKmh,
  poundsToKg,
  toMetricProse,
} from "@/shared/lib/metric";

describe("metric conversions", () => {
  it("converts PHB PT table values", () => {
    expect(feetToMeters(5)).toBe(1.5);
    expect(feetToMeters(30)).toBe(9);
    expect(poundsToKg(2)).toBe(1);
    expect(mphToKmh(8)).toBe(12);
  });

  it("formats display strings in pt-BR", () => {
    expect(formatMetersFromFeet(5)).toBe("1,5 m");
    expect(formatMetersFromFeet(30)).toBe("9 m");
    expect(formatReachFromFeet(5)).toBe("alcance 1,5 m");
    expect(formatKgFromPounds(2000)).toBe("1000 kg");
    expect(formatKmhFromMph(1.5)).toBe("2,25 km/h");
  });

  it("rewrites imperial measures in prose", () => {
    expect(toMetricProse("alcance 30 pés")).toBe("alcance 9 m");
    expect(toMetricProse("range 20/60 feet")).toBe("range 6/18 m");
    expect(toMetricProse("8 mph (ar)")).toBe("12 km/h (ar)");
    expect(toMetricProse("pesa 100 libras")).toBe("pesa 50 kg");
    expect(toMetricProse("2 lb.")).toBe("1 kg");
    expect(toMetricProse("5 ft.")).toBe("1,5 m");
    expect(toMetricProse("1 milha")).toBe("1,5 km");
  });

  it("keeps anatomical pés without a leading number", () => {
    expect(toMetricProse("aparece aos seus pés")).toBe("aparece aos seus pés");
  });
});
