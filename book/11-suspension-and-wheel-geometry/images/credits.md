# Chapter 11 image credits

All four files were extracted as embedded JPEGs from the original Porsche publications, without retouching. Retrieved and visually checked 10 November 2026. These are third-party Porsche images; the repository's MIT licence does not apply to them. Retained for this personal-use reference project, with no permission to republish asserted.

| Local file | Creator / attribution | Original source and location | Subject and limits |
| --- | --- | --- | --- |
| `front-axle-boxster-s.jpg` | Porsche AG; individual artist/photographer not credited | *The Boxster*, UK edition 01/10, printed p. 50, PDF p. 23, first embedded image. [PDF](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf) | Factory technical image labelled Boxster S front axle. Used for shared architecture, not proof of identical 2.9 parts or brakes. |
| `rear-axle-boxster-s.jpg` | Porsche AG; individual artist/photographer not credited | Same publication, printed p. 50, PDF p. 23, second embedded image. [PDF](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf) | Factory technical image labelled Boxster S rear axle. Same architectural qualification. |
| `boxster-and-s-on-road.jpg` | Porsche AG; individual photographer not credited | Same publication, printed p. 51, PDF p. 23, third embedded image. [PDF](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf) | Real period road photograph: ordinary Boxster left, Boxster S right. No inference of fitted PASM from the image. |
| `spyder-cornering.jpg` | Porsche AG; individual photographer not credited | *The Boxster Spyder*, UK edition 01/10, printed p. 29, PDF p. 13. [PDF](https://porschecarshistory.com/wp-content/old/brochures2/93/2010%20987%20Boxster%20Spyder.pdf) | Real period photograph of 987 Spyder, beside the original p. 28 chassis description. Ride-height claim comes from that description, not photogrammetry. |

The original SVG schematics and interactive teaching models were authored for this chapter. They are conceptual illustrations, not Porsche CAD or service drawings.

## Factory parts-reference pages

The 22 PNGs in [`../part-reference/`](../part-reference/README.md) are uncropped full-page renders of Porsche's *Boxster 2009–2012 PET*, model 987209, P33, 19 July 2018 snapshot, PDF pp. 129–139 and 181–191. They preserve the original factory drawings, numbered callouts and adjacent application lists. Source, exact page/plate/item locators, SHA-256 and applicability limits are recorded in that directory. Creator/copyright: Porsche; independently hosted PDF retrieved 10 November 2026. No retouching or factory-CAD claim; these third-party excerpts are excluded from the repository's MIT licence, with no permission to republish asserted.

## Component illustrations in the manuscript — 12 November 2026

Porsche AG, **PET 987209**, model life **2009–2012**, catalogue P33, snapshot **19 July 2018**; [Porsche-authored catalogue, independent archive](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf). Source PDF SHA-256: `c865de9263f5946db4c24874eb10e503be2343762b308695aa7bb6a943bfd2bf`. These are later service-catalogue illustrations, not a dated 2010 UK order guide. © Porsche AG; the repository’s MIT licence does not relicense them.

The original embedded monochrome bitmaps were extracted with Poppler `pdfimages`, keeping native resolution. Page furniture and, where recorded below, the boxed vehicle-locator inset were omitted. White margins were trimmed and a 20-pixel white border added. No numbered component was redrawn, reshaped or generatively altered. Crop coordinates refer to the native bitmap before border padding. Original full-page references remain unchanged.

### `pet-front-strut.png`

- **Source:** PET **402-000**, [PDF p. 133](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf#page=133); [archived full page](../part-reference/pet-402-000-p133.png).
- **Extraction:** PDF image object **505 0**, native **2034 × 3136**; crop `[198, 318, 2034, 2996]`. Locator inset omitted at `[0, 2, 672, 513]`. Result **1876 × 2718** pixels.
- **Applicability and limits:** 402-000 shares passive PR029, PASM PR475 and Spyder applications with different part listings. Controller 14 and body-acceleration sensor 16 are PASM-related; item 17 identifies mounting hardware/bracket, not a second sensor. Exploded vertical spacing is not actual spring length, ride height or available travel.
- **Local image SHA-256:** `2aa20bc7fe88eac3008f3fb829ea810ae812467c27fe963d06d07252ef6084b0`.
