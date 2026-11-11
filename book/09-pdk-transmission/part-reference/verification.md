# Chapter 09 component and figure verification

Checked **10 November 2026** against the saved real factory pages in [README.md](README.md), the existing period Porsche cutaway and Porsche's original training text. **Confirmed** means the identified component/function has matching evidence. **Illustrative** means the drawing teaches a verified relationship without claiming factory geometry or calibration. The chapter's six-speed-manual baseline and optional PDK remain explicit.

## Every chapter topic

| Topic group | Evidence | Disposition |
| --- | --- | --- |
| Installation and assembly identity | PET 320-000 pp.119–120; transmission key p.7; UK 01/10 brochure pp.42–45,126 | **Confirmed / expanded.** Optional 2.9 PDK is CG200; S/Spyder CG220 is distinguished. New prose connects housing, engine interface, supports, sump and drive flanges. Shared drawings do not establish interchangeability. |
| Dual-mass flywheel | PET 102-000 pp.39,41 item14 PR250; training pp.90–91 | **Confirmed.** PDK and manual flywheel application branches remain distinct. Two-mass operation is schematic, without spring rates or exact tooth count. |
| Nested wet K1/K2 packs and concentric shafts | Training pp.68,89–92; original Porsche cutaway | **Confirmed principle / illustrative geometry.** Outer K1 → inner shaft1 → odd+reverse; inner K2 → hollow shaft2 → even. PET does not expose these internals; no serviceable clutch-pack inventory inferred. |
| Gears, synchronisers, hydraulic shift rods | Training pp.80–87 | **Confirmed principle / illustrative layout.** Sample gears/rods represent selection, without reconstructing seven gear pairs, exact shaft topology or tooth forms. |
| Preselection, upshift/downshift and overlap | UK brochure pp.44–45; training pp.72–74,89–92 | **Confirmed principle.** Sixteen discrete interaction states checked. Output-driven inactive shaft, open clutch, regulated handover and illustrative next-gear predictions remain explicit. No timing or numeric torque shares. |
| Final drive, outputs and parking restraint | PET 320-005 pp.121–123 items15/16/21; training pp.86,88–89 | **Confirmed / improved.** Short and long output flanges now distinguished in prose and model. Parking catch acts on pinion shaft; not a third clutch. Differential operation stays in chapter10. |
| Cabin selector, cable and wheel controls | PET 701-001 pp.222–224 items1/4/5; training p.88; UK brochure pp.46–47,113; owner's manual pp.174–179 | **Corrected omission.** Explicit mechanical selector cable/parking-lock path added. Forward gears remain hydraulic/electronic selections. Original bidirectional switches and optional right-up/left-down paddles retained. |
| Hydraulic unit, sump, valves and seals | PET 320-005 pp.121–123 items1/2/5/7/11/13/14/19/20/23–25; training pp.93–95 | **Confirmed / expanded.** Separate sump below hydraulic block, connector housings and two pressure sensors identified. Explorer solenoid/channel count remains schematic. No fluid-fill or dismantling procedure added. |
| Separate ECU, sensing and CAN | PET 901-003 pp.508–509 items7/8 PR250; training pp.97–102 | **Confirmed.** Separate rear-right ECU remains distinguished from hydraulic unit. Retainer included as supporting geometry. No software identity inferred from replacement controller entries. |
| Two oils, exchanger and heat | PET 320-000 pp.119–120 fluid entries4/5; 360-000 pp.124–125 items1/3/4/7/8/10/12/13; training pp.66,91–92,96 | **Confirmed / expanded.** Exchanger now includes representative gearbox oil pipes, separate coolant hoses and disc-valve shape. Gear-oil volume remains separate and housing-cooled. No modern oil substitution, interval or factory hose routing asserted. |
| Support brackets and installed connections | PET 370-000 pp.127–128 items1/2/6, A120/A121 PR250 | **Confirmed / added.** Housing group includes brackets and support shapes; casting, mounts and fastening coordinates remain approximate. Chapter10 owns load isolation and mount operation. |
| Seventh, ratios, controls and protection | UK brochure pp.42–47,126–127; training p.65; owner's manual pp.174–180 | **Confirmed.** Sixth maximum speed, long seventh, refusal/downshift limits and slope-holding guidance retained. No universal final-drive value introduced. |
| 2010 options, other years and variants | UK 01/10 ordinary/Spyder brochures; UK Black Edition 03/2011 price list; PET p.7 only for catalogue gearbox identity | **Confirmed within published evidence.** PDK250, Chrono639/640, wheel840 and variant performance qualifications retained. No complete annual UK parts/software continuity claimed. |
| Identification, ageing and symptoms | PET variant/application branches; original owner's manual warnings | **Expanded / bounded.** CG200/CG220 identity and separate fluid records added; wear mechanisms retained without failure rates, diagnosis thresholds or repair instructions. |

## Every SVG, photograph and interactive module

