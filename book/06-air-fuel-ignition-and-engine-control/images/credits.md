# Chapter 06 image credits

## sport-chrono-stopwatch.jpg

- Creator and rights holder: Dr. Ing. h.c. F. Porsche AG. © Porsche AG; no open licence inferred.
- Publication: *The Boxster*, January 2010 UK edition, WSLB1101000125; printed p. 57, physical PDF page 26 of 62.
- Exact source: https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf
- Original publication independently opened and relevant spread visually inspected on 10 November 2026. Local original used: `/tmp/boxster-ch05/brochure-2010.pdf`.
- Modification: rendered the relevant spread using Poppler, cropped the stopwatch photograph alone, converted to JPEG. No image content added or removed within the photograph. Final crop 639 × 352 pixels.
- Identification: Porsche catalogue photograph of the optional Sport Chrono dashboard stopwatch, applicable to the ordinary Boxster/Boxster S package description. It establishes the appearance of the illustrated equipment, not the options fitted to a particular car.
- Use: retained locally for the user's personal reading. Original project MIT licence does not relicense this photograph.

The air-path and injection-location SVGs, the mixture-feedback D3 view and its poster, and the intake 3D explorer and its poster are original project work, based on the mechanisms documented in `../research.md`. They reproduce no Porsche diagram geometry.

## Coverage additions — 10 November 2026

`fuel-supply-and-vapour.svg` and `crankcase-ventilation.svg`: original functional maps of separate liquid, vapour and breather/oil-return paths.

## Factory parts-reference audit — 10 November 2026

The unaltered full-page factory renderings are retained separately in [`../part-reference/`](../part-reference/README.md), with every filename, original PDF page/plate, relevant callouts, applicability, source URL, catalogue identity/date and SHA-256 recorded there. They are Porsche-authored PET illustrations, © Porsche; independently hosted originals and local renderings receive no project MIT licence. They are supporting reference evidence rather than artwork redrawn into these SVGs.

The original `air-path.svg` now names the factory-documented cylindrical element and vacuum-operated tuning flaps. The original `intake-explorer` geometry is corrected to a cylindrical filter and gains clamped air guide/manifold joints, two vacuum units/change-over valves, connected bank fuel pipes, injector clips and seals. These are project-authored educational shapes informed by PET 106-000/107-007/107-010, not traced factory CAD or dimensional reproductions. Its generated poster is refreshed by parent integration after the model change. Existing functional-flow SVGs, injection comparison and mixture-feedback view retain their original schematic limits.

## Component illustrations in the manuscript — 12 November 2026

Porsche AG, **PET 987209**, model life **2009–2012**, catalogue P33, snapshot **19 July 2018**; [Porsche-authored catalogue, independent archive](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf). Source PDF SHA-256: `c865de9263f5946db4c24874eb10e503be2343762b308695aa7bb6a943bfd2bf`. These are later service-catalogue illustrations, not a dated 2010 UK order guide. © Porsche AG; the repository’s MIT licence does not relicense them.

The original embedded monochrome bitmaps were extracted with Poppler `pdfimages`, keeping native resolution. Page furniture and, where recorded below, the boxed vehicle-locator inset were omitted. White margins were trimmed and a 20-pixel white border added. No numbered component was redrawn, reshaped or generatively altered. Crop coordinates refer to the native bitmap before border padding. Original full-page references remain unchanged.

### `pet-air-cleaner.png`

- **Source:** PET **106-000**, [PDF p. 85](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf#page=85); [archived full page](../part-reference/pet-106-000-p85.png).
- **Extraction:** PDF image object **317 0**, native **2055 × 3118**; crop `[4, 587, 2055, 3095]`. Locator inset omitted at `[0, 2, 672, 513]`. Result **2091 × 2548** pixels.
- **Applicability and limits:** 106-000 identifies cover 3, element 8, retainer 9, airflow meter 14 and duct 16. Installed duct bends and component dimensions are not measured from the exploded spacing.
- **Local image SHA-256:** `3a24f127fa6fbdd0e7d08dfdb544e7609a83004d0f40290c92e004729bd77c06`.

### `pet-port-injectors.png`

- **Source:** PET **107-007**, [PDF p. 90](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf#page=90); [archived full page](../part-reference/pet-107-007-p90.png).
- **Extraction:** PDF image object **336 0**, native **2056 × 2759**; crop `[39, 510, 2037, 2759]`. Locator inset omitted at `[5, 5, 681, 517]`. Result **2038 × 2289** pixels.
- **Applicability and limits:** 107-007 is the A120 2.9 injection-valve/fuel-collection-pipe plate. Injector 6, clips 7 and seals 8/9 are the port-injection assembly; this is not the S engine's high-pressure DFI equipment.
- **Local image SHA-256:** `885f502f4048b4d4a8a6804c36074c3ed8aa34fa9b385d00de105d44c631e12f`.


## Visual review additions — 13 November 2026

`intake-state-0/1/2.svg`, `intake-resonance-states`

The initial functional connection states were revised on 14 November: the current illustration uses photo-guided outer assembly shapes with separate enlarged flap sections. The 2.9 states remain vacuum-closed at idle, distribution open above 3,800 rpm and tuning open above 5,500 rpm. See the refinement record below for current geometry, sources and limits.

Factory material retains Porsche’s original rights; SVG composition/labels and teaching drawings are original project work. No generative alteration of documentary photographs.

## Intake assembly photographs and redraw — 14 November 2026

The [intake refinement source inventory](../part-reference/intake-refinement/README.md) records all ten original image URLs, pixel sizes, byte counts, SHA-256 hashes, supplier identities and application limits. `assembly-view-2.jpg` (Viking Auto Salvage, 2010 Cayman 2.9 donor listing) and `distributor-view-1.jpg` (Wolf Auto Parts PS85425, later replacement listing) are imported separately into the manuscript. Their pixels are unchanged, with captions and layout supplied by React. The other assembly/bank/centre photographs and Porsche's WM 244619 drawing remain chapter-local reference evidence.

`intake-state-0.svg`, `intake-state-1.svg`, `intake-state-2.svg` and the matching `intake-resonance-states/poster.svg` are original vector illustrations. They now show photo-guided moulding proportions, three curved runners per bank, clamped oval joints, ribs, mounting bosses, the throttle neck, two vacuum units and two change-over valves. Numbered leaders and enlarged half-oval flap sections are authored vector elements. Hidden internal dimensions and installed axes are illustrative, not traced factory CAD. Switching states derive from Porsche 2009 Technik, printed p. 59, and retain the base engine's 3,800/5,500 rpm thresholds. Supplier photographs and Porsche factory material retain their respective rights.
