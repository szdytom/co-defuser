import React from 'react';
import type { SVGSymbol, ShapeKind, FillKind, DecoKind } from './types';

const SHAPES: ShapeKind[] = ['circle', 'triangle', 'square', 'hexagon', 'star'];
const FILLS: FillKind[] = ['solid', 'hstripe', 'vstripe', 'dstripe', 'checker', 'dots', 'waves', 'empty'];
const DECOS: DecoKind[] = ['triangles', 'dots', 'circles', 'diamonds'];

export function randomSymbol(rng: { next(): number }): SVGSymbol {
  return {
    shape: SHAPES[Math.floor(rng.next() * SHAPES.length)],
    fill: FILLS[Math.floor(rng.next() * FILLS.length)],
    deco: DECOS[Math.floor(rng.next() * DECOS.length)],
    hue: Math.floor(rng.next() * 360),
    decoCount: Math.floor(rng.next() * 3) + 3,
  };
}

function symbolKey(s: SVGSymbol): string {
  return `${s.shape}|${s.fill}|${s.deco}|${s.hue}|${s.decoCount}`;
}

export function generateGrid(rng: { next(): number }): SVGSymbol[][] {
  // 8 columns × 6 rows
  // Symbols can repeat across columns, but within a column each symbol is unique.
  // For any two columns, |intersection| < 4 (at most 3 symbols in common).
  const pool: SVGSymbol[] = [];
  for (let i = 0; i < 48; i++) {
    pool.push(randomSymbol(rng));
  }

  const columns: SVGSymbol[][] = [];
  for (let col = 0; col < 8; col++) {
    columns.push(pool.slice(col * 6, col * 6 + 6));
  }

  for (let attempt = 0; attempt < 2000; attempt++) {
    let ok = true;
    for (let i = 0; i < 8 && ok; i++) {
      for (let j = i + 1; j < 8 && ok; j++) {
        const shared = columns[i].filter(a =>
          columns[j].some(b => symbolKey(a) === symbolKey(b)),
        );
        if (shared.length >= 4) {
          ok = false;
          const idx = columns[j].findIndex(s => symbolKey(s) === symbolKey(shared[0]));
          let sym = randomSymbol(rng);
          let guard = 0;
          while (columns[j].some(s => symbolKey(s) === symbolKey(sym)) && guard < 50) {
            sym = randomSymbol(rng);
            guard++;
          }
          columns[j][idx] = sym;
        }
      }
    }
    if (ok) break;
  }

  const grid: SVGSymbol[][] = [];
  for (let row = 0; row < 6; row++) {
    const rowData: SVGSymbol[] = [];
    for (let col = 0; col < 8; col++) {
      rowData.push(columns[col][row]);
    }
    grid.push(rowData);
  }
  return grid;
}

const PATTERN_IDS: Record<FillKind, string> = {
  solid: 'pat-solid',
  hstripe: 'pat-hstripe',
  vstripe: 'pat-vstripe',
  dstripe: 'pat-dstripe',
  checker: 'pat-checker',
  dots: 'pat-dots',
  waves: 'pat-waves',
  empty: 'pat-empty',
};

function hsl(hue: number, s: number, l: number): string {
  return `hsl(${hue}, ${s}%, ${l}%)`;
}

export function RenderSymbol({ symbol, size = 48 }: { symbol: SVGSymbol; size?: number }) {
  const uid = React.useId();
  const c = size / 2;
  const r = size * 0.38;
  const strokeW = size * 0.04;
  const fillColor = hsl(symbol.hue, 70, 50);
  const strokeColor = hsl(symbol.hue, 80, 35);
  const lightColor = hsl(symbol.hue, 50, 75);
  const darkColor = hsl(symbol.hue, 80, 25);

  const fillId = `f-${uid}-${symbolKey(symbol).replace(/[^a-zA-Z0-9]/g, '')}`;

  const shapePath = (() => {
    switch (symbol.shape) {
      case 'circle':
        return <circle cx={c} cy={c} r={r} fill={`url(#${fillId})`} stroke={strokeColor} strokeWidth={strokeW} />;
      case 'triangle': {
        const innerR = r * 0.52;
        const halfSide = Math.sqrt(3) * innerR;
        const points = `${c},${c - 2 * innerR} ${c - halfSide},${c + innerR} ${c + halfSide},${c + innerR}`;
        return <polygon points={points} fill={`url(#${fillId})`} stroke={strokeColor} strokeWidth={strokeW} strokeLinejoin="round" />;
      }
      case 'square': {
        const s = r * 1.3;
        return <rect x={c - s} y={c - s} width={s * 2} height={s * 2} fill={`url(#${fillId})`} stroke={strokeColor} strokeWidth={strokeW} rx={size * 0.06} />;
      }
      case 'hexagon': {
        const pts: string[] = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          pts.push(`${c + r * Math.cos(angle)},${c + r * Math.sin(angle)}`);
        }
        return <polygon points={pts.join(' ')} fill={`url(#${fillId})`} stroke={strokeColor} strokeWidth={strokeW} strokeLinejoin="round" />;
      }
      case 'star': {
        const pts: string[] = [];
        const outerR = r;
        const innerR = r * 0.42;
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const radius = i % 2 === 0 ? outerR : innerR;
          pts.push(`${c + radius * Math.cos(angle)},${c + radius * Math.sin(angle)}`);
        }
        return <polygon points={pts.join(' ')} fill={`url(#${fillId})`} stroke={strokeColor} strokeWidth={strokeW} strokeLinejoin="round" />;
      }
    }
  })();

  const decoElements = (() => {
    const els: React.ReactElement[] = [];
    const decoR = r * 0.7;
    const decoSize = size * 0.05;
    for (let i = 0; i < symbol.decoCount; i++) {
      const angle = (Math.PI * 2 / symbol.decoCount) * i;
      const x = c + decoR * Math.cos(angle);
      const y = c + decoR * Math.sin(angle);
      switch (symbol.deco) {
        case 'triangles': {
          const s2 = decoSize * 1.4;
          const tp = `${x},${y - s2} ${x - s2},${y + s2 * 0.7} ${x + s2},${y + s2 * 0.7}`;
          els.push(<polygon key={i} points={tp} fill={lightColor} stroke={darkColor} strokeWidth={0.5} />);
          break;
        }
        case 'dots':
          els.push(<circle key={i} cx={x} cy={y} r={decoSize} fill={darkColor} />);
          break;
        case 'circles':
          els.push(<circle key={i} cx={x} cy={y} r={decoSize * 1.3} fill="none" stroke={lightColor} strokeWidth={1} />);
          break;
        case 'diamonds': {
          const sd = decoSize * 1.2;
          const dp = `${x},${y - sd} ${x + sd},${y} ${x},${y + sd} ${x - sd},${y}`;
          els.push(<polygon key={i} points={dp} fill={darkColor} stroke={lightColor} strokeWidth={0.5} />);
          break;
        }
      }
    }
    return els;
  })();

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        {renderPatternDefs(fillId, symbol.fill, fillColor, lightColor, darkColor, size)}
      </defs>
      {shapePath}
      {decoElements}
    </svg>
  );
}

