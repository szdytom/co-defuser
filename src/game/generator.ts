import { createPRNG, hashString } from '../seed';
import type { GameState, PuzzleInstance } from './types';
import type { GameConfig } from './config';
import { DEFAULT_CONFIG } from './config';
import { MODULE_REGISTRY } from '../modules/registry';

export function generateGame(seed: string, config: GameConfig = DEFAULT_CONFIG): GameState {
  const seedNum = hashString(seed);
  const rng = createPRNG(seedNum);

  const puzzles: PuzzleInstance[] = [];

  const moduleSpecs: { id: string; count: number }[] = [
    { id: 'wire', count: config.wireModuleCount },
    { id: 'keyboard-svg', count: config.keyboardSVGCount },
    { id: 'keyboard-dot', count: config.keyboardDotCount },
    { id: 'memory', count: config.memoryModuleCount },
  ];

  let moduleIdx = 0;
  for (const spec of moduleSpecs) {
    const mod = MODULE_REGISTRY[spec.id];
    if (!mod) continue;

    for (let i = 0; i < spec.count; i++) {
      const rule = mod.generateRule(rng);
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
