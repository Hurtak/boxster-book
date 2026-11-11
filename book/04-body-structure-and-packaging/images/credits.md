# Chapter 04 image credits

These two Porsche-authored illustrations/photographs are retained locally for the user's personal illustrated book. Third-party copyright remains with the source rightsholder; the project's MIT licence does not relicense them. No individual photographer is identified in the publication.

## `porsche-material-zones.jpg`

- **Source/rightsholder:** Porsche AG, *The Boxster*, January 2010 UK edition, colophon WSLB1101000125, printed **p. 66**, PDF **p. 31**.
- **Exact source:** https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf#page=31
- **Image:** factory cutaway exposing the body structure, with material regions in the original colours. It is a factory technical illustration, not a photograph of a stripped car or original book artwork. The separately typeset colour legend on the source page is outside the embedded image and has not been included as tiny illegible text.
- **Local treatment:** extracted original embedded JPEG using Poppler `pdfimages -f 31 -l 31 -j`, image 000, **544 × 382**. No crop, recolouring, generated content or substituted components. Checked visually against a rendered complete source spread on 10 November 2026.

## `porsche-two-luggage-compartments.jpg`

- **Source/rightsholder:** Porsche AG, same January 2010 UK brochure, printed **p. 79**, PDF **p. 37**.
- **Exact source:** https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf#page=37
- **Image:** studio photograph of the red **Boxster S**, front and rear luggage lids raised. Caption identifies the S as a comparison; its photograph does not establish the reference 2.9's options.
- **Local treatment:** extracted original embedded JPEG using Poppler `pdfimages -f 37 -l 37 -j`, image 002, **527 × 300**. No compositing, recolouring or crop. Checked visually against the complete source spread on 10 November 2026.

The load-path and airflow SVGs, the D3 packaging-layer view and the 3D body-shell explorer are original book artwork. Their shapes, clearances and load/air paths are schematic, not factory CAD or measured analysis.


## Factory parts-reference pages

The **46 full-page PNGs** in [`../part-reference/`](../part-reference/README.md) reproduce selected original Porsche PET **987209**, **P33**, **19 July 2018** pages for chapter research. The source/edition/hash, each original page/plate, callouts and applicability are recorded in that directory's README. The drawings were rasterised at 1800 pixels on the longest side without cropping, recolouring or changing their numbered callouts. Porsche retains copyright; these are not original MIT-licensed artwork or factory CAD. All 20 drawing pages were visually inspected against their parts lists on 10 November 2026.

The new seat-support pair, inner sill webs and rear-wall service cover in the body explorer, right-side fan symbol in the airflow map, and top-cover seal in the packaging view are original educational geometry. PET confirms their identities and neighbouring assemblies; their shapes, offsets, dimensions and symbolic fan blades remain illustrative. Full figure-by-figure coverage is in [`verification.md`](../part-reference/verification.md).

## Diagram proportion review — 11 November 2026

- The airflow map now uses the UK body, wheelbase and tyre proportions, separate front cooling modules, a moulded airbox and a distinct right-side ventilation duct/fan. Its [reference record](../part-reference/body-airflow-refinement/provenance.md) identifies the factory body photographs, PET component plates and primary training page supporting the airflow direction.
- The live packaging view and matching poster use a photo-guided rear section, shallow roof stowage and shaped luggage/access parts. Only the detail inset separates the engine-cover layers. The [reference record](../part-reference/body-packaging-layers-refinement/README.md) credits the roof-sequence and service-cup excerpts and identifies the PET parts used.

These remain original explanatory drawings. The retained factory excerpts keep their original rights; internal installation contours, section placement and flow arrows are not factory CAD or measured analysis.

## Component illustrations in the manuscript — 12 November 2026

Porsche AG, **PET 987209**, model life **2009–2012**, catalogue P33, snapshot **19 July 2018**; [Porsche-authored catalogue, independent archive](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf). Source PDF SHA-256: `c865de9263f5946db4c24874eb10e503be2343762b308695aa7bb6a943bfd2bf`. These are later service-catalogue illustrations, not a dated 2010 UK order guide. © Porsche AG; the repository’s MIT licence does not relicense them.

The original embedded monochrome bitmaps were extracted with Poppler `pdfimages`, keeping native resolution. Page furniture and, where recorded below, the boxed vehicle-locator inset were omitted. White margins were trimmed and a 20-pixel white border added. No numbered component was redrawn, reshaped or generatively altered. Crop coordinates refer to the native bitmap before border padding. Original full-page references remain unchanged.

### `pet-engine-access.png`

- **Source:** PET **807-005**, [PDF p. 306](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf#page=306); [archived full page](../part-reference/pet-807-005-p306.png).
- **Extraction:** PDF image object **1136 0**, native **2067 × 2785**; crop `[129, 466, 2013, 2655]`. Locator inset omitted at `[5, 4, 681, 515]`. Result **1924 × 2229** pixels.
- **Applicability and limits:** 807-005 separates upper engine cover 5, seal 7 and top trim 1 from rear-wall cover 10 and trim 11/12. It does not show the exterior roof-compartment lid or a workshop removal sequence.
- **Local image SHA-256:** `a3b4435554a7b502c8ee2c12a43c668153722c721bedc59dd9fb00e9e0e59210`.
