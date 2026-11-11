# Chapter 05 component and figure verification

Checked **10 November 2026**, against the actual factory drawings indexed in [README](README.md), their adjacent item/application lists, the chapter's complete MDX, all three standalone SVGs, all three interactive source modules and their fallback SVGs, and both photographs/credits. The primary reference remains the **2010 European/UK Boxster 2.9**, manual standard, PDK optional.

**Confirmed** means the stated identity/count/connection is supported. **Corrected** identifies changes made during this pass. **Illustrative** means the drawing teaches a relationship without claiming factory shape, coordinates, timing or dimensions. **Unresolved** records a boundary rather than an inferred fact. Factory identity is not proof of an operating principle: the latter retains the Porsche training/brochure and NASA sources in [research](../research.md).

## Every static SVG and interactive ID

| Existing asset / ID | Factory and operating evidence | Disposition |
| --- | --- | --- |
| `images/engine-layout.svg` | PET 101-005, 102-000, 102-005, 103-000 and 103-010; Porsche flat-engine account and training Engine pp. 7–18 | **Confirmed / illustrative, retained.** Six distinct rods/crankpins, staggered opposed banks, one head and two cams per bank. Crankpins are deliberately projected onto the shaft axis; front/rear, crank phase, valve geometry and installed outline are not assigned. Ring marks are symbolic, not a complete piston-detail view; the three-ring pack is now explicit in prose and 3D. |
| `images/timing-drive.svg` | PET 103-015, items 1, 4–6, 9 and 12–15; training Engine pp. 16–18 | **Corrected / illustrative.** Two chains serve the four cams; two oil-fed cam-chain tensioners act on their rails. Added explicit separate oil-pump chain, omitted from the map, and changed “2 tensioners total” to “2 cam-chain tensioners”. No IMS. Arrows are connections, not routes, tooth counts or rotation directions. |
| `images/accessory-drive.svg` | PET 101-010, items 1, 3, 7–12; 102-000 item 16; 104-010 item 12; training Engine pp. 12–13 and 19 | **Confirmed / improved.** One double-sided belt drives alternator, hydraulic steering pump, A/C compressor and coolant pump with hydraulic tensioning. Added the crank pulley's torsional vibration damper. Cam-driven vacuum pump remains separate. Physical pulley order, diameter and wrap are not inferred from the functional bus. |
| `diagrams/engine-four-stroke/poster.svg` | PET 102-000/102-005/103-005/103-010 identifies mechanism parts; Porsche training Fuel/ignition p. 59 identifies port injection; NASA four-stroke source establishes operation | **Confirmed / illustrative, retained.** Intake, compression, power, exhaust across 720°; upright cylinder and one valve from each pair for clarity. No measured Porsche ignition or valve-event timing is claimed. |
| Interactive `engine-four-stroke` (`index.js`) | Same evidence; slider-crank equation in source | **Confirmed / illustrative, retained.** A fixed-length rod joins piston pin to offset crankpin. Stroke selection spans four 180° divisions; 720° returns to intake with accumulated cam angle 360°. Spark marker at 360° is explicitly schematic; actual ignition/valve timing differs. Slider, stroke presets and accessible textual state remain. |
| `diagrams/engine-timing-lift/poster.svg` | PET 103-010 items 1, 3, 9 and 103-005 control elements establish hardware; training Engine pp. 16 and 18 establishes 3.6/10.0 mm inlet lifts and 40° crank-angle phase range | **Confirmed / illustrative, retained.** Equal-duration low/high curves are a conceptual comparison, not recovered profiles. 40° crank equals 20° cam. No crank TDC reference or switching rpm inferred. |
| Interactive `engine-timing-lift` (`index.js`) | Same evidence; source maps crank advance to half as much cam phase | **Confirmed / illustrative, retained.** Timing compares the same selected peak/profile with the zero-advance dashed reference; changing lift chooses 3.6 or 10.0 mm. Vane/profile/valve symbols do not reproduce tappet locks, hydraulic ports or controller thresholds. Native controls, pressed-state buttons and explanations remain. |
| `diagrams/engine-explorer/poster.svg` | Same eight-part assembly as `model.js`; PET plates below | **Regenerated and visually checked during parent integration.** The current assembly, eight labelled groups and schematic location/separation limit agree with the updated model. |
| Interactive `engine-explorer` (`index.js`, `model.js`, `config`) | PET 101-005 through 103-015; 107-010 and 202-000; training Engine pp. 7–19; chapter 04 owns full car packaging | **Corrected / improved / illustrative.** Eight existing groups and 11 connections retained. Added factory-backed parts within groups: three piston rings, big-end bearing sections, gasket sections, tappets, return-spring symbols, inlet adjusters, exhaust sprockets and manifold catalyst bodies. Corrected the prior description that placed the catalysts beyond the manifold cutaway. No chains are routed geometrically. |

