# Desktop and phone rendering verification

Verified 10 November 2026 against the generated production editions, after the chapter source audit and guidance relocation.

## Checks and result

- `npm test`: **31 tests passed**, including portable, web and Pages builds, offline reading, navigation/history, source disclosures, keyboard operation, print and unavailable-WebGL fallbacks.
- All **18 chapters** checked at **390 × 844** and **1440 × 1000** in Chrome: opening, middle, ending and expanded notes, **144 reading states** in total. No horizontal page overflow, clipped text blocks, broken images, missing bundled fonts, runtime errors or failed book resources were found.
- The suite exercises all **38 interactive figures** at **390, 768 and 1440 px**, including controls and live label bounds. The component-tour checks cover connections, assembled and exploded views, part selection and state restoration.
- Source SVG checks cover all **73 diagrams/fallbacks** at a phone-sized canvas. Responsive reader checks additionally span **320–1920 px**.
- Reviewed the chapter contact sheets and every screenshot emitted by the cover and brakes inspectors at phone, tablet and desktop widths. The final inspector runs have **zero failures**, with the explicit citation-number exception below.

This is Chrome viewport and touch-emulation evidence, rather than physical-device or Safari/Firefox testing. Screenshots and machine-readable results are generated under `dist/render-review/`; the full suite’s figure screenshots are under `dist/previews/`. Generated artifacts remain ignored by Git.

## Inspector dispositions

The existing **The page is the object** direction (seed **1298968287**) is retained. This is a rendering check of the established book design, with no new direction or assets introduced.

- The source linter mistook a 1 px component-marker leader for a decorative divider. A local explanatory comment records its functional role: it joins a numbered label to the corresponding 3D part. Lint now has zero failures; outlined native diagram controls retain their justified interface warning.
- The brakes inspector’s only initial failure called superscript source reference **20** a decorative label above the next heading. The manuscript and screenshot confirm it is a citation. The final brakes run uses the `eyebrow` allowance specifically for that verified false positive; citations were preserved.
- The tablet cover’s margin warning compares inset cover text with the outer frame; its paper has equal 24 px outside gutters. The `cover-intro` warning refers to prose continuing the book title and illustration, rather than an independent unnamed section. Both were visually checked.
- The `few-pictures`, `still-page` and `no-footage` allowances retain the earlier book-design rationale: an illustrated reference book with user-controlled diagrams does not need promotional imagery or autoplay motion.

## Visual critique

ROUND 1

Seen in one second: an illustrated Boxster reference book with a clear reading action.

Idea (one sentence): the 2010 reference car becomes a mechanical field guide, with the contents as its spine and diagrams as inserted plates.

Live thing: chapter navigation and the component/diagram controls.

Layout words by section: cover=illustrated page / chapters=reading column / diagrams=plates / sources=disclosure.

Scores: design 6.5 · usability 8 · creativity 7 · content 8 → overall 7.2.

Caps applied: the cover uses one original model illustration; the reading page deliberately remains stationary. This is below the promotional-site rubric’s 7.5 target, without a rendering defect requiring a redesign.

Top three review notes, with disposition:

1. The source-reference false positive is recorded above; the citation is retained (`inspector-brakes/report.json`).
2. The cover’s intro and inset measurements are intentional book structure (`inspector-cover/tablet-fold.jpg`).
3. Figure controls retain their useful outlines and diagrams their functional leaders (`dist/previews/all-*-phone.png`). No decorative restyling was added.
