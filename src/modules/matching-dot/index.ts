import React from 'react';
import type { IModuleType } from '../types';
import type { MatchingDotRule, MatchingDotPuzzle, MatchingAction } from './types';
import { generateMatchingDotRule, generateMatchingDotPuzzle } from './generator';
import { MatchingDotOperator, MatchingDotExpert } from './MatchingModule';

export const matchingDotModule: IModuleType<MatchingDotRule, MatchingDotPuzzle> = {
  id: 'matching-dot',
  displayName: '配对(点阵)',

  generateRule(rng) {
    return generateMatchingDotRule(rng);
  },

  generatePuzzle(rule) {
    return generateMatchingDotPuzzle(rule);
  },

  validate(rule, puzzle, actions) {
    if (actions.length === 0) return { correct: false, solved: false };
    const last = actions[actions.length - 1] as MatchingAction;
    if (last.kind !== 'pair') return { correct: false, solved: false };

    const idxA = puzzle.buttonRuleIndices[last.a];
    const idxB = puzzle.buttonRuleIndices[last.b];
    const pairA = Math.floor(idxA / 2);
    const pairB = Math.floor(idxB / 2);
    const correct = pairA === pairB;
    const solved = correct && actions.length === 6;
    return { correct, solved };
  },

  operatorComponent({ puzzle, onAction, pressedActions, disabled, lastActionWrong }) {
    return React.createElement(MatchingDotOperator, { puzzle, onAction, pressedActions, disabled, lastActionWrong });
  },

  expertComponent({ rule }) {
    return React.createElement(MatchingDotExpert, { rule });
  },
};
