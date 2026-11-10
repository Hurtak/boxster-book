# Diagrams in the book

The manuscript names a diagram and supplies a useful static illustration. The chapter owns the subject-specific scene and explanation. Shared modules own the reader controls, SVG/3D infrastructure and diagram lifecycle.

## Files and responsibilities

```text
interactive/
  runtime.js                  # Find diagrams, mount near viewport, retain state
  ui.js                       # Panels, labelled sliders and buttons
  styles.css                  # Responsive controls, static/print fallback
  svg.js                      # Responsive D3 SVG surface
  math.js                     # Units, energy calculation, camera interpolation
  diagrams/energy.js          # Reusable speed–energy diagram
  three/scene.js              # GLB loading, lighting, orbiting and disposal
  models/
    reference-car.glb         # Shared car for later component chapters
    reference-car.js          # Editable source for the schematic car
    geometry.js               # Geometry authoring primitives
book/13-brakes-and-stability-systems/
  index.md
  diagrams/
    brake-explorer/
      index.js                # Chapter behaviour and connection to shared code
      scene.json              # Camera stops, part names, offsets and explanation
      brake.glb               # Local 3D asset, in metres
      model.js                # Editable geometry source for this sample
      poster.svg              # Static explanation
    caliper-pressure/
      index.js
      poster.svg
    braking-energy/
      index.js                # Configuration for the shared energy diagram
      poster.svg
```

Use **D3** for a hydraulic circuit, force arrows, cutaway, graph or timeline. Use **Three.js** when spatial relationships, rotation or an exploded assembly help the explanation. They share controls and lifecycle, without forcing every diagram into a 3D scene. See the [D3 documentation](https://d3js.org/) and [Three.js documentation](https://threejs.org/docs/).

## Add a diagram to a chapter

Create `diagrams/unique-diagram-name/index.js` beside the chapter. Folder names are diagram IDs and must be unique across the book. Reference it in Pandoc Markdown:

```markdown
::: {.book-diagram data-diagram="unique-diagram-name"}
![An explanation that makes sense without interaction.](diagrams/unique-diagram-name/poster.svg)
:::
```

Export one function:

```js
import { panel, slider } from '../../../../interactive/ui.js';

export function mount(host, { state, signal }) {
  state.value ??= 0;
  const { stage, controls, explanation } = panel(host, {
    title: 'What this diagram explains',
    description: 'What the reader can change and observe.',
    note: 'What is simplified, illustrative or measured.',
  });
  // Draw into stage, update the explanation and keep values in state.
  // Bind listeners with { signal }, or remove them in the returned cleanup.
  // Return a cleanup function when owning resources beyond DOM nodes.
}
```

The build discovers chapter modules automatically; there is no central chapter registry to edit. Missing files, duplicate IDs and unknown Markdown references fail the build. Prefer the existing brake and energy examples when implementing a new diagram.

`mount` may be asynchronous. `state` is the same plain object on subsequent mounts of that figure. `signal` is aborted when it leaves the area around the viewport; cancel subscriptions and dispose any owned resources. A returned cleanup function must be safe to call more than once. Only mutate the supplied host; the runtime owns the static fallback and outer figure.

Keep the poster and alt text meaningful. A diagram must explain its main idea in print and without scripting. Native sliders support arrow keys, Home and End; preset buttons give keyboard access to the 3D tour. Explain selection in text as well as colour. Avoid automatic motion and make quantities, units and assumptions visible.

## 3D assets and the guided slider

Use a self-contained **GLB**, with embedded resources, metres as units and meaningful node names. The provided loader supports uncompressed meshes; adding Draco, KTX2 or other compression requires a bundled decoder. Geometry can be authored in Blender and exported, or generated from code as in this sample. Replacing an asset also requires matching its coordinate system, named nodes, camera framing and offsets to the chapter scene.

Import models normally and resolve them through the shared loader:

```js
import model from './assembly.glb';
import { loadModel, scene3D } from '../../../../interactive/three/scene.js';

// Inside async mount:
const assembly = await loadModel(model, signal, import.meta.url);
// Add to a shared scene3D surface; return its dispose function.
```

`import.meta.url` matters in the web build: a model URL is relative to its generated JavaScript chunk. The portable build instead passes embedded model bytes. Keep the model and its loader within the chapter module so the web edition can load them on demand.

The brake example maps a single 0–100 slider onto four authored stops:

| Position | Explanation |
| --- | --- |
| 0 | Complete car, locating the selected front-left wheel |
| 30 | Body lifted away; schematic hydraulic connections exposed |
| 65 | Camera at the wheel, surrounding car hidden |
| 100 | Assembly separated along per-part offsets |

Camera poses interpolate smoothly between stops. Node transformations use the slider's absolute value, so scrubbing backwards reassembles the same scene without accumulating movement. Part buttons then focus a selected component; moving the main slider returns to the guided view. Named nodes separate the wheel, disc, pads, complete monobloc caliper, pistons and hub. The caliper body never splits into fictional halves.

The renderer uses demand-based frames, a capped pixel ratio and disposable WebGL surfaces. A 32 MiB cache of recently used model bytes avoids repeated downloads, while each mounted scene gets its own parsed objects. Larger assets still load, but are not retained in this cache. The portable edition also retains its embedded bundle. The shared reference car can serve the cooling, suspension or engine chapters; each chapter should supply its own local assembly and explanation. The sample's approximate geometry must not be treated as CAD or a workshop disassembly sequence.

## Build and delivery

- `npm run models` regenerates the two sample GLBs. Regenerate only when changing their geometry sources.
- `npm run build` makes one portable offline HTML file. All interactive code and models are embedded, so its size grows with the whole book.
- `npm run build:web` produces `dist/web/book.html` with hashed code chunks and GLBs in `book-assets/`. Serve the directory over HTTP. Only diagrams near the viewport are mounted; their code and model assets load when needed.
- `npm test` rebuilds both editions and exercises the real browser interfaces and shipped GLB.

No CDN, framework or external model service is required at reading time. Add tests for new calculations or meaningful interaction contracts; retain browser checks for loading, fallbacks and a narrow reading column.
