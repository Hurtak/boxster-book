import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { referenceCar } from '../interactive/models/reference-car.js';
import { brakeAssembly } from '../book/13-brakes-and-stability-systems/diagrams/brake-explorer/model.js';

// GLTFExporter uses this browser interface to read its output Blob in Node.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((value) => { this.result = value; this.onloadend?.(); });
  }
};
for (const [path, object] of [
  ['interactive/models/reference-car.glb', referenceCar()],
  ['book/13-brakes-and-stability-systems/diagrams/brake-explorer/brake.glb', brakeAssembly()],
]) {
  const bytes = await new GLTFExporter().parseAsync(object, { binary: true });
  await mkdir(dirname(resolve(path)), { recursive: true });
  await writeFile(path, new Uint8Array(bytes));
  console.log(`${path}: ${Math.round(bytes.byteLength / 1024)} KiB`);
}