| Asset / ID | Evidence and outcome |
| --- | --- |
| `images/pdk-concentric-inputs.svg` | **Confirmed / illustrative, unchanged.** Training pp.68,89–91 supports every K1/K2, shaft and gear-assignment label. End view plus longitudinal section explicitly omit bearings/dimensions. No assertion that shaft1 has no bore. |
| `images/pdk-oil-control.svg` | **Confirmed / illustrative, unchanged.** PET 320-005/360-000/901-003 and training pp.66,91–102 support separate electronic decisions, hydraulic actuation, feedback, exchanger, two oils and heat paths. A functional heat-flow chart, not a piping/valve diagram. |
| `diagrams/pdk-power-path/poster.svg` | **Confirmed / illustrative, unchanged.** Initial 1→2 Ready state agrees with live module: K1 closed, K2 open, second selected/output-driven. Both routes join common final drive; only K1 carries engine drive in steady state. |
| `pdk-power-path` — `index.js` | **Confirmed / illustrative, unchanged.** All **4 shifts × 4 phases** audited. Odd/even assignment maintained; never two rigidly closed paths; inactive selection occurs with clutch open. Native select/slider, stored state and AbortSignal handling retained. No automatic animation or measured shift timing. |
| `diagrams/pdk-explorer/poster.svg` | **Regenerated and visually checked during parent integration.** The ten labelled groups and location agree with the changed model. The old eight-group poster is superseded; both standalone SVGs and the power-path fallback were also rendered and visually inspected afresh. |
| `pdk-explorer` — `index.js`, `model.js` | **Expanded / illustrative.** Original eight groups retained; housing/sump/support and selector/cable groups added (ten total). Fifteen connection endpoints validated. PET supplies external identity; training supplies internal path semantics. |
| `images/pdk-factory-cutaway.jpg` | Original period Porsche illustration, visually inspected at native resolution; common broad gear-train/clutch/final-drive arrangement, not evidence of identical base/S part numbers. Original attribution in credits retained. |
| `images/pdk-paddle-wheel.jpg` | Original period Porsche optional-wheel photograph, visually inspected; right/left paddle control explanation agrees with UK brochure. Personalised cabin does not establish a particular car's equipment. |

The current SVG XML and accessible text were checked directly. Local `qlmanage` rasterisation was unavailable in the sandbox and `sips` could not decode SVG; no new SVG browser-rendering result is claimed by this scoped pass. The older `/tmp/boxster-ch09/figures-390.png` is stale and was not used as proof of current layouts. Parent integration owns fresh rendered/phone/print checks.

## Every explorer group and connection

| Part ID | Factory/training evidence and scope |
| --- | --- |
| `flywheel` | PET102-000 item14 PR250; training90–91. Two-mass shape schematic. |
| `k1-odd` | Training68,89–92. Outer pack, inner shaft, odd+reverse. Ring sector and drawn plate count illustrative. |
| `k2-even` | Training68,89–92. Inner pack, hollow shaft, even gears. Separate speed possible. |
| `gears` | Training80–87. Sample meshed gearing/selectors, not exact seven-speed topology. |
| `final-drive` | PET320-005 items15/16; training86. Distinct short/long flange reach now represented; exact side, dimensions and driveshaft geometry remain illustrative. |
| `hydraulic-block` | PET320-005 item11 and connectors13/14; training93–95. Separate from ECU and above sump. No valve count reconstructed. |
| `controller` | PET901-003 items7/8 PR250; training102. Rear-right region; approximate box, retainer and mounting position. |
| `cooler` | PET360-000 items1/3/4/10/12/13; training96. Separate oil/coolant pipes and disc valve illustrated without reconstructing control logic or route. |
| `housing` | PET320-000/320-005 and 370-000. Deliberate housing cutaways, bolted sump and brackets. Interior visible by teaching omission. |
| `selector` | PET701-001 items1/4/5; training88. Cabin selector and separate mechanical parking cable. Forward requests use electronic control. |

All **15 links** were checked: flywheel→K1 and →K2; K1→gears and K2→gears; gears→final drive; hydraulic block→K1, →K2, →gears and →cooler; ECU→hydraulic block; gears/sensors→ECU; housing→hydraulic block and →gears; selector→housing/parking mechanism and →ECU. Link categories separate mechanical, fluid, structural and signal functions. These lines are functional connections, not measured routing or an animation of pressure/torque.

The complete-car **0**, exposed-system **30**, focused-assembly **65** and separated-groups **100** tour stages use the shared renderer. Location remains behind the engine, ECU rear-right, selector in the cabin; separation offsets are illustrative and reversible. Shared reference car geometry is untouched. No deployable spoiler is added.

## Scoped checks

- Heading text, published diagram IDs and the existing footnote-reference **sequence/count** are unchanged: **21 reference occurrences, 17 definitions**. Existing notes were augmented with PET locators.
- Both chapter modules pass `node --check`; four SVGs parse as XML. All six imported image files and seventeen saved factory PNGs exist.
- Node imports verify **10 selectable groups, 15 valid links, 281 meshes, 52,463 vertices**, finite geometry/offsets and a nonempty installed envelope (approximately X ±0.691m, Y0.183–0.787m, Z−1.875–−0.055m). The cabin selector accounts for the forward extent.
- All **16 logical shift states** maintain odd/even paths, never label both clutches closed and change the inactive gear with its clutch open.
- Poster regeneration and fresh browser/phone/print proof belong to parent integration. No global build/test, shared edit, staging or commit was performed by this chapter pass.
