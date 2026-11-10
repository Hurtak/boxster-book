# Green and tan reference car

This is original, editable mesh geometry guided by the five supplied photographs. It uses the open-top car in the third photograph as the main appearance reference. No photograph, street, building, scenery or other background is baked into the model.

The first and second photographs supply the rear bumper, twin round exhaust outlets, rear lamp shape and side-intake details. The fourth and fifth help with the front body curvature, clear lamp covers, projector optics and tan cabin. Those two show some different trim: the model keeps clear European side repeaters, silver split-spoke wheels and the book's 2.9 brake baseline. The main model has its roof down; the raised black roof in the second photograph is not fitted to this open-top configuration.

## Authoring modules

- `shape.js` defines the width and height profiles, fender curvature and bumper caps, in metres. The front is +Z and the driver's side is −X.
- `body.js` creates the shell, real wheel-arch and intake openings, panel gaps, mirrors, fuel flap and trim.
- `bumpers.js` creates the recessed grilles, registration plates, rear bumper and exhaust tips.
- `lights.js` creates the separate reflector bowls, projector optics, glass covers and rear lamp elements.
- `cabin.js` creates the contoured tan seats, perforations and stitching, dashboard, steering wheel, instruments, console, roll hoops and curved windscreen.
- `wheel.js` supplies the same detailed split-spoke wheel to the shared car and the chapter's brake assembly. Rear tyres are wider; tread cuts and grooves are geometry.
- `surfaces.js` supplies the material palette, rounded solids and curved surface helpers. Adaptive subdivision splits a shared edge in both adjacent triangles, preventing cracks when flat triangulations are curved.

The full car retains the named `body`, `interior`, `chassis`, `engine`, `gearbox`, `hydraulics` and four wheel groups used by the book's slider. Export preparation batches unlabelled trim, indexes repeated vertices and removes unused UV attributes. Named parts remain separate for interaction. The asset includes clear-coat and transparent glass materials, so its paint and glass should be reviewed in the shared renderer, with its generated studio environment.

## Review and regenerate

Run `npm run preview:model`, then `npm run serve`, and open <http://localhost:8000/model-preview/>. Compare front, rear, side, low-front, cabin and head-on views. Drag to orbit and scroll to zoom. Run `npm test` after editing; it checks the shipped GLB's named subsystems, material colours, finite geometry, size and integration with the book.

The reconstruction is visually guided rather than scanned or manufacturer CAD. Unseen cabin surfaces, small controls and lamp internals are approximated, and different trim in the photographs cannot describe one exact factory configuration. Mechanical pipe routing and exploded-part separation remain schematic. The source and generated model are covered by the project's MIT license.
