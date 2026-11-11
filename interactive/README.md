# Diagrams in the book

The manuscript names a diagram and supplies a useful static illustration. The chapter owns the subject-specific scene and explanation. Shared modules own the reader controls, SVG/3D infrastructure and diagram lifecycle.

## Files and responsibilities

```text
src/
  book/Diagram.tsx            # React wrapper, viewport lifecycle, retained state
  book/Figure.tsx             # Asset resolution, image and caption
  reader/                    # React chapter reader and navigation
scripts/mdx/
  inventory.ts               # Discover chapter/diagram IDs, validate links
  compiler.ts                # Shared MDX rules for Node/browser exports
  bundler.ts                 # Lazy Vite diagram registry and asset manifest
interactive/
  ui.js                       # Panels, labelled sliders and buttons
  styles.css                  # Responsive controls, static/print fallback
  svg.js                      # Responsive D3 SVG surface
  math.js                     # Units, energy calculation, camera interpolation
  diagrams/energy.js          # Reusable speed–energy diagram
  three/scene.js              # GLB loading, lighting, orbiting and disposal
  three/component-explorer.js # Shared car-to-assembly tour, focus and connections
  three/component-geometry.js # Geometry primitives for chapter-owned assemblies
  models/
    reference-car.glb         # Shared car for later component chapters
    reference-car.js          # Assemble the photo-guided car and named subsystems
    boxster/                 # Curved shell, lamps, bumpers, tan cabin and wheels
    prepare-model.js         # Batch trim geometry while preserving named parts
    geometry.js               # Geometry authoring primitives
book/13-brakes-and-stability-systems/
  index.mdx
  images/
    braking-chain.svg         # Standalone chapter illustration
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

Create `diagrams/unique-diagram-name/index.js` beside the chapter. Folder names are diagram IDs and must be unique across the book. Reference it in MDX:

```mdx
import { Diagram } from '../../src/book/components';
import poster from './diagrams/unique-diagram-name/poster.svg';

<Diagram id="unique-diagram-name" poster={poster} alt="An explanation that makes sense without interaction." />
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

The build discovers chapter modules automatically and generates the lazy registry. Missing files, duplicate IDs, unknown references and missing descriptive alternatives fail the build. Prefer the existing brake and energy examples when implementing a new diagram.

`mount` may be asynchronous. `state` is the same plain object on subsequent mounts of that figure. `signal` is aborted when it leaves the area around the viewport; cancel subscriptions and dispose any owned resources. A returned cleanup function must be safe to call more than once. Only mutate the supplied host; React owns the static fallback and outer figure. Keep browser access inside `mount`, since Node must be able to render the chapter without creating a drawing surface. Late asynchronous mounts must check the signal and release any resources they acquired. Development uses React Strict Mode, so repeated setup/teardown is expected.

The reader can prepare a selected chapter's panel layouts before they enter the viewport. Heavy async viewers receive an optional `whenVisible` promise: build all headings, stage sizing, controls, explanations and notes first, dispatch `new Event('diagram-layout')` on the host, then await `whenVisible` and check `signal.throwIfAborted()` before downloading models or creating WebGL. Resolve the mount only after the scene is rendered; the reader shows a measured loading placeholder until then. The shared component viewer and brake viewer use this sequence. Synchronous SVG modules need no special event. Preparation must describe the retained control state so loading the model does not change the panel's height.

Keep the poster and alt text meaningful. A diagram must explain its main idea in print and without scripting. The shared React wrapper provides Interactive / Static diagram buttons for every figure, preserving the view choice across chapter navigation and retaining interactive state when releasing a live host. Poster mode needs no diagram module or WebGL context and responds to layout preparation immediately. The buttons are hidden in print and without JavaScript. Chapter modules should not duplicate these controls. Native sliders support arrow keys, Home and End; preset buttons give keyboard access to the 3D tour. Explain selection in text as well as colour. Avoid automatic motion and make quantities, units and assumptions visible.

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

`import.meta.url` resolves a model URL relative to its generated JavaScript chunk. Keep the model and its loader within the chapter module so the Pages build can load them on demand.

The brake example maps a single 0–100 slider onto four authored stops:

| Position | Explanation |
| --- | --- |
| 0 | Complete car, locating the selected front-left wheel |
| 30 | Body fades in place; schematic hydraulic connections exposed |
| 65 | Camera at the wheel, surrounding car hidden |
| 100 | Assembly separated along per-part offsets |

Camera poses interpolate smoothly between stops. Node transformations use the slider's absolute value, so scrubbing backwards reassembles the same scene without accumulating movement. Part buttons then focus a selected component; moving the main slider returns to the guided view. Named nodes separate the wheel, disc, pads, complete monobloc caliper, pistons and hub. The caliper body never splits into fictional halves.

