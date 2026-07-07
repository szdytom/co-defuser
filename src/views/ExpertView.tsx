import React from 'react';
import type { GameState } from '../game/types';

interface ExpertViewProps {
  gameState: GameState;
  onBack: () => void;
}

export const ExpertView: React.FC<ExpertViewProps> = ({ gameState, onBack }) => {
  const { puzzles, seed } = gameState;

  return (
    <div className="expert-view content-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="back-btn" onClick={onBack}>返回</button>
      </div>
      <div className="manual-header">
        <h2>操作手册</h2>
        <p className="seed-label">种子: {seed}</p>
      </div>
      {puzzles.map((inst, idx) => (
        <React.Fragment key={idx}>
          {inst.moduleType.expertComponent({ rule: inst.rule })}
        </React.Fragment>
      ))}
    </div>
  );
};
