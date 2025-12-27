export function sampleUniqueBy<T, K>(
  arr: T[],
  count: number,
  getKey: (item: T) => K
): T[] {
  const seen = new Set<K>();
  const pool: T[] = [];
  for (const item of arr) {
    const key = getKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      pool.push(item);
    }
  }

  const n = Math.min(count, pool.length);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, n);
}

export function calculateLaneDurationSec(condition: number, distance: number) {
  const c = Math.max(1, Math.min(100, condition ?? 100));
  const t = (c - 1) / 99;

  const minFactor = 0.65;
  const maxFactor = 1.25;

  const factor = maxFactor - (maxFactor - minFactor) * t;
  return (distance * factor) / 100;
}
