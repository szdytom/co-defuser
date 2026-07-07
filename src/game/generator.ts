import { createPRNG, hashString } from '../seed';
import type { GameState, PuzzleInstance, ManualData } from './types';
import type { GameConfig } from './config';
import { DEFAULT_CONFIG } from './config';
import { MODULE_REGISTRY, listModules } from '../modules/registry';

function shuffle<T>(arr: T[], rng: { next(): number }): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function allocateModules(
  total: number,
  enabled: string[],
  rng: { next(): number },
): { id: string; count: number }[] {
  const hasTimer = enabled.includes('timer');
  const others = enabled.filter(id => id !== 'timer');
  const timerCount = hasTimer ? 1 : 0;
  const otherCount = total - timerCount;

  if (otherCount <= 0) {
    return hasTimer ? [{ id: 'timer', count: 1 }] : [];
  }

  if (otherCount < others.length) {
    const picked = shuffle(others, rng).slice(0, otherCount);
    const result = picked.map(id => ({ id, count: 1 }));
    if (hasTimer) result.push({ id: 'timer', count: 1 });
    return result;
  }

  const counts: Record<string, number> = {};
  for (const id of others) counts[id] = 1;
  for (let i = 0; i < otherCount - others.length; i++) {
    const pick = others[Math.floor(rng.next() * others.length)];
    counts[pick]++;
  }
  const result = Object.entries(counts).map(([id, count]) => ({ id, count }));
  if (hasTimer) result.push({ id: 'timer', count: 1 });
  return result;
}

export function generateGame(seed: string, config: GameConfig = DEFAULT_CONFIG): GameState {
  const seedNum = hashString(seed);
  const rng = createPRNG(seedNum);

  const puzzles: PuzzleInstance[] = [];
  const mathRng = { next: () => Math.random() };

  const rules: Record<string, unknown> = {};
  for (const mod of listModules()) {
    rules[mod.id] = mod.generateRule(rng);
  }

  const moduleSpecs = allocateModules(config.moduleCount, config.enabledModules, mathRng);

  const expanded: { id: string }[] = [];
  for (const spec of moduleSpecs) {
    for (let i = 0; i < spec.count; i++) {
      expanded.push({ id: spec.id });
    }
  }
  const shuffled = shuffle(expanded, mathRng);

  let moduleIdx = 0;
  for (const entry of shuffled) {
    const mod = MODULE_REGISTRY[entry.id];
    if (!mod) continue;

    const rule = rules[entry.id];
    const puzzle = mod.generatePuzzle(rule);
    moduleIdx++;
    puzzles.push({
      moduleType: mod,
      rule,
      puzzle,
      pressedActions: [],
      solved: false,
      index: moduleIdx,
    });
  }

  return {
    phase: 'playing',
    role: 'operator',
    seed,
    puzzles,
    mistakes: 0,
    maxMistakes: config.maxMistakes,
    timerSeconds: config.timerSeconds,
    timeRemaining: config.timerSeconds,
    lastWrongIdx: -1,
    wrongCount: 0,
  };
}

export function generateManual(seed: string): ManualData {
  const seedNum = hashString(seed);
  const rng = createPRNG(seedNum);

  const entries: ManualData['entries'] = [];
  for (const mod of listModules()) {
    const rule = mod.generateRule(rng);
    entries.push({ moduleType: mod, rule });
  }

  return { seed, entries };
}
