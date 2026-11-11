import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Vector3, Raycaster } from 'three';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { referenceCar } from '../interactive/models/reference-car.js';
import { createAssembly as roofAssembly } from '../book/14-roof-glass-seals-and-drainage/diagrams/roof-explorer/model.js';
import { disposeObject } from '../interactive/three/scene.js';
import { installAssembly } from '../interactive/three/installed-assembly.js';
import { brakeAssembly } from '../book/13-brakes-and-stability-systems/diagrams/brake-explorer/model.js';

const explorers = [];
for (const chapter of (await readdir('book')).sort()) {
  for (const diagram of await readdir(`book/${chapter}/diagrams`).catch(() => [])) {
    const file = resolve('book', chapter, 'diagrams', diagram, 'model.js');
    if (!(await readFile(file, 'utf8').catch(() => '')).includes('export function createAssembly')) continue;
    explorers.push(await import(pathToFileURL(file)));
  }
}

function vertices(root) {
  root.updateWorldMatrix(true, true);
  const points = [];
  root.traverse(object => {
    if (!object.isMesh) return;
    const positions = object.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) points.push(new Vector3().fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld));
  });
  return points;
}

function sameSurface(actual, expected, label) {
  assert.ok(actual && expected, label);
  const a = vertices(actual), b = vertices(expected);
  assert.equal(a.length, b.length, `${label}: same tessellation`);
  a.forEach((point, i) => assert.ok(point.distanceTo(b[i]) < 1e-6, `${label}: vertex ${i}`));
}

test('the roof header uses the car windscreen frame, in the same installed coordinates', () => {
  const car = referenceCar(), roof = roofAssembly();
  try {
    const carFrame = car.getObjectByName('windscreen-frame');
    const header = roof.getObjectByName('header').getObjectByName('windscreen-frame');
    assert.ok(carFrame && header, 'Both views must use the complete named windscreen frame');
    const actual = new Box3().setFromObject(header), expected = new Box3().setFromObject(carFrame);
    assert.ok(actual.min.distanceTo(expected.min) < 1e-6);
    assert.ok(actual.max.distanceTo(expected.max) < 1e-6);
    const top = new Vector3(0, 1.175, .12);
    assert.ok(actual.containsPoint(top), 'Header must meet the top of the car windscreen');
  } finally { disposeObject(car); disposeObject(roof); }
});

test('visible frames, seats, controls, glass and road wheel match the shared car vertex for vertex', () => {
  const car = referenceCar();
  const bindings = {
    'body-explorer': [['windscreen-frame', 'windscreen-frame']],
    'roof-explorer': [['header', 'windscreen-frame']],
    'cabin-explorer': [['seat-upholstery', 'driver-seat']],
    'steering-explorer': [['column', 'tan-steering-wheel']],
    'manual-explorer': [['selector', 'gear-lever']],
    'audio-explorer': [['head-unit', 'radio-unit'], ['windscreen-aerial', 'curved-windscreen']],
    'suspension-explorer': [['wheel', 'wheel-fl']],
    'protection-explorer': [['windscreen-frame', 'windscreen-frame'], ['front-modules', 'tan-steering-wheel'], ['seats', 'driver-seat'], ['seats', 'passenger-seat']],
  };
  try {
    for (const { config, createAssembly } of explorers) {
      const model = createAssembly();
      try {
        for (const [part, name] of bindings[config.id] ?? []) {
          const owner = model.getObjectByName(part);
          const actual = owner.children.find(child => child.name === name)
            ?? (config.id === 'suspension-explorer' ? owner.getObjectByName('road-wheel') : owner.getObjectByName(name));
          sameSurface(actual, car.getObjectByName(name), `${config.id}/${name}`);
        }
      } finally { disposeObject(model); }
    }
  } finally { disposeObject(car); }
});

test('the brake wheel is the actual car wheel at the front-left axle, with no duplicate context brake', () => {
  const car = referenceCar(), brake = brakeAssembly();
  brake.position.set(.76, .329, 1.2075);
  const cleanup = installAssembly(car, { id: 'brake-explorer', hideCarParts: ['wheel-fl', 'brake-fl'] });
  const expected = referenceCar();
  try {
    sameSurface(brake.getObjectByName('wheel'), expected.getObjectByName('wheel-fl'), 'Brake wheel fits actual axle');
    assert.equal(car.getObjectByName('wheel-fl'), undefined);
    assert.equal(car.getObjectByName('brake-fl'), undefined);
    assert.ok(car.getObjectByName('brake-fr'), 'Retain the other corner brakes');
  } finally { cleanup(); disposeObject(car); disposeObject(brake); disposeObject(expected); }
});