There are **six existing SVG files** (three standalone + three posters) and **three interactive IDs** in this chapter. No ID or MDX heading has been added/renamed. The engine explorer has no chapter-local GLB; its procedural `model.js` and shared reference car define its geometry.

## Every explorer part

| Group | Exact factory evidence | Verification / improvement / limit |
| --- | --- | --- |
| `crankcase` | 101-005 item 1 and its A120 line | Two-part case with integrated cylinder bores retained. Open rings/rails are cutaway sections, not removable liners or the cast exterior. Alloy/running surface comes from training, not PET linework. |
| `crankshaft` | 102-000 items 1, 10–13; training Engine p. 9 | Longitudinal shaft and eight bearing positions retained. Six separate crankpins, illustrative static angular positions. No firing-order or timing-setting claim; bearing colour/clearance selection omitted. |
| `pistons-rods` | 102-000 items 6–9; 102-005 items 1–3 | Six pistons/rods and pins retained; added third piston ring and six hollow big-end bearing sections. Factory pin-retaining rings are described; clearances, actual pin/ring profiles and split-shell geometry remain simplified. |
| `right-head` | 103-000 items 1/2, A120 cylinders 1–3; 103-005 valve/spring items; 103-010 tappets | Head closes three cylinders and contains twelve valves. Added gasket sections, twelve tappets and twelve symbolic spring returns; casting, passages, covers and nested spring details remain cut away. |
| `left-head` | 103-000 items 1/2, A120 cylinders 4–6; 103-005 and 103-010 | Same twelve-valve count/added details as right head. The factory bank identity is supported by 202-000's explicit left 4–6/right 1–3 labels; exact installed coordinates are illustrative. |
| `camshafts` | 103-010 items 1/2 (bank-specific inlet/exhaust cams), 3 (two adjusters), 7 (two exhaust sprockets), 9/10 (12+12 tappets) | Four cams retained. Added two inlet adjuster units and two fixed exhaust sprockets at the pulley-side end, established by training Engine p. 9; tooth counts, diameters and separation are illustrative. Chain paths and tappet lift-lock mechanism remain omitted. |
| `intake` | 107-010 items 1/2/5/8/10; A120 list, training Fuel/ignition p. 59 | Two three-runner distributors and upper cross-connection retained. Air joins port-injected fuel upstream of the inlet valves. Specific runner lengths, flange geometry, resonance hardware and injectors remain outside this construction cutaway. |
| `exhaust` | 202-000 items 1/2/3/5/6, drawing p. 104 and lists pp. 105–106 | Three branches per bank join one manifold/catalyst assembly. Added two catalyst bodies and corrected group label/description. Further silencers, lambda-probe positions and heat shields are omitted geometrically and taught in chapter 07. |

## Every explorer connection and tour stage

| Connection in configuration | Evidence and disposition |
| --- | --- |
| `crankcase` → `crankshaft` | **Confirmed:** main bearings locate/support shaft, PET 101-005 + 102-000; oil-film function from training. |
| `pistons-rods` → `crankshaft` | **Confirmed:** six rods, six crankpin joints, 102-000 + 102-005. Articulated motion is generic slider-crank mechanics. |
| `crankcase` → `left-head` | **Confirmed:** three-cylinder bank, head and gasket, 101-005 + 103-000. |
| `crankcase` → `right-head` | **Confirmed:** the other three-cylinder bank, same plates with bank-specific entries. |
| `crankshaft` → `camshafts` | **Confirmed / omitted geometry:** two cam chains, 103-015 item 1; half speed/no IMS from training Engine pp. 16–18. Oil-pump chain distinguished. |
| `camshafts` → `left-head` | **Confirmed / clarified:** two cams act through hydraulic tappets on twelve valves, 103-005 + 103-010. |
| `camshafts` → `right-head` | **Confirmed / clarified:** corresponding valve train of other bank, same plates. |
| `intake` → `left-head` | **Confirmed / illustrative route:** distributor ports/seals, 107-010 + head ports, 103-000. |
| `intake` → `right-head` | **Confirmed / illustrative route:** corresponding distributor on other bank, same plates. |
| `left-head` → `exhaust` | **Confirmed / corrected:** exhaust ports → manifold/catalyst, 202-000 items 1/3/5/6. |
| `right-head` → `exhaust` | **Confirmed / corrected:** other bank's manifold/catalyst, 202-000 items 2/3/5/6. |

The shared **0 / 30 / 65 / 100** tour progresses from car location to an exposed location, assembled cutaway and separated inspection. All four stages teach the same A120/2.9 assembly. Separation offsets are display aids; no component is animated as a working engine, no workshop removal sequence is asserted, and the reference-car engine node is hidden while this chapter assembly is shown. Shared appearance geometry is outside this chapter's ownership.

## Every component-topic group in the prose

