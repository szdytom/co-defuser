import React from 'react';

interface TimerProps {
  timeRemaining: number;
  total: number;
}

export const Timer: React.FC<TimerProps> = ({ timeRemaining, total }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isUrgent = timeRemaining <= 30;
  const progress = timeRemaining / total;

  return (
    <div className={`timer ${isUrgent ? 'urgent' : ''}`}
      style={{ color: isUrgent ? undefined : progress < 0.3 ? '#ffa502' : '#e94560' }}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};
