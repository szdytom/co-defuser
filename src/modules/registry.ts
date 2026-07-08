import type { IModuleType } from './types';
import { wireModule } from './wire';
import { keyboardSVGModule } from './keyboard-svg';
import { keyboardDotModule } from './keyboard-dot';
import { memoryModule } from './memory';
import { timerModule } from './timer';
import { matchingSVGModule } from './matching-svg';
import { matchingDotModule } from './matching-dot';
import { signalModule } from './signal';

export const MODULE_REGISTRY: Record<string, IModuleType<any, any>> = {
  wire: wireModule,
  'keyboard-svg': keyboardSVGModule,
  'keyboard-dot': keyboardDotModule,
  memory: memoryModule,
  timer: timerModule,
  'matching-svg': matchingSVGModule,
  'matching-dot': matchingDotModule,
  signal: signalModule,
};

export function getModule(id: string): IModuleType<any, any> | undefined {
  return MODULE_REGISTRY[id];
}

export function listModules(): IModuleType<any, any>[] {
  return Object.values(MODULE_REGISTRY);
}
