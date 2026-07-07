import type { DotPattern } from '../keyboard-dot/types';
import { randomPattern, patternKey } from '../keyboard-dot/dot-utils';
import type { MatchingDotRule, MatchingDotPuzzle } from './types';

function shuffle<T>(arr: T[], rng: { next(): number }): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateMatchingDotRule(rng: { next(): number }): MatchingDotRule {
  const patterns: DotPattern[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < 48; i++) {
    let pat: DotPattern;
    let attempts = 0;
    do {
      pat = randomPattern(rng);
      attempts++;
    } while (seen.has(patternKey(pat)) && attempts < 500);
    seen.add(patternKey(pat));
    patterns.push(pat);
  }
  return { patterns };
}

export function generateMatchingDotPuzzle(rule: MatchingDotRule): MatchingDotPuzzle {
  const pairCount = 6;
  const usedPairs = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], { next: () => Math.random() }).slice(0, pairCount);
  const indices: number[] = [];
  for (const p of usedPairs) {
    indices.push(p * 2, p * 2 + 1);
  }
  const shuffled = shuffle(indices, { next: () => Math.random() });
  const buttonPatterns = shuffled.map(i => rule.patterns[i]);
  return {
    buttonPatterns,
    buttonRuleIndices: shuffled,
  };
}
