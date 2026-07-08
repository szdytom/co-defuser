import React from 'react';
import type { DotPattern } from './types';

export function randomPattern(rng: { next(): number }): DotPattern {
  const pattern: number[] = [];
  for (let i = 0; i < 15; i++) {
    pattern.push(rng.next() > 0.5 ? 1 : 0);
  }
  pattern.length = 15;
  return pattern;
}

export function patternKey(p: DotPattern): string {
  return p.join('');
}

export function generateDotGrid(rng: { next(): number }): DotPattern[][] {
  const columns: DotPattern[][] = [];
  for (let col = 0; col < 8; col++) {
    const colData: DotPattern[] = [];
    const seen = new Set<string>();
    for (let row = 0; row < 6; row++) {
      let pat: DotPattern;
      let attempts = 0;
      do {
        pat = randomPattern(rng);
        attempts++;
      } while (seen.has(patternKey(pat)) && attempts < 500);
      seen.add(patternKey(pat));
      colData.push(pat);
    }
    columns.push(colData);
  }

  for (let attempt = 0; attempt < 2000; attempt++) {
    let ok = true;
    for (let i = 0; i < 8 && ok; i++) {
      for (let j = i + 1; j < 8 && ok; j++) {
        const shared = columns[i].filter(a =>
          columns[j].some(b => patternKey(a) === patternKey(b)),
        );
        if (shared.length >= 4) {
          ok = false;
          const idx = columns[j].findIndex(s => patternKey(s) === patternKey(shared[0]));
          let pat = randomPattern(rng);
          let guard = 0;
          const seenJ = new Set(columns[j].map(patternKey));
          while (seenJ.has(patternKey(pat)) && guard < 50) {
            pat = randomPattern(rng);
            guard++;
          }
          columns[j][idx] = pat;
        }
      }
    }
    if (ok) break;
  }

  const grid: DotPattern[][] = [];
  for (let row = 0; row < 6; row++) {
    const rowData: DotPattern[] = [];
    for (let col = 0; col < 8; col++) {
      rowData.push(columns[col][row]);
    }
    grid.push(rowData);
  }
  return grid;
}

export function RenderDotPattern({ pattern, size = 48, color = '#e0e0e0' }: { pattern: DotPattern; size?: number; color?: string }) {
  const cellSize = size / 5;
  const r = cellSize * 0.3;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => {
          const idx = col <= 2 ? row * 3 + col : row * 3 + (4 - col);
          if (idx >= 15) return null;
          if (!pattern[idx]) return null;
          const cx = col * cellSize + cellSize / 2;
          const cy = row * cellSize + cellSize / 2;
          return <circle key={`${row}-${col}`} cx={cx} cy={cy} r={r} fill={color} />;
        })
      )}
    </svg>
  );
}

export function generateDotPuzzle(rule: { grid: DotPattern[][] }): {
  targetPatterns: DotPattern[];
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
  const targetPatterns = pickedRows.map(r => rule.grid[r][col]);
  const sortedRows = [...pickedRows].sort((a, b) => a - b);
  const correctOrder = sortedRows.map(r => pickedRows.indexOf(r));
  return { targetPatterns, correctOrder, columnIndex: col };
}
