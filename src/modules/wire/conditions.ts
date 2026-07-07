import type { AtomCondition, WireColor } from './types';
import { ALL_COLORS } from './types';

function countColor(config: WireColor[], color: WireColor): number {
  let c = 0;
  for (const w of config) if (w === color) c++;
  return c;
}

export const CONDITION_POOL: AtomCondition[] = [];

function add(cond: AtomCondition) {
  CONDITION_POOL.push(cond);
}

for (const c of ALL_COLORS) {
  const cn = cnName(c);
  add({ desc: `没有${cn}线`, test: w => countColor(w, c) === 0 });
  add({ desc: `有${cn}线`, test: w => countColor(w, c) > 0 });
  add({ desc: `恰好一根${cn}线`, test: w => countColor(w, c) === 1 });
  add({ desc: `有不止一根${cn}线`, test: w => countColor(w, c) > 1 });
  add({ desc: `最后一根线是${cn}线`, test: w => w.length > 0 && w[w.length - 1] === c });
  add({ desc: `第一根线是${cn}线`, test: w => w.length > 0 && w[0] === c });
}

const comparePairs: [WireColor, WireColor][] = [
  ['red', 'blue'],
  ['red', 'yellow'],
  ['blue', 'red'],
  ['blue', 'yellow'],
  ['yellow', 'red'],
  ['yellow', 'blue'],
  ['white', 'black'],
  ['black', 'green'],
  ['green', 'red'],
];
for (const [a, b] of comparePairs) {
  const an = cnName(a);
  const bn = cnName(b);
  add({ desc: `${an}线多于${bn}线`, test: w => countColor(w, a) > countColor(w, b) });
  add({ desc: `${an}线不少于${bn}线`, test: w => countColor(w, a) >= countColor(w, b) });
}

function cnName(c: WireColor): string {
  switch (c) {
    case 'red': return '红';
    case 'blue': return '蓝';
    case 'yellow': return '黄';
    case 'white': return '白';
    case 'black': return '黑';
    case 'green': return '绿';
  }
}
