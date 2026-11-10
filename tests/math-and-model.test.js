import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { kineticEnergy, sampleTimeline } from '../interactive/math.js';

const config = JSON.parse(await readFile(new URL('../book/13-brakes-and-stability-systems/diagrams/brake-explorer/scene.json', import.meta.url), 'utf8'));

test('the energy example uses SI units, speed squared and total mass', () => {
  const reference = kineticEnergy(1400, 100);
  assert.ok(Math.abs(reference - 540.12345679) < 1e-6);
  assert.equal(kineticEnergy(1400, 200), reference * 4);
  assert.equal(kineticEnergy(2800, 100), reference * 2);
  assert.equal(kineticEnergy(1400, 0), 0);
  for (const [mass, speed] of [[0, 100], [1400, -1], [NaN, 100], [1400, Infinity]]) {
    assert.throws(() => kineticEnergy(mass, speed), RangeError);
  }
});

test('the camera follows authored positions and stops at the ends of the timeline', () => {
  const { camera } = config;
  for (const frame of camera) {
    const sampled = sampleTimeline(frame.at, camera);
    for (const key of ['position', 'target']) {
      sampled[key].forEach((number, i) => assert.ok(Math.abs(number - frame[key][i]) < 1e-12));
    }
  }
  assert.deepEqual(sampleTimeline(-1, camera), sampleTimeline(0, camera));
  assert.deepEqual(sampleTimeline(101, camera), sampleTimeline(100, camera));
  const middle = sampleTimeline(15, camera);
  for (const key of ['position', 'target']) {
    middle[key].forEach((number, i) => assert.ok(Math.abs(number - (camera[0][key][i] + camera[1][key][i]) / 2) < 1e-12));
  }
});

test('the actual shipped GLB has the named parts and the stated front-disc envelope', async () => {
  const source = await readFile(new URL('../book/13-brakes-and-stability-systems/diagrams/brake-explorer/brake.glb', import.meta.url));
  const buffer = source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  const { scene } = await new GLTFLoader().parseAsync(buffer, '');
  const { parts } = config;
  for (const { name } of parts) assert.ok(scene.getObjectByName(name), `Missing ${name}`);
  const dimensions = new Box3().setFromObject(scene.getObjectByName('disc')).getSize(new Vector3());
  for (const [axis, metres] of [['x', 0.028], ['y', 0.318], ['z', 0.318]]) {
    assert.ok(Math.abs(dimensions[axis] - metres) < 1e-6, `${axis}: ${dimensions[axis]}`);
  }
  assert.equal(scene.getObjectByName('pistons').children.length, 4);
  assert.equal(scene.getObjectByName('front-brake-assembly').userData.units, 'metres');
});
