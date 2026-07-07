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

function patternKey(p: DotPattern): string {
  return p.join('');
}

export function generateDotGrid(rng: { next(): number }): DotPattern[][] {
  const grid: DotPattern[][] = [];
  const seen = new Set<string>();

  for (let row = 0; row < 6; row++) {
    const rowData: DotPattern[] = [];
    for (let col = 0; col < 8; col++) {
      let pat: DotPattern;
      let attempts = 0;
      do {
        pat = randomPattern(rng);
        attempts++;
      } while (seen.has(patternKey(pat)) && attempts < 500);
      seen.add(patternKey(pat));
      rowData.push(pat);
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
  for (let attempt = 0; attempt < 50; attempt++) {
    const col = Math.floor(Math.random() * 8);
    const rows = [0, 1, 2, 3, 4, 5];
    for (let i = rows.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rows[i], rows[j]] = [rows[j], rows[i]];
    }
    const pickedRows = rows.slice(0, 4);
    const targetPatterns = pickedRows.map(r => rule.grid[r][col]);
    const targetKeys = new Set(targetPatterns.map(patternKey));

    let uniqueColumn = true;
    for (let c = 0; c < 8; c++) {
      if (c === col) continue;
      let matchCount = 0;
      for (let r = 0; r < 6; r++) {
        if (targetKeys.has(patternKey(rule.grid[r][c]))) matchCount++;
      }
      if (matchCount >= 4) {
        uniqueColumn = false;
        break;
      }
    }

    if (!uniqueColumn) continue;

    const sortedRows = [...pickedRows].sort((a, b) => a - b);
    const correctOrder = sortedRows.map(r => pickedRows.indexOf(r));
    return { targetPatterns, correctOrder, columnIndex: col };
  }

  const col = 0;
  const targetPatterns = [rule.grid[0][0], rule.grid[1][0], rule.grid[2][0], rule.grid[3][0]];
  const correctOrder = [0, 1, 2, 3];
  return { targetPatterns, correctOrder, columnIndex: col };
}
