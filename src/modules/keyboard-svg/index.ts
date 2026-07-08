import React from 'react';
import type { IModuleType } from '../types';
import type { KeyboardSVGRule, KeyboardSVGPuzzle } from './types';
import { generateGrid, generatePuzzle } from './svg-utils';
import { KbSvgOperator, KbSvgExpert } from './KeyboardSVGModule';

export const keyboardSVGModule: IModuleType<KeyboardSVGRule, KeyboardSVGPuzzle> = {
  id: 'keyboard-svg',
  displayName: '键盘(符号)',

  generateRule(rng) {
    return { grid: generateGrid(rng) };
  },

  generatePuzzle(rule) {
    return generatePuzzle(rule);
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

  operatorComponent(props) {
    return React.createElement(KbSvgOperator, props);
  },

  expertComponent(props) {
    return React.createElement(KbSvgExpert, props);
  },
};
