# Chapter 08 verification against factory drawings

Checked **10 November 2026**. Reference: **2010 European/UK Boxster 2.9, G87/10 six-speed manual**, with PDK explicitly optional. All page numbers refer to the source and local files in [README.md](README.md). “Confirmed” means identity/connection or bounded application is supported; it does not mean the educational geometry is CAD.

## Every image and interactive asset

| Asset / ID | Evidence | Disposition |
| --- | --- | --- |
| `images/clutch-actuation.svg` | PET **301-000**, pp.109–110: cover/disc **1**, lever **3**, bearing **4**, sleeve **5**, pivot **10**; **301-005**, pp.111–112: slave **1**; **702-008**, pp.231–232: master **1**, feed **2–6**, pressure **8–10**, slave **22**. Existing Porsche WM300107 establishes brake-reservoir supply; ZF/SACHS explains diaphragm actuation. | **Confirmed architecture; improved** by drawing the reservoir/feed separately from the master-to-slave pressure path. Single-disc continuity and fulcrum drawing retained. Enlarged travel/force arrows and simplified working flywheel face remain **illustrative**. Pedal assist spring is omitted from this functional section, not denied. |
| `images/constant-mesh-and-synchroniser.svg` | PET **302-000/005**, pp.113–116, establishes the gearbox assembly and exterior interfaces; it supplies no internal gearset drawing. ZF synchronous-transmission history and Schaeffler TPI125, pp.6–10, establish generic permanently meshed pairs, shaft-linked hub/sleeve, cone speed matching and blocking. | **Illustrative, retained.** No literal G87/10 shaft plan, tooth number, reverse path or cone count claimed. PET cannot confirm internal geometry; that precise arrangement remains **unresolved**. |
| `diagrams/manual-ratio-explorer/index.js`; ID **manual-ratio-explorer** | Porsche *2010 Boxster Specifications*, p.2 basic-manual column: ratios 3.667/2.050/1.407/1.133/0.972/0.841 and final3.875. PET **302-000**, pp.113–114 supports G8710 identity, not these numerical ratios. | **Confirmed numerical source; retained.** Six buttons and rpm/torque sliders are a calculation, not an animation of internals. 2.10 m circumference, equal wheel speed, no losses/slip and independent torque input are explicit illustrative assumptions. |
| `diagrams/manual-ratio-explorer/poster.svg` | Same ratios and formulae as the interactive; initial third/3,000rpm/200Nm. | **Confirmed, retained:** 5.452125 reduction, 550.244wheelrpm, 69.331km/h and 1,090.425Nm total before wheel distribution. |
| `diagrams/manual-explorer/index.js` / `model.js`; ID **manual-explorer** | Eight factory plates listed below and in the manifest; operating principles use separately credited Porsche/ZF/Schaeffler documents. | **Improved:** nine selectable groups, adding pedal/master/feed/pressure chain and assist spring; correct guide-sleeve clearance inside the bearing; add cable-retaining brackets. No simulated moving clutch or synchroniser is introduced. |
| `diagrams/manual-explorer/poster.svg` | Generated static view of the same model and configuration. | **Regenerated and visually checked during parent integration.** The nine labels and hydraulic connection agree with the live assembly; the prior eight-part fallback is superseded. |
| `images/porsche-six-speed-gear-lever.jpg` | Original Porsche UK 01/10 brochure p.47/PDF21, object78; PET **701-000**, pp.219–221 separates knob **7**, housing **1**, cable **3**. | **Confirmed, retained:** genuine period control photo. Tan trim/knob does not establish XCZ or an owner's specification. |

There are no other chapter SVGs, interactive modules or animations. The 20 new factory PNGs are supporting source assets, not additional schematic figures. Native controls and static fallbacks remain intact.

## Every selectable explorer group

| Group | Factory evidence and comparison | Result / limits |
| --- | --- | --- |
| `engine-interface` | **102-000**, p.39 drawing / p.40 list, crank **1**, rear seal **5**; flywheel **14** attaches at crank end. | **Confirmed connection.** Small flange section, six drawn fasteners and scale are illustrative, not factory bolt-count evidence. |
| `flywheel` | **102-000**, pp.39/41, **14–15**, A120+480 versus A121+480 and 250. | **Confirmed dual-mass identity and crank attachment.** Ring gear visible in factory drawing. Spring positions, winding count and separated masses are generic ZF mechanism detail, not a PET cutaway. |
| `clutch` | **301-000**, pp.109–110, set **1** and screws **2**; Porsche training p.103 single dry plate/240 mm and S-only X-Tend. | **Confirmed assembly.** One disc, two facings, hub, pressure plate/cover and diaphragm; dimensions/fingers are illustrative. No S self-adjustment assigned to the base. |
| `release` | **301-000** **3–5, 10–11**; **301-005** **1**. | **Confirmed separate slave → pivoted lever → bearing; guide sleeve around shaft. Corrected** geometry so sleeve outer radius clears bearing inner radius, with shaft clearance inside it. No concentric hydraulic release unit. |
| `pedal-hydraulics` | **702-000** **5–9**; **702-008** **1–10, 22**; Porsche WM300107 supply from brake-fluid reservoir. | **Added** pedal, assist spring, master, reservoir/feed and pressure line to slave. LHD location aligns with the shared car illustration; UK/RHD feed pipes differ. Routing and spring geometry are illustrative; no exact force curve. |
| `geartrain` | **302-000/005**, pp.113–116: bellhousing, casing and lateral flanges. Generic constant-mesh authority as above. | **Confirmed exterior role, illustrative internals.** Only two pairs; precise six-speed/reverse arrangement **unresolved**, not factory-derived. |
| `synchroniser` | Same generic ZF/Schaeffler references. PET exterior selector rod **302-005 item7** does not reveal the internal fork set. | **Illustrative, retained:** cone before positive dog-tooth engagement. Factory cone count and positions **unresolved**. |
| `selector` | **701-000**, pp.219–221, housing **1**, paired cables **3**, levers/joints **20–23**, brackets **25–26**. | **Confirmed and improved** with fixed housing-retaining brackets. Cable paths, joint geometry and locations are schematic. |
| `final-drive` | **302-005**, pp.115–116, two output flanges **3** and seals **4**; **501-005**, pp.187–188, shafts **1**, inner bolts **2**, joint **12**, hub **7**, nut **8**. | **Confirmed boundary** from transaxle through articulated half-shafts to hubs. Gear/differential internals, joint construction and dimensions remain schematic; detailed differential action belongs to chapter10. Manual/S/PDK shaft entries differ. |

