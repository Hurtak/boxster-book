# Chapter 05 photograph credits

These two third-party photographs are retained locally for the user's personal illustrated book. They are not author-created diagrams and are not represented as MIT-licensed material. Individual photographers are not named in the inspected sources; credits below identify the credited publisher/rightsholder rather than invent a photographer name.

## `ma120-cayman-2-9-engine.jpg`

- **Creator/source credit:** Redline Auto Parts, product photography.
- **Source page:** [2009–2012 Porsche 987 Boxster / Cayman 2.9l Engine Long Block / MA1.20 / 89K BC026](https://www.redlineautoparts.com/porsche/2005-2012-boxster-cayman-987/2009-2012-porsche-987-boxster-cayman-2-9l-engine-long-block-ma1-20-89k-bc026/).
- **Original image:** [IMG_2711, CDN copy](https://cdn11.bigcommerce.com/s-dals72eswg/images/stencil/1280x1280/products/69667/734956/IMG_2711__76846.1715094272.jpg?c=2).
- **Identification:** Seller identifies donor as **2009 Porsche 987 Cayman 2.9l**. Photograph is a complete used engine viewed from the gearbox end, with the black intake above the low aluminium crankcase. It is not asserted to be a 2010 UK Boxster engine, and seller compatibility wording is not used as engineering proof of interchangeability.
- **Local treatment:** Original 1280 × 960 JPEG saved without compositing or part substitution. Visually inspected 10 November 2026.

## `porsche-3-4-engine-comparison.jpg`

- **Creator/source credit:** Porsche AG; individual photographer not specified.
- **Source:** Porsche, *The Boxster*, January 2010 UK brochure, printed **p. 27** / PDF spread **page 11**. [Original PDF](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf#page=11).
- **Identification:** Original caption identifies **3.4-litre six-cylinder Boxer engine in the Boxster S**. Accessory-drive-end photograph, not a 2.9 engine photograph. Used only in the related-model comparison.
- **Local treatment:** Embedded JPEG extracted with Poppler `pdfimages -f 11 -l 11 -j`, image 001, 527 × 336. Image identity checked against the complete rendered spread; no added labels or changes. Visually inspected 10 November 2026.

The chapter's SVG diagrams and interactive D3 graphics are original explanatory artwork created for the book. They are mechanically simplified and distinguish the 2010 2.9 baseline from the labelled comparison photograph.

## Coverage additions — 10 November 2026

`accessory-drive.svg`: original functional belt-drive map; exact pulley positions, wrap and diameters are not reproduced.

## Factory parts reference addition — 10 November 2026

The 29 full-page PNGs in [part-reference](../part-reference/README.md) reproduce selected Porsche-authored PET 987209/P33 pages, catalogue snapshot 19 July 2018, retrieved 10 November 2026. They retain the entire page, factory callouts, plate identifiers, dates and footers; longest edge 1,800 pixels, no compositing or part substitution. Exact per-file PDF page/plate/application and source hash are in the reference index. Copyright remains Porsche's; these are not original/MIT-licensed book drawings.

`timing-drive.svg` now explicitly separates the two cam-drive chains and their two hydraulic tensioners from the third, omitted oil-pump chain (PET 103-015). `accessory-drive.svg` now identifies the crank pulley's torsional vibration damper (102-000 item 16). Both remain original functional schematics. The engine explorer's additional ring/bearing/gasket/tappet/spring/adjuster/sprocket/catalyst details are simplified original geometry informed by PET 102-000/005, 103-000/005/010 and 202-000, not extracted factory CAD. See [complete visual verification](../part-reference/verification.md).

## Component illustrations in the manuscript — 12 November 2026

Porsche AG, **PET 987209**, model life **2009–2012**, catalogue P33, snapshot **19 July 2018**; [Porsche-authored catalogue, independent archive](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf). Source PDF SHA-256: `c865de9263f5946db4c24874eb10e503be2343762b308695aa7bb6a943bfd2bf`. These are later service-catalogue illustrations, not a dated 2010 UK order guide. © Porsche AG; the repository’s MIT licence does not relicense them.

The original embedded monochrome bitmaps were extracted with Poppler `pdfimages`, keeping native resolution. Page furniture and, where recorded below, the boxed vehicle-locator inset were omitted. White margins were trimmed and a 20-pixel white border added. No numbered component was redrawn, reshaped or generatively altered. Crop coordinates refer to the native bitmap before border padding. Original full-page references remain unchanged.

### `pet-crankshaft-and-rods.png`

- **Source:** PET **102-000**, [PDF p. 39](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf#page=39); [archived full page](../part-reference/pet-102-000-p039.png).
- **Extraction:** PDF image object **143 0**, native **2007 × 3127**; crop `[0, 169, 2007, 3018]`. Locator inset omitted at `[0, 0, 672, 506]`. Result **2047 × 2889** pixels.
- **Applicability and limits:** 102-000 is shared by engine applications A120/A121. One representative rod is shown, not the engine's complete rod count. The plate does not establish bearing clearances or an exact 2.9 flywheel specification.
- **Local image SHA-256:** `d19674d0400262f09e670f405252997cb9adcf05494b2a8179e8cce44b2403ce`.

### `pet-piston-and-rings.png`

- **Source:** PET **102-005**, [PDF p. 42](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf#page=42); [archived full page](../part-reference/pet-102-005-p042.png).
- **Extraction:** PDF image object **154 0**, native **2067 × 2660**; crop `[120, 830, 1988, 2491]`. Locator inset omitted at `[9, 3, 680, 513]`. Result **1908 × 1701** pixels.
- **Applicability and limits:** 102-005 has separate A120/A121 piston applications. Its representative crown must not be treated as an exact 2.9 crown profile. Ring pack 2 has three rings; item 3 is the pin-retaining clip.
- **Local image SHA-256:** `75855264d73160cc9c6a22ee45153a537d9d573e4120226d5d090712af1faeec`.


## Visual review additions — 13 November 2026

`AnnotatedFigure` for the factory accessory drive; the revised paired tappet sections for original mechanism artwork

The shared React figure displays a layout crop of the saved PET101-010 p37 drawing:7 belt,8 alternator,9 coolant pulley,10 steering pulley,11 crank pulley,12 compressor,1–3 tensioner/rollers; the actual callout drawing replaces guessed belt geometry. The revised tappet comparison and its archived source images are documented below.

Factory material retains Porsche’s original rights; React composition/labels and original teaching drawings are original project work. No generative alteration of documentary photographs.

## Source-preserving React layout — 13 November 2026

The former SVG image wrapper has been removed. Imported originals are displayed by the shared `Figure`, `AnnotatedFigure` or `ImageComparison` components. Crops are CSS viewports; editorial numbers and legends are separate HTML elements. The same composition is retained in no-JavaScript and print views. Source image bytes have not been retouched or re-exported.

## Tappet proportion and detail revision — 14 November 2026

The former rectangular, two-profile `variocam-tappet.svg` has been replaced by paired cylindrical cutaways (`variocam-tappet-uncoupled.svg` / `variocam-tappet-coupled.svg`) and two original Wolf Auto Parts photographs of listed inlet tappet **9A1 105 070 03**, stock PS60678. The external envelope and central-pad ratio follow the visible part; the factory UK 01/10 VarioCam illustration establishes three neighbouring cam tracks. The new sections distinguish the outer ring, inner tappet, lateral coupling pin, internal return spring and hydraulic clearance compensation. The valve stem is broken off graphically so a compressed full valve is not presented as a scale part.

All originals, source URLs, native dimensions, processing, hashes and the comparison with PET 103-010 and Porsche training are recorded in [the refinement reference](part-reference/tappet-refinement/README.md). Photographs remain unchanged; crops are layout viewports. Both modes use the same body proportions and show a common base-circle position, not their peak displacements. The baseline **3.6 / 10.0 mm** figures remain unchanged. The older P001 cutaway supplies only mechanism context; unknown MA120 clearances, oil drillings and internal dimensions remain explicitly schematic. Detailed comparisons stack on phones and remain side by side on wider screens.
