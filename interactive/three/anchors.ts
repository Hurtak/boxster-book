import { Box3, Matrix4, Mesh, Triangle, Vector3, type BufferGeometry, type Object3D } from 'three';

const localAnchors = new WeakMap<Object3D, Vector3>();

// Assembly parts move rigidly. Retain a point on their actual triangles in part
// coordinates, so leaders cannot target the empty centre of a frame or bank pair.
export function surfaceAnchor(object: Object3D): Vector3 {
  let anchor = localAnchors.get(object);
  if (!anchor) {
    object.updateWorldMatrix(true, true);
    const inverse = object.matrixWorld.clone().invert();
    const bounds = new Box3();
    const meshes: { geometry: BufferGeometry; matrix: Matrix4 }[] = [];
    object.traverse((child) => {
      if (!(child instanceof Mesh) || !child.geometry.getAttribute('position')) return;
      const geometry = child.geometry;
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      const matrix = new Matrix4().multiplyMatrices(inverse, child.matrixWorld);
      bounds.union(geometry.boundingBox!.clone().applyMatrix4(matrix));
      meshes.push({ geometry, matrix });
    });
    if (bounds.isEmpty()) throw new Error(`Cannot anchor an empty component: ${object.name}`);
    const target = bounds.getCenter(new Vector3());
    const preferred: unknown = object.userData.anchor;
    if (preferred !== undefined) {
      if (!Array.isArray(preferred) || preferred.length !== 3)
        throw new Error(`Invalid local anchor for component: ${object.name}`);
      const [x, y, z] = preferred as unknown[];
      if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number' || ![x, y, z].every(Number.isFinite))
        throw new Error(`Invalid local anchor for component: ${object.name}`);
      target.set(x, y, z);
    }
    const triangle = new Triangle();
    const candidate = new Vector3();
    anchor = new Vector3();
    let distance = Infinity;
    for (const { geometry, matrix } of meshes) {
      const positions = geometry.getAttribute('position');
      const indices = geometry.index;
      const count = indices?.count ?? positions.count;
      for (let i = 0; i + 2 < count; i += 3) {
        triangle.a.fromBufferAttribute(positions, indices ? indices.getX(i) : i).applyMatrix4(matrix);
        triangle.b.fromBufferAttribute(positions, indices ? indices.getX(i + 1) : i + 1).applyMatrix4(matrix);
        triangle.c.fromBufferAttribute(positions, indices ? indices.getX(i + 2) : i + 2).applyMatrix4(matrix);
        triangle.closestPointToPoint(target, candidate);
        const next = candidate.distanceToSquared(target);
        if (next < distance) {
          distance = next;
          anchor.copy(candidate);
        }
      }
    }
    if (!Number.isFinite(distance)) throw new Error(`Cannot anchor a component without triangles: ${object.name}`);
    localAnchors.set(object, anchor);
  }
  object.updateWorldMatrix(true, false);
  return anchor.clone().applyMatrix4(object.matrixWorld);
}
