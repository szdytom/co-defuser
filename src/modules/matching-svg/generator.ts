import type { SVGSymbol } from '../keyboard-svg/types';
import { randomSymbol, symbolKey } from '../keyboard-svg/svg-utils';
import type { MatchingSVGRule, MatchingSVGPuzzle } from './types';

function shuffle<T>(arr: T[], rng: { next(): number }): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateMatchingSVGRule(rng: { next(): number }): MatchingSVGRule {
  const symbols: SVGSymbol[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < 48; i++) {
    let sym: SVGSymbol;
    let attempts = 0;
    do {
      sym = randomSymbol(rng);
      attempts++;
    } while (seen.has(symbolKey(sym)) && attempts < 500);
    seen.add(symbolKey(sym));
    symbols.push(sym);
  }
  return { symbols };
}

export function generateMatchingSVGPuzzle(rule: MatchingSVGRule): MatchingSVGPuzzle {
  const pairCount = 6;
  const usedPairs = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], { next: () => Math.random() }).slice(0, pairCount);
  const indices: number[] = [];
  for (const p of usedPairs) {
    indices.push(p * 2, p * 2 + 1);
  }
  const shuffled = shuffle(indices, { next: () => Math.random() });
  const buttonPatterns = shuffled.map(i => rule.symbols[i]);
  return {
    buttonPatterns,
    buttonRuleIndices: shuffled,
  };
}
