import React from 'react';
import type { IModuleType } from '../types';
import type { MatchingDotRule, MatchingDotPuzzle } from './types';
import { generateMatchingDotRule, generateMatchingDotPuzzle } from './generator';
import { validateMatchingAction } from '../matching-common/generator';
import { createMatchingOperator, createMatchingExpert } from '../matching-common/MatchingModule';
import { RenderDotPattern } from '../keyboard-dot/dot-utils';
import type { DotPattern } from '../keyboard-dot/types';

const renderPattern = (pat: DotPattern, size: number) =>
  React.createElement(RenderDotPattern, { pattern: pat, size, color: 'var(--color-accent)' });

const MatchingOperator = createMatchingOperator(renderPattern);
const MatchingExpert = createMatchingExpert(
  renderPattern,
  '配对模块 (点阵)',
  '你面前有 12 个带有点阵图案的按钮，需要两两配对成 6 对。以下为全部 12 组配对参照表，每行展示 3 组。先选一个按钮，再选另一个，按下确认键配对。配对错误会清空当前选择。',
  (rule: MatchingDotRule) => Array.from({ length: 24 }, (_, i) => ({ a: rule.patterns[i * 2], b: rule.patterns[i * 2 + 1] })),
);

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
    return validateMatchingAction(actions, puzzle.buttonRuleIndices);
  },

  operatorComponent(props) {
    return React.createElement(MatchingOperator, props);
  },

  expertComponent(props) {
    return React.createElement(MatchingExpert, props);
  },
};
