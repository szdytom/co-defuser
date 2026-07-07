import React from 'react';
import './ResultOverlay.css';

interface ResultOverlayProps {
  win: boolean;
  onRestart: () => void;
}

export const ResultOverlay: React.FC<ResultOverlayProps> = ({ win, onRestart }) => {
  return (
    <div className={`result-overlay ${win ? 'win' : 'lose'}`}>
      <h2>{win ? '任务成功!' : '任务失败'}</h2>
      <p className="result-detail">
        {win ? '你们成功完成了所有模块！' : '失误过多或时间耗尽…'}
      </p>
      <button onClick={onRestart}>重新开始</button>
    </div>
  );
};
