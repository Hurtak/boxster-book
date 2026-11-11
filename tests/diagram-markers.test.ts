import assert from 'node:assert/strict';
import { test } from 'vite-plus/test';
import { placeMarker } from '../interactive/three/marker-layout';

test('a component badge leaves room for the title in a focused phone view', () => {
  const title = { left: 12, top: 12, right: 197, bottom: 50 };
  const point = placeMarker({ x: 73, y: 73 }, 342, 340, [], title);
  assert.ok(point);
  const nearestX = Math.max(title.left, Math.min(point.x, title.right));
  const nearestY = Math.max(title.top, Math.min(point.y, title.bottom));
  assert.ok(Math.hypot(point.x - nearestX, point.y - nearestY) >= 16);
});

test('a wide title and clustered targets retain separate badges inside a small phone canvas', () => {
  const points: { x: number; y: number }[] = [];
  const title = { left: 12, top: 12, right: 268, bottom: 100 };
  for (let i = 0; i < 10; i++) {
    const point = placeMarker({ x: 50 + i * 3, y: 35 }, 280, 340, points, title);
    assert.ok(point, 'The available canvas has room for all ten badges');
    assert.ok(point.x >= 14 && point.x <= 266 && point.y >= 116 && point.y <= 326);
    for (const other of points) assert.ok(Math.hypot(point.x - other.x, point.y - other.y) >= 28);
    points.push(point);
  }
});

test('an unavailable label position does not silently fall back over an occupied area', () => {
  assert.equal(placeMarker({ x: 40, y: 40 }, 100, 100, [], { left: 0, top: 0, right: 100, bottom: 100 }), undefined);
});