function renderPatternDefs(id: string, fill: FillKind, color: string, light: string, dark: string, size: number): React.ReactElement | null {
  const dotR = size * 0.02;
  const stripeW = size * 0.08;

  switch (fill) {
    case 'solid':
      return <pattern id={id} width="1" height="1"><rect width="1" height="1" fill={color} /></pattern>;
    case 'hstripe':
      return (
        <pattern id={id} width={stripeW * 2} height={stripeW * 2} patternUnits="userSpaceOnUse">
          <rect width={stripeW * 2} height={stripeW * 2} fill={color} />
          <rect width={stripeW * 2} height={stripeW} fill={dark} />
        </pattern>
      );
    case 'vstripe':
      return (
        <pattern id={id} width={stripeW * 2} height={stripeW * 2} patternUnits="userSpaceOnUse">
          <rect width={stripeW * 2} height={stripeW * 2} fill={color} />
          <rect width={stripeW} height={stripeW * 2} fill={dark} />
        </pattern>
      );
    case 'dstripe':
      return (
        <pattern id={id} width={stripeW * 3} height={stripeW * 3} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={stripeW * 3} height={stripeW * 3} fill={color} />
          <rect width={stripeW} height={stripeW * 3} fill={dark} />
        </pattern>
      );
    case 'checker':
      return (
        <pattern id={id} width={stripeW * 2} height={stripeW * 2} patternUnits="userSpaceOnUse">
          <rect width={stripeW * 2} height={stripeW * 2} fill={color} />
          <rect width={stripeW} height={stripeW} fill={dark} />
          <rect x={stripeW} y={stripeW} width={stripeW} height={stripeW} fill={dark} />
        </pattern>
      );
    case 'dots':
      return (
        <pattern id={id} width={dotR * 8} height={dotR * 8} patternUnits="userSpaceOnUse">
          <rect width={dotR * 8} height={dotR * 8} fill={color} />
          <circle cx={dotR * 4} cy={dotR * 4} r={dotR} fill={dark} />
        </pattern>
      );
    case 'waves':
      return (
        <pattern id={id} width={stripeW * 3} height={stripeW * 3} patternUnits="userSpaceOnUse">
          <rect width={stripeW * 3} height={stripeW * 3} fill={color} />
          <path d={`M0,${stripeW * 1.5} Q${stripeW * 0.75},${stripeW * 0.5} ${stripeW * 1.5},${stripeW * 1.5} T${stripeW * 3},${stripeW * 1.5}`} fill="none" stroke={dark} strokeWidth={stripeW * 0.4} />
        </pattern>
      );
    case 'empty':
      return null;
  }
}

export { symbolKey };

export function generatePuzzle(rule: { grid: SVGSymbol[][] }): {
  targetSymbols: SVGSymbol[];
  correctOrder: number[];
  columnIndex: number;
} {
  const col = Math.floor(Math.random() * 8);
  const rows = [0, 1, 2, 3, 4, 5];
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }
  const pickedRows = rows.slice(0, 4);
  const targetSymbols = pickedRows.map(r => rule.grid[r][col]);
  const sortedRows = [...pickedRows].sort((a, b) => a - b);
  const correctOrder = sortedRows.map(r => pickedRows.indexOf(r));
  return { targetSymbols, correctOrder, columnIndex: col };
}
