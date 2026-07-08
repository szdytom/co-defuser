import type { DotPattern } from '../keyboard-dot/types';
import { randomPattern, patternKey } from '../keyboard-dot/dot-utils';
import type { MatchingDotRule, MatchingDotPuzzle } from './types';
import { generatePairsPuzzle } from '../matching-common/generator';

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
  return generatePairsPuzzle(rule.patterns);
}
