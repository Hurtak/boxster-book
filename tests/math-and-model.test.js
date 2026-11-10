import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { kineticEnergy, sampleTimeline } from '../interactive/math.js';
import { calculateManualRatio } from '../book/08-manual-transmission-and-clutch/diagrams/manual-ratio-explorer/index.js';
import { differentialSpeeds, openDifferentialTorque } from '../book/10-differential-driveshafts-and-mounts/diagrams/drivetrain-open-differential/model.js';
import { gripBudget } from '../book/12-steering-wheels-and-tyres/diagrams/tyre-grip-budget/index.js';

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
  for (const args of [[-1, 0, 100], [0, NaN, 100], [0, 0, 0], [0, 0, Infinity]]) {
    assert.throws(() => gripBudget(...args), RangeError);
  }
});

const config = JSON.parse(await readFile(new URL('../book/13-brakes-and-stability-systems/diagrams/brake-explorer/scene.json', import.meta.url), 'utf8'));

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

test('the photo-guided car keeps the complete book interface and valid detailed geometry', async () => {
  const source=await readFile(new URL('../interactive/models/reference-car.glb',import.meta.url));
  const {scene}=await new GLTFLoader().parseAsync(source.buffer.slice(source.byteOffset,source.byteOffset+source.byteLength),'');
  for(const name of ['body','interior','chassis','engine','gearbox','hydraulics','wheel-fl','wheel-fr','wheel-rl','wheel-rr','driver-seat','passenger-seat','curved-windscreen']) {
    assert.ok(scene.getObjectByName(name),`Missing ${name}`);
  }
  let vertices=0,paint,tan;
  scene.traverse(object=>{
    if(!object.geometry)return;
    const position=object.geometry.attributes.position,normal=object.geometry.attributes.normal;
    vertices+=position.count;
    for(let i=0;i<position.count;i++) {
      assert.ok(Number.isFinite(position.getX(i)+position.getY(i)+position.getZ(i)),`Invalid vertex in ${object.name}`);
      if(normal)assert.ok(Number.isFinite(normal.getX(i)+normal.getY(i)+normal.getZ(i)),`Invalid normal in ${object.name}`);
    }
    for(const surface of [object.material].flat()) {
      if(surface.name.startsWith('Deep metallic green'))paint=surface;
      if(surface.name.startsWith('Tan leather'))tan=surface;
    }
  });
  assert.ok(vertices>100000,'The shipped asset should retain its detailed geometry');
  assert.ok(source.length<16*1024*1024,'Keep the model practical for the web edition');
  assert.ok(paint&&paint.color.g>paint.color.r*1.5&&paint.color.g>paint.color.b);
  assert.ok(tan&&tan.color.r>tan.color.g&&tan.color.g>tan.color.b);
  const dimensions=new Box3().setFromObject(scene).getSize(new Vector3());
  assert.ok(dimensions.x>1.8&&dimensions.x<2.2&&dimensions.y>1.1&&dimensions.y<1.4&&dimensions.z>4.2&&dimensions.z<4.7,JSON.stringify(dimensions));
});
