# Coverage and consolidation implementation

Completed 10 November 2026. This implements the coverage and repetition proposals for the **2010 European/UK Boxster 987.2 2.9**, with the manual as standard and PDK as an option. It extends the manuscript and its existing reader; it does not implement the separate MDX migration plan.

## Proposal mapping

| Proposal | Result |
| --- | --- |
| Explain crankcase ventilation and oil separation | Chapter 6 follows blow-by through pre/fine separation, intake recirculation and oil return; chapter 7 links back without repeating it. Original SVG distinguishes this from fuel-tank ventilation. |
| Complete fuel delivery and evaporative-emissions coverage | Chapter 6 follows the front tank, electric pump, filter/regulation, rear feed and port injectors. A parallel vapour path explains the canister and controlled purge. Original SVG keeps liquid and vapour separate. |
| Explain the accessory belt and vacuum supply | Chapter 5 explains the double-sided poly-V drive, hydraulic tensioner and four accessory loads. Chapter 13 explains the separate exhaust-cam-driven vacuum pump and front booster. Two original SVGs distinguish mechanical drive, air and hydraulic functions. |
| Add instruments, everyday controls, cruise and parking assistance | Chapter 15 adds instrument/display roles, column controls, optional cruise, wheel functions and storage, with an original control map and a credited period S dashboard comparison. Chapter 16 adds rear ultrasonic ParkAssist and its limitations. |
| Explain slip angle and shared tyre grip | Chapter 12 adds an original slip-angle SVG and the interactive force-budget circle, with preserved state and printable fallback. Chapter 18 connects braking, wheel loading, steering and rear drive through one bend. |
| Collect annual equipment, colours and trim | New chapter 19 is a reference appendix. It contains an annual evidence matrix, dated changes and derivative comparison; U means unverified UK evidence, not unavailable equipment. |
| Add visual option references | Appendix has ten wheel photographs, the standard-seat support drawing and three optional seat photographs, sixteen paint samples, five hood photographs and ten interior samples. Its material/finish table separates leather coverage from seat mechanisms. |
| Add an index and glossary | Appendix contains 65 option-code entries and 42 glossary entries, linked to the chapters which explain them. Model/market/dependency exceptions remain explicit. |
| Consolidate Sport Chrono | Chapter 18 owns the manual/PDK/PASM/PCM function matrix. Other chapters retain the effect relevant to their mechanism and link to the master explanation. |
| Reduce repeated guidance | Shared evidence and condition-reading conventions sit in chapter 1. Component chapters retain specific dates, symptoms and mechanisms, with compact links to the annual matrix. Repeated instructions before the shared component explorer have been removed. |
| Move optional arithmetic and identifiers out of the main route | Native disclosures hold engine calculations, manual ratios/worked example, nominal tyre arithmetic and controller/sensor identifiers. The audio reference table is in the appendix. Disclosures expand for print, restore their prior state afterwards, and open when following a source backlink or fragment into them. |
| Review chapter order | Retain the original 18-chapter sequence: context, engine, torque transmission, chassis, cabin/electrics, then integration. The reference appendix follows it. Original chapter titles, section headings and legacy heading destinations are preserved. |

## Evidence and limits

New component facts were checked against the original Porsche 2009 technical introduction, the original UK January 2010 catalogue, PET and the owner handbook, with their different purposes and markets retained. Bosch/ATE corroborate the generic booster principle; HELLA supports vapour capture/purge and ultrasonic sensing; Michelin's *The tyre: Grip* supports slip and the shared-force explanation. Exact locators, sources and qualifications are in the owning research files and manuscript notes.

The atlas uses extracted original catalogue photographs and printed samples. It includes visible attribution and source notes, plus object/extraction mappings in its image credits. The new dashboard photograph depicts an optioned **S**, not the baseline 2.9. Small original wheel and seat images remain limited by their source resolution. Printed samples are not calibrated paint colours.

The January 2010 catalogue prospectively advertises Platinum Silver, Ice Blue and Amethyst from September 2010 **at the earliest**, and additionally lists Arctic Silver and Atlas Grey through July. These are calendar qualifications, not established first/last build dates or a model-year boundary.

The inspected sources do not establish a complete ordinary UK 2011/2012 equipment, paint and trim series. Those gaps remain U. An archive entry labelled “2011 – Boxster (UK)” was checked and excluded: its contents describe the later 981, despite its November 2011 edition date. US technical corroboration does not fill UK ordering gaps. No unverified annual changes have been invented.

The grip circle uses arbitrary force units, constant wheel load and a circular envelope. It displays **requested** longitudinal/lateral forces, including combinations outside capacity; it does not simulate delivered forces, tyre slip or vehicle response. Its controls are not pedal/steering percentages. Real combined-slip behaviour is more complex. The six new static diagrams likewise explain functions rather than service routing or measured geometry.

## Validation

