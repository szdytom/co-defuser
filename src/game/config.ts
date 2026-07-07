export interface GameConfig {
  timerSeconds: number;
  maxMistakes: number;
  wireModuleCount: number;
  keyboardSVGCount: number;
  keyboardDotCount: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  timerSeconds: 300,
  maxMistakes: 3,
  wireModuleCount: 1,
  keyboardSVGCount: 1,
  keyboardDotCount: 1,
};
