export interface TimerAction {
  kind: 'press' | 'timeout';
}

export interface TimerRule {}

export interface TimerPuzzle {
  initialTargetTime: number;
}
