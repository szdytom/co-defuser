export type ShapeKind = 'circle' | 'triangle' | 'square' | 'hexagon' | 'star';
export type FillKind = 'solid' | 'hstripe' | 'vstripe' | 'dstripe' | 'checker' | 'dots' | 'waves' | 'empty';
export type DecoKind = 'triangles' | 'dots' | 'circles' | 'diamonds';

export interface SVGSymbol {
  shape: ShapeKind;
  fill: FillKind;
  deco: DecoKind;
  hue: number;
  decoCount: number;
}

export interface KeyboardSVGRule {
  grid: SVGSymbol[][];
}

export interface KeyboardSVGPuzzle {
  targetSymbols: SVGSymbol[];
  correctOrder: number[];
}
