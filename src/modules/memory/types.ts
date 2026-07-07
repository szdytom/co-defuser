export interface MemoryAction {
  pressedPosition: number;
}

export type StageRuleAction =
  | { kind: 'position'; position: number }
  | { kind: 'label'; label: number }
  | { kind: 'samePosition'; stage: number }
  | { kind: 'sameLabel'; stage: number };

export interface StageRule {
  actions: [StageRuleAction, StageRuleAction, StageRuleAction, StageRuleAction];
}

export interface MemoryRule {
  stages: [StageRule, StageRule, StageRule, StageRule, StageRule];
}

export interface MemoryPuzzle {
  buttonLabelSets: [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]];
  displayValues: [number, number, number, number, number];
}
