import React from 'react';
import type { IModuleType } from '../types';
import type { MatchingSVGRule, MatchingSVGPuzzle, MatchingAction } from './types';
import { generateMatchingSVGRule, generateMatchingSVGPuzzle } from './generator';
import { MatchingSVGOperator, MatchingSVGExpert } from './MatchingModule';

export const matchingSVGModule: IModuleType<MatchingSVGRule, MatchingSVGPuzzle> = {
  id: 'matching-svg',
  displayName: '配对(符号)',

  generateRule(rng) {
    return generateMatchingSVGRule(rng);
  },

  generatePuzzle(rule) {
    return generateMatchingSVGPuzzle(rule);
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
    return React.createElement(MatchingSVGOperator, { puzzle, onAction, pressedActions, disabled, lastActionWrong });
  },

  expertComponent({ rule }) {
    return React.createElement(MatchingSVGExpert, { rule });
  },
};
