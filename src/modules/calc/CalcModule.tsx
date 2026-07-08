import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { CalcPuzzle, CalcRule, CalcState, ConditionDesc } from './types';
import { OP_LABELS } from './generator';
import { InputDisplay } from '../../components/InputDisplay';
import './CalcModule.css';

function condText(cond: ConditionDesc): string {
  switch (cond.kind) {
    case 'odd': return 'X为奇数';
    case 'even': return 'X为偶数';
    case 'prime': return 'X为质数';
    case 'composite': return 'X为合数';
    case 'eq':
      return cond.values.length === 1
        ? `X为${cond.values[0]}`
        : `X为${cond.values.slice(0, -1).join('、')}或${cond.values[cond.values.length - 1]}`;
  }
}

const KEY_ROWS = [
  [7, 8, 9],
  [4, 5, 6],
  [1, 2, 3],
];

export const CalcOperator: React.FC<{
  puzzle: CalcPuzzle;
  onAction: (action: unknown) => void;
  pressedActions: unknown[];
  disabled: boolean;
  lastActionWrong: boolean;
}> = ({ puzzle, onAction, pressedActions, disabled, lastActionWrong }) => {
  const [input, setInput] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [flashIdx, setFlashIdx] = useState(-1);
  const flashTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (disabled || step >= puzzle.rounds.length) return;

    cancelledRef.current = false;
    const round = puzzle.rounds[step];

    function flashLoop() {
      if (cancelledRef.current) return;
      setFlashIdx(round.flashValue);
      const timers = flashTimersRef.current;
      timers.push(setTimeout(() => {
        if (cancelledRef.current) return;
        setFlashIdx(-1);
        timers.push(setTimeout(flashLoop, 1200));
      }, 600));
    }

    flashLoop();

    return () => {
      cancelledRef.current = true;
      flashTimersRef.current.forEach(clearTimeout);
      flashTimersRef.current = [];
    };
  }, [step, disabled, puzzle.rounds]);

  useEffect(() => {
    if (lastActionWrong) {
      setInput([]);
      setStep(0);
    }
  }, [pressedActions, lastActionWrong]);

  const handleDigit = useCallback((d: number) => {
    if (disabled || step >= puzzle.rounds.length) return;
    setInput(prev => [...prev, d]);
    setStep(prev => prev + 1);
  }, [disabled, step, puzzle.rounds.length]);

  const handleBackspace = useCallback(() => {
    if (input.length === 0) return;
    setInput(prev => prev.slice(0, -1));
    setStep(prev => Math.max(0, prev - 1));
  }, [input.length]);

  const handleConfirm = useCallback(() => {
    if (disabled || input.length === 0) return;
    onAction({ digit: input.join('') });
  }, [disabled, input, onAction]);

  const strInput = input.map(String);
  const hasInput = input.length > 0;
  const showActive = step < puzzle.rounds.length ? step : -1;

  return (
    <div className={`calc-module ${lastActionWrong ? 'shake-module' : ''}`}>
      <InputDisplay slotCount={4} values={strInput} activeIndex={showActive} />

      <div className="calc-keypad">
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} className="calc-keypad-row">
            {row.map(d => (
              <button
                key={d}
                className={`calc-key ${flashIdx === d ? 'calc-key-flash' : ''}`}
                onClick={() => handleDigit(d)}
                disabled={disabled}
              >
                {d}
              </button>
            ))}
          </div>
        ))}
        <div className="calc-keypad-row">
          <button className={`calc-key ${flashIdx === 0 ? 'calc-key-flash' : ''}`} onClick={() => handleDigit(0)} disabled={disabled}>0</button>
          <button className="calc-key calc-key-control" onClick={handleBackspace} disabled={disabled || input.length === 0}>⌫</button>
          <button
            className={`calc-key calc-key-control calc-key-confirm ${hasInput ? 'calc-key-confirm-ready' : ''}`}
            onClick={handleConfirm}
            disabled={disabled || input.length === 0}
          >✓</button>
        </div>
      </div>
    </div>
  );
};

const STATE_NAMES = ['A', 'B', 'C', 'D', 'E', 'F'];

function RenderBranches({ branches }: { branches: CalcState['branches'] }) {
  if (branches.length === 0) return null;

  return (
    <>
      {branches.map((br: CalcState['branches'][number], i: number) => {
        const isFirst = i === 0;
        const isLast = i === branches.length - 1;
        if (isFirst) {
          return (
            <div key={i} className="tree-line">
              如果<span className="cond">{condText(br.condition)}</span>，转移到<span className="action">状态 {STATE_NAMES[br.nextState]}</span>。
            </div>
          );
        }
        if (isLast) {
          return (
            <div key={i} className="tree-line">
              否则，转移到<span className="action">状态 {STATE_NAMES[br.nextState]}</span>。
            </div>
          );
        }
        return (
          <div key={i} className="tree-line">
            否则，如果<span className="cond">{condText(br.condition)}</span>，转移到<span className="action">状态 {STATE_NAMES[br.nextState]}</span>。
          </div>
        );
      })}
    </>
  );
}

export const CalcExpert: React.FC<{ rule: CalcRule }> = ({ rule }) => (
  <div className="manual-section">
    <h3>计算模块</h3>
    <div className="manual-rule-text" style={{ lineHeight: 1.8 }}>
      <p>你面前有一个 0-9 的数字键盘，每轮有一个数字键会高亮闪烁。共 4 轮，流程如下：</p>
      <ol style={{ margin: '6px 0 0 0', paddingLeft: 20 }}>
        <li><strong>确认当前状态</strong>——初始为 A，根据下表找到当前状态的公式，如"X 加 I"。</li>
        <li><strong>读取闪烁值 I</strong>——键盘上高亮闪烁的数字即 I。</li>
        <li><strong>计算新 X</strong>——将原 X（初始为 0）与 I 按公式计算，结果取绝对值后仅保留个位数。例如减：|X - I| 取个位。</li>
        <li><strong>输入 X</strong>——在键盘上输入计算结果，按确认键提交。</li>
        <li><strong>确定下一状态</strong>——按下表根据新 X 的值找到对应转移状态，回到第 1 步。</li>
      </ol>
      <p style={{ marginTop: 8 }}>每轮结束后 X 和状态都会更新。4 轮全部正确输入即解除。</p>
    </div>
    {rule.states.map((st, i) => (
      <div key={i} className="calc-expert-state">
        <h4>状态 {STATE_NAMES[i]}：X {OP_LABELS[st.op]} I</h4>
        <div className="decision-tree">
          <RenderBranches branches={st.branches} />
        </div>
      </div>
    ))}
  </div>
);
