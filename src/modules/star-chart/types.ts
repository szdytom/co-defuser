export interface StarPoint {
  x: number;
  y: number;
  color: string;
}

export interface StarChartRule {
  points: StarPoint[];
}

export interface VisiblePoint {
  x: number;
  y: number;
  isSpecial: boolean;
}

export interface StarChartPuzzle {
  viewRect: { x: number; y: number; w: number; h: number };
  visiblePoints: VisiblePoint[];
  specialPointIndex: number;
}
