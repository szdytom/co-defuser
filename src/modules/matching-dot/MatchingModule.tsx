import React, { useState, useEffect } from 'react';
import type { MatchingDotRule, MatchingDotPuzzle } from './types';
import { RenderDotPattern } from '../keyboard-dot/dot-utils';
import '../matching-svg/MatchingModule.css';

export const MatchingDotOperator: React.FC<{
  puzzle: MatchingDotPuzzle;
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
              <RenderDotPattern pattern={puzzle.buttonPatterns[selected[i]]} size={56} color="var(--color-accent)" />
            ) : (
              <span className="matching-slot-empty">?</span>
            )}
          </div>
        ))}
      </div>
      <div className="matching-grid">
        {puzzle.buttonPatterns.map((pat, i) => {
          const isMatched = matchedSet.has(i);
          const isSelected = selected.includes(i);
          return (
            <button
              key={i}
              className={`matching-btn ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleButtonPress(i)}
              disabled={isMatched || disabled}
            >
              <RenderDotPattern pattern={pat} size={36} color="var(--color-accent)" />
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

export const MatchingDotExpert: React.FC<{ rule: MatchingDotRule }> = ({ rule }) => {
  const pairs = Array.from({ length: 24 }, (_, i) => ({
    a: rule.patterns[i * 2],
    b: rule.patterns[i * 2 + 1],
  }));

  return (
    <div className="manual-section">
      <h3>配对模块 (点阵)</h3>
      <p className="manual-rule-text">
        操作员面前有 12 个带有点阵图案的按钮，需要两两配对。
        以下为全部 24 对点阵参照表。每行展示 3 对。
      </p>
      <div className="matching-expert-grid">
        {pairs.map((pair, i) => (
          <React.Fragment key={i}>
            <div className="matching-expert-pair">
              <span className="matching-pair-label">对{i + 1}</span>
              <div className="matching-pair-symbols">
                <RenderDotPattern pattern={pair.a} size={32} color="currentColor" />
                <span className="matching-pair-vs">↔</span>
                <RenderDotPattern pattern={pair.b} size={32} color="currentColor" />
              </div>
            </div>
            {(i + 1) % 3 === 0 && i + 1 < 24 && <div className="matching-expert-gap" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
