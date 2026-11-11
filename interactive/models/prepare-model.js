import * as THREE from 'three';
import {
  mergeGeometries,
  mergeVertices,
} from 'three/addons/utils/BufferGeometryUtils.js';

// Preserve named parts for chapter interaction, but batch their unlabelled trim.
// All current meshes use solid materials, so UVs do not need to be shipped.
export function prepareModel(root) {
  root.updateMatrixWorld(true);
  const subsystems = [...root.children];
  root.traverse(object => {
    if (object.userData.carPart && !subsystems.includes(object)) subsystems.push(object);
  });
  for (const subsystem of subsystems) {
    const inverse = new THREE.Matrix4().copy(subsystem.matrixWorld).invert();
    const batches = new Map(),
      remove = [];
    subsystem.traverse((object) => {
      // Keep replaceable installed assemblies intact, including their trim.
      for (let parent = object; parent && parent !== subsystem; parent = parent.parent)
        if (parent.userData.carPart) return;
      if (
        !object.isMesh ||
        object.isInstancedMesh ||
        Array.isArray(object.material)
      )
        return;
      if (Object.values(object.material).some((value) => value?.isTexture))
        return;
      const geometry = object.geometry.clone();
      for (const key of Object.keys(geometry.attributes))
        if (!['position', 'normal'].includes(key))
          geometry.deleteAttribute(key);
      geometry.normalizeNormals();
      if (object.name) {
        object.geometry = mergeVertices(geometry, 1e-5);
        geometry.dispose();
        return;
      }
      geometry.applyMatrix4(
        new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld)
      );
      if (!batches.has(object.material)) batches.set(object.material, []);
      batches
        .get(object.material)
        .push(geometry.index ? geometry.toNonIndexed() : geometry);
      remove.push(object);
    });
    for (const object of remove) object.removeFromParent();
    let i = 0;
    for (const [material, geometries] of batches) {
      const combined = mergeGeometries(geometries, false);
      const object = new THREE.Mesh(mergeVertices(combined, 1e-5), material);
      object.name = `${subsystem.name}-trim-${i++}`;
      subsystem.add(object);
      geometries.forEach((geometry) => geometry.dispose());
      combined.dispose();
    }
  }
  return root;
}
