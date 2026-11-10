# Text and source correctness review

Reviewed **10 November 2026**. Reference: the **2010 European/UK Boxster 987.2 2.9-litre**, with the standard six-speed manual and optional seven-speed PDK.

One dedicated sub-agent reviewed each of all **18 chapters**. The pass covered manuscript prose, every source note, captions and alternative text, image provenance, static SVG text and reader-facing interactive/3D descriptions. Relevant primary passages were inspected independently; previous drafts and review reports were treated as leads. The parent reconciled shared facts and the resulting text/diagram changes. Detailed evidence, access methods and limits remain in each chapter’s `research.md`.

## Material corrections

- **Dates and applicability:** distinguished announced Dutch introduction dates from completed deliveries across Europe. Kept UK ordering evidence separate from North American model-year sheets and later replacement-parts listings. Preserved the launch catalogue’s planned May 2009/manual-transmission qualification for the locking differential.
- **Component descriptions and drawings:** corrected nominal rim width to the distance between inner flange faces, adjusted the schematic flange spacing, and changed the standard 2.9 exhaust outlet from an oval to a rounded trapezoidal outline. Removed unsupported claims about an input shaft’s internal construction and the exact standard radio-aerial layout.
- **Controls:** reconciled the brake and integration chapters on PSM OFF and the training-specified Sport Chrono Package Plus hydraulic-assist limits. Distinguished ordinary vacuum assistance from additional hydraulic assistance. Explained that A/C OFF changes the clutchless compressor’s delivery rather than stopping its engine-driven shaft.
- **Options and derivatives:** added supported equipment prerequisites, including tracking preparation with the alarm. The original UK Black Edition price list resolves its standard disc dimensions as **318 × 28 mm front and 299 × 24 mm rear**, printed p. 42 / PDF p. 22. See the [brake evidence](../../book/13-brakes-and-stability-systems/research.md).
- **Source precision:** corrected printed-page versus PDF/viewer locators, publication identities, photographed variants and image dimensions. Added accessible copies of Porsche-authored training text alongside intermittently blocked viewers. The Spyder numerical technical table is printed **41 / PDF 19**; its optional-audio table is the adjacent printed **40**, also on PDF 19.

## Chapter audit record

All rows are complete. Links open the chapter’s evidence and uncertainty record.

| Chapter | Result |
| --- | --- |
| [01 · The 2010 Boxster 2.9 in the 987.2 family](../../book/01-the-2010-boxster-2-9-in-the-987-2-family/research.md) | Qualified announced launch dates and corrected publication/table locators; retained the baseline and variant figures. |
| [02 · The yearly timeline](../../book/02-the-yearly-timeline/research.md) | Separated planned regional introductions from completed availability and removed an unsupported annual-continuity inference. |
| [03 · The 2010 Boxster 2.9 specification and options](../../book/03-the-2010-boxster-2-9-specification-and-options/research.md) | Clarified dated differential eligibility, wheel prerequisites and option symbols; verified the numerical specification. |
| [04 · Body structure and packaging](../../book/04-body-structure-and-packaging/research.md) | Strengthened facelift body and side-airflow evidence; corrected comparison and artwork references. |
| [05 · Engine construction and valve gear](../../book/05-engine-construction-and-valve-gear/research.md) | Clarified port-injector location, VarioCam evidence and primary-document identity; verified engine geometry and valve gear. |
| [06 · Air, fuel, ignition and engine control](../../book/06-air-fuel-ignition-and-engine-control/research.md) | Clarified knock and inlet-port terminology; corrected source locators and the matching intake descriptions. |
| [07 · Lubrication, cooling and exhaust](../../book/07-lubrication-cooling-and-exhaust/research.md) | Corrected the standard outlet shape and sports-tailpipe evidence scope; retained verified oil, cooling and catalyst architecture. |
| [08 · Manual transmission and clutch](../../book/08-manual-transmission-and-clutch/research.md) | Corrected clutch/PET locators and UK derivative evidence; independently checked all gearing calculations. |
| [09 · PDK transmission](../../book/09-pdk-transmission/research.md) | Removed unsupported shaft-construction wording; corrected manual-mode attribution, regional scope and Chrono/Spyder locators. |
| [10 · Differential, driveshafts and mounts](../../book/10-differential-driveshafts-and-mounts/research.md) | Corrected the differential percentage caption; strengthened ideal-differential, CV-joint and derivative evidence. |
| [11 · Suspension and wheel geometry](../../book/11-suspension-and-wheel-geometry/research.md) | Clarified spring support, suspension geometry and PASM/static-load relationships; corrected introduction and source wording. |
| [12 · Steering, wheels and tyres](../../book/12-steering-wheels-and-tyres/research.md) | Corrected rim-width definition and flange geometry, wheel-mounting roles, fitment scope and source locators. |
| [13 · Brakes and stability systems](../../book/13-brakes-and-stability-systems/research.md) | Specified PSM/brake-assist conditions, verified UK Black Edition disc thicknesses and distinguished later US evidence. |
| [14 · Roof, glass, seals and drainage](../../book/14-roof-glass-seals-and-drainage/research.md) | Corrected drain/PET and Spyder references, window-control scope and the wind-deflector equipment combination. |
| [15 · Cabin, seating and climate](../../book/15-cabin-seating-and-climate/research.md) | Explained clutchless compressor output versus shaft rotation; verified seat ventilation/options and corrected HVAC references. |
| [16 · Lighting, electrical systems and security](../../book/16-lighting-electrical-systems-and-security/research.md) | Corrected handbook/PET locators, alarm prerequisites, photo identification and starter/authorisation descriptions. |
| [17 · Audio, navigation and communication](../../book/17-audio-navigation-and-communication/research.md) | Corrected radio-option locators, HFP cradle/pairing scope and schematic aerial wording; verified audio counts and capabilities. |
| [18 · Occupant protection and system integration](../../book/18-occupant-protection-and-system-integration/research.md) | Reconciled braking-mode limits, belt-locking support, windscreen reinforcement and POSIP wording; retained the restraint layout. |

