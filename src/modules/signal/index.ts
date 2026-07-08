import React from 'react';
import type { IModuleType } from '../types';
import type { SignalRule, SignalPuzzle } from './types';
import { generateRule, generatePuzzle, validatePuzzle } from './generator';
import { SignalOperator, SignalExpert } from './SignalModule';

export const signalModule: IModuleType<SignalRule, SignalPuzzle> = {
  id: 'signal',
  name: '信号',

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
    return React.createElement(SignalOperator, props);
  },

  expertComponent(props) {
    return React.createElement(SignalExpert, props);
  },
};
