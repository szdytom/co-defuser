import type { CalcRule, CalcPuzzle, CalcState, OpKind, ConditionDesc, DecisionBranch } from './types';

const OPS: OpKind[] = ['add', 'sub', 'mul', 'mod'];
const OP_LABELS: Record<OpKind, string> = { add: '加', sub: '减', mul: '乘', mod: '除取余' };

function shuffle<T>(arr: T[], rng: { next(): number }): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 0-9 partitioned by conditions. Each condition must split at least 1 out.
const CONDITION_POOL: ConditionDesc[] = [
  { kind: 'odd' },
  { kind: 'even' },
  { kind: 'prime' },
  { kind: 'composite' },
  { kind: 'eq', values: [0] },
  { kind: 'eq', values: [1] },
  { kind: 'eq', values: [2] },
  { kind: 'eq', values: [3] },
  { kind: 'eq', values: [4] },
  { kind: 'eq', values: [5] },
  { kind: 'eq', values: [6] },
  { kind: 'eq', values: [7] },
  { kind: 'eq', values: [8] },
  { kind: 'eq', values: [9] },
];

function matches(cond: ConditionDesc, x: number): boolean {
  switch (cond.kind) {
    case 'odd': return x % 2 === 1;
    case 'even': return x % 2 === 0;
    case 'prime': return [2, 3, 5, 7].includes(x);
    case 'composite': return [4, 6, 8, 9].includes(x);
    case 'eq': return cond.values.includes(x);
  }
}

function satisfiedBy(cond: ConditionDesc): number[] {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => matches(cond, x));
}

function unsatisfiedBy(cond: ConditionDesc): number[] {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => !matches(cond, x));
}

// Build a decision tree: partition domain into 2-5 groups, pick a distinct state per group
function generateBranches(rng: { next(): number }, stateCount: number): DecisionBranch[] {
  const domain = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const branchCount = 2 + Math.floor(rng.next() * 4); // 2-5

  // Pick distinct states for each branch
  const availableStates = shuffle([0, 1, 2, 3, 4, 5].filter(s => s < stateCount), rng);
  const usedStates = availableStates.slice(0, branchCount);

  const branches: DecisionBranch[] = [];
  let remaining = [...domain];
  let stateIdx = 0;

  while (remaining.length > 0 && stateIdx < usedStates.length) {
    const isLast = remaining.length <= 1 || stateIdx === usedStates.length - 1;

    if (isLast) {
      branches.push({ condition: { kind: 'eq', values: [...remaining] }, nextState: usedStates[stateIdx] });
      break;
    }

    const candidates = CONDITION_POOL.filter(cond => {
      const yes = satisfiedBy(cond).filter(v => remaining.includes(v));
      const no = unsatisfiedBy(cond).filter(v => remaining.includes(v));
      return yes.length > 0 && no.length > 0;
    });

    if (candidates.length === 0) {
      branches.push({ condition: { kind: 'eq', values: [remaining[0]] }, nextState: usedStates[stateIdx] });
      remaining = remaining.slice(1);
      stateIdx++;
      continue;
    }

    const chosen = candidates[Math.floor(rng.next() * candidates.length)];
    const yes = satisfiedBy(chosen).filter(v => remaining.includes(v));
    branches.push({ condition: chosen, nextState: usedStates[stateIdx] });
    remaining = remaining.filter(v => !yes.includes(v));
    stateIdx++;
  }

  return branches;
}

function applyOp(x: number, i: number, op: OpKind): number {
  switch (op) {
    case 'add': return (x + i) % 10;
    case 'sub': return Math.abs(x - i) % 10;
    case 'mul': return (x * i) % 10;
    case 'mod': return i === 0 ? x : (x % i);
  }
}

function evaluateBranches(branches: DecisionBranch[], x: number): number {
  for (const br of branches) {
    if (matches(br.condition, x)) return br.nextState;
  }
  return branches[branches.length - 1].nextState;
}

export function generateRule(rng: { next(): number }): CalcRule {
  const states: CalcState[] = [];
  for (let i = 0; i < 6; i++) {
    const op = OPS[Math.floor(rng.next() * OPS.length)];
    const branches = generateBranches(rng, 6);
    states.push({ op, branches });
  }
  return { states };
}

export function generatePuzzle(rule: CalcRule): CalcPuzzle {
  const rounds: CalcPuzzle['rounds'] = [];
  let x = 0;
  let stateIdx = 0;

  for (let r = 0; r < 4; r++) {
    const state = rule.states[stateIdx];
    const flashValue = state.op === 'mod'
      ? 1 + Math.floor(Math.random() * 9)  // 1-9, avoid division by zero
      : Math.floor(Math.random() * 10);
    x = applyOp(x, flashValue, state.op);
    rounds.push({ flashValue, expectedX: x });
    stateIdx = evaluateBranches(state.branches, x);
  }

  return { rounds };
}

export function validatePuzzle(
  _rule: CalcRule,
  puzzle: CalcPuzzle,
  actions: unknown[],
): { correct: boolean; solved: boolean } {
  if (actions.length === 0) return { correct: false, solved: false };
  const last = actions[actions.length - 1] as { digit: string } | null;
  if (!last || typeof last.digit !== 'string') return { correct: false, solved: false };

  const entered = last.digit;
  const expected = puzzle.rounds.map(r => r.expectedX).join('');
  const correct = entered === expected;
  return { correct, solved: correct };
}

export { OP_LABELS };
