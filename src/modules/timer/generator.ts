import type { TimerRule, TimerPuzzle } from './types';

export function generateTimerRule(_rng: { next(): number }): TimerRule {
  return {};
}

export function generateTimerPuzzle(_rule: TimerRule): TimerPuzzle {
  const maxTarget = 270;
  const minTarget = 30;
  const possibleTimes: number[] = [];
  for (let t = minTarget; t <= maxTarget; t += 5) {
    possibleTimes.push(t);
  }
  const target = possibleTimes[Math.floor(Math.random() * possibleTimes.length)];
  return { initialTargetTime: target };
}

export function generateNewTarget(currentTimeRemaining: number): number {
  const maxTarget = Math.max(15, currentTimeRemaining - 5);
  const minTarget = 10;
  const possibleTimes: number[] = [];
  for (let t = minTarget; t <= maxTarget; t += 5) {
    possibleTimes.push(t);
  }
  if (possibleTimes.length === 0) return minTarget;
  return possibleTimes[Math.floor(Math.random() * possibleTimes.length)];
}
