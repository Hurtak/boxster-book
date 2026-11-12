import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Box3, Mesh, MeshStandardMaterial, Raycaster, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { test } from 'vite-plus/test';
import { calculateManualRatio } from '../book/08-manual-transmission-and-clutch/diagrams/manual-ratio-explorer/index.ts';
import {
  differentialSpeeds,
  openDifferentialTorque,
} from '../book/10-differential-driveshafts-and-mounts/diagrams/drivetrain-open-differential/model.ts';
import { gripBudget } from '../book/12-steering-wheels-and-tyres/diagrams/tyre-grip-budget/index.ts';
import { kineticEnergy, sampleTimeline } from '../interactive/math.ts';
import { modelPart } from './model-helpers';
test('the tyre force envelope shares capacity and distinguishes requests beyond the limit', () => {
  assert.deepEqual(gripBudget(60, 80, 100), { resultant: 100, remainingLateral: 80, within: true });
  assert.equal(gripBudget(60, 90, 100).within, false);
  assert.equal(gripBudget(100, 0, 100).within, true);
  assert.equal(gripBudget(120, 0, 100).remainingLateral, 0);
  assert.equal(gripBudget(60, 60, 70).within, false);
  let previous = Infinity;
  for (let force = 0; force <= 120; force++) {
    const result = gripBudget(force, 0, 100);
    assert.ok(result.remainingLateral <= previous);
    assert.ok(Number.isFinite(result.resultant + result.remainingLateral));
    previous = result.remainingLateral;
  }
  for (const args of [
    [-1, 0, 100],
    [0, NaN, 100],
    [0, 0, 0],
    [0, 0, Infinity],
  ] as const) {
    assert.throws(() => gripBudget(args[0], args[1], args[2]), RangeError);
  }
});
const config = JSON.parse(
  await readFile(
    new URL('../book/13-brakes-and-stability-systems/diagrams/brake-explorer/scene.json', import.meta.url),
    'utf8',
  ),
);
test('ideal gearing conserves rotational power and the open differential respects speed and grip constraints', () => {
  const first = calculateManualRatio(1, 3000, 200);
  const sixth = calculateManualRatio(6, 3000, 200);
  assert.ok(first.axleTorqueNm > sixth.axleTorqueNm);
  assert.ok(first.wheelRpm < sixth.wheelRpm);
  for (let gear = 1; gear <= 6; gear++) {
    const result = calculateManualRatio(gear, 3000, 200);
    assert.ok(Math.abs(result.axleTorqueNm * result.wheelRpm - 200 * 3000) < 1e-8);
  }
  for (const difference of [-100, -20, 0, 20, 100]) {
    const speeds = differentialSpeeds(300, difference);
    assert.equal((speeds.leftRpm + speeds.rightRpm) / 2, 300);
  }
  assert.deepEqual(openDifferentialTorque(800, 100), { eachNm: 100, totalNm: 200, unusedNm: 600 });
  assert.deepEqual(openDifferentialTorque(800, 600), { eachNm: 400, totalNm: 800, unusedNm: 0 });
  assert.equal(openDifferentialTorque(800, 0).totalNm, 0);
});
test('the energy example uses SI units, speed squared and total mass', () => {
  const reference = kineticEnergy(1400, 100);
  assert.ok(Math.abs(reference - 540.12345679) < 1e-6);
  assert.equal(kineticEnergy(1400, 200), reference * 4);
  assert.equal(kineticEnergy(2800, 100), reference * 2);
  assert.equal(kineticEnergy(1400, 0), 0);
  for (const [mass, speed] of [
    [0, 100],
    [1400, -1],
    [NaN, 100],
    [1400, Infinity],
  ] as const) {
    assert.throws(() => kineticEnergy(mass, speed), RangeError);
  }
});
test('the camera follows authored positions and stops at the ends of the timeline', () => {
  const { camera } = config;
  for (const frame of camera) {
    const sampled = sampleTimeline(frame.at, camera);
    for (const key of ['position', 'target']) {
      sampled[key as 'position' | 'target'].forEach((number: number, i: string | number) =>
        assert.ok(Math.abs(number - frame[key][i]) < 1e-12),
      );
    }
  }
  assert.deepEqual(sampleTimeline(-1, camera), sampleTimeline(0, camera));
  assert.deepEqual(sampleTimeline(101, camera), sampleTimeline(100, camera));
  const middle = sampleTimeline(15, camera);
  for (const key of ['position', 'target']) {
    middle[key as 'position' | 'target'].forEach((number: number, i: string | number) =>
      assert.ok(Math.abs(number - (camera[0][key][i] + camera[1][key][i]) / 2) < 1e-12),
    );
  }
});
test('the actual shipped GLB has the named parts and the stated front-disc envelope', async () => {
  const source = await readFile(
    new URL('../book/13-brakes-and-stability-systems/diagrams/brake-explorer/brake.glb', import.meta.url),
  );
  const buffer = source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  const { scene } = await new GLTFLoader().parseAsync(buffer, '');
  const { parts } = config;
  for (const { name } of parts) assert.ok(modelPart(scene, name), `Missing ${name}`);
  const dimensions = new Box3().setFromObject(modelPart(scene, 'disc')).getSize(new Vector3());
  for (const [axis, metres] of [
    ['x', 0.028],
    ['y', 0.318],
    ['z', 0.318],
  ] as const) {
    assert.ok(Math.abs(dimensions[axis] - metres) < 1e-6, `${axis}: ${dimensions[axis]}`);
  }
  assert.equal(modelPart(scene, 'pistons').children.length, 4);
  assert.equal(modelPart(scene, 'front-brake-assembly').userData.units, 'metres');
});
test('the photo-guided car keeps the complete book interface and valid detailed geometry', async () => {
  const source = await readFile(new URL('../interactive/models/reference-car.glb', import.meta.url));
  const { scene } = await new GLTFLoader().parseAsync(
    source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength),
    '',
  );
  for (const name of [
    'body',
    'interior',
    'chassis',
    'engine',
    'gearbox',
    'hydraulics',
    'wheel-fl',
    'wheel-fr',
    'wheel-rl',
    'wheel-rr',
    'driver-seat',
    'passenger-seat',
    'curved-windscreen',
  ]) {
    assert.ok(modelPart(scene, name), `Missing ${name}`);
  }
  let vertices = 0;
  let paint: MeshStandardMaterial | undefined, tan: MeshStandardMaterial | undefined;
  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const position = object.geometry.attributes.position,
      normal = object.geometry.attributes.normal;
    vertices += position.count;
    for (let i = 0; i < position.count; i++) {
      assert.ok(
        Number.isFinite(position.getX(i) + position.getY(i) + position.getZ(i)),
        `Invalid vertex in ${object.name}`,
      );
      if (normal)
        assert.ok(
          Number.isFinite(normal.getX(i) + normal.getY(i) + normal.getZ(i)),
          `Invalid normal in ${object.name}`,
        );
    }
    for (const surface of [object.material].flat()) {
      if (!(surface instanceof MeshStandardMaterial)) continue;
      if (surface.name.startsWith('Deep metallic green')) paint = surface;
      if (surface.name.startsWith('Tan leather')) tan = surface;
    }
  });
  assert.ok(vertices > 100000, 'The shipped asset should retain its detailed geometry');
  assert.ok(source.length < 16 * 1024 * 1024, 'Keep the model practical for the web edition');
  assert.ok(paint && paint.color.g > paint.color.r * 1.5 && paint.color.g > paint.color.b);
  assert.ok(tan && tan.color.r > tan.color.g && tan.color.g > tan.color.b);
  const dimensions = new Box3().setFromObject(scene).getSize(new Vector3());
  assert.ok(
    dimensions.x > 1.8 &&
      dimensions.x < 2.2 &&
      dimensions.y > 1.1 &&
      dimensions.y < 1.4 &&
      dimensions.z > 4.2 &&
      dimensions.z < 4.7,
    JSON.stringify(dimensions),
  );
});
test('the exported car retains its dimensions and the reference side-profile landmarks', async () => {
  const source = await readFile(new URL('../interactive/models/reference-car.glb', import.meta.url));
  const { scene } = await new GLTFLoader().parseAsync(
    source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength),
    '',
  );
  scene.updateMatrixWorld(true);
  const shell = modelPart(scene, 'body-shell');
  const body = new Box3().setFromObject(shell).getSize(new Vector3());
  const whole = new Box3().setFromObject(scene).getSize(new Vector3());
  const front = modelPart(scene, 'wheel-fl').getWorldPosition(new Vector3());
  const rear = modelPart(scene, 'wheel-rl').getWorldPosition(new Vector3());
  // Porsche's January 2010 UK brochure, pp. 126–127. The open car's height
  // must not be stretched to the catalogue height of the raised fabric roof.
  assert.ok(Math.abs(front.z - rear.z - 2.415) < 1e-6, 'Retain the actual axle spacing');
  assert.ok(Math.abs(whole.z - 4.342) < 0.015, `Overall length: ${whole.z}`);
  assert.ok(Math.abs(whole.x - 1.952) < 0.006, `Width with mirrors: ${whole.x}`);
  assert.ok(Math.abs(body.x - 1.801) < 0.006, `Body width: ${body.x}`);
  // These broad silhouette bands are photo-guided modelling guards, not
  // factory fitting dimensions. Ray-sample the shipped mesh, not metadata.
  const shoulder = new Raycaster(new Vector3(0.78, 2, 0), new Vector3(0, -1, 0)).intersectObject(shell)[0];
  const rocker = new Raycaster(new Vector3(0.81, -1, 0), new Vector3(0, 1, 0)).intersectObject(shell)[0];
  assert.ok(shoulder && shoulder.point.y > 0.86 && shoulder.point.y < 0.89, 'Door shoulder height');
  assert.ok(rocker && rocker.point.y > 0.205 && rocker.point.y < 0.255, 'Outer sill steps above the underfloor');
  const glass = new Box3().setFromObject(modelPart(scene, 'curved-windscreen')).getSize(new Vector3());
  assert.ok(glass.z > 0.49 && glass.z < 0.52, `Windscreen fore/aft span: ${glass.z}`);
  const seat = new Box3().setFromObject(modelPart(scene, 'driver-seat'));
  const hoop = new Box3().setFromObject(modelPart(scene, 'roll-hoop-1'));
  const gap = seat.min.z - hoop.min.z;
  assert.ok(gap > 0.04 && gap < 0.11, `Hoop must sit closely behind the head restraint: ${gap}`);
});
test('the upper front bumper has a convex painted face without a recessed ring above the plate', async () => {
  const source = await readFile(new URL('../interactive/models/reference-car.glb', import.meta.url));
  const { scene } = await new GLTFLoader().parseAsync(
    source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength),
    '',
  );
  scene.updateMatrixWorld(true);
  const shell = modelPart(scene, 'body-shell');
  const depth = (x: number, y: number) => {
    const hit = new Raycaster(new Vector3(x, y, 3), new Vector3(0, 0, -1)).intersectObject(shell)[0];
    assert.ok(hit, `Missing painted front-bumper surface at ${x}, ${y}`);
    return hit.point.z;
  };
  // The photos show a continuous convex panel between the bonnet and plate.
  // A reverse vertical curve here makes the studio reflection form a dented ring.
  for (const x of [-0.3, -0.15, 0, 0.15, 0.3]) {
    for (const y of [0.47, 0.48, 0.49, 0.5, 0.51, 0.52, 0.53, 0.54, 0.55, 0.56, 0.57, 0.58]) {
      const indentation = (depth(x, y - 0.01) + depth(x, y + 0.01)) / 2 - depth(x, y);
      assert.ok(
        indentation < 0.0001,
        `Concave bumper at x=${x}, y=${y}: ${(indentation * 1000).toFixed(3)} mm behind its neighbours`,
      );
    }
  }
});
test('the bonnet forms an outward crown between the front wings', async () => {
  const source = await readFile(new URL('../interactive/models/reference-car.glb', import.meta.url));
  const { scene } = await new GLTFLoader().parseAsync(
    source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength),
    '',
  );
  scene.updateMatrixWorld(true);
  const shell = modelPart(scene, 'body-shell');
  const height = (x: number, z: number) => {
    const hit = new Raycaster(new Vector3(x, 2, z), new Vector3(0, -1, 0)).intersectObject(shell)[0];
    assert.ok(hit, `Missing bonnet surface at ${x}, ${z}`);
    return hit.point.y;
  };
  // Test the exported painted surface, rather than its authoring parameters or lighting.
  // The small tolerance allows mesh interpolation; this is not a factory dimension.
  for (const z of [0.85, 1.1, 1.35, 1.55]) {
    for (const x of [0.08, 0.16, 0.24]) {
      const indentation = (height(-x, z) + height(x, z)) / 2 - height(0, z);
      assert.ok(
        indentation < 0.0001,
        `Bonnet centre dips ${(indentation * 1000).toFixed(2)} mm below x=±${x} at z=${z}`,
      );
    }
  }
  for (const x of [-0.2, 0, 0.2]) {
    for (const z of [1.72, 1.8, 1.88, 1.96]) {
      const indentation = (height(x, z - 0.04) + height(x, z + 0.04)) / 2 - height(x, z);
      assert.ok(
        indentation < 0.0001,
        `Bonnet front reverses curvature by ${(indentation * 1000).toFixed(2)} mm at ${x}, ${z}`,
      );
    }
  }
});
test('the shipped car has smooth lid centrelines and proportioned mirrored lamps and seat hoops', async () => {
  const source = await readFile(new URL('../interactive/models/reference-car.glb', import.meta.url));
  const { scene } = await new GLTFLoader().parseAsync(
    source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength),
    '',
  );
  scene.updateMatrixWorld(true);
  const shell = modelPart(scene, 'body-shell');
  for (const [z, limit] of [
    [-1.93, 0.001],
    [1.95, 0.001],
    [-1.985, 0.0005],
    [2.005, 0.0005],
  ] as const) {
    const height = (x: number | undefined) => {
      const hit = new Raycaster(new Vector3(x, 2, z), new Vector3(0, -1, 0)).intersectObject(shell)[0];
      assert.ok(hit, `Missing painted lid surface at ${x}, ${z}`);
      return hit.point.y;
    };
    assert.ok(Math.abs(height(0.02) - height(0)) < limit, `A sharp centre ridge returned at z=${z}`);
    assert.ok(Math.abs(height(0.02) - height(-0.02)) < 1e-6, `The lid is not mirrored at z=${z}`);
  }
  const left = new Box3().setFromObject(modelPart(scene, 'headlamp-cover-1'));
  const right = new Box3().setFromObject(modelPart(scene, 'headlamp-cover--1'));
  assert.ok(Math.abs(left.min.x + right.max.x) < 1e-5 && Math.abs(left.max.x + right.min.x) < 1e-5);
  assert.ok(left.getSize(new Vector3()).distanceTo(right.getSize(new Vector3())) < 1e-5);
  const windscreen = new Box3().setFromObject(modelPart(scene, 'curved-windscreen'));
  for (const side of [-1, 1]) {
    const seat = new Box3().setFromObject(modelPart(scene, side > 0 ? 'driver-seat' : 'passenger-seat'));
    const hoop = new Box3().setFromObject(modelPart(scene, `roll-hoop-${side}`));
    assert.ok(!hoop.isEmpty(), 'The named hoop must retain its geometry after export batching');
    assert.ok(
      hoop.max.y > seat.max.y && hoop.max.y < windscreen.max.y + 0.015,
      'The hoop should closely follow the head restraint below the windscreen header',
    );
    assert.ok(
      hoop.getSize(new Vector3()).x < seat.getSize(new Vector3()).x,
      'A hoop should fit behind the seat shoulders',
    );
  }
});
