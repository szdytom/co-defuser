import type { WireColor, WireRule, WirePuzzle, DecisionTree, LeafAction } from './types';
import { ALL_COLORS } from './types';
import { allConfigs } from './allConfigs';
import { CONDITION_POOL } from './conditions';

const MAX_TREE_DEPTH = 5;
const WIRE_COUNTS = [3, 4, 5, 6];

export function generateWireRule(rng: { next(): number }): WireRule {
  const trees: Record<number, DecisionTree> = {};

  for (const N of WIRE_COUNTS) {
    const fullSet = allConfigs(N);
    trees[N] = generateNode(rng, fullSet, 0);
  }

  return { trees };
}

function generateNode(rng: { next(): number }, set: WireColor[][], depth: number): DecisionTree {
  if (depth >= MAX_TREE_DEPTH) {
    return createLeaf(rng, set);
  }

  const shuffled = shuffleArray(CONDITION_POOL.slice(), rng);

  for (const cond of shuffled) {
    const trueSet: WireColor[][] = [];
    const falseSet: WireColor[][] = [];
    for (const config of set) {
      if (cond.test(config)) {
        trueSet.push(config);
      } else {
        falseSet.push(config);
      }
    }

    if (trueSet.length > 0 && falseSet.length > 0) {
      return {
        kind: 'if',
        condition: cond,
        trueBranch: generateNode(rng, trueSet, depth + 1),
        falseBranch: generateNode(rng, falseSet, depth + 1),
      };
    }
  }

  return createLeaf(rng, set);
}

function createLeaf(rng: { next(): number }, set: WireColor[][]): DecisionTree {
  const N = set[0].length;
  const actions: LeafAction[] = [];

  for (let i = 0; i < N; i++) {
    actions.push({ kind: 'absolute', index: i });
  }

  for (const color of ALL_COLORS) {
    const alwaysPresent = set.every(config => config.includes(color));
    if (alwaysPresent) {
      actions.push({ kind: 'first_of', color });
      actions.push({ kind: 'last_of', color });
    }
  }

  const chosen = actions[Math.floor(rng.next() * actions.length)];
  return { kind: 'leaf', action: chosen };
}

export function evaluateTree(tree: DecisionTree, config: WireColor[]): number {
  if (tree.kind === 'leaf') {
    return resolveAction(tree.action, config);
  }
  if (tree.condition.test(config)) {
    return evaluateTree(tree.trueBranch, config);
  }
  return evaluateTree(tree.falseBranch, config);
}

function resolveAction(action: LeafAction, config: WireColor[]): number {
  switch (action.kind) {
    case 'absolute':
      return action.index;
    case 'first_of':
      return config.indexOf(action.color);
    case 'last_of':
      return config.lastIndexOf(action.color);
  }
}

export function generateWirePuzzle(rule: WireRule): WirePuzzle {
  const N = WIRE_COUNTS[Math.floor(Math.random() * WIRE_COUNTS.length)];
  const colors: WireColor[] = [];
  for (let i = 0; i < N; i++) {
    colors.push(ALL_COLORS[Math.floor(Math.random() * ALL_COLORS.length)]);
  }
  const correctIndex = evaluateTree(rule.trees[N], colors);
  return { colors, correctIndex };
}

function shuffleArray<T>(arr: T[], rng: { next(): number }): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
