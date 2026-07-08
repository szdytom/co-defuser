import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import '../matching-svg/MatchingModule.css';

export function createMatchingOperator<TPattern>(
  renderPattern: (pattern: TPattern, size: number) => ReactNode,
) {
  return (props: {
    puzzle: { buttonPatterns: TPattern[] };
    onAction: (action: unknown) => void;
    pressedActions: unknown[];
    disabled: boolean;
    lastActionWrong: boolean;
  }) => {
    const { puzzle, onAction, pressedActions, disabled, lastActionWrong } = props;
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
                renderPattern(puzzle.buttonPatterns[selected[i]], 56)
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
                {renderPattern(pat, 46)}
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
}

export function createMatchingExpert<TPattern, TRule>(
  renderPattern: (pattern: TPattern, size: number) => ReactNode,
  title: string,
  description: string,
  getPairs: (rule: TRule) => { a: TPattern; b: TPattern }[],
) {
  return (props: { rule: TRule }) => {
    const pairs = getPairs(props.rule);

    return (
      <div className="manual-section">
        <h3>{title}</h3>
        <p className="manual-rule-text">{description}</p>
        <div className="matching-expert-grid">
          {pairs.map((pair, i) => (
            <React.Fragment key={i}>
              <div className="matching-expert-pair">
                <span className="matching-pair-label">对{i + 1}</span>
                <div className="matching-pair-symbols">
                  {renderPattern(pair.a, 38)}
                  <span className="matching-pair-vs">↔</span>
                  {renderPattern(pair.b, 38)}
                </div>
              </div>
              {(i + 1) % 3 === 0 && i + 1 < 24 && <div className="matching-expert-gap" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };
}
