export type WireColor = 'red' | 'blue' | 'yellow' | 'white' | 'black' | 'green';

export const ALL_COLORS: WireColor[] = ['red', 'blue', 'yellow', 'white', 'black', 'green'];

export interface AtomCondition {
  desc: string;
  test: (config: WireColor[]) => boolean;
}

export type DecisionTree =
  | { kind: 'if'; condition: AtomCondition; trueBranch: DecisionTree; falseBranch: DecisionTree }
  | { kind: 'leaf'; action: LeafAction }

export type LeafAction =
  | { kind: 'absolute'; index: number }
  | { kind: 'first_of'; color: WireColor }
  | { kind: 'last_of'; color: WireColor }

export interface WireRule {
  trees: Record<number, DecisionTree>;
}

export interface WirePuzzle {
  colors: WireColor[];
  correctIndex: number;
}
