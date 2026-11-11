import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Box3, DoubleSide, Mesh, MeshPhysicalMaterial, Raycaster, Triangle, Vector3, type Intersection } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { test } from 'vite-plus/test';
import { modelPart } from './model-helpers';

async function carModel() {
  const source = await readFile(new URL('../interactive/models/reference-car.glb', import.meta.url));
  const { scene } = await new GLTFLoader().parseAsync(
    source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength),
    '',
  );
  scene.updateMatrixWorld(true);
  return scene;
}
const vertex = (mesh: Mesh, index: number) =>
  new Vector3().fromBufferAttribute(mesh.geometry.getAttribute('position'), index).applyMatrix4(mesh.matrixWorld);

test('shipped headlamps have enclosing optical covers with retained refraction', async () => {
  const scene = await carModel();
  for (const side of [-1, 1]) {
    const cover = modelPart(scene, `headlamp-cover-${side}`);
    assert.ok(cover instanceof Mesh && cover.material instanceof MeshPhysicalMaterial);
    // Inspect both interfaces even though the renderer culls the rear faces.
    cover.material.side = DoubleSide;
    const centre = new Box3().setFromObject(cover).getCenter(new Vector3());
    const outward = new Vector3(side * 0.12, 0.66, 0.74).normalize();
    const hits = new Raycaster(centre.clone().addScaledVector(outward, 0.4), outward.clone().negate()).intersectObject(
      cover,
    );
    const interfaces = hits.filter((hit, i) => !i || Math.abs(hit.distance - hits[i - 1].distance) > 1e-5);
    assert.equal(interfaces.length, 2, 'A protective cover needs distinct outer and inner surfaces');
    const front = interfaces[0],
      back = interfaces[1];
    assert.ok(front.face && back.face);
    assert.ok(front.face.normal.clone().transformDirection(cover.matrixWorld).dot(outward) > 0);
    assert.ok(back.face.normal.clone().transformDirection(cover.matrixWorld).dot(outward) < 0);
    const thickness = interfaces[1].distance - interfaces[0].distance;
    assert.ok(thickness > 0.002 && thickness < 0.006, `Unexpected cover thickness: ${thickness}`);
    assert.equal(cover.material.opacity, 1, 'Alpha blending must not make the cover reflections disappear');
    assert.ok(cover.material.transmission > 0.8 && cover.material.ior > 1.4);
  }
});

test('the shipped cover fits the wing aperture and encloses its optical elements', async () => {
  const scene = await carModel();
  const shell = modelPart(scene, 'body-shell');
  assert.ok(shell instanceof Mesh && shell.geometry.index);
  const shellIndices = shell.geometry.index;
  const edges = new Map<string, { a: number; b: number; count: number }>();
  for (let i = 0; i < shellIndices.count; i += 3) {
    for (let edge = 0; edge < 3; edge++) {
      const a = shellIndices.getX(i + edge),
        b = shellIndices.getX(i + ((edge + 1) % 3));
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      const record = edges.get(key);
      if (record) record.count++;
      else edges.set(key, { a, b, count: 1 });
    }
  }
  for (const side of [-1, 1]) {
    const cover = modelPart(scene, `headlamp-cover-${side}`);
    assert.ok(cover instanceof Mesh && cover.geometry.index);
    const bounds = new Box3().setFromObject(cover).expandByScalar(0.008);
    const rim = new Set<number>();
    for (const { a, b, count } of edges.values()) {
      if (count === 1) for (const i of [a, b]) if (bounds.containsPoint(vertex(shell, i))) rim.add(i);
    }
    assert.ok(rim.size > 30, 'The check must sample the actual painted aperture boundary');
    const indices = cover.geometry.index;
    const triangles: Triangle[] = [];
    for (let i = 0; i < indices.count; i += 3) {
      triangles.push(
        new Triangle(
          vertex(cover, indices.getX(i)),
          vertex(cover, indices.getX(i + 1)),
          vertex(cover, indices.getX(i + 2)),
        ),
      );
    }
    const closest = new Vector3();
    for (const i of rim) {
      const point = vertex(shell, i);
      const gap = Math.sqrt(
        Math.min(...triangles.map((triangle) => triangle.closestPointToPoint(point, closest).distanceToSquared(point))),
      );
      assert.ok(gap < 0.003, `Cover separates from its painted aperture by ${gap} m`);
    }
    const outward = new Vector3(side * 0.12, 0.66, 0.74).normalize();
    const housingBack = modelPart(scene, `headlamp-cover-${side}-floor`);
    for (const name of [
      'headlamp-optic-main',
      'headlamp-optic-high',
      'headlamp-reflector-main',
      'headlamp-reflector-high',
      'headlamp-indicator',
    ]) {
      const optic = modelPart(scene, `${name}-${side}`);
      assert.ok(optic instanceof Mesh);
      const positions = optic.geometry.getAttribute('position');
      for (let i = 0; i < positions.count; i++) {
        const point = vertex(optic, i);
        const hit: Intersection | undefined = new Raycaster(
          point.clone().addScaledVector(outward, 0.4),
          outward.clone().negate(),
        ).intersectObject(cover)[0];
        assert.ok(
          hit && hit.distance < 0.399,
          `${name}-${side} vertex ${i} at ${point.toArray().join(', ')} protrudes through or beyond its cover (hit: ${hit?.distance})`,
        );
        const obstruction: Intersection | undefined = new Raycaster(
          point.clone().addScaledVector(outward, 0.4),
          outward.clone().negate(),
        ).intersectObject(housingBack)[0];
        assert.ok(
          !obstruction || obstruction.distance > 0.401,
          `${name}-${side} is clipped by the back of its housing`,
        );
      }
    }
  }
});
