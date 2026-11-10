import * as THREE from 'three';
import { profile } from './surfaces.js';

export const front = 1.85,
  rear = -1.85;
const widths = [
  [-1.85, 0.86],
  [-1.82, 0.86],
  [-1.35, 0.9],
  [-0.85, 0.87],
  [-0.3, 0.815],
  [0.3, 0.82],
  [0.85, 0.87],
  [1.25, 0.9],
  [1.82, 0.84],
  [1.85, 0.84],
];
const heights = [
  [-2.18, 0.565],
  [-1.85, 0.66],
  [-1.2, 0.735],
  [-0.67, 0.765],
  [0, 0.76],
  [0.5, 0.8],
  [0.85, 0.765],
  [1.25, 0.715],
  [1.7, 0.65],
  [1.85, 0.605],
  [2.19, 0.56],
];
export function width(z) {
  if (z > front)
    return 0.84 * Math.sqrt(Math.max(0, 1 - ((z - front) / 0.34) ** 2));
  if (z < rear)
    return 0.86 * Math.sqrt(Math.max(0, 1 - ((z - rear) / 0.33) ** 2));
  return profile(widths, z);
}
export function deckHeight(x, z) {
  const u = Math.min(1, Math.abs(x) / Math.max(0.0001, width(z)));
  const haunch =
    (z > 0 ? 0.16 : 0.105) * Math.exp(-(((Math.abs(z) - 1.22) / 0.65) ** 2));
  const endTaper = Math.min(1, width(z) / 0.4);
  return (
    profile(heights, z) +
    (haunch * Math.exp(-(((u - 0.85) / 0.28) ** 2)) - 0.035 * u ** 12) *
      endTaper
  );
}
export const shoulder = (z) => deckHeight(width(z), z);
export function flank(side, z, y) {
  const t = THREE.MathUtils.clamp(
    (shoulder(z) - y) / (shoulder(z) - 0.19),
    0,
    1
  );
  return (
    side * (width(z) * (1 - 0.075 * t ** 2) + 0.018 * Math.sin(t * Math.PI))
  );
}
export function cap(x, y, isRear = false) {
  const radius = isRear ? 0.86 : 0.84;
  const end = isRear ? rear : front;
  const z =
    end +
    (isRear ? -0.33 : 0.34) * Math.sqrt(Math.max(0, 1 - (x / radius) ** 2));
  const top = deckHeight(x, z),
    t = THREE.MathUtils.clamp((top - y) / (top - 0.195), 0, 1);
  return {
    x: x * (1 - 0.075 * t * t) + (0.018 * Math.sin(t * Math.PI) * x) / radius,
    z:
      z +
      (isRear ? -1 : 1) *
        0.025 *
        Math.sin(t * Math.PI) *
        (1 - (x / radius) ** 2),
  };
}
export const frontZ = (x, y) => cap(x, y).z;
export const rearZ = (x, y) => cap(x, y, true).z;

// Both adjoining panels use these exact vertices, including the centre apex.
export function capBoundary(isRear = false) {
  const radius = isRear ? 0.86 : 0.84;
  return Array.from({ length: 121 }, (_, i) => {
    const x = -radius + (2 * radius * i) / 120;
    const z =
      (isRear ? rear : front) +
      (isRear ? -0.33 : 0.34) * Math.sqrt(Math.max(0, 1 - (x / radius) ** 2));
    return { x, z };
  });
}
