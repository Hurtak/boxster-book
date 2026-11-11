# Chapter 07 component and figure verification

Audit completed 10 November 2026. Factory plate/page/item locators and saved full-page originals are in the [register](README.md). Read **confirmed** as component identity or connection supported by the named primary source; **illustrative** marks geometry or an operating example rather than a measured factory model. All published chapter headings, both diagram IDs and the existing footnote-reference count/order are retained.

## Every existing SVG and interactive

| Asset | Evidence and disposition |
| --- | --- |
| `images/oil-circuit.svg` | **Confirmed, clarified, illustrative topology.** 104-000/002 establish the pump, dedicated chain, sump and sender. Porsche training Engine pp. 20–22 establishes four scavenge sections, one pressure section, common shaft and hydraulic delivery regulation. The drive label now explicitly names the oil-pump chain. No head-mounted pumps, external reservoir or inferred gallery order is introduced. |
| `images/heat-exchanger.svg` | **Confirmed and retained; conceptual section.** 104-005:1/9/11/12 establishes the housing, filter and exchanger. Separate fluid passages and heat following temperature difference are physical principles. This adequate figure explicitly disclaims Porsche plate count, routing and wall thickness; no reason to replace it with an exploded drawing. |
| `images/exhaust-path.svg` | **Confirmed and retained; functional sequence.** 202-000:1/2/5/6/14/15/17/19 establishes bank assemblies, four sensors, silencers and A120 outlet. Porsche training Fuel/ignition pp. 53–54/60 supplies one manifold-integrated converter per bank, two bricks per converter, LSU before brick 1 and LSF between bricks. The figure's rounded shaped single outlet remains correct for the reference car; it is not a scale pipe plan. |
| `diagrams/fluid-cooling-path/index.js` — `fluid-cooling-path` | **Confirmed and retained; three illustrative states.** 105-000 pump/thermostat, 105-010 distributor/tunnel circuit, 105-015 front pair and 105-020 tank branch agree with warm-up, warm-driving and warm-traffic states. Pump circulation continues during warm-up, fans move air rather than coolant, the pair is one functional block rather than two cores in series, and the tank is a branch. MAHLE supplies the generic thermostat principle. No Porsche threshold, numerical flow split, fan map or physical hose route is simulated. |
| `diagrams/fluid-cooling-path/poster.svg` | **Confirmed and retained.** Static fallback has the same pump, thermostat/bypass, grouped radiator pair, separate air arrows and neutral tank branch. It remains meaningful without controls; no module change requires a new fallback. |
| `diagrams/fluids-explorer/index.js` — `fluids-explorer` | **Confirmed and retained adapter.** Still mounts the shared reference car with chapter-owned model/config. No unrelated shared vehicle geometry or lifecycle change. |
| `diagrams/fluids-explorer/model.js` | **Corrected and expanded, eight selectable groups.** Factory attachments now guide the longitudinal oil-pump shaft/chain, suction pickup/control valve/level sender, housing-mounted exchanger and downward filter cup/insert, separate thermostat body, radiator fan shrouds and air guides, tank bleed/level/fill hardware, service oil/coolant caps, and exhaust joints/shields/retainer/straps. Ten connection records include the separate mechanical oil-pump drive. All hidden shapes, scales, exact port locations, blade/plate counts and routes remain illustrative. Detailed group and tour coverage is below. |
| `diagrams/fluids-explorer/poster.svg` | **Regenerated and visually checked during parent integration** with `npm run posters -- fluids-explorer`. Its numbered groups match the updated assembly. Factory evidence does not convert the resulting static fallback into factory CAD. |

## Every explorer group, connection and tour stop

| Existing selectable group | Evidence, correction and retained limit |
| --- | --- |
| `engine-jackets` | 105-000/003/005 place engine-side water housings and pipes; training Engine pp. 23–24 supplies cross-flow/head cooling. Jacket bands remain location cues, not cast passages. |
| `oil-system` | 104-000:1/6/8/10/15/17 and 104-002:1/15/19. Common shaft now runs along the engine axis, with separate chain, suction pickup, control valve and sender. Five visible rings represent pump sections, not actual gear construction or measured drive ratio. The two cam-drive chains belong to chapter 5. |
| `heat-exchanger` | 104-005:1/7/9–12/18. Added housing context, pressure sender and filler connection; corrected filter from a freestanding upright cylinder to a downward cup with insert. Plate count and the exposed cup section are illustrative. No oil/coolant mixing or assumed internal order. |
| `coolant-pump` | 105-000:3/5/19/21/24 and 105-003:3. Separate pulley/pump and thermostat insert/body now visibly distinguish circulation from regulation. Exposed vanes/spring are conceptual; no Porsche vane count or thermostat setpoint is claimed. |
| `front-radiators` | 105-015:1–3/9/10/14/20. Added shrouds and air guides; visible fan hubs/blades now sit behind the cores. A/C condenser 29 belongs to a separate circuit and is explicitly omitted. Centre module 105-017 remains conditional and omitted. |
| `coolant-pipes` | 105-010:8/9/15/16/17/18/29–32. Separate distributor headers feed both front modules. Existing couplings retained; manual/PDK pipe distinction added to description. No physical left/right routing, exact bracket count or interchangeability inferred. |
| `expansion-tank` | 105-020:1/2/4/7/10/14/17 and 105-022:1/3/5. Replaced generic sphere with a schematic moulded body and added level switch, bleed valve, separate service cup, two fluid caps and vent/fill paths. It remains a side branch, not the radiator return vessel. Exact hose endpoints remain illustrative. |
| `exhaust-system` | 202-000:1/2/3/5/6/8/10/12/14/15/19/28/29 plus training brick sequence. Added flanged joints, shields and rear support/straps. Two manifold-integrated converters and one A120 shaped outlet retained. Standard exhaust remains free of XLF-only flap actuators. No exact silencer internals or heat-shield geometry claimed. |

