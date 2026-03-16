import type { Stop } from "./achievements";

export type PoliceForecastInput = {
  stops: Stop[];
  policeIndex: number;
  unlockedBadgeCount: number;
  daysSinceLastStop?: number;
};

const forecastLines = {
  unknown: "Zatiaľ nepopísaný príbeh.",
  low: "Nenápadný typ.",
  calm: "Dnes pôsobíš celkom nevinne.",
  mild: "Mierne podozrivý, ale v pohode.",
  reminder: "Premávka si ťa začína pamätať.",
  calmBefore: "Vyzerá to na pokoj pred kontrolou.",
  main: "Máš energiu hlavnej postavy.",
  known: "Známa tvár v premávke.",
  seen: "Hliadka by ťa už možno spoznala.",
  alert: "Policajný vesmír je v strehu.",
  ripe: "Tento týždeň je výživný.",
  tour: "Toto už nie je jazda, ale turné.",
  noticed: "Hliadka zbystrila.",
  silent: "Radar zatiaľ mlčí.",
  offRadar: "Momentálne mimo radaru.",
};

function chooseFrom(lines: string[], seed: number) {
  if (lines.length === 0) return "";
  return lines[seed % lines.length];
}

export function getPoliceForecast({
  stops,
  policeIndex,
  unlockedBadgeCount,
  daysSinceLastStop,
}: PoliceForecastInput): string {
  // 1) No stops at all
  if (stops.length === 0) {
    return forecastLines.unknown;
  }

  // 2) If we have a notion of how long since last stop, prefer that
  if (typeof daysSinceLastStop === "number") {
    if (daysSinceLastStop >= 10) {
      return forecastLines.offRadar;
    }
    if (daysSinceLastStop >= 7) {
      return forecastLines.silent;
    }
  }

  // Use a stable seed based on stops and badges
  const seed = stops.length + unlockedBadgeCount;

  // High index -> more serious
  if (policeIndex >= 8) {
    const preferred = [forecastLines.tour, forecastLines.noticed];
    if (unlockedBadgeCount >= 5) {
      return chooseFrom(preferred, seed);
    }
    return chooseFrom([forecastLines.ripe, ...preferred], seed);
  }

  if (policeIndex >= 6) {
    const preferred = [
      forecastLines.reminder,
      forecastLines.calmBefore,
      forecastLines.main,
    ];
    if (unlockedBadgeCount >= 5) {
      return chooseFrom([forecastLines.tour, forecastLines.noticed], seed);
    }
    return chooseFrom(preferred, seed);
  }

  if (policeIndex >= 4) {
    return chooseFrom(
      [forecastLines.known, forecastLines.seen, forecastLines.alert],
      seed,
    );
  }

  if (policeIndex >= 2) {
    return chooseFrom([forecastLines.calm, forecastLines.mild], seed);
  }

  return forecastLines.low;
}