## Tour, connections and functional scope

| View / relationship | Evidence and disposition |
| --- | --- |
| Tour **0**, car location | **301-005/302-000** engine-facing bellhousing and transaxle exterior, plus chapter packaging. Longitudinal engine/clutch/transaxle and lateral rear-wheel outputs **confirmed**; whole-car coordinates approximate. |
| Tour **30**, car opened / overview | **701-000/702-008** establish separate lever/cable and pedal/hydraulic command paths. Hydraulic path is now visible; cables/pipes are schematic installation routes. |
| Tour **65**, assembled focus | **102-000 + 301-000/005** establish the coaxial flywheel/clutch/release interfaces; **302-005** lateral outputs. No claim that PET supplied measured installed geometry. |
| Tour **100**, separated view | All nine component groups use reversible visual offsets. **Illustrative** separation for inspection, not operating motion or dismantling order. |
| Engine → flywheel → clutch → input/geartrain | **102-000 1/14**, **301-000 1**, plus training and generic clutch principle. **Confirmed torque topology.** |
| Pedal/master → slave/release → clutch | **702-008 1/8–10/22**, **301-000 3–5/10**, **301-005 1**. New **fluid** connection distinguishes hydraulic transmission from the lever's mechanical action. |
| Lever/cables → selector/fork/sleeve → geartrain | **701-000 1/3/20–26** and generic Schaeffler synchroniser principle. Control topology **confirmed**; factory fork plan unresolved. |
| Geartrain → final drive / half-shafts | **302-000/005** and **501-005**. **Confirmed installed assembly boundary**; generic geartrain is not a tooth-by-tooth factory route. |

## Every prose topic

| Topic group | Factory check, source boundary and action |
| --- | --- |
| Baseline, G87/10 versus G87/40, gearbox/final-drive packaging | PET **302-000** and source key p.7 corroborate distinct manual types; contemporary training pp.103–104 establishes facelift changes. **Confirmed**, no claim of identical gearing. |
| Flywheel inertia, dual masses, torsional springs | PET **102-000** confirms flywheel identity/attachment and A120/A121/PDK distinctions. ZF supplies general internal mechanism. **Confirmed identity; illustrative internals retained.** |
| One dry disc, pressure plate, spring clamp, release/slip/heat | PET **301-000**, training p.103 and ZF/SACHS. **Confirmed**; thermodynamic explanation is not inferred from an exploded view. |
| Pedal, master, feed, pressure line, slave, lever, bearing and guide | PET **702-000/008 + 301-000/005**. **Improved** with assist spring and guide-sleeve description; added feed versus pressure distinction. Reservoir supply retains workshop authority. |
| Driver instructions, hill hold and drag | Handbook pp.60/172–173 and Porsche training, plus supplier fault guidance. PET shows hardware but does not establish driving instructions or hill-hold calibration. **Retained.** |
| Lever/cables, neutral, constant mesh, synchronisation, reverse | PET **701-000/302-005** confirms controls/exterior. Generic mechanisms and numerical reverse ratio use their existing primary sources. **Improved brackets/cable description**; literal internals unresolved. |
| Ratios, torque/speed, worked example/calculator | Existing Porsche 2010 data and independent arithmetic; **not PET-derived**. **Confirmed and retained**, including fixed illustrative tyre circumference and total axle torque. |
| PDK, Sport Chrono, short shifter | Period UK brochure remains option authority. PET **701-000 1** also lists XCZ, but cannot resolve ordinary UK2010 2.9 orderability. The **UK Black Edition price list03/2011**, printed16–17/PDF9, explicitly offers **XCZ**, £388inc20%VAT, excludes250 and states manual-only. **Confirmed for that later derivative; ordinary UK2010 remains unresolved.** |
| Other years | PET **702-008 10** explicitly separates tube `...113 12` through MY2009 from `...113 13` from MY2010. **Added bounded component distinction**, with no invented feel/capacity change. Complete annual UK redesign history remains unresolved. |
| S, Spyder, Black Edition and sharing | **102-000 14**, **301-000 1/4**, **702-000 9**, **501-005 1** separate relevant parts; training retains S X-Tend boundary. **Added basic/S flywheel/bearing/pedal-spring distinction**; period derivative brochures retain equipment authority. The UK03/2011 Black Edition list's XCZ row is now stated explicitly, without transferring it to the ordinary2010 reference car. |
| Identification and ageing | PET transmission key and distinct assembly entries support ID; ZF/SACHS supports possible wear/drag/slip mechanisms. **Retained**, no diagnostic claim for a particular car or parts ordering instruction. |

Checks: chapter JS syntax, nine named/nonempty groups, connection references, finite geometry/normals, guide/input/bearing radial clearances, original heading list and footnote-reference sequence, calculator outputs and SVG XML are checked locally. The parent owns poster regeneration and full reader/build/browser verification.
