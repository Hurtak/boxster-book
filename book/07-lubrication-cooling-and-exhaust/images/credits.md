# Chapter 07 image credits

The two catalogue illustrations below are Porsche factory illustrations retained locally for the user's personal illustrated book. Individual photographers/illustrators are not named in the source. Copyright remains with Porsche AG; the book's original-material MIT licence does not relicense these images. Both images were visually inspected against their original spread on 10 November 2026.

## `porsche-boxster-s-exhaust.jpg`

- **Publisher/rightsholder:** Porsche AG.
- **Source:** *The Boxster*, January 2010 UK brochure, printed **p. 39**, PDF**p.17**. [Exact original PDF](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf#page=17).
- **Original caption:** “Boxster S exhaust system”. The image is explicitly labelled as the S system in this chapter. Porsche's technical introduction, Fuel/ignition printed p. 60/viewer66, says the2.9 exhaust matches the S apart from the tailpipe; the twin visible outlets are not assigned to the standard2.9.
- **Local treatment:** Embedded JPEG extracted with Poppler`pdfimages -f17 -l18 -j`; resulting image002,527×373pixels. No crop, compositing, text removal or part changes.

## `porsche-boxster-s-system-layout.jpg`

- **Publisher/rightsholder:** Porsche AG.
- **Source:** *The Boxster*, January 2010 UK brochure, printed **pp. 40–41**, PDF**p.18**. [Exact original PDF](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf#page=18).
- **Original identification:** “Boxster S”. A factory photographic cutaway locates front radiator installation, rear engine/gearbox, coolant tank and exhaust. This is a related-model layout illustration, not evidence of the reference car's installed gearbox, PASM, brake equipment or other options.
- **Local treatment:** Embedded JPEG extracted from the same PDF with Poppler`pdfimages`, image003,971×536pixels. The original numbered key is a separate PDF text/vector overlay and is not part of the JPEG; no unreadable spread text is reproduced. No compositing or part changes.

The chapter's schematic SVGs, D3 interactive and 3D component explorer are original explanatory artwork created for the book. Their shapes and routes are functional schematics, not Porsche CAD or workshop assembly drawings.

## Factory parts drawings in `../part-reference/`

The chapter now preserves 32 complete original PET pages across 14 plates, with all numbered callouts and original headers/footers retained. These are **Porsche AG factory illustrations and text**, separately hosted original documents, not book-created MIT artwork. Source: *Boxster 2009–2012 PET*, **987209/P33, snapshot 19 July 2018**, [original PDF](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf). Retrieved/reopened 10 November 2026; full PDF SHA-256 `c865de9263f5946db4c24874eb10e503be2343762b308695aa7bb6a943bfd2bf`.

Poppler converted each full page to a 1,800-pixel-longest-edge PNG without crop, compositing, redrawing or callout removal. The [local register](../part-reference/README.md) lists each file, original page, plate, item IDs and engine/equipment qualifiers. [Verification](../part-reference/verification.md) distinguishes factory-backed identity/attachment from the original schematics and illustrative 3D geometry. Copyright remains Porsche's.

## Component illustrations in the manuscript — 12 November 2026

Porsche AG, **PET 987209**, model life **2009–2012**, catalogue P33, snapshot **19 July 2018**; [Porsche-authored catalogue, independent archive](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf). Source PDF SHA-256: `c865de9263f5946db4c24874eb10e503be2343762b308695aa7bb6a943bfd2bf`. These are later service-catalogue illustrations, not a dated 2010 UK order guide. © Porsche AG; the repository’s MIT licence does not relicense them.

The original embedded monochrome bitmaps were extracted with Poppler `pdfimages`, keeping native resolution. Page furniture and, where recorded below, the boxed vehicle-locator inset were omitted. White margins were trimmed and a 20-pixel white border added. No numbered component was redrawn, reshaped or generatively altered. Crop coordinates refer to the native bitmap before border padding. Original full-page references remain unchanged.

### `pet-oil-filter-and-cooler.png`

- **Source:** PET **104-005**, [PDF p. 60](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf#page=60); [archived full page](../part-reference/pet-104-005-p060.png).
- **Extraction:** PDF image object **222 0**, native **2015 × 3071**; crop `[0, 174, 2015, 3064]`. Locator inset omitted at `[0, 0, 661, 497]`. Result **2055 × 2930** pixels.
- **Applicability and limits:** 104-005 identifies housing 1, filter cup/set 9, insert 11, exchanger 12 and separator 15. The drawing is shared engine-family service evidence, not exact operating fluid routing or an original part-suffix guarantee.
- **Local image SHA-256:** `132c9920bac072d9b0cac341479a060cfc1ce9f1f71db34aacd2be2342595194`.


## Visual review additions — 13 November 2026

`oil-overlap-0/1.svg`, `oil-pump-delivery`, `oil-level-display.svg`

Original pressure-pump sections checked against Porsche2009 Technik Engine pp21–22; fresh primary-text check at https://www.scribd.com/document/972719474/Boxster-2009 . A hydraulic pressure difference moves one gear axially, changing active tooth width; mechanical chain drive remains. No exact control-pressure or delivery map. The four scavenge sections are omitted. Display is conceptual, not a facsimile; measurement conditions remain those of the handbook.

Factory material retains Porsche’s original rights; SVG composition/labels and teaching drawings are original project work. No generative alteration of documentary photographs.

## Oil-pump photographs and section revision — 14 November 2026

The [oil-pump source inventory](../part-reference/oil-pump-refinement/README.md) records the five exact original URLs, image sizes, byte counts, hashes, source identities and applicability limits. `pump-view-1.jpg` is Wolf Auto Parts' photograph of **9A1 107 050 04**, stock PS85365. `porsche-oil-pan-cutaway.jpg` is Porsche's factory illustration from the 2009 Boxster 2.9 oil-supply description, hosted by Operation CHARM. They are displayed separately through React with their original pixels unchanged. The other photographs and factory functional section remain supporting reference evidence.

`oil-overlap-0.svg`, `oil-overlap-1.svg` and the matching `oil-pump-delivery/poster.svg` are project-authored sections informed by that factory principle drawing: shorter spur gears, axial tooth lines, both pistons, the spring, separate command and valve, and two distinct pressure connections. The active-width band, numbered leaders and centred movement arrow are authored vector elements. The complete casting is deliberately omitted from the enlarged internal view. Internal dimensions, tooth count, travel, valve ports and gallery routing are illustrative. Original photographs and Porsche factory material retain their respective rights.

## Vertical oil-level example — 14 November 2026

`oil-level-display.svg` is original project artwork, redrawn after visual comparison with Porsche’s **MY2010 Boxster/Boxster S handbook, WKD 987 021 10, 5/09**, printed pp. **157–158**, [PDF pp. 159–160](https://billswebspace.com/Owners_Manual_Boxster_PCNA.pdf#page=159). The vertical four-segment arrangement replaces the earlier horizontal teaching scale. MAX and MIN align with their actual marked levels; separate leaders identify the maximum and the example’s filled height. No source pixels are reproduced, and the drawing is explicitly conceptual rather than an exact dashboard facsimile. No segment-volume calibration is inferred.
