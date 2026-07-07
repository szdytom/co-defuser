import React from 'react';
import './MistakeCounter.css';

interface MistakeCounterProps {
  mistakes: number;
  maxMistakes: number;
}

export const MistakeCounter: React.FC<MistakeCounterProps> = ({ mistakes, maxMistakes }) => {
  return (
    <div className="mistake-counter">
      {Array.from({ length: maxMistakes }, (_, i) => (
        <div key={i} className={`mistake-dot ${i < mistakes ? 'spent' : ''}`} />
      ))}
    </div>
  );
};
