# Chapter 08 image credits

`porsche-six-speed-gear-lever.jpg` is a genuine Porsche catalogue photograph of the six-speed manual gear lever in a tan cabin. Source: Porsche, *The Boxster*, UK edition **01/10**, publication **WSLB1101000125 GB/UK**, printed **p. 47**, PDF **p. 21**, image object **78**, original dimensions **255 × 228 px**.

Exact source URL: <https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf#page=21>.

Extracted with `pdfimages -f 21 -l 21 -j` from the original downloaded PDF; fourth image on that spread. JPEG copied without cropping, resampling, recolouring or retouching. The source's visible label reads “Gear lever for six-speed gearbox”. The car is a catalogue example; the photograph supplies no proof of an owner's trim or short-shift mechanism. Image inspected during authoring.

Copyright © Dr. Ing. h.c. F. Porsche AG. Reproduced for personal reading as requested. Third-party photograph retains its original rights and is not covered by the repository's MIT licence. No generated image is used.

The original vector diagrams `clutch-actuation.svg`, `constant-mesh-and-synchroniser.svg` and `diagrams/manual-ratio-explorer/poster.svg` were drawn for this book. They are explanatory illustrations, not Porsche factory drawings. Mechanism references and the ratio data are credited in the chapter and `research.md`.

`diagrams/manual-explorer/poster.svg` is a generated view of the book’s original schematic 3D assembly. It is not a Porsche factory drawing or measured G87/10 reconstruction; model-specific fitment evidence and illustrative limits are recorded in the chapter and `research.md`.

## Factory parts-reference pages

The **20 full-page PNGs** in `../part-reference/` are unaltered raster renders of Porsche's *PET, Boxster 2009–2012, type 987*, model 987209, catalogue P33, revision **19 July 2018**, retrieved **10 November 2026**. They preserve the original drawings, numbered callouts, parts/application tables and page furniture. [Source PDF](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf); exact pages, plates, applicability and SHA-256 are in [the reference manifest](../part-reference/README.md).

Copyright © Dr. Ing. h.c. F. Porsche AG. These factory drawings and tables retain Porsche's rights and are **not covered by the repository's MIT licence**. The public host is an independent archive, not the drawing's author. No factory page is recoloured, annotated, cropped or represented as book-original art. The original clutch diagram and car-to-component assembly use these pages for component identity and connections; operating principles remain attributed separately.

## Component illustrations in the manuscript — 12 November 2026

Porsche AG, **PET 987209**, model life **2009–2012**, catalogue P33, snapshot **19 July 2018**; [Porsche-authored catalogue, independent archive](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf). Source PDF SHA-256: `c865de9263f5946db4c24874eb10e503be2343762b308695aa7bb6a943bfd2bf`. These are later service-catalogue illustrations, not a dated 2010 UK order guide. © Porsche AG; the repository’s MIT licence does not relicense them.

The original embedded monochrome bitmaps were extracted with Poppler `pdfimages`, keeping native resolution. Page furniture and, where recorded below, the boxed vehicle-locator inset were omitted. White margins were trimmed and a 20-pixel white border added. No numbered component was redrawn, reshaped or generatively altered. Crop coordinates refer to the native bitmap before border padding. Original full-page references remain unchanged.

### `pet-manual-clutch.png`

- **Source:** PET **301-000**, [PDF p. 109](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf#page=109); [archived full page](../part-reference/pet-301-000-p109.png).
- **Extraction:** PDF image object **411 0**, native **2028 × 2675**; crop `[22, 630, 2025, 2616]`. Locator inset omitted at `[0, 0, 672, 506]`. Result **2043 × 2026** pixels.
- **Applicability and limits:** 301-000 lists G87/10 and G87/40 parts separately. The representative pressure assembly must not be used to assign the S-only X-Tend feature to the reference 2.9. Items 3/4/5 identify the separate lever, bearing and guide.
- **Local image SHA-256:** `9cc5dc46aeab55227268cd10ce2e43cdb74268515326529083aea49b3ae8d3e8`.


## Visual review additions — 13 November 2026

The earlier `dual-mass-flywheel.svg` (replaced by separate face and cutaway panels below).

The initial unfolded two-mass/spring illustration was superseded by the detailed 14 November revision below. Porsche training103 establishes reference-car fitment. Generic mechanism corroborated by ZF https://press.zf.com/press/en/releases/release_3283.html and https://www.zf.com/products/en/cars/products_64271.html . No exact Porsche spring count, shape or twist limit. Spring compliance is kept distinct from clutch slip.

Factory material retains Porsche’s original rights; SVG composition/labels and teaching drawings are original project work. No generative alteration of documentary photographs.

## Flywheel photographs and detailed redraw — 14 November 2026

The [flywheel reference record](../part-reference/flywheel-refinement/README.md) lists exact original image URLs, hashes, dimensions, the LuK guide identity/page locators and the A120 manual parts cross-check. Supplier originals `part-view-4.jpg` and `part-view-1.jpg` are displayed separately through React. The face panel uses a viewport crop, with the source JPEG intact. Their copyright remains with the supplier/photographer.

`dual-mass-flywheel-face.svg` and `dual-mass-flywheel-cutaway.svg` are original vector artwork. Its exterior proportions follow the part photograph; its separate internal cutaway follows the generic LuK mechanism, not a disassembled Porsche-specific measurement. It adds the contact annulus, mounting centre, starter teeth, openings, curved coil springs, channel stops, flange and indexed reference/turned positions. Numbered component labels use the shared native HTML annotation key. The retained complete LuK pages remain Schaeffler-authored reference material with their original rights, not MIT artwork. Exact hidden geometry and twist limits are not inferred.
