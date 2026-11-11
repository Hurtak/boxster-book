import assert from 'node:assert/strict';
import type { Object3D } from 'three';

export function modelPart(root: Object3D, name: string): Object3D {
  const part = root.getObjectByName(name);
  assert.ok(part, `Missing model part: ${name}`);
  return part;
}
