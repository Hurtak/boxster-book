import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import { test } from 'vite-plus/test';
import { createAssembly } from '../book/10-differential-driveshafts-and-mounts/diagrams/drivetrain-explorer/model';
import { createJointMotion } from '../book/10-differential-driveshafts-and-mounts/diagrams/drivetrain-explorer/joint-motion';
import { disposeObject } from '../interactive/three/scene';

test('joint demonstration keeps the shaft rigid, the inner flange fixed and the outer stub with the hub', () => {
  const model = createAssembly();
  try {
    const motion = createJointMotion(model);
    const hub = model.getObjectByName('left-hub')!;
    const shaft = model.getObjectByName('left-shaft')!;
    const bar = shaft.getObjectByName('rigid-axle-bar')!;
    const cap = shaft.getObjectByName('inner-joint-end-cap')!;
    const neutralHub = hub.position.clone(),
      neutralCap = cap.position.clone(),
      neutralBar = bar.position.clone();
    for (const value of [-1, 0, 1, 0]) {
      hub.position.copy(neutralHub);
      motion(value);
      assert.deepEqual(bar.scale.toArray(), [1, 1, 1], 'The rigid shaft is never stretched');
      assert.deepEqual(cap.position.toArray(), neutralCap.toArray(), 'Transmission-side cap stays fixed');
      assert.ok(Math.abs(hub.position.y - neutralHub.y - value * 0.065) < 1e-10);
      assert.ok(bar.position.toArray().every(Number.isFinite));
      if (value === 0) assert.ok(bar.position.distanceTo(neutralBar) < 1e-10, 'Returns to the installed baseline');
      else assert.ok(Math.abs(new Vector3(1, 0, 0).applyQuaternion(bar.quaternion).y) > 0.01, 'Shaft articulates');
    }
  } finally {
    disposeObject(model);
  }
});
