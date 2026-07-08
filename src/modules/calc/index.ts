import React from 'react';
import type { IModuleType } from '../types';
import type { CalcRule, CalcPuzzle } from './types';
import { generateRule, generatePuzzle, validatePuzzle } from './generator';
import { CalcOperator, CalcExpert } from './CalcModule';

export const calcModule: IModuleType<CalcRule, CalcPuzzle> = {
  id: 'calc',
  displayName: '计算',

  generateRule(rng) {
    return generateRule(rng);
  },

  generatePuzzle(rule) {
    return generatePuzzle(rule);
  },

  validate(rule, puzzle, actions) {
    return validatePuzzle(rule, puzzle, actions);
  },

  operatorComponent(props) {
    return React.createElement(CalcOperator, props);
  },

  expertComponent(props) {
    return React.createElement(CalcExpert, props);
  },
};
