import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { SignalPuzzle, SignalRule } from './types';
import './SignalModule.css';

const DOT_MS = 300;
const DASH_MS = 700;
const GAP_MS = 200;
const LETTER_GAP_MS = 200;
const REPEAT_GAP_MS = 2000;
const SCOPE_WINDOW_MS = 3000;

const LIGHT_STYLES: Record<string, React.CSSProperties> = {
  green: {
    background: '#00cc66',
    boxShadow: '0 0 20px rgba(0, 204, 102, 0.8), 0 0 40px rgba(0, 204, 102, 0.4)',
    borderColor: '#33ee88',
  },
  red: {
    background: '#ff3333',
    boxShadow: '0 0 20px rgba(255, 51, 51, 0.8), 0 0 40px rgba(255, 51, 51, 0.4)',
    borderColor: '#ff6666',
  },
  blue: {
    background: '#3388ff',
    boxShadow: '0 0 20px rgba(51, 136, 255, 0.8), 0 0 40px rgba(51, 136, 255, 0.4)',
    borderColor: '#66aaff',
  },
};

type FlashKind = 'dot' | 'dash';

interface TimedFlash {
  kind: FlashKind;
  delay: number;
}

function flashDuration(kind: FlashKind): number {
  return kind === 'dot' ? DOT_MS : DASH_MS;
}

function buildSequence(codes: string[]): TimedFlash[] {
  const seq: TimedFlash[] = [];
  for (let i = 0; i < codes.length; i++) {
    const flashes = codes[i].split('').map(ch => (ch === '.' ? 'dot' as const : 'dash' as const));
    for (let j = 0; j < flashes.length; j++) {
      const isLastInLetter = j === flashes.length - 1;
      const gap = isLastInLetter && i < codes.length - 1 ? LETTER_GAP_MS : GAP_MS;
      seq.push({ kind: flashes[j], delay: gap });
    }
  }
  return seq;
}

function totalSequenceTime(seq: TimedFlash[]): number {
  return seq.reduce((sum, f) => sum + flashDuration(f.kind) + f.delay, 0);
}

