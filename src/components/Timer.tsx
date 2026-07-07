import React from 'react';
import './Timer.css';

interface TimerProps {
  timeRemaining: number;
  total: number;
}

export const Timer: React.FC<TimerProps> = ({ timeRemaining, total }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isUrgent = timeRemaining <= 30;
  const progress = timeRemaining / total;

  const isWarning = !isUrgent && progress < 0.3;

  return (
    <div className={`timer ${isUrgent ? 'urgent' : ''} ${isWarning ? 'warning' : ''}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};
