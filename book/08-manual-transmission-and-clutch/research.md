# Chapter 08 research: manual transmission and clutch

Checked **10 November 2026**. Reference car: European/UK 2010 Boxster 987.2 2.9, standard six-speed manual. The chapter explains general mechanisms using bounded Porsche fitment evidence. No particular owner's options are inferred.

## Primary technical authority

Porsche Cars North America, *2009 Technik Introduction — All Boxster/Cayman Models*, **PNA 987 021 09**, edition **2/09**. The opening notice explains that Porsche AG rest-of-world English content was edited for North America; use the UK catalogue for UK equipment.

- [Public primary-document text at Scribd](https://www.scribd.com/document/972719474/Boxster-2009), fully accessible without sign-in during this inspection. Read the **printed Transmission pp. 103–104** in the public text, not the site's AI summary. Also read [ManualsLib viewer p. 110 / printed p. 104](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=110). ManualsLib viewer109 repeatedly failed; its main index reproduces the clutch paragraph, and the complete public Scribd text independently resolves it.
- **Printed p. 103:** single-plate dry clutch, dual-mass flywheel; 240 mm GGG60 pressure plate; **S models specifically have X-Tend**; standard six-speed manual; housing/flange and fifth ratio revised with the new engine generation; Drive-Off Assistant. Do not assign S self-adjustment to the 2.9.
- **Printed p. 104:** reinforces revised housing/ribs and fifth ratio; S gets pinion/ring and sixth-ratio modifications, reinforced pinion/ring. Explicit codes **G87/10 basic** and **G87/40 S**. These are not the predecessor's G87/20/G87/21. No unverified supplier/type synonym is added.
- The technical introduction does **not** contain a full G87/10 manual ratio table in these pages. Its preceding seven-speed ratio table and triple-cone synchroniser details belong to **PDK**; none is transferred to the manual. Manual ratios below therefore use a separately identified Porsche technical sheet. Exact manual synchroniser cone counts and literal internal shaft/gear placement remain unestablished here.

## Ratios and calculations

Porsche Cars North America, [*2010 Boxster Specifications*, PDF p. 2](https://newsroom.porsche.com/dam/jcr:e5abc517-c680-47c0-974f-b84aefde568f/2010-Boxster-Specifications.pdf#page=2), opened and read with web tool. Basic **Boxster / Manual** column:

| Selection | Ratio |
| --- | ---: |
| 1 | 3.667 |
| 2 | 2.050 |
| 3 | 1.407 |
| 4 | 1.133 |
| 5 | 0.972 |
| 6 | 0.841 |
| R | 3.333 |
| Final drive | 3.875 |

The S manual column is different. Its sixth ratio appears as **0.081**, inconsistent with the later Porsche sheet; do not silently copy/correct it into the chapter. No S ratio calculator is supplied. The basic ratios are also corroborated at coarser precision by Porsche workshop WM 3X00IN search discovery, but that page returned 404 on full open and is not used as the manuscript's cited authority.

Porsche Cars North America, [*2012 Boxster Technical Specifications*, p. 1](https://newsroom.porsche.com/dam/jcr:f533d37f-82ef-4c9c-90cc-56b43185a8de/2012_Boxster_Specs.pdf#page=1), independently opened. Retains standard six-speed manual and optional PDK across ordinary/Spyder/Black variants. Basic manual gears are printed 3.67, 2.05, **1.40**, 1.13, 0.97, 0.84, R3.33 and final3.88. Third's 1.40 is unusual relative to 1.407, so continuity is described as broadly matching rather than an exact thousandth-by-thousandth proof. No annual UK redesign established.

Author calculations use the **2010 rounded values** and fixed **2.10 m illustrative rolling circumference**, not a measured tyre value. Clutch locked; zero losses; zero tyre slip; equal rear-wheel speeds. Total post-final-drive torque precedes differential distribution; never labelled per-wheel torque. Input torque independent of rpm, with no claim of a flat engine-torque map. Formulae:

- `reduction = gearRatio * 3.875`
- `wheelRpm = engineRpm / reduction`
- `speedKmh = wheelRpm * 2.10 * 60 / 1000`
- `axleTorqueNm = engineTorqueNm * reduction`
- At constant road speed, `newEngineRpm = oldEngineRpm * newGearRatio / oldGearRatio`.

## Pedal and clutch release

Porsche [PET, Boxster 2009–2012 type987](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf), update **19 July 2018**, opened via web and inspected from existing `/tmp/suspension-pet.pdf`:

- **301-000**, PDF p. **110**: separate clutch operating lever, G8710 release bearing and guide sleeve; G8740 bearing listed separately.
- **301-005**, PDF p. **112**: separate slave cylinder.
- **702-008**, PDF pp. **231–232**: clutch master cylinder, feed/pressure lines and slave. Left/right-hand-drive variants and service supersessions exist. Later replacement evidence supports the circuit/components, not identical original part numbers throughout production.
- Porsche workshop **WM300107**, [2009 Boxster2.9 reproduction](https://charm.li/Porsche/2009/Boxster%20%28987%29%20F6-2.9L/Repair%20and%20Diagnosis/Transmission%20and%20Drivetrain/Clutch/Service%20and%20Repair/Procedures/), full publicly readable text inspected through the search result and direct HTML retrieval during the text/source audit. Establishes brake-fluid reservoir supply and slave-cylinder circuit. Bleeding settings/sequence deliberately not reproduced. Its generic illustration is labelled five-speed, so it is not treated as a six-speed layout photograph.

Porsche *Boxster, Boxster S Owner's Manual*, **WKD98702110**, 5/09, [PDF](https://billswebspace.com/Owners_Manual_Boxster_PCNA.pdf), opened and inspected. **Printed60/PDF62**: full pedal travel, avoid holding on a steep hill with partial clutch; **printed172/PDF174**: gear diagram, full engagement, reverse only stationary, downshift overrev caution; **printed173/PDF175**: Drive-Off Assistant. US handbook used for mechanical operation, not UK factory-option eligibility.

## General mechanism sources

- ZF, [*Clutches for Passenger Cars and Light Commercial Vehicles*](https://aftermarket.zf.com/en/aftermarket-portal/our-portfolio/passenger-cars/products/clutches/), primary supplier explanation of diaphragm clutches and actuation. A modern CSC product example is **not** used to assign a CSC to this Boxster.
- ZF, [*Torsional Damper with Absorber*](https://www.zf.com/products/en/cars/products_64271.html?pageLink=details_divider658792), opened/read, primary/secondary masses connected by spring set. Only the general two-mass mechanism is adopted; no modern pendulum absorber fitment is claimed.
- ZF, [*From Intermediate Throttle to Shifting Fun*, 25 July2024](https://www.zf.com/mobile/en/company/strategy/heritage_zf/stories/all_synchronous_transmission.html), opened/read, permanent mesh and cone friction before sliding-sleeve tooth engagement. Used for principles, not claim that the illustrated historical ZF gearbox is G87/10. Its loose phrase “friction-locked” after tooth engagement is explained more precisely here as friction for speed matching followed by positive tooth engagement.

## UK catalogue and options

Porsche *The Boxster*, UK **01/10**, **WSLB1101000125 GB/UK**, [PDF](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf), independently opened. Local existing `/tmp/boxster-ch05/brochure-2010.pdf` and text used for image extraction and page checks.

- **Printed47/PDF21:** six-speed standard; dual-mass flywheel, cable control isolates gear lever; hill hold is brake action. Photo of manual lever is fourth image on spread (object78).
- **Printed56–57/PDF26:** SPORT accelerator/rev-limiter/PSM/PASM effects; PDK-exclusive additional functions. No extra peak manual engine output, changed gear teeth, automatic rev matching or automatic manual clutch control claimed.
- **Printed107/PDF49:** 639 Sport Chrono; 640 Plus with PCM; 250 PDK. XCZ absent from this ordinary table, which points readers to other personalisation programmes.

Porsche *Exclusive Boxster*, [North American PDF](https://porschecarshistory.com/wp-content/old/brochures3/19/2009%20987%20Boxster%20US%20Exc.pdf), independently opened; **printed22/PDF24** lists XCZ Short Shifter for both ordinary models. Contemporary facelift styling/PDK identifies context; archive filename alone is not an exact UK MY2010 catalogue date.

Porsche *Tequipment Boxster, Type987*, [public primary PDF](https://manuals.plus/m/9977921fb3092a7eba26a031f41ab2a2a9e8e918373672bf0f711845a803f232.pdf), opened/read. **Printed21/PDF21:** short shifter99742498300; compatible trim lever options, possible cold shift restriction. Colophon **03/08**, WSLB0902116920 GB/WW, despite facelift wheel additions marked earliest02/2009. Treat as evidence of accessory concept, not exact MY2010 UK order eligibility. The **35%** figure found in a different older **986** catalogue is not imported.

Porsche *The Boxster Spyder*, UK **01/10**, [PDF](https://porschecarshistory.com/wp-content/old/brochures2/93/2010%20987%20Boxster%20Spyder.pdf), independently opened, **printed26–27 and41/PDF19:** six-speed standard/PDK optional. Printed42–43/PDF20 is a model-family comparison, not the technical table. Black Edition transmission comparison now uses the UK03/2011 price list, printed8/PDF5 and16–17/PDF9: standard six-speed with dual-mass flywheel; optional seven-speed PDK. No identical clutch assembly or gearing is inferred.

## Original diagrams and verification contract

1. `images/clutch-actuation.svg`: original axial schematic. Engaged friction stack touches; released clearances enlarged. Pedal/master/fluid/slave/lever/bearing chain. It simplifies the flywheel to its working face, not a dimensioned DMF section.
2. `images/constant-mesh-and-synchroniser.svg`: original two-ratio concept, not literal G87/10 shaft layout/tooth counts. Two pairs meshed, selected free gear locked by sleeve; three synchroniser stages explained below.
3. **`manual-ratio-explorer`**, D3 interactive, `diagrams/manual-ratio-explorer/index.js` and meaningful `poster.svg`. Initial **gear3, 3,000rpm, 200Nm**. Native gear buttons with aria-pressed, two labelled sliders. State retained in supplied state object; event listeners and ResizeObserver use abort signal; no timers or auto-motion. Pure exported `calculateManualRatio` provides a checkable calculation seam.

Expected calculator results (unrounded data attributes, display rounded):

| Inputs | Total reduction | Wheel rpm | Road speed km/h | Total axle torque Nm |
| --- | ---: | ---: | ---: | ---: |
| Gear3,3000rpm,200Nm | 5.452125 | 550.244171 | 69.330766 | 1090.425 |
| Gear1,3000rpm,200Nm | 14.209625 | 211.124502 | 26.601687 | 2841.925 |
| Gear6,3000rpm,200Nm | 3.258875 | 920.563078 | 115.990948 | 651.775 |
| Gear3,6000rpm,290Nm | 5.452125 | 1100.488342 | 138.661531 | 1581.11625 |

Host data attributes: `data-manual-gear`, `data-engine-rpm`, `data-engine-torque-nm`, `data-road-speed-kmh`, `data-axle-torque-nm`, `data-wheel-rpm`, `data-total-reduction`. Initial output **69.3km/h /1,090Nm total /550wheelrpm**. Doubling rpm doubles speed at unchanged torque; changing torque scales output torque without changing the speed bars; increasing gear number raises speed and lowers ideal torque at fixed inputs.

Photo provenance is recorded in `images/credits.md`. Full reading-edition build/browser integration is owned by parent; chapter-local syntax, calculations, resources and SVG checks recorded at handoff.

Chapter-local checks completed: `node --check` passed; calculation checks with floating-point tolerances passed for all six gears, rpm doubling and torque independence; XML parsing passed for all three SVGs; all image references and 14 footnotes resolved. An isolated browser component harness passed native controls, selected-button aria state, remount persistence, 390 px overflow and zero page-error checks. Headless Chrome required the normal sandbox escalation; it then ran successfully. Interactive and static SVG screenshots inspected in `/tmp/boxster-ch08/`. Parent retains full edition integration/build responsibility.

## Car-to-component 3D explorer

Added **`manual-explorer`**, with eight selectable groups: engine interface, dual-mass flywheel, dry clutch, separate release mechanism, representative geartrain, synchroniser/fork, cabin lever/cables, and final drive/half-shafts. The shared car axes locate the engine-facing clutch ahead of the gearbox, the cabin control ahead of the power unit, and the rear half-shafts across the rear axle. Seven functional links distinguish torque transmission from clutch-release and selection commands.

Rechecked the Porsche UK January 2010 brochure, printed **p. 47** ([PDF p. 21](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf#page=21)): standard six-speed manual, dual-mass flywheel and cable-operated selection. The existing period lever photograph was visually inspected. Rechecked Porsche PET **301-000/301-005**, [PDF pp. 109–112](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf#page=109): the G87/10 has a distinct operating lever, release bearing and slave cylinder. The catalogue's clutch exploded illustration was rendered locally and visually inspected; no concentric hydraulic release cylinder is substituted.

This is an explanatory assembly, not reconstructed G87/10 CAD. Only two representative constant-mesh pairs are shown; neither their shaft positions nor their tooth counts establish the actual six-speed/reverse arrangement. The synchroniser separates cone speed matching from positive tooth engagement without claiming a factory cone count. Flywheel masses/springs, the one driven plate with two linings, pressure assembly and release bearing have distinct geometry; displayed offsets do not represent operating travel or servicing order. Cable/hose paths, castings, fasteners, half-shaft joints and dimensions are illustrative. The basic clutch is not assigned the S-model X-Tend feature.

Node checks passed for eight nonempty named parts, focus and connection references, finite positions/normals, finite separation vectors and a sensible installed envelope. All part descriptions are at most 280 characters. Generated fallback, shared-renderer interaction, responsive layout and book-wide integration are checked separately by the main build workflow.


## Text and source audit — 10 November 2026

Independently reread every paragraph, footnote, caption/alt text, image credit, both static SVGs and both diagram modules/posters. Reopened the Porsche training text (printed103–104), 2010 and2012 Porsche specification sheets, UK01/10 ordinary and Spyder brochures, PET, PCNA handbook, Exclusive/Tequipment originals and ZF mechanism guidance. This pass verifies text and source support separately from earlier diagram/layout checks.

Corrections:

- **PET locator:** illustration702-008 is PDF231, its parts table PDF232; PDF233 begins702-010. Updated the release citation to PDF109–112 and231–232. The separate operating lever, G8710 bearing, slave and master remain supported; no original-fitment part-number continuity is inferred from this2018 service catalogue.
- **Spyder locator:** the transmission/technical table is printed41/PDF19, not printed42–43/PDF20. Corrected the special-model citation; the actual six-speed/optional seven-speed claim remains accurate.
- **Black Edition scope:** replaced the US2012 transmission comparison citation with the UK03/2011 price list, printed8/PDF5 and16–17/PDF9. Visually checked the archived scan, including its03/2011 cover colophon: six-speed/dual-mass flywheel standard, seven-speed PDK optional. The table also lists XCZ, but it does not establish UK2010 ordinary2.9 orderability.
- **Hydraulics access:** replaced the failing `Clutch Hydraulic System/Service and Repair` path with the actual `Clutch/Service and Repair/Procedures` page. The web viewer still reports404/cache failure; directGET returned the complete Porsche procedure (saved `/tmp/boxster-ch08/hydraulics-live.html`). Its brake-reservoir-to-slave steps independently retain the shared reservoir claim. The five-speed graphic remains excluded as a literal G87/10 layout.
- Strengthened the synchroniser source with Schaeffler *Selector Hub Assemblies*, TPI125, printed6–10/PDF8–12, which explicitly explains blocking, fork/sleeve movement and cone-friction-before-positive-tooth engagement. No G87/10 supplier or cone count is inferred.
- Added explicit source support for the two selector cables (Porsche engine-removal procedure, Part1, step34.1) and the bounded slip/drag ageing discussion (ZF/SACHS guidance).

Retained important findings: G87/10 basic versus G87/40 S; single dry plate/dual-mass flywheel and240mm pressure plate; S-specific X-Tend wording; pedal/master/slave/lever/bearing causality; no automatic manual-clutch control from hill hold; cable isolation; generic constant mesh and cone-then-dog engagement, with no factory cone count assigned. The UK ordinary brochure p47/PDF21 and its fourth photograph were visually checked; image object78 is255×228px, matching the credit. The standard/manual/optionalPDK and SportChrono boundaries remain correct. The Tequipment source's printed03/08 colophon and02/2009 additions are reported as found, rather than treated as a precise UK2010 order guide.

Recalculated all forward and reverse total ratios, illustrative torque/speed/power examples, fixed2.10m road-speed conversion and6000rpm second-to-third result independently. The calculator's units, shared axle torque label, no-loss assumptions,62.8kW initial power and0–300km/h scale are correct. No chapter diagram text/configuration correction or poster regeneration is required.

Scope limits retained: exact UK2010 short-shifter factory orderability and a complete annual UK2011/2012 gearbox change sequence are not established; the prose already states those limits. Literal G87/10 shaft layout, tooth counts and synchroniser cone counts remain illustrative/unclaimed. The live Dropbox and ManualsLib viewers and direct Tequipment download were unavailable; the archived Black Edition original and readable Tequipment PDF text were inspected instead. No unresolved substantive contradiction remains in the chapter.
