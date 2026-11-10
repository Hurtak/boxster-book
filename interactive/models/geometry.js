import * as THREE from 'three';

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
  const result = group(name, parent, position);
  const rubber = material('#22252a', 0, 0.95);
  mesh(result, new THREE.TorusGeometry(0.275, 0.054, 16, 48), rubber, [0, 0, 0], [0, Math.PI / 2, 0]);
  const rim = mesh(result, new THREE.TorusGeometry(0.207, 0.014, 8, 48), surface, [0.045, 0, 0], [0, Math.PI / 2, 0]);
  cylinder(result, 0.049, 0.11, surface, [0, 0, 0]);
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5;
    box(result, [0.03, 0.034, 0.17], surface, [0.04, Math.sin(angle) * 0.12, Math.cos(angle) * 0.12], [-angle, 0, 0]);
  }
  return result;
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
