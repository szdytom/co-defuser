import type { MemoryRule, MemoryPuzzle, StageRuleAction, StageRule } from './types';

function shuffle<T>(arr: T[], rng: { next(): number }): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateMemoryRule(rng: { next(): number }): MemoryRule {
  const stages: [StageRule, StageRule, StageRule, StageRule, StageRule] = [] as any;

  for (let stageIdx = 1; stageIdx <= 5; stageIdx++) {
    const actions: StageRuleAction[] = [];
    for (let display = 1; display <= 4; display++) {
      let action: StageRuleAction;

      if (stageIdx === 1) {
        if (rng.next() < 0.5) {
          action = { kind: 'position', position: Math.floor(rng.next() * 4) };
        } else {
          action = { kind: 'label', label: Math.floor(rng.next() * 4) + 1 };
        }
      } else {
        const refProb = [0, 0, 0.2, 0.4, 0.6, 1.0][stageIdx];
        if (rng.next() < refProb) {
          const refStage = Math.floor(rng.next() * (stageIdx - 1)) + 1;
          if (rng.next() < 0.5) {
            action = { kind: 'samePosition', stage: refStage };
          } else {
            action = { kind: 'sameLabel', stage: refStage };
          }
        } else {
          if (rng.next() < 0.5) {
            action = { kind: 'position', position: Math.floor(rng.next() * 4) };
          } else {
            action = { kind: 'label', label: Math.floor(rng.next() * 4) + 1 };
          }
        }
      }
      actions.push(action);
    }
    stages[stageIdx - 1] = { actions: actions as [StageRuleAction, StageRuleAction, StageRuleAction, StageRuleAction] };
  }

  return { stages };
}

export function generateMemoryPuzzle(_rule: MemoryRule): MemoryPuzzle {
  const rng = { next: () => Math.random() };
  const buttonLabelSets = Array.from({ length: 5 }, () =>
    shuffle([1, 2, 3, 4], rng) as [number, number, number, number]
  ) as [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]];
  const displayValues: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (let i = 0; i < 5; i++) {
    displayValues[i] = Math.floor(Math.random() * 4) + 1;
  }
  return {
    buttonLabelSets,
    displayValues,
  };
}
