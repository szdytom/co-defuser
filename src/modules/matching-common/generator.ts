export function shuffle<T>(arr: T[], rng: { next(): number }): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generatePairsPuzzle<TPattern>(
  rulePatterns: TPattern[],
  pairCount: number = 6,
): { buttonPatterns: TPattern[]; buttonRuleIndices: number[] } {
  const totalPairs = rulePatterns.length / 2;
  const allPairIndices = Array.from({ length: totalPairs }, (_, i) => i);
  const usedPairs = shuffle(allPairIndices, { next: () => Math.random() }).slice(0, pairCount);
  const indices: number[] = [];
  for (const p of usedPairs) {
    indices.push(p * 2, p * 2 + 1);
  }
  const shuffled = shuffle(indices, { next: () => Math.random() });
  const buttonPatterns = shuffled.map(i => rulePatterns[i]);
  return { buttonPatterns, buttonRuleIndices: shuffled };
}

export function validateMatchingAction(
  actions: unknown[],
  buttonRuleIndices: number[],
): { correct: boolean; solved: boolean } {
  if (actions.length === 0) return { correct: false, solved: false };
  const last = actions[actions.length - 1] as { kind: string; a: number; b: number } | null;
  if (!last || last.kind !== 'pair') return { correct: false, solved: false };

  const idxA = buttonRuleIndices[last.a];
  const idxB = buttonRuleIndices[last.b];
  const pairA = Math.floor(idxA / 2);
  const pairB = Math.floor(idxB / 2);
  const correct = pairA === pairB;
  const solved = correct && actions.length === 6;
  return { correct, solved };
}
