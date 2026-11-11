import assert from 'node:assert/strict';
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { test } from 'vite-plus/test';
import { surfaceAnchor } from '../interactive/three/anchors';
import { part } from '../interactive/three/component-geometry';
import { disposeObject } from '../interactive/three/scene';

function frame() {
  const root = new Group();
  for (const [width, height, x, y] of [
    [0.2, 2.2, -1, 0],
    [0.2, 2.2, 1, 0],
    [1.8, 0.2, 0, -1],
    [1.8, 0.2, 0, 1],
  ]) {
    const bar = new Mesh(new BoxGeometry(width, height, 0.2), new MeshBasicMaterial());
    bar.position.set(x, y, 0);
    root.add(bar);
  }
  return root;
}

test('a frame callout lands on its material instead of the empty centre', () => {
  const root = frame();
  try {
    const point = surfaceAnchor(root);
    const axes = [Math.abs(point.x), Math.abs(point.y)].sort((a, b) => a - b);
    assert.ok(Math.abs(axes[0]) < 1e-7);
    assert.ok(Math.abs(axes[1] - 0.9) < 1e-7, 'The nearest real frame surface is 0.9 m from its empty centre');
    assert.ok(Math.abs(point.z) < 1e-7);
  } finally {
    disposeObject(root);
  }
});

test('surface anchors follow a part through parent transforms and exploded translations', () => {
  const root = frame();
  const parent = new Group();
  parent.position.set(2, 1, -3);
  parent.rotation.set(0.2, 0.4, -0.1);
  parent.add(root);
  try {
    const before = root.worldToLocal(surfaceAnchor(root));
    root.position.add(new Vector3(0.7, 0.4, -0.3));
    root.rotation.set(-0.2, 0.1, 0.3);
    parent.updateMatrixWorld(true);
    const after = root.worldToLocal(surfaceAnchor(root));
    assert.ok(before.distanceTo(after) < 1e-7, 'The leader retains the same physical point on the moving part');
  } finally {
    disposeObject(parent);
  }
});

test('a preferred local target keeps an assembly label on its body instead of a long attached pipe', () => {
  const root = new Group();
  const component = part(root, 'housing', 'Housing', [0, 0, 0], [0, 1, 0], 'Housing with an attached pipe', [0, 0, 0]);
  const body = new Mesh(new BoxGeometry(0.2, 0.2, 0.2), new MeshBasicMaterial());
  const pipe = new Mesh(new BoxGeometry(5, 0.05, 0.05), new MeshBasicMaterial());
  pipe.position.x = 3;
  component.add(body, pipe);
  try {
    const point = surfaceAnchor(component);
    assert.ok(Math.abs(point.length() - 0.1) < 1e-7, 'The target is projected onto the housing surface');
  } finally {
    disposeObject(root);
  }
});
