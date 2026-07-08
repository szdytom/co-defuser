import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GameRole } from '../game/types';
import type { GameConfig } from '../game/config';
import { DEFAULT_CONFIG, TIME_OPTIONS, ALL_MODULE_IDS } from '../game/config';
import { ThemeToggle } from '../components/ThemeToggle';
import { getModule } from '../modules/registry';
import './StartScreen.css';

const CONFIG_KEY = 'co-defuser-config';

function loadConfig(): GameConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw);
    return {
      timerSeconds: TIME_OPTIONS.some(o => o.seconds === parsed.timerSeconds) ? parsed.timerSeconds : DEFAULT_CONFIG.timerSeconds,
      maxMistakes: Math.min(10, Math.max(1, parsed.maxMistakes ?? DEFAULT_CONFIG.maxMistakes)),
      moduleCount: Math.min(8, Math.max(1, parsed.moduleCount ?? DEFAULT_CONFIG.moduleCount)),
      enabledModules: Array.isArray(parsed.enabledModules)
        ? parsed.enabledModules.filter((id: string) => ALL_MODULE_IDS.includes(id))
        : [...DEFAULT_CONFIG.enabledModules],
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(config: GameConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

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
  if (config.moduleCount !== DEFAULT_CONFIG.moduleCount) params.set('mc', String(config.moduleCount));
  if (config.enabledModules.join() !== DEFAULT_CONFIG.enabledModules.join()) params.set('em', config.enabledModules.join(','));
  const s = params.toString();
  return s ? `?${s}` : '';
}

function usePersistedSeed(): [string, (s: string) => void] {
  const [seed, setSeed] = useState(() => {
    const saved = sessionStorage.getItem('seed');
    return saved ?? generateRandomSeed();
  });

  const saveSeed = (s: string) => {
    sessionStorage.setItem('seed', s);
    setSeed(s);
  };

  return [seed, saveSeed];
}

function toggleModule(enabled: string[], id: string): string[] {
  if (enabled.includes(id)) {
    if (enabled.length <= 1) return enabled;
    return enabled.filter(m => m !== id);
  }
  return [...enabled, id];
}

export const StartScreen: React.FC = () => {
  const navigate = useNavigate();
  const [seed, setSeed] = usePersistedSeed();
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<GameConfig>(loadConfig);

  useEffect(() => { saveConfig(config); }, [config]);

  const handleRandomSeed = () => setSeed(generateRandomSeed());

  const handleStart = (role: GameRole) => {
    sessionStorage.setItem('seed', seed);
    const search = configToSearch(config);
    const path = role === 'operator' ? '/operator' : '/manual';
    navigate(`${path}/${encodeURIComponent(seed)}${search}`);
  };

  return (
    <div className="content-wrapper start-screen">
      <div style={{ alignSelf: 'flex-end' }}>
        <ThemeToggle />
      </div>
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
          <div className="config-field">
            <span className="config-label">总时间</span>
            <div className="time-options">
              {TIME_OPTIONS.map(opt => (
                <button
                  key={opt.seconds}
                  className={`time-btn ${config.timerSeconds === opt.seconds ? 'active' : ''}`}
                  onClick={() => setConfig(prev => ({ ...prev, timerSeconds: opt.seconds }))}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="config-field">
            <span className="config-label">最大失误</span>
            <input
              type="number"
              className="config-number"
              min={1}
              max={10}
              step={1}
              value={config.maxMistakes}
              onChange={e => {
                const v = Math.min(10, Math.max(1, parseInt(e.target.value) || 1));
                setConfig(prev => ({ ...prev, maxMistakes: v }));
              }}
            />
          </div>

          <div className="config-field">
            <span className="config-label">模块总数</span>
            <input
              type="number"
              className="config-number"
              min={1}
              max={8}
              step={1}
              value={config.moduleCount}
              onChange={e => {
                const v = Math.min(8, Math.max(1, parseInt(e.target.value) || 1));
                setConfig(prev => ({ ...prev, moduleCount: v }));
              }}
            />
          </div>

          <div className="config-field config-modules">
            <span className="config-label">模块类型</span>
            <div className="module-checkboxes">
              {ALL_MODULE_IDS.map(id => {
                const mod = getModule(id);
                return (
                  <label key={id} className="module-check-label">
                    <input
                      type="checkbox"
                      checked={config.enabledModules.includes(id)}
                      onChange={() => setConfig(prev => ({
                        ...prev,
                        enabledModules: toggleModule(prev.enabledModules, id),
                      }))}
                    />
                    {mod?.displayName ?? id}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
