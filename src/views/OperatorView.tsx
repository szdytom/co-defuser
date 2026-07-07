import React, { useEffect, useRef, useState } from 'react';
import type { GameState } from '../game/types';
import { Timer } from '../components/Timer';
import { MistakeCounter } from '../components/MistakeCounter';
import { ResultOverlay } from '../components/ResultOverlay';
import { ThemeToggle } from '../components/ThemeToggle';
import './OperatorView.css';

interface OperatorViewProps {
  gameState: GameState;
  onAction: (puzzleIdx: number, action: unknown) => void;
  onBack: () => void;
  onTick: () => void;
}

export const OperatorView: React.FC<OperatorViewProps> = ({
  gameState,
  onAction,
  onBack,
  onTick,
}) => {
  const { puzzles, mistakes, maxMistakes, timeRemaining, timerSeconds } = gameState;
  const onTickRef = useRef(onTick);
  const phaseRef = useRef(gameState.phase);
  onTickRef.current = onTick;
  phaseRef.current = gameState.phase;

  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  useEffect(() => {
    const newCollapsed = new Set(collapsed);
    let changed = false;
    puzzles.forEach((inst, idx) => {
      if (inst.solved && !newCollapsed.has(idx)) {
        newCollapsed.add(idx);
        changed = true;
      }
    });
    if (changed) {
      setCollapsed(newCollapsed);
    }
  }, [puzzles]);

  useEffect(() => {
    const allSolved = puzzles.every(p => p.solved);
    if (allSolved || gameState.phase !== 'playing' || timeRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      if (phaseRef.current === 'playing') {
        onTickRef.current();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.phase, puzzles, timeRemaining > 0]);

  const toggleCollapse = (idx: number) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  if (gameState.phase === 'win' || gameState.phase === 'lose') {
    return (
      <ResultOverlay
        win={gameState.phase === 'win'}
        onRestart={onBack}
      />
    );
  }

  return (
    <div className="operator-view content-wrapper">
      <div className="header">
        <button className="back-btn" onClick={onBack}>返回</button>
        <Timer timeRemaining={timeRemaining} total={timerSeconds} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MistakeCounter mistakes={mistakes} maxMistakes={maxMistakes} />
          <ThemeToggle />
        </div>
      </div>
      <div className="modules-container">
        {puzzles.map((inst, idx) => {
          const isCollapsed = collapsed.has(idx);

          return (
            <div key={idx} className={inst.solved ? 'module-wrapper solved' : 'module-wrapper'}>
              <div
                className="module-header"
                onClick={() => inst.solved && toggleCollapse(idx)}
                style={{ cursor: inst.solved ? 'pointer' : 'default' }}
              >
                <span className="module-status">
                  {inst.solved ? (
                    <span className="checkmark">✓</span>
                  ) : (
                    <span className="module-num">{inst.index}</span>
                  )}
                </span>
                <span className="module-title">
                  模块 #{inst.index} — {inst.moduleType.name}
                </span>
                {inst.solved && (
                  <span className="collapse-arrow">{isCollapsed ? '▶' : '▼'}</span>
                )}
              </div>
              {!isCollapsed && (
                <div className="module-body" key={`mod-${idx}-${gameState.lastWrongIdx === idx ? `wrong-${gameState.wrongCount}` : 'ok'}`}>
                  {inst.moduleType.operatorComponent({
                    puzzle: inst.puzzle,
                    onAction: (action: unknown) => onAction(idx, action),
                    pressedActions: inst.pressedActions,
                    disabled: inst.solved,
                    lastActionWrong: gameState.lastWrongIdx === idx,
                    timeRemaining: gameState.timeRemaining,
                    otherModulesSolved: puzzles.filter((_, i) => i !== idx).every(p => p.solved),
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
