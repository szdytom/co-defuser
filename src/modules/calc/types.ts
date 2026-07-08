export type OpKind = 'add' | 'sub' | 'mul' | 'mod';

export type ConditionDesc =
  | { kind: 'odd' }
  | { kind: 'even' }
  | { kind: 'eq'; values: number[] }
  | { kind: 'prime' }
  | { kind: 'composite' };

export interface DecisionBranch {
  condition: ConditionDesc;
  nextState: number;
}

export interface CalcState {
  op: OpKind;
  branches: DecisionBranch[];
}

export interface CalcRule {
  states: CalcState[];
}

export interface CalcRound {
  flashValue: number;
  expectedX: number;
}

export interface CalcPuzzle {
  rounds: CalcRound[];
}
