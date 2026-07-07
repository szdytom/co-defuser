import type { IModuleType } from '../types';
import type { KeyboardDotRule, KeyboardDotPuzzle } from './types';
import { generateDotGrid, generateDotPuzzle } from './dot-utils';
import { KbDotOperator, KbDotExpert } from './KeyboardDotModule';

export const keyboardDotModule: IModuleType<KeyboardDotRule, KeyboardDotPuzzle> = {
  id: 'keyboard-dot',
  name: '键盘(点阵)',

  generateRule(rng) {
    return { grid: generateDotGrid(rng) };
  },

  generatePuzzle(rule) {
    return generateDotPuzzle(rule);
  },

  validate(_rule, puzzle, actions) {
    if (actions.length === 0) return { correct: false, solved: false };
    const stepIdx = actions.length - 1;
    const lastAction = actions[stepIdx] as { symbolIdx: number } | null;
    if (!lastAction || typeof lastAction.symbolIdx !== 'number') return { correct: false, solved: false };

    const expectedIdx = puzzle.correctOrder[stepIdx];
    if (expectedIdx === undefined) return { correct: false, solved: false };

    const correct = lastAction.symbolIdx === expectedIdx;
    const solved = correct && actions.length === puzzle.correctOrder.length;
    return { correct, solved };
  },

  operatorComponent({ puzzle, onAction, pressedActions, disabled, lastActionWrong }) {
    return KbDotOperator({ puzzle, onAction, pressedActions, disabled, lastActionWrong });
  },

  expertComponent({ rule }) {
    return KbDotExpert({ rule });
  },
};
