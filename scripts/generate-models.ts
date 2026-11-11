import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { brakeAssembly } from '../book/13-brakes-and-stability-systems/diagrams/brake-explorer/model.ts';
import { prepareModel } from '../interactive/models/prepare-model.ts';
import { referenceCar } from '../interactive/models/reference-car.ts';

// GLTFExporter needs only this Blob reader for binary, embedded-asset export.
class ExportFileReader {
  result: ArrayBuffer | null = null;
  onloadend: (() => void) | null = null;
  readAsArrayBuffer(blob: Blob): void {
    void blob.arrayBuffer().then((value) => {
      this.result = value;
      this.onloadend?.();
    });
  }
}
globalThis.FileReader = ExportFileReader as unknown as typeof FileReader;
for (const [path, object] of [
  ['interactive/models/reference-car.glb', referenceCar()],
  ['book/13-brakes-and-stability-systems/diagrams/brake-explorer/brake.glb', brakeAssembly()],
] as const) {
  const bytes = await new GLTFExporter().parseAsync(prepareModel(object), { binary: true });
  if (!(bytes instanceof ArrayBuffer)) throw new Error('Expected a binary GLB export');
  await mkdir(dirname(resolve(path)), { recursive: true });
  await writeFile(path, new Uint8Array(bytes));
  console.log(`${path}: ${Math.round(bytes.byteLength / 1024)} KiB`);
}