- Portable, web and Pages editions build all **19 reading sections**.
- Full `npm test`: **34 passed**. This includes offline reading, project-prefixed assets, no-JavaScript/WebGL fallbacks, navigation/history, all component tours, interactive lifecycle/state and responsive figures.
- After the final reader change, six affected browser tests passed: navigation, source disclosures/printing, all internal fragments, static SVG accessibility/bounds, grip state and offline atlas/disclosure backlinks. After the two final option-index entries, both fragment and offline-atlas tests passed again.
- The grip calculation has boundary, invalid-input, combined-force and reduced-capacity checks. An excessive force request is retained rather than silently clamped to the circle.
- Production Pages sweep: **19 sections × 2 widths × 4 reading states = 152 states**, at 390 and 1440 px. No page overflow, clipped prose blocks, failed images, missing fonts, runtime/resource errors or diagram failure notices were found. Top/middle/end/open-source screenshots were reviewed in contact sheets.
- The appendix, tyre and cabin chapters were additionally inspected at **390, 768 and 1440 px**. Final reports have zero failures/warnings with the explicit exceptions below. This is Chrome-based responsive verification, not physical-device or cross-browser certification.
- All **80 source SVGs** parse; static SVG accessibility and phone label bounds pass. All **39 interactive modules** are discovered. All chapter-local note references match their definitions, all manuscript images exist and all original chapter/section heading lines remain. `git diff --check` and JavaScript syntax checks pass.
- Six new explanatory plates were separately rendered at phone width. Review corrected a crossing blow-by label, connected the booster air path and clarified the fuel-path merge. Atlas figure padding was corrected so the book's standard plate padding does not shrink its two-column images.
- Source lint: zero failures/warnings. Generated builds, screenshots and temporary source extracts remain ignored/local. Nothing was staged, committed or published.

Review artifacts: `dist/coverage-reader-review/summary.json`, its 24 all-chapter contact sheets, `final-appendix/`, `final-tyres/`, `final-cabin/`, and `inspector-exception-evidence.json`; new plates are in `dist/coverage-review/new-plates.jpg`. Full test log: `/tmp/boxster-coverage-tests-final.log`; affected-test logs: `/tmp/boxster-coverage-focused-final.log` and `/tmp/boxster-coverage-links-final.log`.

## Visual critique

The existing direction is **The page is the object**, seed **1298968287**. Source Serif 4 remains the reading face and Source Sans 3 the navigation/figure face. This pass follows that design without adding promotional motion or decorative layout.

### ROUND 1

Seen in one second: a mechanical book with a clear chapter title and a contents spine.

Idea (one sentence): the reference car leads into readable mechanisms, with photographs and diagrams acting as explanatory plates.

Live thing: chapter navigation, optional detail disclosures, car-to-component tours and the new adjustable grip budget.

Layout words by section: chapter=reading column / mechanism=plate / reference=index and comparison grid / sources=disclosure.

Scores: design 6 · usability 7 · creativity 7 · content 8 → overall 6.7.

Caps applied: the existing stationary reading page and limited photographs in individual component chapters; no autoplay material added to raise a score.

Top three problems (most visible first), with evidence and fix:

1. Early atlas captures: inherited figure padding squeezed the two-column photographs. Give atlas figures their own zero-padding mount while preserving the book's type and grid.
2. Early phone plate captures: the blow-by label crossed its arrow and the booster connection had a gap. Move the label and connect the functional air path; show the fuel branches merging into the cylinder charge.
3. Source navigation into optional detail could reach hidden text. Open every containing disclosure before navigating and verify a real note backlink into the manual calculation.

### ROUND 2 — final

Seen in one second: a focused chapter or reference appendix with a stable title, reading measure and navigation.

Idea (one sentence): the existing field guide now connects missing mechanisms to a compact illustrated reference section.

Live thing: an excessive grip request remains visibly outside the envelope; lowering capacity changes the available force budget, and navigation away/back restores the controls.

Layout words by section: chapter=reading column / controls=interactive plate / atlas=two-column photographs / paint=sample grid / options=linked index / sources=disclosure.

Scores: design 6.5 · usability 8 · creativity 7 · content 8.5 → overall 7.3.

Caps applied: the skill's limited-photography cap on individual component chapters and its stationary-page cap. The result remains below 7.5 under that promotional-page rubric.

Top three remaining limitations, with evidence and disposition:

1. `final-appendix/mobile-page-01.jpg`: wide annual/model comparison tables require horizontal movement inside their own table, preserving readable type and the normal page width. They remain reference tables; chapter prose does not require sideways scrolling.
2. `final-appendix/desktop-page-02.jpg`: period wheel photographs have modest native resolution. Their labels and codes remain clear; upscaling cannot supply missing source detail.
3. `final-tyres/mobile-page-01.jpg`: the existing touch-operated 3D tour occupies more than one screen because its part controls and explanation wrap. It remains a functional figure, with section navigation available; shrinking controls would reduce usability.

### Inspector exceptions

The first unmodified inspections flagged three heuristics. The final round explicitly allows them only on the pages concerned:

- **off-centre:** the meter takes percentiles of text-node edges across the whole document, including the dense index and differently sized navigation rails. Browser geometry confirms the desktop outer frame is 1344 px wide with **48 px on each side**, plus equal 32 px inner gutters; the reading sheet has equal 48 px padding. At 768 px the sheet has equal 24 px outer margins and 40 px padding; at 390 px its padding is 24 px on both sides. The internal desktop rails intentionally have different widths. The rendered frame is retained.
- **eyebrow, tyres/cabin only:** the reported “12”, “18”, “22” and “16”, “19”, “25” are linked superscript source references ending preceding paragraphs, not decorative labels. The references and their backlinks are retained.
- **ui-wrapper, tyres/cabin only:** real interactive figures exceed 1.5 phone screens when controls wrap. DOM evidence confirms no marked figure contains a chapter/section heading or wraps the reading page. Figure controls are retained at their usable sizes.

Existing `still-page`/`no-footage` allowances reflect a user-controlled online book; `few-pictures` is retained on the two component chapters, where diagrams carry the mechanism. The appendix has sufficient actual catalogue photographs and does not use that allowance. No visual elements were hidden from the checker.
