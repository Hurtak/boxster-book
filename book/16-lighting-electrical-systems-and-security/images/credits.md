# Image credits

The two JPEGs are original embedded image objects from Porsche AG, *The Boxster*, January 2010 UK edition, WSLB1101000125 GB/UK, printed p. 65 (PDF sheet 30, containing printed pp. 64–65).

Source URL: <https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf>

The source PDF was independently opened online and its lighting spread was rendered and visually inspected on 10 November 2026. Images were extracted from the existing, provenance-matched `/tmp/boxster-ch05/brochure-2010.pdf` using Poppler `pdfimages -f 30 -l 30 -j`. They are real period Porsche publicity photographs, not generated images.

| Local file | Image object | Origin and treatment |
| --- | --- | --- |
| `porsche-front-lights.jpg` | PDF object 120; 381 × 282 px | Photograph captioned “Night-time illumination (front)”. Original JPEG extracted without cropping, rescaling or retouching. Shows the optional bi-xenon main headlamps above illuminated lower LED modules. No model badge is visible, so the photograph is not identified as the 2.9 or S. |
| `porsche-boxster-s-rear-lights.jpg` | PDF object 121; 385 × 282 px | Photograph captioned “Night-time illumination (rear)”. Boxster S model designation visible. Original JPEG extracted without cropping, rescaling or retouching. Explicitly labelled as an S comparison; ordinary 2.9 LED rear-light claim is separately sourced. |

Copyright remains with Dr. Ing. h.c. F. Porsche AG. These reproductions are included for the requested personal reading draft; the project's MIT licence does not relicense them. No claim is made that an archive host owns the photographs.

The explanatory SVG diagrams, D3 circuit and 3D explorer are original project material. Their geometry is schematic and is not a reproduction of Porsche wiring, photometry or workshop drawings.

## Factory parts excerpts

The **57 full-page PNGs** in [`../part-reference/`](../part-reference/README.md) reproduce Porsche-authored PET **987209**, *Model life 2009>>2012*, catalogue P33, snapshot **19 July 2018**. They were rendered with Poppler from the independently hosted [original catalogue PDF](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf), checked on **10 November 2026**. Source SHA-256: `c865de9263f5946db4c24874eb10e503be2343762b308695aa7bb6a943bfd2bf`.

Each retains the whole page, numbered callouts, catalogue identity, date and page furniture; only rasterisation to a 1,800-pixel long edge was performed. No cropping, redrawing, annotation or generative processing. The parts-reference README records every filename, original one-based PDF page, plate/item IDs and application limits; the accompanying verification file records figure and topic coverage. Original copyright remains with Dr. Ing. h.c. F. Porsche AG, including these factory excerpts; they are not MIT artwork.

## Component illustrations in the manuscript — 12 November 2026

Porsche AG, **PET 987209**, model life **2009–2012**, catalogue P33, snapshot **19 July 2018**; [Porsche-authored catalogue, independent archive](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf). Source PDF SHA-256: `c865de9263f5946db4c24874eb10e503be2343762b308695aa7bb6a943bfd2bf`. These are later service-catalogue illustrations, not a dated 2010 UK order guide. © Porsche AG; the repository’s MIT licence does not relicense them.

The original embedded monochrome bitmaps were extracted with Poppler `pdfimages`, keeping native resolution. Page furniture and, where recorded below, the boxed vehicle-locator inset were omitted. White margins were trimmed and a 20-pixel white border added. No numbered component was redrawn, reshaped or generatively altered. Crop coordinates refer to the native bitmap before border padding. Original full-page references remain unchanged.

### `pet-halogen-headlamp.png`

- **Source:** PET **905-000**, [PDF p. 552](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf#page=552); [archived full page](../part-reference/pet-905-000-p552.png).
- **Extraction:** PDF image object **2020 0**, native **2067 × 3131**; crop `[10, 7, 2067, 2948]`. No locator inset omitted. Result **2097 × 2981** pixels.
- **Applicability and limits:** 905-000 is the halogen plate, not bi-xenon 905-001. Item 20 includes ordinary fog/position-light and Spyder-specific alternatives; the representative outline does not establish identical internals across models or RHD beam pattern.
- **Local image SHA-256:** `d372a125024e639abb32e1d39cd4309e777644dc610ab409f8ab1fabaf3b26e0`.


## Visual review additions — 13 November 2026

`ImageComparison` using the original halogen drawing and P75 photograph

Uses unchanged existing PET905-000 p552 halogen drawing beside the existing UK01/10 p65 optionalP75 front photograph. Explicit drawing/photo comparison rather than an unsupported “standard halogen photo”. Standard lower fog/LEDposition vs P75 lowerLEDDRL follow detailed catalogue64–65 and training158, respecting the existing p17 brochure wording conflict. No beam photometry, RHD pattern or fitment by projector appearance.

Factory material retains Porsche’s original rights; React composition/labels and original teaching drawings are original project work. No generative alteration of documentary photographs.

## Source-preserving React layout — 13 November 2026

The former SVG image wrapper has been removed. Imported originals are displayed by the shared `Figure`, `AnnotatedFigure` or `ImageComparison` components. Crops are CSS viewports; editorial numbers and legends are separate HTML elements. The same composition is retained in enlargement, no-JavaScript and print views. Source image bytes have not been retouched or re-exported.


## Halogen / P75 photo comparison — 14 November 2026

`halogen-front-cameron-original.jpg`: Cameron Sports Cars Ltd, [2010 Boxster2.9 manual listing U1674](https://www.cameronsportscars.com/vehicle-details/used-porsche-boxster-987-2-9-gen-2-manual-for-sale-in-chippenham-south-gloucestershire-u1674/), [original JPEG IMG_32632](https://img.cdn.dragon2000.net/C1353/U1674/IMG_32632-large.jpg). Original image bytes retained without retouching, resizing or mirroring. The head-on view shows the standard halogen/fog-lamp layout. The dealer's generic “LED Daytime Running Lights” wording is not used to identify P75: the visible rectangular fog reflectors match the standard arrangement documented in Porsche's detailed lighting spread and PET905-000.

The React comparison now uses two original photographs, with matching-aspect CSS viewports focused on the front lamps. The PET assembly drawing remains a separate construction figure. `porsche-front-lights.jpg` retains its existing original Porsche provenance and optional-P75 identification. Local source locators, crop coordinates and hashes: [halogen-photo reference](../part-reference/halogen-photo/README.md). Dealer/Porsche photographs retain their original copyrights and are excluded from MIT; no permission to republish is asserted.
