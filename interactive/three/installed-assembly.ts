import type { Object3D } from 'three';
import { ExplorerConfig } from '../types.ts';
import { disposeObject } from './scene.ts';

// The detailed assembly is installed from the first frame. Remove the car's
// corresponding context geometry once, rather than crossfading two versions
// with different shapes/positions. Dispose removed context only at scene teardown
// so shared materials cannot be disposed underneath retained trim.
export function installAssembly(
  car: Object3D,
  config: Pick<ExplorerConfig, 'id' | 'hideCarParts' | 'reuseCarParts' | 'finishInstallation'>,
  model?: Object3D,
) {
  const removed: Object3D[] = [];
  // Resolve everything before mutating either model; a stale name is an error.
  const replacements = Object.entries(config.reuseCarParts ?? {}).map(([partName, names]) => {
    const target = model?.getObjectByName(partName);
    if (!target) throw new Error(`${config.id}: missing assembly part ${partName}`);
    const sources = names.map((name) => {
      const source = car.getObjectByName(name);
      if (!source) throw new Error(`${config.id}: missing car source ${name}`);
      return source;
    });
    return { target, sources };
  });
  const hidden = (config.hideCarParts ?? []).map((name) => {
    const object = car.getObjectByName(name);
    if (!object) throw new Error(`${config.id}: missing car replacement target ${name}`);
    return object;
  });
  // Reuse the actual surface where it seats in a compound-curved opening.
  car.updateMatrixWorld(true);
  model?.updateMatrixWorld(true);
  try {
    for (const { target, sources } of replacements) {
      removed.push(...target.children);
      target.clear();
      sources.forEach((source) => target.attach(source));
    }
    if (model) config.finishInstallation?.(model);
    hidden.forEach((object) => {
      object.removeFromParent();
      removed.push(object);
    });
  } catch (error) {
    removed.forEach(disposeObject);
    throw error;
  }
  return () => {
    removed.forEach(disposeObject);
    removed.length = 0;
  };
}
