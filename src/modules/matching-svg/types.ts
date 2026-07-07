import type { SVGSymbol } from '../keyboard-svg/types';

export interface MatchingAction {
  kind: 'pair';
  a: number;
  b: number;
}

export interface MatchingSVGRule {
  symbols: SVGSymbol[];
}

export interface MatchingSVGPuzzle {
  buttonPatterns: SVGSymbol[];
  buttonRuleIndices: number[];
}
