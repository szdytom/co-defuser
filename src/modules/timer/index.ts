import React from 'react';
import type { IModuleType } from '../types';
import type { TimerRule, TimerPuzzle, TimerAction } from './types';
import { generateTimerRule, generateTimerPuzzle } from './generator';
import { TimerOperator, TimerExpert } from './TimerModule';

export const timerModule: IModuleType<TimerRule, TimerPuzzle> = {
  id: 'timer',
  displayName: '计时',

  generateRule(rng) {
    return generateTimerRule(rng);
  },

  generatePuzzle(rule) {
    return generateTimerPuzzle(rule);
  },

  validate(_rule, _puzzle, actions) {
    if (actions.length === 0) return { correct: false, solved: false };
    const last = actions[actions.length - 1] as TimerAction;
    if (last.kind === 'timeout') return { correct: false, solved: false };
    if (last.kind === 'press') return { correct: true, solved: true };
    return { correct: false, solved: false };
  },

  operatorComponent({ puzzle, onAction, pressedActions, disabled, lastActionWrong, timeRemaining, otherModulesSolved }) {
    return React.createElement(TimerOperator, { puzzle, onAction, pressedActions, disabled, lastActionWrong, timeRemaining, otherModulesSolved });
  },

  expertComponent() {
    return React.createElement(TimerExpert as React.FC<{ rule: TimerRule }>, { rule: {} as TimerRule });
  },
};