test('the roof bows remain under the cloth and an invalid replacement cannot partly strip the car', () => {
  const roof = roofAssembly(), car = referenceCar();
  try {
    const cloth = new Box3().setFromObject(roof.getObjectByName('covering'));
    const frame = new Box3().setFromObject(roof.getObjectByName('roof-frame'));
    assert.ok(frame.max.y <= cloth.max.y, 'No supporting bow protrudes through the roof crown');
    const wheel = car.getObjectByName('wheel-fl');
    assert.throws(() => installAssembly(car, { id: 'invalid', hideCarParts: ['wheel-fl', 'nonexistent'] }), /missing car replacement target/);
    assert.equal(car.getObjectByName('wheel-fl'), wheel);
  } finally { disposeObject(car); disposeObject(roof); }
});

test('every shipped-car replacement resolves and reused parts retain their exact installed world geometry', async () => {
  const bytes = await readFile('interactive/models/reference-car.glb');
  const { scene: original } = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  assert.equal(explorers.length, 14);
  try {
    for (const { config, createAssembly } of explorers) {
      const car = original.clone(true), model = createAssembly();
      const positions = model.children.map(object => [object, object.position.clone()]);
      const sources = Object.entries(config.reuseCarParts ?? {}).flatMap(([part, names]) => names.map(name => {
        const object = car.getObjectByName(name);
        assert.ok(object, `${config.id}/${name}: source survived GLB export`);
        object.updateWorldMatrix(true, true);
        const meshes = [];
        object.traverse(mesh => { if (mesh.isMesh) meshes.push({ mesh, geometry: mesh.geometry, matrix: mesh.matrixWorld.clone() }); });
        return { part, name, object, meshes };
      }));
      const cleanup = installAssembly(car, config, model);
      try {
        for (const name of config.hideCarParts ?? []) assert.equal(car.getObjectByName(name), undefined, `${config.id}/${name}: no duplicate context geometry`);
        for (const { part, name, object, meshes } of sources) {
          assert.equal(car.getObjectByName(name), undefined);
          assert.equal(model.getObjectByName(part).getObjectByName(name), object, 'Same object, not an approximate replacement');
          object.updateWorldMatrix(true, true);
          for (const { mesh, geometry, matrix } of meshes) {
            assert.equal(mesh.geometry, geometry, 'Preserve actual source surface');
            matrix.elements.forEach((value, i) => assert.ok(Math.abs(value - mesh.matrixWorld.elements[i]) < 1e-6, `${config.id}/${name}: installation moved a surface`));
          }
        }
        for (const [object, position] of positions) assert.ok(object.position.equals(position), `${config.id}: fitting must not move the assembly root`);
      } finally { cleanup(); disposeObject(car); disposeObject(model); }
    }
  } finally { disposeObject(original); }
});

test('the front strut mount fits below the actual bonnet and wheel axes stay coaxial', () => {
  const car = referenceCar();
  const model = explorers.find(({ config }) => config.id === 'suspension-explorer').createAssembly();
  try {
    car.updateMatrixWorld(true);
    const hit = new Raycaster(new Vector3(.57, 2, 1.15), new Vector3(0, -1, 0)).intersectObject(car.getObjectByName('body-shell'))[0];
    assert.ok(hit);
    assert.ok(new Box3().setFromObject(model.getObjectByName('body-mounts')).max.y < hit.point.y);
    const wheel = new Box3().setFromObject(model.getObjectByName('wheel')).getCenter(new Vector3());
    assert.ok(wheel.distanceTo(new Vector3(.76, .329, 1.2075)) < .002);
  } finally { disposeObject(car); disposeObject(model); }
});

test('the cabin inlet filter stays under the bonnet rather than appearing through it', () => {
  const car = referenceCar();
  const model = explorers.find(({ config }) => config.id === 'cabin-explorer').createAssembly();
  try {
    car.updateMatrixWorld(true);
    const blower = new Box3().setFromObject(model.getObjectByName('inlet-blower'));
    for (const x of [-.13, .17]) for (const z of [.77, .95]) {
      const hit = new Raycaster(new Vector3(x, 2, z), new Vector3(0, -1, 0)).intersectObject(car.getObjectByName('body-shell'))[0];
      assert.ok(hit && blower.max.y < hit.point.y, 'Filter must stay inside the surrounding body');
    }
  } finally { disposeObject(car); disposeObject(model); }
});
