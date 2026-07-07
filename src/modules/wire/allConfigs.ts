import type { WireColor } from './types';
import { ALL_COLORS } from './types';

const cache = new Map<number, WireColor[][]>();

export function allConfigs(N: number): WireColor[][] {
  const cached = cache.get(N);
  if (cached) return cached;

  const result: WireColor[][] = [];
  const total = Math.pow(ALL_COLORS.length, N);

  for (let i = 0; i < total; i++) {
    const config: WireColor[] = [];
    let v = i;
    for (let pos = 0; pos < N; pos++) {
      config.push(ALL_COLORS[v % ALL_COLORS.length]);
      v = Math.floor(v / ALL_COLORS.length);
    }
    result.push(config);
  }

  cache.set(N, result);
  return result;
}
