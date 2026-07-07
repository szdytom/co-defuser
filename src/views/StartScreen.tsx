import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GameRole } from '../game/types';
import type { GameConfig } from '../game/config';
import { DEFAULT_CONFIG } from '../game/config';

function generateRandomSeed(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function configToSearch(config: GameConfig): string {
  const params = new URLSearchParams();
  if (config.timerSeconds !== DEFAULT_CONFIG.timerSeconds) params.set('t', String(config.timerSeconds));
  if (config.maxMistakes !== DEFAULT_CONFIG.maxMistakes) params.set('m', String(config.maxMistakes));
  if (config.wireModuleCount !== DEFAULT_CONFIG.wireModuleCount) params.set('w', String(config.wireModuleCount));
  if (config.keyboardSVGCount !== DEFAULT_CONFIG.keyboardSVGCount) params.set('ks', String(config.keyboardSVGCount));
  if (config.keyboardDotCount !== DEFAULT_CONFIG.keyboardDotCount) params.set('kd', String(config.keyboardDotCount));
  const s = params.toString();
  return s ? `?${s}` : '';
}

export const StartScreen: React.FC = () => {
  const navigate = useNavigate();
  const [seed, setSeed] = useState(() => generateRandomSeed());
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<GameConfig>({ ...DEFAULT_CONFIG });

  const handleRandomSeed = () => setSeed(generateRandomSeed());

  const updateConfig = (key: keyof GameConfig, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleStart = (role: GameRole) => {
    const search = configToSearch(config);
    const path = role === 'operator' ? '/operator' : '/manual';
    navigate(`${path}/${encodeURIComponent(seed)}${search}`);
  };

  return (
    <div className="content-wrapper start-screen">
      <h1>CO-DEFUSER</h1>

      <div className="seed-input-group">
        <label>游戏种子</label>
        <div className="seed-input-row">
          <input
            type="text"
            value={seed}
            onChange={e => setSeed(e.target.value.toUpperCase())}
            placeholder="输入种子..."
            maxLength={20}
          />
          <button onClick={handleRandomSeed}>随机</button>
        </div>
      </div>

      <div className="role-buttons">
        <button className="role-btn" onClick={() => handleStart('operator')}>
          <span className="icon">🔧</span>
          <span className="label">操作员 A</span>
          <span className="desc">看到谜题，需要拆弹</span>
        </button>
        <button className="role-btn" onClick={() => handleStart('expert')}>
          <span className="icon">📖</span>
          <span className="label">专家 B</span>
          <span className="desc">阅读手册，提供指导</span>
        </button>
      </div>

      <button className="config-toggle" onClick={() => setShowConfig(!showConfig)}>
        {showConfig ? '收起配置' : '游戏配置'}
      </button>

      {showConfig && (
        <div className="config-panel">
          <label>
            总时间 (秒)
            <span>
              <input
                type="range"
                min="60"
                max="600"
                step="30"
                value={config.timerSeconds}
                onChange={e => updateConfig('timerSeconds', Number(e.target.value))}
              />
              <span className="config-value">{config.timerSeconds}</span>
            </span>
          </label>
          <label>
            最大失误次数
            <span>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={config.maxMistakes}
                onChange={e => updateConfig('maxMistakes', Number(e.target.value))}
              />
              <span className="config-value">{config.maxMistakes}</span>
            </span>
          </label>
          <label>
            剪线模块数
            <span>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={config.wireModuleCount}
                onChange={e => updateConfig('wireModuleCount', Number(e.target.value))}
              />
              <span className="config-value">{config.wireModuleCount}</span>
            </span>
          </label>
          <label>
            键盘 (符号) 模块数
            <span>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={config.keyboardSVGCount}
                onChange={e => updateConfig('keyboardSVGCount', Number(e.target.value))}
              />
              <span className="config-value">{config.keyboardSVGCount}</span>
            </span>
          </label>
          <label>
            键盘 (点阵) 模块数
            <span>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={config.keyboardDotCount}
                onChange={e => updateConfig('keyboardDotCount', Number(e.target.value))}
              />
              <span className="config-value">{config.keyboardDotCount}</span>
            </span>
          </label>
        </div>
      )}
    </div>
  );
};
