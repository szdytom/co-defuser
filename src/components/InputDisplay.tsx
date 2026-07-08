import React from 'react';
import './InputDisplay.css';

interface InputDisplayProps {
  slotCount: number;
  values: string[];
  activeIndex: number;
}

export const InputDisplay: React.FC<InputDisplayProps> = ({ slotCount, values, activeIndex }) => (
  <div className="input-display">
    {Array.from({ length: slotCount }, (_, i) => (
      <span
        key={i}
        className={`input-slot ${i < values.length ? 'input-slot-filled' : ''} ${i === activeIndex && activeIndex < slotCount ? 'input-slot-active' : ''}`}
      >
        {i < values.length ? values[i] : ''}
      </span>
    ))}
  </div>
);
