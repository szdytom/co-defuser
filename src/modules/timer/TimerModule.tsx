import React, { useState, useEffect, useRef } from 'react';
import type { TimerPuzzle, TimerRule } from './types';
import { generateNewTarget } from './generator';
import './TimerModule.css';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const TimerOperator: React.FC<{
  puzzle: TimerPuzzle;
  onAction: (action: unknown) => void;
  pressedActions: unknown[];
  disabled: boolean;
  lastActionWrong: boolean;
  timeRemaining?: number;
  otherModulesSolved?: boolean;
}> = ({ puzzle, onAction, pressedActions, disabled, lastActionWrong, timeRemaining = 0, otherModulesSolved = false }) => {
  const [currentTarget, setCurrentTarget] = useState(puzzle.initialTargetTime);
  const timeoutFired = useRef(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (disabled) return;
    if (lastActionWrong && initialized.current) {
      timeoutFired.current = false;
      setCurrentTarget(generateNewTarget(timeRemaining));
    }
    initialized.current = true;
  }, [lastActionWrong]);

  useEffect(() => {
    if (disabled || pressedActions.length > 0) {
      timeoutFired.current = false;
      return;
    }
    if (!timeoutFired.current && timeRemaining <= currentTarget - 5 && initialized.current) {
      timeoutFired.current = true;
      onAction({ kind: 'timeout' });
    }
  }, [timeRemaining]);

  const handlePress = () => {
    if (disabled || pressedActions.length > 0) return;
    const inWindow = Math.abs(timeRemaining - currentTarget) <= 5;
    const allDoneEarly = otherModulesSolved && timeRemaining >= currentTarget;
    if (inWindow || allDoneEarly) {
      onAction({ kind: 'press' });
    }
  };

  return (
    <div className={`timer-module ${lastActionWrong ? 'shake-module' : ''}`}>
      <div className="timer-display">
        <span className="timer-number">{pressedActions.length > 0 ? '✓' : formatTime(currentTarget)}</span>
      </div>
      <button
        className="timer-defuse-btn"
        onClick={handlePress}
        disabled={disabled || pressedActions.length > 0}
      >
        解除
      </button>
    </div>
  );
};

export const TimerExpert: React.FC<{ rule: TimerRule }> = () => {
  return (
    <div className="manual-section">
      <h3>计时模块</h3>
      <p className="manual-rule-text">
        在此模块中，操作员会看到一个倒计时显示（格式 M:SS）和一个"解除"按钮。
        操作员需要根据以下规则决定何时按下按钮：
      </p>
      <ul className="manual-rule-text" style={{ marginTop: 8, paddingLeft: 20 }}>
        <li>当 <strong>其他所有模块都已解除</strong>，且当前剩余时间 <strong>大于等于</strong> 显示的时间时，可以立即按下按钮。</li>
        <li>或，当当前剩余时间与显示的时间 <strong>相差不超过 ±5 秒</strong> 时，可以按下按钮。</li>
      </ul>
      <p className="manual-rule-text" style={{ marginTop: 8 }}>
        按错或超时（未在显示的时间到达前按下）将计一次失误，并显示一个新的倒计时（总是小于当前剩余时间）。
      </p>
    </div>
  );
};
