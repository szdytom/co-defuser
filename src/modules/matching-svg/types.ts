import type { SVGSymbol } from '../keyboard-svg/types';

export interface MatchingSVGRule {
  symbols: SVGSymbol[];
}

export interface MatchingSVGPuzzle {
  buttonPatterns: SVGSymbol[];
  buttonRuleIndices: number[];
}
