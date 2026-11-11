# Green and tan reference car

This is original, editable mesh geometry guided by the supplied photographs. The original five-photo set establishes the green paint, tan cabin and open-top appearance; the three additional front/rear photographs supplied on 10 November 2026 guide the revised lamps, bumpers, seats and roll hoops. No photograph, street, building, scenery or other background is baked into the model.

The first and second photographs supply the rear bumper, twin round exhaust outlets, rear lamp shape and side-intake details. The fourth and fifth help with the front body curvature, clear lamp covers, projector optics and tan cabin. Those two show some different trim: the model keeps clear European side repeaters, silver split-spoke wheels and the book's 2.9 brake baseline. The main model has its roof down; the raised black roof in the second photograph is not fitted to this open-top configuration.

## Authoring modules

- `shape.ts` defines the body as cross-sections in metres: centre, crest, widest point, sill and underside heights along the car, with superellipse plan curves closing the nose and tail onto their centreline profiles. A continuous bonnet crown replaces the previous wing step. Rounded shoulders continue each lid's slope into its bumper profile; denser end rows resolve those curves near the caps. End profiles retain the longitudinal height tangent and meet their mirror with a horizontal tangent. The front is +Z and +Y is up, so +X is the car's left: the driver's side of this left-hand-drive car.
- `shell.ts` lofts those sections into one mirrored surface. Openings such as lamps, wheel arches, intakes, the cockpit and plate recesses are outlines drawn in a local plane; triangles crossing an outline are cut along it. New cut vertices interpolate the original smooth normals so small boundary triangles do not dent the painted reflections. Projected details use interpolated surface normals.
- `body.ts` declares the openings and adds the wheel houses, panel gaps, door handles, mirrors, fuel flap and trim, placing each on the shell along its surface normal.
- `bumpers.ts` outlines the front openings: each outer intake is a D with the LED lamp along its straight top edge, beside a wide centre slot below the plate. It also adds the intake slats, the bumper lip, registration plates, exhaust tips and parking sensors.
- `lights.ts` creates the teardrop headlamp glass, separate forward-facing projector/reflector optics, lower lens ribs and a thin bright perimeter. It also defines the rear lamp outlines: a blunt inner end beside the rear lid, a top edge along the wing crest and a point wrapping onto the flank, with a darker LED cluster and a clear lower band behind a bright divider.
- `seats.ts` creates lower cushions, continuous padded backrests with integrated head restraints, conforming inserts, perforations and stitching. Flatter, lower roll hoops have aluminium-look rear trim, tan front trim and shaped mesh screens. Named cushion and hoop geometry remains with its part after export batching.
- `cabin.ts` assembles the seats and hoops with the dashboard, steering wheel, instruments, console and curved windscreen.
- `wheel.ts` supplies the same detailed split-spoke wheel to the shared car and the chapter's brake assembly. Rear tyres are wider; tread cuts and grooves are geometry.
- `surfaces.ts` supplies the material palette, rounded solids and curved surface helpers. Adaptive subdivision splits a shared edge in both adjacent triangles, preventing cracks when flat triangulations are curved.

The full car retains the named `body`, `interior`, `chassis`, `engine`, `gearbox`, `hydraulics` and four wheel groups used by the book's slider. Export preparation batches unlabelled trim, indexes repeated vertices and removes unused UV attributes. Named parts remain separate for interaction. The asset includes clear-coat and transparent glass materials, so its paint and glass should be reviewed in the shared renderer, with its generated studio environment.

## Review and regenerate

Run `npm run model:preview`, then `npm run build:preview`, and open <http://localhost:8000/model-preview/>. Compare front, rear, side, low-front, cabin and head-on views. Drag to orbit and scroll to zoom. Run `npm test` after editing; it checks the shipped GLB's named subsystems, material colours, finite geometry, size and integration with the book.

## Revision 3 reference choices

The spoiler and its raised lid lip are omitted at the user's request, even where visible in a reference photograph. The rear bumper retains the paired outer dark inserts and exhaust opening. The source geometry and generated GLB are updated together; the shared car is used by all fifteen component tours, while their explanatory assembly geometry stays separate.

The supplied photographs drive appearance rather than a single factory option specification. The period Porsche brochure [_The new Boxster_](https://xr793.com/wp-content/uploads/2022/01/2009-Porsche-Boxster.pdf) supplies additional original reference views: printed pages 14–17 for the front/rear lighting and bumper design, 66–67 for the flattened rear hoops, 74–75 for seat forms and 80–81 for wind deflectors. Its photographs depict different equipment combinations; dimensions and trim reconstructed from them are visual approximations.

Matching before/after renders are kept locally in `dist/model-refinement/`: front, low front, head-on, side, rear, straight rear and cabin. Geometry checks cover the painted lid centrelines, mirrored lamp envelopes and the exported seat/hoop/windscreen relationship.

Close low-angle front/rear comparisons are in `dist/hood-refinement/`. The follow-up fixes the pointed lid-to-bumper joins that higher viewpoints concealed. Regression checks sample the actual front and rear edge stations as well as the inner lid surfaces; the previous GLB fails the edge check.

Front-bumper comparisons are in `dist/bumper-refinement/`. The [front-on photograph of a green 2010 Boxster](https://www.elferspot.com/en/car/porsche-boxster-2010-800009/) and the period Porsche brochure show a broad, smoothly convex panel above the number plate. The old nose profile recessed an intermediate station, introducing an S-bend that the clear-coat reflections exaggerated into an oval dent. Moving that station forward restores a continuous convex face while retaining the bonnet edge, outer bumper envelope and fitted opening outlines. Its coordinates remain visual reconstruction parameters, not factory dimensions. A regression test ray-samples the actual shipped GLB across this panel and rejects reverse curvature; the old asset fails it. Front, level, low and three-quarter renders use matching cameras and lighting.

The reconstruction is visually guided rather than scanned or manufacturer CAD. Unseen cabin surfaces, small controls and lamp internals are approximated, and different trim in the photographs cannot describe one exact factory configuration. Mechanical pipe routing and exploded-part separation remain schematic. The source and generated model are covered by the project's MIT license.
