import type { IModuleType, OperatorAction } from '../modules/types';

export type GameRole = 'operator' | 'expert';

export type GamePhase = 'start' | 'playing' | 'win' | 'lose';

export interface PuzzleInstance<P = unknown, R = unknown> {
  moduleType: IModuleType<R, P>;
  rule: R;
  puzzle: P;
  pressedActions: OperatorAction[];
  solved: boolean;
  index: number;
}

export interface GameState {
  phase: GamePhase;
  role: GameRole;
  seed: string;
  puzzles: PuzzleInstance[];
  mistakes: number;
  maxMistakes: number;
  timerSeconds: number;
  timeRemaining: number;
  lastWrongIdx: number;
  wrongCount: number;
}
