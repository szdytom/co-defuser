export const ALL_MODULE_IDS = ['wire', 'keyboard-svg', 'keyboard-dot', 'memory', 'timer', 'matching-svg', 'matching-dot', 'signal'];

export const TIME_OPTIONS = [
  { label: '2分', seconds: 120 },
  { label: '3分', seconds: 180 },
  { label: '5分', seconds: 300 },
  { label: '10分', seconds: 600 },
] as const;

export interface GameConfig {
  timerSeconds: number;
  maxMistakes: number;
  moduleCount: number;
  enabledModules: string[];
}

export const DEFAULT_CONFIG: GameConfig = {
  timerSeconds: 300,
  maxMistakes: 3,
  moduleCount: 4,
  enabledModules: [...ALL_MODULE_IDS],
};
