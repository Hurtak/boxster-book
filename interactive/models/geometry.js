import * as THREE from 'three';
import { roadWheel } from './boxster/wheel.js';

export const material = (color, metalness = 0.15, roughness = 0.55) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
export function group(name, parent, position = [0, 0, 0]) {
  const result = new THREE.Group();
  result.name = name;
  result.position.fromArray(position);
  parent?.add(result);
  return result;
}
export function mesh(parent, geometry, surface, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const result = new THREE.Mesh(geometry, surface);
  result.position.fromArray(position);
  result.rotation.set(...rotation);
  parent.add(result);
  return result;
}
export const box = (parent, dimensions, surface, position, rotation) => mesh(parent, new THREE.BoxGeometry(...dimensions), surface, position, rotation);
export const cylinder = (parent, radius, length, surface, position, rotation = [0, 0, Math.PI / 2]) => mesh(parent, new THREE.CylinderGeometry(radius, radius, length, 40), surface, position, rotation);

export function tube(parent, points, radius, surface) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  return mesh(parent, new THREE.TubeGeometry(curve, 40, radius, 6, false), surface);
}

export function wheel(parent, name, position, surface) {
  return roadWheel(parent, name, position, surface);
}

export function annulus(parent, outer, inner, depth, surface, position = [0, 0, 0], holes = false) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
  const opening = new THREE.Path();
  opening.absarc(0, 0, inner, 0, Math.PI * 2, true);
  shape.holes.push(opening);
  if (holes) {
    for (let i = 0; i < 24; i++) {
      const angle = i * Math.PI * 2 / 24;
      const radius = i % 2 ? 0.115 : 0.14;
      const hole = new THREE.Path();
      hole.absarc(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.0035, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }
  }
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 32 });
  geometry.translate(0, 0, -depth / 2);
  return mesh(parent, geometry, surface, position, [0, Math.PI / 2, 0]);
}
