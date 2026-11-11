# Image credits

Retrieved and visually checked 10 November 2026. These images retain Porsche AG's rights. The repository's MIT licence does not relicense them. Retained as third-party period material for the personal-use book; no republication permission is asserted.

| File | Creator / rights holder | Exact source | Modifications and scope |
| --- | --- | --- | --- |
| `boxster-and-s-19-inch.jpg` | Porsche AG; individual photographer not credited | *The Boxster*, UK edition 01/10, printed pp. 52–53, PDF p. 24, first embedded JPEG, 1184 × 337. [Original PDF](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf#page=24). | Embedded JPEG extracted with `pdfimages -f 24 -l 24 -j`, no retouching or cropping. Original caption identifies ordinary Boxster with Carrera Sport wheels and S with Carrera S II, both 19-inch. Comparison image, not an owner's car/equipment record. |
| `boxster-iii-17-inch.jpg` | Porsche AG; individual photographer not credited | Same brochure, printed p. 53, PDF p. 24, second embedded JPEG, 165 × 209. [Original PDF](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf#page=24). | Extracted original embedded JPEG, unmodified. The original caption identifies the standard 17-inch Boxster III wheel. Modest source resolution is retained; manuscript displays it at 210 px width. |

The steering and offset SVGs, tyre-comparison figure and 3D-explorer rendering were authored for this chapter and are original schematics, not Porsche CAD or service illustrations.

## Coverage additions — 10 November 2026

`tyre-slip-angle.svg` and `tyre-grip-budget`/poster: original explanatory geometry, not copied Michelin artwork or measured Porsche tyre data.

## Factory parts-reference audit — 10 November 2026

[Chapter-local factory excerpts](../part-reference/README.md) retain 22 complete, unaltered rendered pages from Porsche AG's *PET — Boxster 987209, 2009–2012*, P33 snapshot 19 July 2018; original PDF SHA-256 `c865de9263f5946db4c24874eb10e503be2343762b308695aa7bb6a943bfd2bf`. Source, individual PDF pages, plate/item numbers, applicability and rights are recorded there. They are Porsche material rather than original MIT-licensed diagrams.

The explorer's revised broad reservoir over the pump, protected inner track-rod joints, ordinary valve and balancing weight follow parts identities in PET 403-003, 403-000 and 601-000. Dimensions/positions remain original schematic geometry. The two existing Porsche photographs remain unchanged; PET's generic rim picture does not replace the standard-wheel photograph. No standalone SVG was changed by this audit. Regenerate the original `steering-explorer/poster.svg` from its updated model/config during parent integration.

## Component illustrations in the manuscript — 12 November 2026

Porsche AG, **PET 987209**, model life **2009–2012**, catalogue P33, snapshot **19 July 2018**; [Porsche-authored catalogue, independent archive](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf). Source PDF SHA-256: `c865de9263f5946db4c24874eb10e503be2343762b308695aa7bb6a943bfd2bf`. These are later service-catalogue illustrations, not a dated 2010 UK order guide. © Porsche AG; the repository’s MIT licence does not relicense them.

The original embedded monochrome bitmaps were extracted with Poppler `pdfimages`, keeping native resolution. Page furniture and, where recorded below, the boxed vehicle-locator inset were omitted. White margins were trimmed and a 20-pixel white border added. No numbered component was redrawn, reshaped or generatively altered. Crop coordinates refer to the native bitmap before border padding. Original full-page references remain unchanged.

### `pet-steering-rack.png`

- **Source:** PET **403-000**, [PDF p. 138](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf#page=138); [archived full page](../part-reference/pet-403-000-p138.png).
- **Extraction:** PDF image object **524 0**, native **2034 × 2570**; crop `[159, 835, 1995, 2354]`. Locator inset omitted at `[0, 2, 672, 513]`. Result **1876 × 1559** pixels.
- **Applicability and limits:** 403-000 distinguishes gear 1, bellows 2, joint 6, locknut 7 and track rod 8. LHD/RHD alternatives are listed separately, so handed pipe geometry and complete interchangeability are not inferred.
- **Local image SHA-256:** `ce59b3cf143a23a4c4bc970bcbdd5a5acecb4886a07445b5efa294347f14af14`.
