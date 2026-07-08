# 添加新模块指南

本文档描述如何为 Co-Defuser 添加一种新的谜题模块（例如按钮序列、滑块、密码盘等）。

## 架构概览

```
seed ──→ PRNG ──→ generateRule() ──→ Rule (双侧一致)
                         │
                         ▼
                 generatePuzzle(Rule) ──→ Puzzle (仅 A 侧, Math.random)

         Rule ──→ expertComponent()   ──→ B 侧手册渲染
         Puzzle ──→ operatorComponent() ──→ A 侧交互界面
```

关键原则：
- **Rule** 由种子通过 PRNG 确定性地生成，A、B 两侧相同。
- **Puzzle** 由 Rule 约束 + `Math.random` 在 A 侧独立随机生成。
- **validate** 在 A 侧持有 Rule 数据（但不渲染给 A），用来验证操作。

## 核心接口

接口定义在 `src/modules/types.ts`：

```typescript
interface IModuleType<TRule, TPuzzle> {
  id: string;
  name: string;

  // 确定性生成规则（由种子 PRNG 驱动，双侧相同）
  generateRule: (rng: { next(): number }) => TRule;

  // 基于规则生成谜题实例（Math.random，仅 A 侧）
  generatePuzzle: (rule: TRule) => TPuzzle;

  // 验证操作序列，返回 { correct, solved }
  // actions 是玩家已按下的全部动作（包含本次）
  // 单次动作模块（如剪线）：检查最新动作
  // 序列动作模块（如键盘）：检查整个序列
  validate: (rule: TRule, puzzle: TPuzzle, actions: OperatorAction[]) => {
    correct: boolean;
    solved: boolean;
  };

  // A 侧 React 组件
  // ⚠️ 必须通过 React.createElement(Component, props) 或 JSX 渲染，
  // 不能直接函数调用 Component(props)。直接调用会使 hooks 注册到父组件的
  // hooks 链上，导致卸载和生命周期异常。
  operatorComponent: (props: {
    puzzle: TPuzzle;
    onAction: (action: OperatorAction) => void;  // 玩家点击时调用
    pressedActions: OperatorAction[];            // 已成功的动作序列
    disabled: boolean;                           // 模块已解时禁用
    lastActionWrong: boolean;                    // 上一次操作是否错误
  }) => ReactNode;

  // B 侧 React 组件（只读手册）
  expertComponent: (props: { rule: TRule }) => ReactNode;
}
```

## 实现步骤

以添加一个"密码盘"模块为例。

### 步骤 1：创建模块目录

```
src/modules/password/
├── types.ts       # TRule / TPuzzle 类型定义
├── generator.ts   # generateRule + generatePuzzle
├── PasswordOperator.tsx  # A 侧组件
├── PasswordExpert.tsx    # B 侧组件
└── index.ts       # 实现 IModuleType 并导出
```

### 步骤 2：定义类型 (`types.ts`)

```typescript
// 规则：由种子 PRNG 生成，双侧一致
export interface PasswordRule {
  code: string;        // 预设密码，如 "7351"
  hints: string[];     // 提示文字，如 ["第一个数字大于3", "没有重复数字"]
}

// 谜题：A 侧 Math.random 生成
export interface PasswordPuzzle {
  displayDigits: number[];  // 供选择的数字，随机打乱
}

// 玩家动作
export interface PasswordAction {
  digit: number;
}
```

### 步骤 3：实现生成器 (`generator.ts`)

```typescript
import type { PasswordRule, PasswordPuzzle, PasswordAction } from './types';

export function generateRule(rng: { next(): number }): PasswordRule {
  // 用 PRNG 确定性生成密码和提示
  const code = [];
  for (let i = 0; i < 4; i++) {
    code.push(Math.floor(rng.next() * 10));
  }
  // 生成提示语...
  return { code: code.join(''), hints };
}

export function generatePuzzle(rule: PasswordRule): PasswordPuzzle {
  // 用 Math.random 随机排列供选择的数字
  const digits = [0,1,2,3,4,5,6,7,8,9]
    .sort(() => Math.random() - 0.5);
  return { displayDigits: digits };
}

export function validatePuzzle(
  rule: PasswordRule,
  puzzle: PasswordPuzzle,
  actions: PasswordAction[]
): { correct: boolean; solved: boolean } {
  // 检查 actions 序列是否匹配密码的前缀
  const entered = actions.map(a => a.digit).join('');
  const correct = rule.code.startsWith(entered);
  const solved = rule.code === entered;
  return { correct, solved };
}
```

### 步骤 4：实现组件

**A 侧 (`PasswordOperator.tsx`)**：

```typescript
import React from 'react';
import type { PasswordPuzzle, PasswordAction } from './types';

export const PasswordOperator: React.FC<{
  puzzle: PasswordPuzzle;
  onAction: (action: PasswordAction) => void;
  pressedActions: PasswordAction[];
  disabled: boolean;
  lastActionWrong: boolean;
}> = ({ puzzle, onAction, pressedActions, disabled, lastActionWrong }) => {
  const pressedSet = new Set(pressedActions.map(a => a.digit));

  return (
    <div className={`password-module ${lastActionWrong ? 'shake-module' : ''}`}>
      <div className="digit-buttons">
        {puzzle.displayDigits.map((d, i) => (
          <button
            key={i}
            className={`digit-btn ${pressedSet.has(d) ? 'pressed' : ''}`}
            onClick={() => onAction({ digit: d })}
            disabled={pressedSet.has(d) || disabled}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="entered-display">
        {pressedActions.map(a => a.digit).join('')}
      </div>
    </div>
  );
};
```

