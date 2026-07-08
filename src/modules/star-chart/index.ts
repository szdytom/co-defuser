import React from 'react';
import type { IModuleType } from '../types';
import type { StarChartRule, StarChartPuzzle } from './types';
import { generateRule, generatePuzzle, validatePuzzle } from './generator';
import { StarChartOperator, StarChartExpert } from './StarChartModule';

export const starChartModule: IModuleType<StarChartRule, StarChartPuzzle> = {
  id: 'star-chart',
  displayName: '星图',

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
    return React.createElement(StarChartOperator, props);
  },

  expertComponent(props) {
    return React.createElement(StarChartExpert, props);
  },
};
