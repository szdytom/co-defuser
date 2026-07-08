import React from 'react';
import type { IModuleType } from '../types';
import type { MatchingSVGRule, MatchingSVGPuzzle } from './types';
import { generateMatchingSVGRule, generateMatchingSVGPuzzle } from './generator';
import { validateMatchingAction } from '../matching-common/generator';
import { createMatchingOperator, createMatchingExpert } from '../matching-common/MatchingModule';
import { RenderSymbol } from '../keyboard-svg/svg-utils';
import type { SVGSymbol } from '../keyboard-svg/types';

const renderSymbol = (sym: SVGSymbol, size: number) =>
  React.createElement(RenderSymbol, { symbol: sym, size });

const MatchingOperator = createMatchingOperator(renderSymbol);
const MatchingExpert = createMatchingExpert(
  renderSymbol,
  '配对模块 (符号)',
  '你面前有 12 个带有符号的按钮，需要两两配对成 6 对。以下为全部 12 组配对参照表，每行展示 3 组。先选一个按钮，再选另一个，按下确认键配对。配对错误会清空当前选择。',
  (rule: MatchingSVGRule) => Array.from({ length: 24 }, (_, i) => ({ a: rule.symbols[i * 2], b: rule.symbols[i * 2 + 1] })),
);

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
    return validateMatchingAction(actions, puzzle.buttonRuleIndices);
  },

  operatorComponent(props) {
    return React.createElement(MatchingOperator, props);
  },

  expertComponent(props) {
    return React.createElement(MatchingExpert, props);
  },
};
