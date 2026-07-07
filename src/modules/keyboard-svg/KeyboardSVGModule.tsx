import React from 'react';
import type { KeyboardSVGRule, KeyboardSVGPuzzle } from './types';
import { RenderSymbol } from './svg-utils';

export const KbSvgOperator: React.FC<{
  puzzle: KeyboardSVGPuzzle;
  onAction: (action: unknown) => void;
  pressedActions: unknown[];
  disabled: boolean;
  lastActionWrong: boolean;
}> = ({ puzzle, onAction, pressedActions, disabled, lastActionWrong }) => {
  const pressedSet = new Set(pressedActions.map(a => (a as { symbolIdx: number })?.symbolIdx ?? -1));

  const handlePress = (idx: number) => {
    if (disabled || pressedSet.has(idx)) return;
    onAction({ symbolIdx: idx });
  };

  return (
    <div className={`keyboard-operator-module ${lastActionWrong ? 'shake-module' : ''}`}>
      <div className="target-buttons">
        {puzzle.targetSymbols.map((sym, i) => {
          const pressed = pressedSet.has(i);
          const orderIdx = pressedActions.findIndex(
            a => (a as { symbolIdx: number })?.symbolIdx === i
          );
          return (
            <button
              key={i}
              className={`target-btn ${pressed ? 'pressed' : ''}`}
              onClick={() => handlePress(i)}
              disabled={pressed || disabled}
              style={{ position: 'relative' }}
            >
              <RenderSymbol symbol={sym} size={48} />
              {orderIdx >= 0 && (
                <span className="order-badge">{orderIdx + 1}</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="order-indicator">
        {pressedActions.length > 0 && `${pressedActions.length} / ${puzzle.correctOrder.length}`}
      </div>
    </div>
  );
};

export const KbSvgExpert: React.FC<{ rule: KeyboardSVGRule }> = ({ rule }) => {
  const cols = 8;
  const rows = 6;

  return (
    <div className="manual-section">
      <h3>键盘模块 (符号)</h3>
      <p className="manual-rule-text">
        以下为6行8列的符号表格。操作员能看到4个符号按钮。
        有且仅有一列同时包含全部4个符号。
        以该列中这4个符号从上到下的顺序来按下这4个按钮。
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table className="keyboard-grid-table">
          <thead>
            <tr>
              <th></th>
              {Array.from({ length: cols }, (_, c) => (
                <th key={c} className="col-header">{c + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, r) => (
              <tr key={r}>
                <td className="col-header">{r + 1}</td>
                {Array.from({ length: cols }, (_, c) => (
                  <td key={c}>
                    <span className="keyboard-grid-cell">
                      <RenderSymbol symbol={rule.grid[r][c]} size={40} />
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
