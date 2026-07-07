import React from 'react';
import type { MemoryRule, MemoryPuzzle, StageRuleAction } from './types';
import './MemoryModule.css';

const POSITION_NAMES = ['一', '二', '三', '四'];
const DIGIT_NAMES = ['1', '2', '3', '4'];

function describeAction(action: StageRuleAction): string {
  switch (action.kind) {
    case 'position':
      return `按下第${POSITION_NAMES[action.position]}个位置的按钮`;
    case 'label':
      return `按下数字为"${action.label}"的按钮`;
    case 'samePosition':
      return `按下和阶段 ${action.stage} 中你所按下的按钮位置相同的按钮`;
    case 'sameLabel':
      return `按下和阶段 ${action.stage} 中你所按下的按钮数字相同的按钮`;
  }
}

export const MemoryOperator: React.FC<{
  puzzle: MemoryPuzzle;
  onAction: (action: unknown) => void;
  pressedActions: unknown[];
  disabled: boolean;
  lastActionWrong: boolean;
}> = ({ puzzle, onAction, pressedActions, disabled, lastActionWrong }) => {
  const currentStage = pressedActions.length;
  const displayValue = currentStage < 5 ? puzzle.displayValues[currentStage] : null;
  const allStages = 5;

  const handlePress = (position: number) => {
    if (disabled) return;
    onAction({ pressedPosition: position });
  };

  return (
    <div className={`memory-module ${lastActionWrong ? 'shake-module' : ''}`}>
      <div className="memory-display">
        <span className="display-number">{displayValue ?? '-'}</span>
      </div>

      <div className="memory-buttons">
        {(currentStage < 5 ? puzzle.buttonLabelSets[currentStage] : puzzle.buttonLabelSets[0]).map((label, i) => (
          <button
            key={i}
            className={`memory-btn ${disabled ? 'pressed' : ''}`}
            onClick={() => handlePress(i)}
            disabled={disabled}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="memory-stage-indicator">
        <div className="memory-stage-bar">
          {Array.from({ length: allStages }, (_, i) => (
            <div
              key={i}
              className={`memory-stage-segment ${
                i < currentStage ? 'completed' : i === currentStage ? 'current' : ''
              }`}
            />
          ))}
        </div>
        <span className="memory-stage-text">
          {currentStage < allStages ? `阶段 ${currentStage + 1} / ${allStages}` : '已解除'}
        </span>
      </div>
    </div>
  );
};

export const MemoryExpert: React.FC<{ rule: MemoryRule }> = ({ rule }) => {
  return (
    <div className="manual-section">
      <h3>记忆模块</h3>
      <p className="manual-rule-text">
        在此模块中，操作员会看到一个数字显示屏（1-4）和四个带有数字标签的按钮。
        根据当前阶段和显示的数字，按照以下规则按下正确的按钮。
        按错会重置到阶段 1。
      </p>
      <div className="manual-memory-rules">
        {rule.stages.map((stage, si) => (
          <div key={si} className="stage-block">
            <div className="stage-title">阶段 {si + 1}</div>
            {stage.actions.map((action, di) => (
              <div key={di} className="rule-line">
                如果显示的是 <span className="display-val">{di + 1}</span>
                ，<span className="action-desc">{describeAction(action)}</span>。
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
