export type DotPattern = number[];

export interface KeyboardDotRule {
  grid: DotPattern[][];
}

export interface KeyboardDotPuzzle {
  targetPatterns: DotPattern[];
  correctOrder: number[];
}
