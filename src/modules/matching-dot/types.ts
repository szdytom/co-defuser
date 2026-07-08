import type { DotPattern } from '../keyboard-dot/types';

export interface MatchingDotRule {
  patterns: DotPattern[];
}

export interface MatchingDotPuzzle {
  buttonPatterns: DotPattern[];
  buttonRuleIndices: number[];
}
