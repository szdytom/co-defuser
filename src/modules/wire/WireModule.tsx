import React from 'react';
import type { WirePuzzle, WireRule, DecisionTree, LeafAction } from './types';
import './WireModule.css';

function actionDesc(action: LeafAction): string {
  switch (action.kind) {
    case 'absolute':
      return `剪断第${'一二三四五六'[action.index]}根线`;
    case 'first_of':
      return `剪断第一根${cnName(action.color)}线`;
    case 'last_of':
      return `剪断最后一根${cnName(action.color)}线`;
  }
}

function cnName(c: string): string {
  switch (c) {
    case 'red': return '红';
    case 'blue': return '蓝';
    case 'yellow': return '黄';
    case 'white': return '白';
    case 'black': return '黑';
    case 'green': return '绿';
  }
  return c;
}

function RenderAction({ action }: { action: LeafAction }) {
  return <span className="action">{actionDesc(action)}</span>;
}

function RenderTree({ tree, cont }: { tree: DecisionTree; cont: string }) {
  if (tree.kind === 'leaf') {
    return (
      <div className="tree-line">
        {cont ? <>{cont}，</> : null}
        <RenderAction action={tree.action} />。
      </div>
    );
  }

  const condPrefix = cont ? `${cont}，如果` : '如果';

  if (tree.trueBranch.kind === 'leaf') {
    return (
      <>
        <div className="tree-line">
          {condPrefix}<span className="cond">{tree.condition.desc}</span>，则<RenderAction action={tree.trueBranch.action} />。
        </div>
        <RenderTree tree={tree.falseBranch} cont="否则" />
      </>
    );
  }

  return (
    <>
      <div className="tree-line">
        {condPrefix}<span className="cond">{tree.condition.desc}</span>，则：
      </div>
      <div className="tree-indent">
        <RenderTree tree={tree.trueBranch} cont="" />
      </div>
      <div className="tree-line">
        否则：
      </div>
      <div className="tree-indent">
        <RenderTree tree={tree.falseBranch} cont="" />
      </div>
    </>
  );
}

export const WireOperator: React.FC<{
  puzzle: WirePuzzle;
  onAction: (action: unknown) => void;
  pressedActions: unknown[];
  disabled: boolean;
  lastActionWrong: boolean;
}> = ({ puzzle, onAction, pressedActions, disabled, lastActionWrong }) => {
  const handleClick = (index: number) => {
    if (disabled) return;
    if (pressedActions.some(a => a && typeof a === 'object' && (a as { wireIndex: number }).wireIndex === index)) return;
    onAction({ wireIndex: index });
  };

  const isCut = (i: number) =>
    pressedActions.some(a => a && typeof a === 'object' && (a as { wireIndex: number }).wireIndex === i);

  return (
    <div className={`wire-module ${lastActionWrong ? 'shake-module' : ''}`}>
      <div className="wires">
        {puzzle.colors.map((color, i) => {
          const cut = isCut(i);
          return (
            <div
              key={i}
              className={`wire ${color} ${cut ? 'cut' : ''}`}
              onClick={() => handleClick(i)}
            >
              {cnName(color)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const WireExpert: React.FC<{ rule: WireRule }> = ({ rule }) => {
  const counts = [3, 4, 5, 6];
  return (
    <div className="manual-section">
      <h3>剪线模块</h3>
      <p className="manual-rule-text">在此模块中，你会看到3~6根彩色线路，从上到下排列。根据线数查找对应规则：</p>
      {counts.map(N => (
        <div key={N} className="wire-count-header">
          <hr className="wire-hr" />
          <h4 className="wire-count-title">{N}根线</h4>
          <div className="decision-tree">
            <RenderTree tree={rule.trees[N]} cont="" />
          </div>
        </div>
      ))}
    </div>
  );
};
