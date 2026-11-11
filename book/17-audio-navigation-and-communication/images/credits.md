# Chapter 17 image credits

Both photographs are reproduced from Porsche-authored period material, not generated imagery. Rights remain with Dr. Ing. h.c. F. Porsche AG and the original photographer. The brochure is publicly hosted by Mr Sportscars; that hosting is not treated as a licence. Included for the requested personal reading copy; the project's MIT licence does not relicense these images.

## `cdr-30-period.jpg`

- **Origin:** Porsche, *The Boxster*, UK edition **01/10**, document **WSLB1101000125**, printed **p. 82**, PDF **p. 39** (the spread pp. 82–83).
- **Exact source:** https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf
- **Content:** factory close-up photograph of CDR-30. Original caption expressly says **with optional CD autochanger**. The chapter caption preserves that qualification; the photo does not establish any owner's equipment.
- **Local provenance:** pre-existing `/tmp/boxster-ch05/brochure-2010.pdf`, independently matched against the internet original and visually inspected on 10 November 2026. Extracted embedded JPEG with `pdfimages -f 39 -l 39 -j`; first embedded image, 566 × 336 pixels.
- **Modification:** direct extraction and descriptive rename; no compositing or generative alteration. The unreadable surrounding brochure text is excluded.

## `pcm-3-period.jpg`

- **Origin and exact source:** same Porsche UK **01/10** brochure and URL; printed **p. 83**, PDF **p. 39**.
- **Content:** factory close-up photograph of PCM with navigation; the original shows a radio screen. It identifies the period head unit, not the fitted speaker/telephone options of an individual car.
- **Local provenance:** second embedded JPEG extracted from the independently inspected spread, 566 × 336 pixels.
- **Modification:** direct extraction and descriptive rename; no compositing or generative alteration.

Original chapter SVGs (`audio-amplification.svg`, `telephone-paths.svg`, and `diagrams/audio-source-path/poster.svg`) are author-created educational diagrams. They are not reproductions of Porsche wiring or component drawings.

## Factory parts-reference excerpts

The twelve complete PNG pages in [`../part-reference/`](../part-reference/README.md) reproduce Porsche-authored **PET 987209**, **19 July 2018**, plates **911-000, 911-005 and 911-010**. The reference README records source URL, PDF hash, page numbers, applicability and the visual audit. Poppler rasterisation preserves the complete original pages and callouts, without cropping or generative alteration. Copyright remains Porsche's; these factory pages are not author-created MIT artwork. The original explanatory schematics and explorer remain approximate teaching diagrams, rather than traced factory drawings.

## Component illustrations in the manuscript — 12 November 2026

Porsche AG, **PET 987209**, model life **2009–2012**, catalogue P33, snapshot **19 July 2018**; [Porsche-authored catalogue, independent archive](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf). Source PDF SHA-256: `c865de9263f5946db4c24874eb10e503be2343762b308695aa7bb6a943bfd2bf`. These are later service-catalogue illustrations, not a dated 2010 UK order guide. © Porsche AG; the repository’s MIT licence does not relicense them.

The original embedded monochrome bitmaps were extracted with Poppler `pdfimages`, keeping native resolution. Page furniture and, where recorded below, the boxed vehicle-locator inset were omitted. White margins were trimmed and a 20-pixel white border added. No numbered component was redrawn, reshaped or generatively altered. Crop coordinates refer to the native bitmap before border padding. Original full-page references remain unchanged.

### `pet-speaker-families.png`

- **Source:** PET **911-005**, [PDF p. 579](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf#page=579); [archived full page](../part-reference/pet-911-005-p579.png).
- **Extraction:** PDF image object **2115 0**, native **2067 × 3061**; crop `[131, 201, 1990, 3035]`. Locator inset omitted at `[8, 5, 679, 515]`. Result **1899 × 2874** pixels.
- **Applicability and limits:** 911-005 lists separate PR441/490/680 applications. Item 9 is the complete BOSE rear subwoofer enclosure, not one driver or a standard four-speaker-system part. No physical driver dimensions or amplifier-channel mapping is inferred.
- **Local image SHA-256:** `2647ab76f388bfff71548c13085240b77e44c9a7fc222b369e3c93e717a0853d`.