The renderer uses demand-based frames, a capped pixel ratio, a generated studio reflection environment, self-shadowing and disposable WebGL surfaces. Reflections supply the green paint and glass finish without adding a photographic background. A 32 MiB cache of recently used model bytes avoids repeated downloads, while each mounted scene gets its own parsed objects. Larger assets still load, but are not retained in this cache. Component chapters reuse the same reference car and supply their own assembly and explanation. The approximate geometry must not be treated as CAD or a workshop disassembly sequence.

## Chapter component explorers

Chapters 4–18 have a car-to-component tour. Brakes retain their dedicated GLB assembly; the other fourteen chapters define procedural geometry in `diagrams/<subject>-explorer/model.js`. Each module exports `config` and `createAssembly()`, and a small `index.js` passes these and the shared reference car to `mountExplorer`.

Use the car's coordinate system: **+X left, +Y up, +Z front**, in metres. `createAssembly()` returns a group whose named direct children are selectable parts. The shared `part()` helper records each part's label, explanation, installed position and illustrative separation offset. Put meaningful geometry inside that group. The `config` supplies the title, four stage explanations, focus part and named connections; connection kinds distinguish mechanical, fluid, air, electrical, signal and structural relationships.

The shared viewer handles the 0/30/65/100 stages, perspective framing at each screen width, numbered markers, part focus, connection visibility, native controls and resource cleanup. Part separation is calculated from original positions, so reversing the slider reassembles the same model. The chapter owns spatial relationships and factual limits; the renderer supplies no mechanical simulation. Models and controller descriptions distinguish the standard 2010 2.9 from options such as PDK.

### Installed geometry and fit

The detailed assembly is present in its installed position from the first frame. The surrounding car fades; the assembly stays still until separation starts at 65. Do not crossfade a rough car part into a differently shaped chapter part. `hideCarParts` names only the context nodes that the detailed assembly replaces, not unrelated trim or wheels that should remain on the whole car.

Use shared factories in `interactive/models/boxster/` for visible frames, glazing, seats, controls and wheels. For surfaces fitted to compound-curved openings, `config.reuseCarParts` maps a selectable part to named nodes in the shipped car. `installAssembly` transfers those actual nodes while preserving world transforms, replaces the authored placeholder, and validates every name before mutation. An optional `finishInstallation(model)` adds internal explanatory detail. The poster renderer applies the same installation step; camera bounds are measured after fitting.

Mark replaceable car groups with `userData.carPart = true`. GLB preparation batches their trim within that group rather than flattening it into the outer body or interior. Keep node names unique, including left/right suffixes. After changing these factories, run `npm run model:generate` before rendering posters. The dedicated brake viewer also removes its duplicate context wheel and brake before displaying the installed detailed assembly.

The [assembly fit review](models/boxster/assembly-fit-review.md) records decisions for all fifteen tours. `tests/installed-assemblies.test.js` checks shared surfaces vertex by vertex, exported replacement names, transferred world geometry, the front mount's bonnet clearance, and the brake wheel's axle position. Matching the authored car does not make these educational models factory CAD or establish real fitting dimensions.

Run `npm run model:posters` after changing a procedural model or its configuration. It uses local Chrome (or `BROWSER_EXECUTABLE_PATH`) to render each exploded assembly and writes its `poster.svg`, including an embedded PNG, a vehicle location map, vector part labels and a summary. Render one model with `npm run model:posters -- engine-explorer`. The normal book build uses those checked-in posters and needs no browser for rendering them. Interactive fallbacks remain beside their module; standalone chapter illustrations and photographs belong in `images/`.

## Build and delivery

- `npm run model:generate` regenerates the two sample GLBs. Regenerate only when changing their geometry sources.
- `npm run model:posters` regenerates the fourteen procedural component illustrations from their chapter models.
- `npm run model:preview` regenerates the models and builds a full-size inspection viewer at `dist/model-preview/`. Serve `dist/` with `npm run build:preview`; its camera presets support front, rear, side and cabin comparisons.
- `npm run build` produces the sole Pages edition at `dist/site/index.html` with hashed chunks, images and GLBs in `index-assets/`. Preview it with `npm run build:preview` at `/site/`. Only diagrams near the viewport are mounted; their code and model assets load when needed.
- The reader’s Print whole book action exports all chapters through the browser, using every static poster. There is no separate PDF build.
- `npm test` runs the tests against the existing Pages build, exercising the real browser interfaces and shipped GLB.
- `npm run validate` checks TypeScript, builds the Pages edition, then runs all tests. CI uses this command.

React, D3 and Three.js are bundled locally; reading uses no CDN or external model service. Vite supplies the development server and HTTP builds. The model preview and poster authoring tools still use esbuild; the book itself uses Vite. The former imperative reader and Pandoc builder are retired. Add tests for new calculations or meaningful interaction contracts; retain browser checks for loading, fallbacks and a narrow reading column.
