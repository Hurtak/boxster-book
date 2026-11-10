import reference from '../../../../interactive/models/reference-car.glb';
import { mountExplorer } from '../../../../interactive/three/component-explorer.js';
import { config, createAssembly } from './model.js';

export const mount = (host, options) => mountExplorer(host, options, { reference, base: import.meta.url, config, createAssembly });
