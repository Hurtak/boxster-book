import reference from '../../../../interactive/models/reference-car.glb';
import { mountExplorer } from '../../../../interactive/three/component-explorer.ts';
import type { DiagramContext } from '../../../../interactive/types';
import { config, createAssembly } from './model.ts';
import { createJointMotion } from './joint-motion';

export const mount = (host: HTMLElement, options: DiagramContext) =>
  mountExplorer(host, options, {
    reference,
    base: import.meta.url,
    config,
    createAssembly,
    motion: {
      create: createJointMotion,
      note: 'Wheel movement changes joint angle and required reach. The rigid bar keeps its length and slides relative to the inner joint. Motion and boot deformation are illustrative, not measured suspension travel or Porsche joint limits. Movement is suppressed in the exploded view.',
    },
  });
