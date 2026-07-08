import type { StarChartRule, StarChartPuzzle, StarPoint } from './types';

const COLORS = ['red', 'yellow', 'blue', 'green', 'black', 'white'];
const W = 5;
const H = 3;
const MARGIN = 0.2;
const MIN_DIST = 0.22;
const POINT_RADIUS = 0.08;

function rand(rng: { next(): number }): number {
  return rng.next();
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function tooClose(x: number, y: number, points: StarPoint[]): boolean {
  for (const p of points) {
    const dx = p.x - x;
    const dy = p.y - y;
    if (dx * dx + dy * dy < MIN_DIST * MIN_DIST) return true;
  }
  return false;
}

function addUniquePoint(
  x: number, y: number, color: string,
  points: StarPoint[], retries = 30,
): void {
  let px = x;
  let py = y;
  for (let attempt = 0; attempt < retries; attempt++) {
    if (!tooClose(px, py, points)) {
      points.push({ x: px, y: py, color });
      return;
    }
    px = x + (rand({ next: () => Math.random() }) - 0.5) * 0.15;
    py = y + (rand({ next: () => Math.random() }) - 0.5) * 0.15;
    px = clamp(px, MARGIN, W - MARGIN);
    py = clamp(py, MARGIN, H - MARGIN);
  }
}

export function generateRule(rng: { next(): number }): StarChartRule {
  const points: StarPoint[] = [];

  const localCount = 2 + Math.floor(rand(rng) * 3);
  for (let li = 0; li < localCount; li++) {
    const cx = MARGIN + rand(rng) * (W - 2 * MARGIN);
    const cy = MARGIN + rand(rng) * (H - 2 * MARGIN);
    const rw = 0.5 + rand(rng) * 1.5;
    const rh = 0.3 + rand(rng) * 0.9;
    const n = 2 + Math.floor(rand(rng) * 4);
    for (let i = 0; i < n; i++) {
      const x = clamp(cx + (rand(rng) - 0.5) * rw, MARGIN, W - MARGIN);
      const y = clamp(cy + (rand(rng) - 0.5) * rh, MARGIN, H - MARGIN);
      const color = COLORS[Math.floor(rand(rng) * COLORS.length)];
      addUniquePoint(x, y, color, points);
    }
  }

  const walkCount = 3 + Math.floor(rand(rng) * 3);
  for (let wi = 0; wi < walkCount; wi++) {
    let x = MARGIN + rand(rng) * (W - 2 * MARGIN);
    let y = MARGIN + rand(rng) * (H - 2 * MARGIN);
    const steps = 3 + Math.floor(rand(rng) * 6);
    const walkPath: { x: number; y: number }[] = [];
    for (let s = 0; s < steps; s++) {
      x = clamp(x + (rand(rng) - 0.5) * 0.5, MARGIN, W - MARGIN);
      y = clamp(y + (rand(rng) - 0.5) * 0.3, MARGIN, H - MARGIN);
      walkPath.push({ x, y });
    }
    const pickCount = 1 + Math.floor(rand(rng) * Math.min(3, walkPath.length));
    const shuffled = [...walkPath].sort(() => rand(rng) - 0.5);
    for (let i = 0; i < pickCount; i++) {
      const color = COLORS[Math.floor(rand(rng) * COLORS.length)];
      addUniquePoint(shuffled[i].x, shuffled[i].y, color, points);
    }
  }

  return { points };
}

export function generatePuzzle(rule: StarChartRule): StarChartPuzzle {
  const specialPointIndex = Math.floor(Math.random() * rule.points.length);
  const sp = rule.points[specialPointIndex];
  const halfW = W / 2;
  const halfH = H / 2;
  let rx = sp.x - Math.random() * halfW;
  let ry = sp.y - Math.random() * halfH;
  rx = clamp(rx, 0, W - halfW);
  ry = clamp(ry, 0, H - halfH);
  const rect = { x: rx, y: ry, w: halfW, h: halfH };

  const visiblePoints = rule.points
    .filter(pt => pt.x + POINT_RADIUS >= rect.x && pt.x - POINT_RADIUS <= rect.x + rect.w && pt.y + POINT_RADIUS >= rect.y && pt.y - POINT_RADIUS <= rect.y + rect.h)
    .map(pt => ({ x: pt.x, y: pt.y, isSpecial: pt === rule.points[specialPointIndex] }));

  return { viewRect: rect, visiblePoints, specialPointIndex };
}

export { POINT_RADIUS };

export function validatePuzzle(
  rule: StarChartRule,
  puzzle: StarChartPuzzle,
  actions: unknown[],
): { correct: boolean; solved: boolean } {
  if (actions.length === 0) return { correct: false, solved: false };
  const last = actions[actions.length - 1] as { color: string } | null;
  if (!last || typeof last.color !== 'string') return { correct: false, solved: false };

  const specialColor = rule.points[puzzle.specialPointIndex].color;
  const correct = last.color === specialColor;
  return { correct, solved: correct };
}
