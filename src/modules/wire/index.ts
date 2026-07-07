import type { IModuleType } from '../types';
import type { WireRule, WirePuzzle } from './types';
import { generateWireRule, generateWirePuzzle, evaluateTree } from './generator';
import { WireOperator, WireExpert } from './WireModule';

export const wireModule: IModuleType<WireRule, WirePuzzle> = {
  id: 'wire',
  name: '剪线',

  generateRule(rng) {
    return generateWireRule(rng);
  },

  generatePuzzle(rule) {
    return generateWirePuzzle(rule);
  },

  validate(rule, puzzle, actions) {
    if (actions.length === 0) return { correct: false, solved: false };
    const a = actions[actions.length - 1] as { wireIndex: number } | null;
    if (!a || typeof a.wireIndex !== 'number') return { correct: false, solved: false };
    const tree = rule.trees[puzzle.colors.length];
    if (!tree) return { correct: false, solved: false };
    const correctIndex = evaluateTree(tree, puzzle.colors);
    const correct = a.wireIndex === correctIndex;
    return { correct, solved: correct };
  },

  operatorComponent({ puzzle, onAction, pressedActions, disabled, lastActionWrong }) {
    return WireOperator({ puzzle, onAction, pressedActions, disabled, lastActionWrong });
  },

  expertComponent({ rule }) {
    return WireExpert({ rule });
  },
};
