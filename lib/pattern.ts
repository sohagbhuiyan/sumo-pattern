export const SHOW_SECONDS = 10;

export function levelConfig(level: number) {
  const size = level <= 4 ? 3 : 4; // 3x3 -> 4x4
  const length = Math.min(3 + level, size * size);
  return { size, length };
}

export function generatePattern(size: number, length: number): number[] {
  const total = size * size;
  const result: number[] = [];
  while (result.length < length) {
    const n = Math.floor(Math.random() * total);
    if (!result.includes(n)) result.push(n);
  }
  return result;
}

export function isSame(a: number[], b: number[]) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}