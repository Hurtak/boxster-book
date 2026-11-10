# Green and tan reference car

This is original, editable mesh geometry guided by the five supplied photographs. It uses the open-top car in the third photograph as the main appearance reference. No photograph, street, building, scenery or other background is baked into the model.

The first and second photographs supply the rear bumper, twin round exhaust outlets, rear lamp shape and side-intake details. The fourth and fifth help with the front body curvature, clear lamp covers, projector optics and tan cabin. Those two show some different trim: the model keeps clear European side repeaters, silver split-spoke wheels and the book's 2.9 brake baseline. The main model has its roof down; the raised black roof in the second photograph is not fitted to this open-top configuration.

## Authoring modules

- `shape.js` defines the body as cross-sections in metres: centre, crest, widest point, sill and underside heights along the car, with superellipse plan curves closing the nose and tail onto their centreline profiles. Across the front the bonnet is nearly flat out to its shut line, where each wing rises to a distinct crest; ahead of the lamps the wings drop below the bonnet, so the lamp glass faces forward. The front is +Z and +Y is up, so +X is the car's left: the driver's side of this left-hand-drive car.
- `shell.js` lofts those sections into one mirrored surface. Openings such as lamps, wheel arches, intakes, the cockpit and plate recesses are outlines drawn in a local plane; triangles crossing an outline are cut along it, so each opening has a clean edge and can be given its own material, walls and floor.
- `body.js` declares the openings and adds the wheel houses, panel gaps, door handles, mirrors, fuel flap and trim, placing each on the shell along its surface normal.
- `bumpers.js` outlines the front openings: each outer intake is a D with the LED lamp along its straight top edge, beside a wide centre slot below the plate. It also adds the intake slats, the bumper lip, registration plates, exhaust tips and parking sensors.
- `lights.js` creates the teardrop headlamp glass with its main-beam and projector units, and the outlines of the rear lamp: a blunt inner end beside the rear lid, a top edge along the wing crest and a point wrapping onto the flank, with a darker LED cluster and a clear lower band behind a bright divider.
- `cabin.js` creates the contoured tan seats, perforations and stitching, dashboard, steering wheel, instruments, console, roll hoops and curved windscreen.
- `wheel.js` supplies the same detailed split-spoke wheel to the shared car and the chapter's brake assembly. Rear tyres are wider; tread cuts and grooves are geometry.
- `surfaces.js` supplies the material palette, rounded solids and curved surface helpers. Adaptive subdivision splits a shared edge in both adjacent triangles, preventing cracks when flat triangulations are curved.

The full car retains the named `body`, `interior`, `chassis`, `engine`, `gearbox`, `hydraulics` and four wheel groups used by the book's slider. Export preparation batches unlabelled trim, indexes repeated vertices and removes unused UV attributes. Named parts remain separate for interaction. The asset includes clear-coat and transparent glass materials, so its paint and glass should be reviewed in the shared renderer, with its generated studio environment.

## Review and regenerate

Run `npm run preview:model`, then `npm run serve`, and open <http://localhost:8000/model-preview/>. Compare front, rear, side, low-front, cabin and head-on views. Drag to orbit and scroll to zoom. Run `npm test` after editing; it checks the shipped GLB's named subsystems, material colours, finite geometry, size and integration with the book.

The reconstruction is visually guided rather than scanned or manufacturer CAD. Unseen cabin surfaces, small controls and lamp internals are approximated, and different trim in the photographs cannot describe one exact factory configuration. Mechanical pipe routing and exploded-part separation remain schematic. The source and generated model are covered by the project's MIT license.
