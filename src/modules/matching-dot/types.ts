import type { DotPattern } from '../keyboard-dot/types';

export interface MatchingAction {
  kind: 'pair';
  a: number;
  b: number;
}

export interface MatchingDotRule {
  patterns: DotPattern[];
}

export interface MatchingDotPuzzle {
  buttonPatterns: DotPattern[];
  buttonRuleIndices: number[];
}