export const SignalOperator: React.FC<{
  puzzle: SignalPuzzle;
  onAction: (action: unknown) => void;
  pressedActions: unknown[];
  disabled: boolean;
  lastActionWrong: boolean;
}> = ({ puzzle, onAction, pressedActions, disabled, lastActionWrong }) => {
  const [input, setInput] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [lightOn, setLightOn] = useState(false);

  const signalLogRef = useRef<{ t: number; on: boolean }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (disabled) return;
    const seq = buildSequence(puzzle.challengeCodes);
    let cancelled = false;
    let timers: ReturnType<typeof setTimeout>[] = [];

    function schedule(idx: number) {
      if (cancelled || idx >= seq.length) return;
      const flash = seq[idx];
      signalLogRef.current.push({ t: performance.now(), on: true });
      setLightOn(true);
      timers.push(setTimeout(() => {
        if (cancelled) return;
        signalLogRef.current.push({ t: performance.now(), on: false });
        setLightOn(false);
        timers.push(setTimeout(() => {
          if (cancelled) return;
          schedule(idx + 1);
        }, flash.delay));
      }, flashDuration(flash.kind)));
    }

    function loop() {
      if (cancelled) return;
      schedule(0);
      const totalTime = totalSequenceTime(seq);
      timers.push(setTimeout(() => {
        if (cancelled) return;
        setLightOn(false);
        timers.push(setTimeout(loop, REPEAT_GAP_MS));
      }, totalTime));
    }

    loop();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [disabled, puzzle.challengeCodes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const rawCtx = canvas?.getContext('2d');
    if (!canvas || !rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    let rafId: number;

    function draw() {
      try {
        const now = performance.now();
        const startTime = now - SCOPE_WINDOW_MS;
        const log = signalLogRef.current;

        ctx.fillStyle = '#0d2343';
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = '#6c85a8';
        ctx.lineWidth = 0.5;
        for (let t = 0; t < SCOPE_WINDOW_MS; t += 500) {
          const x = (t / SCOPE_WINDOW_MS) * W;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, H);
          ctx.stroke();
        }

        if (log.length > 0) {
          const margin = H * 0.15;
          const offY = H - margin;
          const onY = margin;
          const EDGE_MS = 25;
          const noiseAmp = H * 0.07;
          const STEP_MS = 3;

          function nf(t: number): number {
            return Math.sin(t * 0.005) * 0.2
                 + Math.sin(t * 0.011) * 0.1
                 + Math.abs(Math.sin(t * 0.027)) ** 15 * 0.6
                 + Math.abs(Math.sin(t * 0.065)) ** 25 * 0.4
                 - 0.35;
          }

          let state = false;
          let logIdx = 0;
          let lastTransitionT = startTime;
          let lastTransitionFrom = state;

          while (logIdx < log.length && log[logIdx].t <= startTime) {
            lastTransitionT = log[logIdx].t;
            lastTransitionFrom = state;
            state = log[logIdx].on;
            logIdx++;
          }

          ctx.shadowColor = '#00ff66';
          ctx.shadowBlur = 16;
          ctx.strokeStyle = '#00ff66';
          ctx.lineWidth = 1.5;
          ctx.beginPath();

          {
            const y0 = (state ? onY : offY) + nf(startTime) * noiseAmp;
            ctx.moveTo(0, y0);
          }

          for (let t = startTime + STEP_MS; t <= now; t += STEP_MS) {
            while (logIdx < log.length && log[logIdx].t <= t) {
              lastTransitionT = log[logIdx].t;
              lastTransitionFrom = state;
              state = log[logIdx].on;
              logIdx++;
            }

            const elapsed = t - lastTransitionT;
            let value: number;
            if (elapsed < EDGE_MS) {
              const progress = elapsed / EDGE_MS;
              value = lastTransitionFrom ? 1 - progress : progress;
            } else {
              value = state ? 1 : 0;
            }

            const x = ((t - startTime) / SCOPE_WINDOW_MS) * W;
            const yBase = offY + (onY - offY) * value;
            const y = yBase + nf(t) * noiseAmp;
            ctx.lineTo(x, y);
          }

          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      } catch (_) { /* draw error, continue loop */ }

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    if (lastActionWrong) {
      setInput([]);
      setStep(0);
    }
  }, [pressedActions, lastActionWrong]);

  const handleKeyPress = useCallback((symbol: string) => {
    if (disabled || input.length >= 6) return;
    setInput(prev => [...prev, symbol]);
    setStep(prev => Math.min(prev + 1, 6));
  }, [disabled, input.length]);

  const handleBackspace = useCallback(() => {
    if (input.length === 0) return;
    setInput(prev => prev.slice(0, -1));
    setStep(prev => Math.max(0, prev - 1));
  }, [input.length]);

  const handleConfirm = useCallback(() => {
    if (disabled || input.length === 0) return;
    onAction({ input: input.join('') });
  }, [disabled, input, onAction]);

  const currentLayout = puzzle.keyboardLayouts[Math.min(step, puzzle.keyboardLayouts.length - 1)] || [];

  const hasInput = input.length > 0;

  return (
    <div className={`signal-module ${lastActionWrong ? 'shake-module' : ''}`}>
      <div className="signal-top-row">
        <div className="signal-light-wrapper">
          <div
          className={`signal-light ${lightOn ? 'signal-light-on' : ''}`}
          style={lightOn ? LIGHT_STYLES[puzzle.lightColor] : undefined}
        />
        </div>
        <canvas ref={canvasRef} className="signal-scope" />
      </div>

      <div className="signal-input-display">
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            className={`signal-input-slot ${i < input.length ? 'signal-input-slot-filled' : ''} ${i === step && step < 6 ? 'signal-input-slot-active' : ''}`}
          >
            {i < input.length ? input[i] : ''}
          </span>
        ))}
      </div>

      <div className="signal-keyboard">
        {[0, 1, 2].map(ri => (
          <div key={ri} className="signal-keyboard-row">
            {currentLayout.slice(ri * 6, ri * 6 + 6).map((symbol, ci) => (
              <button
                key={`${ri}-${ci}`}
                className="signal-key"
                onClick={() => handleKeyPress(symbol)}
                disabled={disabled}
              >
                {symbol}
              </button>
            ))}
          </div>
        ))}
        <div className="signal-keyboard-row">
          {currentLayout.slice(18, 22).map((symbol, ci) => (
            <button
              key={`3-${ci}`}
              className="signal-key"
              onClick={() => handleKeyPress(symbol)}
              disabled={disabled}
            >
              {symbol}
            </button>
          ))}
          <button
            key="bs"
            className="signal-key signal-key-control"
            onClick={handleBackspace}
            disabled={disabled || input.length === 0}
          >
            ⌫
          </button>
          <button
            key="ok"
            className={`signal-key signal-key-control signal-key-confirm ${hasInput ? 'signal-key-confirm-ready' : ''}`}
            onClick={handleConfirm}
            disabled={disabled || input.length === 0}
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
};

const COLOR_NAMES: Record<string, string> = {
  green: '绿',
  red: '红',
  blue: '蓝',
};

function CodeTable({ codeSet, label }: { codeSet: { codeMap: Record<string, string>; color: string }; label: string }) {
  const items = Object.entries(codeSet.codeMap);
  const rows: { symbol: string; code: string }[][] = [];
  for (let i = 0; i < items.length; i += 3) {
    rows.push(items.slice(i, i + 3).map(([symbol, code]) => ({ symbol, code: code.replaceAll('.', '·') })));
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <h4 style={{ color: `var(--signal-${codeSet.color})`, marginBottom: 6, fontSize: '0.9rem' }}>
        {label} — {COLOR_NAMES[codeSet.color]}灯编码
      </h4>
      <div style={{ overflowX: 'auto' }}>
        <table className="signal-code-table">
          <thead>
            <tr>
              <th>符号</th>
              <th>编码</th>
              <th>符号</th>
              <th>编码</th>
              <th>符号</th>
              <th>编码</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map(({ symbol, code }) => (
                  <React.Fragment key={symbol}>
                    <td className="signal-code-symbol">{symbol}</td>
                    <td className="signal-code-pattern">{code}</td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const SignalExpert: React.FC<{ rule: SignalRule }> = ({ rule }) => {
  return (
    <div className="manual-section">
      <h3>信号模块</h3>
      <p className="manual-rule-text">
        操作员面前有绿、红、蓝三种不同颜色的指示灯（每次只有一种）。
        点(·)为短闪，横(-)为长闪。请根据指示灯颜色找到对应的编码表，
        告知操作员每个闪烁序列对应的符号。
        操作员输入全部符号后按确认键解除。
      </p>
      {rule.codeSets.map((cs, i) => (
        <CodeTable key={cs.color} codeSet={cs} label={`第${i + 1}套`} />
      ))}
    </div>
  );
};
