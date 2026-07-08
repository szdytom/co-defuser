import type { SignalRule, SignalPuzzle, LightColor } from './types';

const ALL_SYMBOLS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
];

const COLORS: LightColor[] = ['green', 'red', 'blue'];

interface HuffNode {
  weight: number;
  symbol?: string;
  left?: HuffNode;
  right?: HuffNode;
}

function buildHuffmanCodes(weights: number[]): Record<string, string> {
  const nodes: HuffNode[] = ALL_SYMBOLS.map((s, i) => ({ symbol: s, weight: weights[i] }));

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.weight - b.weight);
    const left = nodes.shift()!;
    const right = nodes.shift()!;
    nodes.push({ weight: left.weight + right.weight, left, right });
  }

  const root = nodes[0];
  const codes: Record<string, string> = {};

  function traverse(node: HuffNode, prefix: string) {
    if (node.symbol) {
      codes[node.symbol] = prefix.replace(/0/g, '.').replace(/1/g, '-');
      return;
    }
    if (node.left) traverse(node.left, prefix + '0');
    if (node.right) traverse(node.right, prefix + '1');
  }

  traverse(root, '');
  return codes;
}

export function generateRule(rng: { next(): number }): SignalRule {
  const codeSets = COLORS.map(color => {
    const weights = ALL_SYMBOLS.map(() => Math.floor(rng.next() * 10000) + 1);
    const codeMap = buildHuffmanCodes(weights);
    return { codeMap, color };
  });

  return { allSymbols: [...ALL_SYMBOLS], codeSets };
}

export function generatePuzzle(rule: SignalRule): SignalPuzzle {
  const codeSetIndex = Math.floor(Math.random() * 3);
  const codeSet = rule.codeSets[codeSetIndex];

  const shuffled = [...rule.allSymbols].sort(() => Math.random() - 0.5);
  const count = 3 + Math.floor(Math.random() * 4);
  const challengeSymbols = shuffled.slice(0, count);
  const challengeCodes = challengeSymbols.map(s => codeSet.codeMap[s]);

  const keyboardLayouts: string[][] = [];
  for (let i = 0; i < 6; i++) {
    const layout = [...rule.allSymbols].sort(() => Math.random() - 0.5);
    const mustInclude = challengeSymbols[Math.min(i, count - 1)];
    const idx = layout.indexOf(mustInclude);
    if (idx >= 22) {
      [layout[0], layout[idx]] = [layout[idx], layout[0]];
    }
    keyboardLayouts.push(layout.slice(0, 22));
  }

  return { challengeSymbols, challengeCodes, keyboardLayouts, codeSetIndex, lightColor: codeSet.color };
}

export function validatePuzzle(
  _rule: SignalRule,
  puzzle: SignalPuzzle,
  actions: unknown[],
): { correct: boolean; solved: boolean } {
  if (actions.length === 0) return { correct: false, solved: false };

  const lastAction = actions[actions.length - 1] as { input: string } | null;
  if (!lastAction || typeof lastAction.input !== 'string') {
    return { correct: false, solved: false };
  }

  const entered = lastAction.input;
  const expected = puzzle.challengeSymbols.join('');
  const correct = entered === expected;
  return { correct, solved: correct };
}
