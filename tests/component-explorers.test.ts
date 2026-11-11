import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Box3, Mesh, PerspectiveCamera, Vector3 } from 'three';
import { test } from 'vite-plus/test';
import { frameBounds, geometryCorners } from '../interactive/three/component-explorer.ts';
import { disposeObject } from '../interactive/three/scene.ts';
import type { AssemblyModule } from '../interactive/types';
const componentChapters = Array.from({ length: 15 }, (_, i) => i + 4).filter((number) => number !== 13);
const chapters = (await readdir(resolve('book')))
  .filter((name) => componentChapters.includes(Number(name.slice(0, 2))))
  .sort();
const explorers: (AssemblyModule & {
  chapter: string;
})[] = [];
for (const chapter of chapters) {
  const directory = resolve('book', chapter, 'diagrams');
  for (const name of await readdir(directory)) {
    if (!name.endsWith('-explorer')) continue;
    const file = resolve(directory, name, 'model.ts');
    const source = await readFile(file, 'utf8').catch((error) =>
      error.code === 'ENOENT' ? '' : Promise.reject(error),
    );
    if (!source.includes('export function createAssembly')) continue;
    const model = await import(pathToFileURL(file).href);
    if (model.createAssembly) explorers.push({ chapter, ...model });
  }
}
test('every component chapter has a located assembly and a connected set of identifiable parts', () => {
  assert.equal(explorers.length, 14);
  assert.deepEqual(
    explorers.map((item) => Number(item.chapter.slice(0, 2))),
    componentChapters,
  );
  for (const { config, createAssembly } of explorers) {
    const model = createAssembly();
    try {
      const parts = model.children.filter((part) => part.userData.label);
      const names = new Set(parts.map((part) => part.name));
      assert.equal(names.size, parts.length, `${config.id}: unambiguous part names`);
      assert.ok(names.has(config.focus), config.id);
      assert.ok(parts.length >= 5 && parts.length <= 10, `${config.id}: useful breakdown`);
      const reached = new Set([config.focus]);
      for (const connection of config.connections) {
        assert.ok(names.has(connection.from) && names.has(connection.to), `${config.id}: missing physical endpoint`);
        assert.ok(
          connection.label &&
            ['mechanical', 'fluid', 'air', 'electrical', 'signal', 'structure'].includes(connection.kind),
        );
      }
      for (let i = 0; i < parts.length; i++)
        for (const { from, to } of config.connections) {
          if (reached.has(from)) reached.add(to);
          if (reached.has(to)) reached.add(from);
        }
      assert.equal(reached.size, parts.length, `${config.id}: isolated component`);
      for (const part of parts) {
        assert.ok(part.userData.description, `${config.id}/${part.name}: explain its role`);
        assert.ok(part.userData.explode.length === 3 && part.userData.explode.every(Number.isFinite));
        assert.ok(!new Box3().setFromObject(part).isEmpty(), `${config.id}/${part.name}: missing geometry`);
      }
      const bounds = new Box3().setFromObject(model);
      assert.ok(
        bounds.min.x > -1.6 &&
          bounds.max.x < 1.6 &&
          bounds.min.y > -0.1 &&
          bounds.max.y < 2 &&
          bounds.min.z > -2.7 &&
          bounds.max.z < 2.7,
        `${config.id}: assembly must fit its installed car context`,
      );
      model.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        for (const key of ['position', 'normal']) {
          const attribute: import('three').BufferAttribute | import('three').InterleavedBufferAttribute =
            object.geometry.attributes[key];
          assert.ok(attribute, `${config.id}/${object.name}: missing ${key}`);
          assert.ok(Array.from(attribute.array).every(Number.isFinite), `${config.id}: invalid geometry`);
        }
      });
    } finally {
      disposeObject(model);
    }
  }
});
test('assembly and exploded camera framing keeps each complete component in view on phones and desktops', () => {
  for (const { config, createAssembly } of explorers) {
    const model = createAssembly();
    try {
      for (const exploded of [false, true]) {
        if (exploded)
          for (const part of model.children)
            if (part.userData.explode) part.position.add(new Vector3(...part.userData.explode));
        const bounds = new Box3().setFromObject(model);
        const corners = geometryCorners(model);
        for (const aspect of [342 / 340, 652 / 420]) {
          const camera = new PerspectiveCamera(36, aspect, 0.01, 60);
          const direction = new Vector3(...(config.direction ?? [1.25, 0.85, 1.65])).normalize();
          const pose = frameBounds(bounds, camera, direction, 1.18, corners);
          camera.position.fromArray(pose.position);
          camera.lookAt(new Vector3(...pose.target));
          camera.updateMatrixWorld();
          for (const corner of corners) {
            const projected = corner.clone().project(camera);
            assert.ok(
              Math.abs(projected.x) < 0.99 && Math.abs(projected.y) < 0.99 && projected.z > -1 && projected.z < 1,
              `${config.id}: clipped ${exploded ? 'exploded' : 'assembled'} bounds at aspect ${aspect}`,
            );
          }
        }
      }
    } finally {
      disposeObject(model);
    }
  }
});