## Evidence boundaries

The dated UK sales documents establish UK equipment. Porsche’s PCNA training edition **PNA 987 021 09, 2/09** supplies technical mechanisms; the North American handbook **WKD 987 021 10, 5/09** retains its stated market scope. PET **987209, 19 July 2018** is later service-parts evidence. A collector’s hosting does not change an original document’s authorship, but a reachable URL alone does not verify its contents.

Conflicting or malformed source entries are recorded rather than silently propagated: examples include the ordinary brochure’s oxygen-sensor/intermediate-shaft copy and suspect rows in US specification sheets. Specific technical evidence supports the retained account. Where an archive viewer failed, reviewers used another original copy, the original document’s full text or an identified local scan, recording which was inspected.

A complete annual UK ordering/production-change history remains unavailable. Exact first option-delivery dates, some component/software breakpoints, current telephone/device compatibility and a contemporary market-matched UK brake-fluid schedule are consequently not invented. The HVAC sources also differ on a low-temperature cooling cut-off; the manuscript leaves that limit qualitative. Schematic geometry does not establish concealed dimensions, parts interchangeability or crash performance.

## Validation for this pass

- Portable, web and GitHub Pages builds pass for all **18 chapters**.
- **7 focused tests pass**: calculation, gearing/differential constraints, energy, shipped models, component connections and camera framing. These are `tests/math-and-model.test.js` and `tests/component-explorers.test.js`.
- **283 source-note definitions** match their references; **109 local manuscript image targets** exist.
- All **73 source SVGs** parse and have accessible titles/descriptions. All **14 changed chapter JavaScript modules** pass syntax checks.
- Regenerated the **8 affected component-explorer fallbacks**. The chapter photographs and shipped GLB binaries remain unchanged by this text/source pass.
- Local guidance/review links resolve after relocation; `git diff --check` passes.

The separate all-pages desktop/phone rendering sweep was skipped at the user’s request. No Git staging, commit or push was performed by this audit.

## Guidance location

Supporting guidelines, editorial conventions and historical research now live in `.agents/`; reviews live in `.agents/reviews/`. The root [AGENTS.md](../../AGENTS.md) supplies conditional reading pointers. [README.md](../../README.md) remains the human-facing build and reader guide. These files are outside the manuscript build.

The subsequently authorised desktop/phone sweep and full test run are recorded separately in [rendering verification](render-verification.md).
