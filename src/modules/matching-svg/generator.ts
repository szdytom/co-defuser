import type { SVGSymbol } from '../keyboard-svg/types';
import { randomSymbol, symbolKey } from '../keyboard-svg/svg-utils';
import type { MatchingSVGRule, MatchingSVGPuzzle } from './types';
import { generatePairsPuzzle } from '../matching-common/generator';

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
  return generatePairsPuzzle(rule.symbols);
}