| Topic coverage | Evidence / disposition |
| --- | --- |
| Engine identity, mid-engine water-cooled flat-six, port injection versus S DFI | **Confirmed:** PET engine table p. 6, 101-005/107-010, training Engine p. 4 and Fuel/ignition p. 59; brochure remains authority for 2010 UK specification. No Cayman image is relabelled Boxster. |
| Opposed/staggered cylinders, crankpin/rod relationship and balanced low installation | **Confirmed principle / illustrative geometry:** PET crank/rod identity + Porsche flat-engine explanation. PET alone does not prove balance forces or installation dimensions. |
| Four strokes, combustion, crank/cam turns, dead centres and actual valve-event caveat | **Confirmed principle / illustrative cycle:** NASA teaching sources + training chain/cam sections. PET provides component identity, not the animation's operating angles. |
| Bore, stroke, displacement, compression, torque, power and worked examples | **Retained, outside PET's authority:** dated UK technical tables and training Engine p. 4; existing arithmetic is a calculation, not a measured curve. The known 88 mm PCNA-sheet conflict remains documented. |
| Case, Alusil surface, bearings, rods, piston crowns, rings and pins | **Confirmed / improved:** 101-005, 102-000/005; alloy/forging/fracture-split claims retain training source. Added replaceable shell and three-ring/pin-retention context. No clearance selection. |
| Heads, ports, guides/seats, valves, springs, tappets, gaskets and covers | **Confirmed / improved:** 103-000/005/010, training Engine pp. 14–16. Added the sealing boundary and cam→tappet→valve motion path. |
| Chains, guides, tensioners, sprockets, inlet adjusters and no IMS | **Confirmed / corrected:** 103-010/015; distinguished pump chain and cam-drive tensioners. No elimination-of-all-failures claim. |
| Belt, alternator, steering pump, A/C compressor, coolant pump, hydraulic tensioner and cam-driven vacuum pump | **Confirmed / improved:** 101-010, 102-000/104-010; training pp. 12–13/19 supplies double-sided belt, damping and pump drive. Added pulley damper, retained cross-chapter functions. |
| VarioCam timing/lift, vane control, feedback, 40° crank range and 3.6/10.0 mm lifts | **Confirmed hardware / operating source retained:** 103-005/010 corroborates components; training and UK brochure establish values and operating combinations. PET cannot supply ECU thresholds or motion curves. |
| 2010 options and other 2.9 years | **Dated brochure authority / unresolved running changes:** PR filters identify replacement applications only. The chapter does not derive order availability, exact introduction dates or unchanged internals from 2018 PET. |
| S, Spyder, Black Edition and Cayman comparisons | **Confirmed limited distinctions / unresolved complete inventory:** A120/A121 crankcases, pistons, heads and all four cams have distinct lines. Brochures/training retain output, lift and injection differences. Complete special-model internal parts, Cayman replacement equivalence and engine-code suffixes remain unresolved. |
| Identification, engine mounts and ageing | **Confirmed identity / bounded limits:** engine table p. 6, 109-000 mounts/damper, condition discussion tied to working chains/bearings/oil-fed units. No failure rate, service interval, diagnostic conclusion or removal procedure inferred. |

## Photograph verification

`images/ma120-cayman-2-9-engine.jpg` remains the specifically credited **2009 Cayman 2.9 donor**, whose intake, case and engine-end view were visually inspected against 107-010 and 101-005. Its seller caption does not establish complete Boxster interchangeability. `images/porsche-3-4-engine-comparison.jpg` remains the specifically credited **3.4 Boxster S comparison**, with visible external accessory drive consistent with 101-010. Neither is used as a hidden 2010 2.9 geometry specification. Original provenance/processing is retained in [credits](../images/credits.md).

## Checks and remaining limits

- Actual source PDF hash checked; all 12 saved factory assembly drawings visually inspected, plus engine/application and adjacent parts text. 29 full-page source PNGs indexed individually.
- All three standalone SVGs rendered in local Chrome and visually inspected; timing-chain and accessory-drive additions remain legible without overlap. Sandbox blocked Chrome's first launch; the approved local headless launch succeeded.
- Procedural assembly imports in Node, has finite vertex coordinates, eight selectable groups and 11 resolving connections. Counts checked: 24 valve-return symbols, 24 tappets, two inlet adjusters, two exhaust sprockets, two catalyst bodies, six gasket sections and six rod big-end bearing sections. All three JS modules parse.
- Heading IDs, diagram IDs and existing footnote-reference order/count are preserved. Book-wide rendering, browser regression and generated explorer-poster verification are handled by parent integration; no book-wide build/test is claimed here.
- The new detail is educational geometry. No chain route, tooth count, original 2010 running-change boundary, control calibration, material inferred from PET, forces, timing-setting instruction or interchangeability decision is supplied.