**B 侧 (`PasswordExpert.tsx`)**：

```typescript
import React from 'react';
import type { PasswordRule } from './types';

export const PasswordExpert: React.FC<{ rule: PasswordRule }> = ({ rule }) => (
  <div className="manual-section">
    <h3>密码盘模块</h3>
    <p className="manual-rule-text">操作员面前有 0-9 的数字按钮。</p>
    <p>等待操作员描述，根据以下提示推断密码：</p>
    <ul>
      {rule.hints.map((h, i) => <li key={i}>{h}</li>)}
    </ul>
    <p className="manual-rule-text">
      密码为 4 位数字。按顺序输入正确密码即可解除。
    </p>
  </div>
);
```

### 步骤 5：组装模块对象 (`index.ts`)

```typescript
import React from 'react';
import type { IModuleType } from '../types';
import type { PasswordRule, PasswordPuzzle, PasswordAction } from './types';
import { generateRule, generatePuzzle, validatePuzzle } from './generator';
import { PasswordOperator } from './PasswordOperator';
import { PasswordExpert } from './PasswordExpert';

export const passwordModule: IModuleType<PasswordRule, PasswordPuzzle> = {
  id: 'password',
  name: '密码盘',

  generateRule(rng) {
    return generateRule(rng);
  },

  generatePuzzle(rule) {
    return generatePuzzle(rule);
  },

  validate(rule, puzzle, actions) {
    return validatePuzzle(rule, puzzle, actions as PasswordAction[]);
  },

  operatorComponent(props) {
    // ⚠️ 必须用 createElement 或 JSX 渲染，不能直接函数调用
    return React.createElement(PasswordOperator, props);
  },

  expertComponent(props) {
    return React.createElement(PasswordExpert, props);
  },
};
```

### 步骤 6：注册模块 (`src/modules/registry.ts`)

```typescript
import { passwordModule } from './password';

export const MODULE_REGISTRY: Record<string, IModuleType<any, any>> = {
  wire: wireModule,
  'keyboard-svg': keyboardSVGModule,
  'keyboard-dot': keyboardDotModule,
  password: passwordModule,   // ← 添加这一行
};
```

### 步骤 7：添加游戏配置 (`src/game/config.ts`)

```typescript
export interface GameConfig {
  // ... 已有配置
  passwordModuleCount: number;  // ← 新字段
}

export const DEFAULT_CONFIG: GameConfig = {
  // ... 已有默认值
  passwordModuleCount: 1,       // ← 默认数量
};
```

### 步骤 8：注册到游戏生成器 (`src/game/generator.ts`)

在 `moduleSpecs` 数组中添加：

```typescript
const moduleSpecs: { id: string; count: number }[] = [
  { id: 'wire', count: config.wireModuleCount },
  { id: 'keyboard-svg', count: config.keyboardSVGCount },
  { id: 'keyboard-dot', count: config.keyboardDotCount },
  { id: 'password', count: config.passwordModuleCount },  // ← 添加
];
```

### 步骤 9：添加启动页配置滑块 (`src/views/StartScreen.tsx`)

在配置面板中添加滑块：

```tsx
<label>
  密码盘模块数
  <span>
    <input
      type="range"
      min="0"
      max="3"
      step="1"
      value={config.passwordModuleCount}
      onChange={e => updateConfig('passwordModuleCount', Number(e.target.value))}
    />
    <span className="config-value">{config.passwordModuleCount}</span>
  </span>
</label>
```

## validate 详解

`validate(rule, puzzle, actions)` 的 `actions` 参数是玩家**已成功按下的完整动作序列**（不含错误动作——错误动作会导致序列清空）：

### 单次动作模块（如剪线）

只检查最新动作是否正确，正确即解决：

```typescript
validate(rule, puzzle, actions) {
  const last = actions[actions.length - 1] as SomeAction;
  const correct = /* 判断 last 是否正确 */;
  return { correct, solved: correct };
}
```

### 序列动作模块（如键盘、密码盘）

检查整个序列是否为正确序列的前缀：

```typescript
validate(rule, puzzle, actions) {
  const correct = /* 检查 actions 是正确序列的前缀 */;
  const solved = correct && actions.length === expectedLength;
  return { correct, solved };
}
```

## CSS 约定

模块 A 侧组件根元素建议使用 `shake-module` 类来响应错误反馈：

```tsx
<div className={`my-module ${lastActionWrong ? 'shake-module' : ''}`}>
```

全局 CSS 中已定义 `.shake-module` 动画（红色边框 + 抖动）。

## 关键约定

| 约定 | 说明 |
|------|------|
| `generateRule` 必须纯 PRNG 驱动 | 同一种子必须产生完全相同的 Rule |
| `generatePuzzle` 使用 `Math.random()` | 不受种子影响，每次刷新谜题不同 |
| 组件不维护校验状态 | 正确/错误由父组件通过 props 告知 |
| B 侧不包含交互元素 | 纯展示，文本可选中复制 |
| 类型参数化 | `IModuleType<TRule, TPuzzle>` 保证类型安全 |
| operatorComponent 必须用 createElement/JSX 渲染 | 不准直接函数调用 `Component(props)`，hooks 会注册到父组件导致异常 |