The **0/30/65/100 tour stops** remain car location → exposed system → assembly → illustrative separation. They are educational camera/separation states, not an animation of operating oil-pump gears, thermostat travel, flap action, coolant temperature or workshop removal. `focus` still resolves to `engine-jackets`.

All **ten named connections** were checked: engine/oil return and pressure supply; new engine/oil-chain mechanical drive; oil/exchanger; coolant/exchanger wall; coolant pump/engine; accessory-belt mechanical drive; pump/thermostat-to-long circuit; long pipes/front pair; tank/engine branch; engine/exhaust gas. Shared connection lines are functional cues, not factory hose centre-lines. The exchanger's two fluids remain separate throughout.

## Other chapter figures

| Image | Disposition |
| --- | --- |
| `images/porsche-boxster-s-system-layout.jpg` | **Confirmed, related-model factory illustration retained.** Original 01/10 UK brochure printed pp. 40–41. Front/rear location check agrees with PET. The caption explicitly identifies the S, and is not used to give the baseline optional gearbox or centre radiator. |
| `images/porsche-boxster-s-exhaust.jpg` | **Confirmed, related-model factory illustration retained.** Original brochure printed p. 39; training p. 60 explicitly identifies shared architecture apart from the outlet. Visible S twin outlets remain identified as S, not standard A120 equipment. |

## Every component-topic group

| Chapter topic | Evidence and disposition |
| --- | --- |
| Internal oil reservoir, returning oil and demand-controlled pressure pump | **Confirmed.** 104-000/002 and Porsche training Engine pp. 20–22; no exterior dry-sump tank. Dedicated pump chain now explicit, distinct from two cam chains. Bearing-film/heat-carrying account is general mechanics. |
| Oil level, pressure and confirmation measurement | **Confirmed.** Sump level sender 104-002:19 distinct from pressure sender 104-005:7. Original handbook pp. 157–158 and Porsche 8/11 ENU1709 remain authority for measurement/warning process, not PET. Existing source-note order retained. |
| Pump, jackets, thermostat, long pipes and radiator pair | **Confirmed, expanded.** 105-000/003/005/010/015 plus training Engine pp. 23–24 and MAHLE's generic thermostat explanation. Added installed shroud/guide/distributor context. PET's numbered layout does not establish bypass flow proportions or thermostat/fan calibrations. |
| Fans, expansion, venting and service filling | **Confirmed, expanded.** 105-015/020/022 plus handbook pp. 197–198. Front fans distinct from engine-space blower; filler cup/caps distinct from tank. Cold/level advice retained; no bleeding instructions added. |
| Oil filter, exchanger, sender and separate fluids | **Confirmed, corrected 3D fitment.** 104-005:1/7/9–12; heat-transfer section retained. Filter, pressure and level sensing are now clearly different jobs. |
| Exhaust treatment, feedback, silencing, outlet and supports | **Confirmed, expanded.** 202-000 plus Porsche training Fuel/ignition pp. 53–54/60. Supports/joints/shields now included. Secondary-air and feedback explanations correctly remain cross-references to chapter 6. |
| 2010 sports exhaust and separate sports tailpipe | **Confirmed with existing scope.** 202-000/005 distinguishes XLS trim and XLF silencers/control plumbing; original 01/10 UK brochure/handbook controls UK XLF availability and switch. Cayman 28/09 ENU2601 is bounded corroboration for electrical/pneumatic principle, not Boxster calibration. |
| Optional PDK thermal load | **Confirmed.** Saved 360-000:1/3/4/10/13 proves additional gearbox-mounted exchanger and separate oil/water lines; training Transmission p. 96 explains the clutch/hydraulic circuit. Not silently installed on the manual baseline. |
| Other years and S/Spyder/Black Edition | **Confirmed within existing evidence limits.** Dated UK brochure notes and historical research retain earliest-advertised sports exhaust and optional status. PET replacement qualifiers do not become original ordering history. Full centre-radiator matrix, pump-breakpoint history and derivative thermostat settings remain unresolved. |
| Identification and ageing | **Retained.** Existing qualitative leaks/obstructions/hoses/mechanisms account stays tied to actual separate circuits; no repair procedure, lifetime or failure frequency inferred from exploded drawings. |

## Narrow checks

- `node --check` passes for both chapter interactive modules and the explorer model.
- Direct `createAssembly()` inspection finds **8 named groups, 188 meshes and 10 valid connection records**; all position coordinates are finite, each group has non-empty bounds and every connection resolves to an existing selectable group.
- All chapter SVGs parse as XML. MDX compilation succeeds; imported local assets resolve. Published headings, two diagram IDs and all footnote references remain identical in count and order to the pre-edit chapter.
- Parent owns full-book integration and regenerated `fluids-explorer` poster/browser inspection. This author did not launch a competing global build, regenerate shared assets, stage files or commit.
