export const RACE_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200] as const;

export const HORSES_PER_RACE = 10;

export const DEFAULT_RACE_COUNT = 6;

function parsePositiveNumber(value: unknown): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/**
 * Multiplies race speed in the UI (Track animation) and scales internal delays.
 *
 * - Default: 1 (normal speed)
 * - Example (fast tests): VITE_RACE_SPEED_MULTIPLIER=10
 */
export const RACE_SPEED_MULTIPLIER =
  parsePositiveNumber(import.meta.env.VITE_RACE_SPEED_MULTIPLIER) ?? 1;

/** Base delay between races, scaled down by speed multiplier. */
export const AUTO_START_DELAY_MS = Math.max(0, Math.round(1000 / RACE_SPEED_MULTIPLIER));
