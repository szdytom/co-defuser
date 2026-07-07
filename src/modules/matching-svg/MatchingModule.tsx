import React, { useState, useEffect } from 'react';
import type { MatchingSVGRule, MatchingSVGPuzzle } from './types';
import { RenderSymbol } from '../keyboard-svg/svg-utils';
import './MatchingModule.css';

export const MatchingSVGOperator: React.FC<{
  puzzle: MatchingSVGPuzzle;
  onAction: (action: unknown) => void;
  pressedActions: unknown[];
  disabled: boolean;
  lastActionWrong: boolean;
}> = ({ puzzle, onAction, pressedActions, disabled, lastActionWrong }) => {
  const [selected, setSelected] = useState<number[]>([]);

  const matchedSet = new Set<number>();
  for (const a of pressedActions) {
    const act = a as { a: number; b: number };
    matchedSet.add(act.a);
    matchedSet.add(act.b);
  }

  useEffect(() => {
    if (lastActionWrong) setSelected([]);
  }, [lastActionWrong]);

  const handleButtonPress = (idx: number) => {
    if (disabled || matchedSet.has(idx)) return;
    if (selected.includes(idx)) {
      setSelected(selected.filter(i => i !== idx));
      return;
    }
    if (selected.length >= 2) return;
    setSelected([...selected, idx]);
  };

  const handleClear = () => {
    setSelected([]);
  };

  const handleConfirm = () => {
    if (selected.length !== 2) return;
    onAction({ kind: 'pair', a: selected[0], b: selected[1] });
    setSelected([]);
  };

  return (
    <div className={`matching-module ${lastActionWrong ? 'shake-module' : ''}`}>
      <div className="matching-slots">
        {[0, 1].map(i => (
          <div key={i} className="matching-slot">
            {selected[i] !== undefined ? (
              <RenderSymbol symbol={puzzle.buttonPatterns[selected[i]]} size={56} />
            ) : (
              <span className="matching-slot-empty">?</span>
            )}
          </div>
        ))}
      </div>
      <div className="matching-grid">
        {puzzle.buttonPatterns.map((sym, i) => {
          const isMatched = matchedSet.has(i);
          const isSelected = selected.includes(i);
          return (
            <button
              key={i}
              className={`matching-btn ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleButtonPress(i)}
              disabled={isMatched || disabled}
            >
              <RenderSymbol symbol={sym} size={36} />
            </button>
          );
        })}
      </div>
      <div className="matching-actions">
        <button className="matching-action-btn clear" onClick={handleClear} disabled={selected.length === 0}>
          清除
        </button>
        <button className="matching-action-btn confirm" onClick={handleConfirm} disabled={selected.length !== 2}>
          确认
        </button>
      </div>
    </div>
  );
};

export const MatchingSVGExpert: React.FC<{ rule: MatchingSVGRule }> = ({ rule }) => {
  const pairs = Array.from({ length: 24 }, (_, i) => ({
    a: rule.symbols[i * 2],
    b: rule.symbols[i * 2 + 1],
  }));

  return (
    <div className="manual-section">
      <h3>配对模块 (符号)</h3>
      <p className="manual-rule-text">
        操作员面前有 12 个带有符号的按钮，需要两两配对。
        以下为全部 24 对符号参照表。每行展示 3 对。
      </p>
      <div className="matching-expert-grid">
        {pairs.map((pair, i) => (
          <React.Fragment key={i}>
            <div className="matching-expert-pair">
              <span className="matching-pair-label">对{i + 1}</span>
              <div className="matching-pair-symbols">
                <RenderSymbol symbol={pair.a} size={32} />
                <span className="matching-pair-vs">↔</span>
                <RenderSymbol symbol={pair.b} size={32} />
              </div>
            </div>
            {(i + 1) % 3 === 0 && i + 1 < 24 && <div className="matching-expert-gap" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
