import type { ReactNode } from 'react';

export type OperatorAction = unknown;

export interface IModuleType<TRule, TPuzzle> {
  id: string;
  displayName: string;
  generateRule: (rng: { next(): number }) => TRule;
  generatePuzzle: (rule: TRule) => TPuzzle;
  validate: (rule: TRule, puzzle: TPuzzle, actions: OperatorAction[]) => {
    correct: boolean;
    solved: boolean;
  };
  operatorComponent: (props: {
    puzzle: TPuzzle;
    onAction: (action: OperatorAction) => void;
    pressedActions: OperatorAction[];
    disabled: boolean;
    lastActionWrong: boolean;
    timeRemaining?: number;
    otherModulesSolved?: boolean;
  }) => ReactNode;
  expertComponent: (props: { rule: TRule }) => ReactNode;
}
