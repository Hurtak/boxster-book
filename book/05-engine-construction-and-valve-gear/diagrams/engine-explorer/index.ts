import reference from '../../../../interactive/models/reference-car.glb';
import { mountExplorer } from '../../../../interactive/three/component-explorer.ts';
import type { DiagramContext } from '../../../../interactive/types';
import { config, createAssembly } from './model.ts';

export const mount = (host: HTMLElement, options: DiagramContext) =>
  mountExplorer(host, options, {
    reference,
    base: import.meta.url,
    config,
    createAssembly,
  });
