import type { IModuleType } from './types';
import { wireModule } from './wire';
import { keyboardSVGModule } from './keyboard-svg';
import { keyboardDotModule } from './keyboard-dot';
import { memoryModule } from './memory';

export const MODULE_REGISTRY: Record<string, IModuleType<any, any>> = {
  wire: wireModule,
  'keyboard-svg': keyboardSVGModule,
  'keyboard-dot': keyboardDotModule,
  memory: memoryModule,
};

export function getModule(id: string): IModuleType<any, any> | undefined {
  return MODULE_REGISTRY[id];
}

export function listModules(): IModuleType<any, any>[] {
  return Object.values(MODULE_REGISTRY);
}
