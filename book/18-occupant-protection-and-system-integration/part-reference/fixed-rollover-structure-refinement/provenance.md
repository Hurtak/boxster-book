# Fixed rollover structure: profile refinement

Checked 11 November 2026. Scope: original `../../images/fixed-rollover-structure.svg`, for the **2010 European/UK ordinary Boxster 987.2 2.9**. The illustration exposes normally covered structure; it is not a body-repair drawing. No chapter prose, common research, common credits or explorer geometry is changed by this refinement.

## Primary sources inspected

| Source and exact locator | Visibly supported detail used |
| --- | --- |
| Porsche AG, PET model **987209**, model life **2009–2012**, snapshot **19 July 2018**, Kat **P33**, PDF **418**, plate **812-000**, item **1**. [Existing factory drawing](../pet-812-000-p418.png); [source PDF](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf#page=418). | A single assembly has two rounded, flattened hoop openings, a shaped central connection, broad splayed outer supports, mounting webs and feet. It is not two independent rectangular hoops. The lower members and apertures are simplified rather than counted or dimensioned. |
| Same, PDF **419**, plate **812-000**, item **1**, [existing list](../pet-812-000-p419.png). | Ordinary-model assembly `987 580 011 01` is distinguished from the separate Spyder listing `987 580 011 09`. This refinement follows the ordinary model. The later service catalogue does not prove the exact original suffix fitted to an individual 2010 car. |
| Same, PDF **418**, plate **812-000**, item **2**. | The upper belt-guide/retractor assembly is separate from item 1, with an attachment to the outer region of the rear frame. The orange guide loops identify this relationship; their shape, size and indicated belt tails are simplified. |
| Same, PDF **252**, plate **801-045**, items **1–5**, [existing drawing](../pet-801-045-p252.png); PDF **253**, [existing list](../pet-801-045-p253.png). | The windscreen/scuttle frame, A-pillar reinforcement and adjoining hinge-pillar pieces form distinct body components. Blue glass is separated from green reinforced metal in the side projection. The steel description comes from the period brochure, not from an inference about the PET line work. |
| Same, PDF **454**, plate **817-006**, item **1**, [existing drawing](../pet-817-006-p454.png); PDF **455**, [existing list](../pet-817-006-p455.png). | The standard/comfort backrest frame extends continuously through the head-restraint region. PR369/370 standard-seat and PR437/438 comfort-seat listings support the frame family; no optional bucket-seat outline is substituted for the baseline seat. |
| Porsche AG, *The Boxster*, **UK 01/10**, publication **WSLB1101000125**, printed **66–67**, PDF **31**. [Original brochure](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf#page=31); saved [body illustration](uk-01-10-p66-body-structure.jpg). | The period text identifies an internal steel windscreen reinforcement, high-strength steel rear bars behind the seats, a flattened bar form following the backrests, and upper belt anchorages on the bars. The factory body cutaway shows the joined rear structure and its relationship to the raked front frame. |
| Same, printed **74–75**, PDF **35**, [comfort-seat photo](uk-01-10-p74-comfort-seat.jpg). | Continuous head restraint, full backrest, shoulder/side-bolster transitions, cushion and moderate recline. The photographed seat is explicitly optional comfort equipment; it guides the shared backrest outline with PET, without importing its optional controls or adjustment equipment into the standard seat. |
| Same, printed **80**, PDF **38**, [open-roof side photo](uk-01-10-p80-open-roof-side.jpg); printed **81**, same PDF page, [wind-deflector photo](uk-01-10-p81-wind-deflector.jpg). | The head restraints, rear bars and windscreen have comparable above-body heights. Bars sit closely behind the backrests and have rounded, tapered profiles. The deflector photograph includes trim and optional mesh/glass: those parts are omitted from the explanatory drawing, and their external outlines are not described as the bare steel cross-section. |
| Same, printed **12–13**, PDF **5**, [existing side photograph](../../../01-the-2010-boxster-2-9-in-the-987-2-family/part-reference/family-layout-refinement/uk-01-10-pdf-p5-side-000.jpg). | Ordinary **Boxster S**, used only for the visible shared cabin proportions, rake and bar/backrest spacing. Its wheels, brakes and other S equipment are not imported into the 2.9 baseline. |

The two source PDFs were opened afresh through the web tool. The brochure screenshot service returned a cache miss; the existing original PDF was rendered locally at the exact pages above and inspected, alongside its original embedded JPEGs. PET drawings were inspected in the existing full-page renderings. Full PDFs remain in `/tmp`, not in this reference folder.

Source PDF SHA-256 values:

- UK 01/10 brochure: `69b7491a26a7ec3609a0ef92299f276f158b311207e8cad1596c8049ac4031ac`.
- PET 987209/P33: `c865de9263f5946db4c24874eb10e503be2343762b308695aa7bb6a943bfd2bf`.

## Saved compact excerpts and rights

All four JPEGs here are **unaltered embedded Porsche images**, extracted with Poppler `pdfimages -j`. They are references for a source-guided original SVG, not replacement photographs presented as original artwork.

| File | PDF page / object | Original dimensions |
| --- | --- | --- |
| `uk-01-10-p66-body-structure.jpg` | 31 / **124 0** | 544 × 382 |
| `uk-01-10-p74-comfort-seat.jpg` | 35 / **141 0** | 165 × 209 |
| `uk-01-10-p80-open-roof-side.jpg` | 38 / **159 0** | 346 × 153 |
| `uk-01-10-p81-wind-deflector.jpg` | 38 / **161 0** | 344 × 209 |

Creator/rightsholder: **Porsche AG**; individual photographers/illustrators uncredited. © Porsche AG. Retained for the user's personal reference book. The repository's MIT licence does not relicense these factory images. Existing PET images and the existing full-car photograph are linked rather than duplicated.

## What changed and what remains approximate

- Replaced the small separate headrest blocks with full reclining seat backs and continuous integral head restraints. The two seats sit in front of the rear frame and correctly obscure parts of it.
- Reduced the visual dominance of the rear hoops and used rounded tapered profiles, a shaped central connection and outer mounting webs/feet following PET. The transverse view exposes the lower frame under the omitted trim.
- Replaced the unrelated floating-body blocks with a cropped cabin/body-support context. A front-pointing arrow at the left of the side view makes the orientation explicit.
- Separated blue glazing, green reinforced metal, grey seats/body supports and orange upper belt guides. Numbered guide/web labels avoid long crossing leaders.

No measured structural dimensions, tube wall/cross-section, exact stamped-aperture or fastener count, hidden mounting coordinates, roof load, rollover envelope, deployment mechanism or crash performance is claimed. The two views use independent educational scales and approximate profiles. Body supports and lower mounting heights are illustrative. Colour does not reproduce the brochure's materials key.

## Local verification and integration handoff

- SVG XML parses successfully; all IDs are unique and accessible title/description references resolve.
- The viewBox is **600 × 1190**. Existing image use can scale it without a fixed raster size; labels stay within the authored 24-pixel margins by source inspection.
- `git diff --check` passed for the owned SVG. All reference links and original JPEG dimensions were checked locally.
- No Chrome process, full book build, shared code check or test suite was run by this delegated author. The parent owns serial SVG/reader renders at phone and desktop widths, including text bounds and clipping. Earlier chapter-wide verification statements describe the previous figure and are not a claim that this redraw has already passed integrated rendering.
