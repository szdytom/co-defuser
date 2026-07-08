import React, { useCallback } from 'react';
import type { StarChartRule, StarChartPuzzle } from './types';
import { POINT_RADIUS } from './generator';
import './StarChartModule.css';

const COLOR_BUTTONS = [
  { id: 'red', label: '红', css: '#ff4444' },
  { id: 'yellow', label: '黄', css: '#ffcc00' },
  { id: 'blue', label: '蓝', css: '#3388ff' },
  { id: 'green', label: '绿', css: '#44cc66' },
  { id: 'black', label: '黑', css: '#222222' },
  { id: 'white', label: '白', css: '#eeeeee' },
];

const COLOR_MAP: Record<string, string> = {
  red: '#ff4444',
  yellow: '#ffcc00',
  blue: '#3388ff',
  green: '#44cc66',
  black: '#222222',
  white: '#eeeeee',
};

const COLOR_CN: Record<string, string> = {
  red: '红', yellow: '黄', blue: '蓝', green: '绿', black: '黑', white: '白',
};

export const StarChartOperator: React.FC<{
  puzzle: StarChartPuzzle;
  onAction: (action: unknown) => void;
  pressedActions: unknown[];
  disabled: boolean;
  lastActionWrong: boolean;
}> = ({ puzzle, onAction, pressedActions, disabled, lastActionWrong }) => {
  const handleColor = useCallback((color: string) => {
    if (disabled) return;
    onAction({ color });
  }, [disabled, onAction]);

  return (
    <div className={`star-module ${lastActionWrong ? 'shake-module' : ''}`}>
      <svg className="star-svg" viewBox={`${puzzle.viewRect.x} ${puzzle.viewRect.y} ${puzzle.viewRect.w} ${puzzle.viewRect.h}`} preserveAspectRatio="xMidYMid meet" style={{ color: 'var(--text-primary)' }}>
        {puzzle.visiblePoints.map((pt, i) => (
          pt.isSpecial
            ? <text key={i} x={pt.x} y={pt.y} fontSize="0.25" fill="currentColor" textAnchor="middle" dominantBaseline="central" fontWeight="bold">✕</text>
            : <circle key={i} cx={pt.x} cy={pt.y} r={POINT_RADIUS} fill="currentColor" />
        ))}
      </svg>
      <div className="star-color-buttons">
        {COLOR_BUTTONS.map(cb => (
          <button
            key={cb.id}
            className="star-color-btn"
            style={{ backgroundColor: cb.css, color: cb.id === 'white' || cb.id === 'yellow' ? '#222' : '#fff' }}
            onClick={() => handleColor(cb.id)}
            disabled={disabled}
          >
            {cb.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export const StarChartExpert: React.FC<{ rule: StarChartRule }> = ({ rule }) => {
  return (
    <div className="manual-section">
      <h3>星图模块</h3>
      <p className="manual-rule-text">
        你面前有一张完整星图，每个点有对应颜色。
        你看到的只是其中一个局部区域，该区域中有一个点标记为 ✕。
        在完整星图中找到 ✕ 对应的位置，确认该点的颜色即可。
      </p>
      <div className="star-svg-center">
        <svg className="star-svg star-svg-full" viewBox="0 0 5 3" preserveAspectRatio="xMidYMid meet">
        {rule.points.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r={POINT_RADIUS} fill={COLOR_MAP[pt.color]} stroke="rgba(128,128,128,0.35)" strokeWidth="0.025" />
        ))}
      </svg>
      </div>
    </div>
  );
};
