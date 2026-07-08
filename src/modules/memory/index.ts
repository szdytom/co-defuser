import React from 'react';
import type { IModuleType } from '../types';
import type { MemoryRule, MemoryPuzzle, MemoryAction, StageRuleAction } from './types';
import { generateMemoryRule, generateMemoryPuzzle } from './generator';
import { MemoryOperator, MemoryExpert } from './MemoryModule';

const POSITION_NAMES = ['一', '二', '三', '四'];

function resolveAction(
  action: StageRuleAction,
  pressedActions: MemoryAction[],
  buttonLabelSets: MemoryPuzzle['buttonLabelSets'],
  currentStageIdx: number,
): number {
  switch (action.kind) {
    case 'position':
      return action.position;
    case 'label':
      return buttonLabelSets[currentStageIdx].indexOf(action.label);
    case 'samePosition': {
      const prev = pressedActions[action.stage - 1];
      return prev.pressedPosition;
    }
    case 'sameLabel': {
      const prev = pressedActions[action.stage - 1];
      const prevLabel = buttonLabelSets[action.stage - 1][prev.pressedPosition];
      return buttonLabelSets[currentStageIdx].indexOf(prevLabel);
    }
  }
}

export const memoryModule: IModuleType<MemoryRule, MemoryPuzzle> = {
  id: 'memory',
  displayName: '记忆',

  generateRule(rng) {
    return generateMemoryRule(rng);
  },

  generatePuzzle(rule) {
    return generateMemoryPuzzle(rule);
  },

  validate(rule, puzzle, actions) {
    if (actions.length === 0) return { correct: false, solved: false };

    const stageIdx = actions.length - 1;
    const stage = rule.stages[stageIdx];
    if (!stage) return { correct: false, solved: false };

    const lastAction = actions[stageIdx] as MemoryAction;
    if (lastAction == null || typeof lastAction.pressedPosition !== 'number') {
      return { correct: false, solved: false };
    }

    const displayValue = puzzle.displayValues[stageIdx];
    const expectedAction = stage.actions[displayValue - 1];

    const correctPosition = resolveAction(expectedAction, actions as MemoryAction[], puzzle.buttonLabelSets, stageIdx);
    const correct = lastAction.pressedPosition === correctPosition;
    const solved = correct && actions.length === 5;

    return { correct, solved };
  },

  operatorComponent(props) {
    return React.createElement(MemoryOperator, props);
  },

  expertComponent(props) {
    return React.createElement(MemoryExpert, props);
  },
};
