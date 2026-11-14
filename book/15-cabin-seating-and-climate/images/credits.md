# Chapter 15 image credits

Third-party photographs are retained locally for the user's personal illustrated book. Copyright remains with the original rightsholder; the repository's MIT licence does not relicense them. No individual photographer is identified in the brochure, so none is invented here.

## `porsche-optioned-cabin.jpg`

- **Credit/rightsholder:** Porsche AG.
- **Source:** Porsche, *The Boxster*, UK edition 01/10, printed **pp.70–71**, PDF **p.33**. [Exact source PDF](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf#page=33).
- **Source identification:** Caption identifies a Boxster interior with **comfort seats with driver memory and other optional equipment**. This is not asserted to show standard 2.9 upholstery or the options of an individual owner's car. Visible tan/leather appearance cannot establish hidden equipment.
- **Local treatment:** Embedded JPEG extracted with Poppler `pdfimages -f 33 -l 33 -j`, local extraction image 000, **1104×408**. No compositing, added equipment or alteration. Visually inspected 10 November 2026.

## `porsche-sports-bucket-seat.jpg`

- **Credit/rightsholder:** Porsche AG.
- **Source:** Same UK 01/10 brochure, printed **pp.74–75**, PDF **p.35**. [Exact source PDF](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf#page=35).
- **Source identification:** Original caption **Sports bucket seat**; one of three separate seat photographs on that spread. The brochure describes optional ordinary-model equipment. It is used as a construction comparison, not to establish a car's original seat specification.
- **Local treatment:** Embedded JPEG extracted with Poppler `pdfimages -f 35 -l 35 -j`, local extraction image 001, **165×209**, displayed at a modest 180px width. No upscaling/compositing or labels added. Extraction order was checked against the complete rendered spread; image 002 is the adaptive sports seat, not this bucket. Visually inspected 10 November 2026.

The three standalone explanatory SVGs, D3 airflow diagram and 3D cabin model are original schematic artwork created for this chapter. They are not Porsche factory engineering drawings.

## Coverage additions — 10 November 2026

`dashboard-controls.svg`: original functional map of instrument and control groups, not an exact LHD/RHD dashboard drawing.

`porsche-dashboard-s.png`: Porsche AG, *The Boxster*, UK01/10, printed72–73/PDF34, extracted embedded image0 with Poppler as PNG. Source caption explicitly identifies Boxster S interior with optional PDK multifunction wheel and personalisation; aluminium-coloured dials, PCM and automatic climate are visible. No retouching, overlay or substitution. Rights remain with Porsche AG; visible photo credit/source is beside the photograph.


## Factory parts reference excerpts — 10 November 2026

The **67 full-page PNGs** in [part-reference](../part-reference/README.md) are Porsche AG factory catalogue excerpts, **PET987209 / P33,19 July2018**, covering29 drawing plates with selected application tables. Each is an unaltered Poppler rendering at1800px maximum dimension, retaining catalogue headers, numbered callouts, date and page identity. Exact original PDF pages, plate IDs, relevant items, source URL/hash and application limits are listed beside the files. These factory pages remain Porsche copyright and are distinct from the original schematic SVG/model artwork.

The original **cabin-heat-paths.svg** now includes the factory-listed receiver-drier on the high-pressure liquid side. It remains a functional explanatory drawing, not a traced factory hose map. The **cabin-explorer** model gains a local refrigerant-pipe/drier group and clearer seat/inlet support detail; its shapes, pipe routes, fin/spring counts, colours and separation offsets remain illustrative. Its generated fallback is regenerated centrally by the parent integration task.

## Component illustrations in the manuscript — 12 November 2026

Porsche AG, **PET 987209**, model life **2009–2012**, catalogue P33, snapshot **19 July 2018**; [Porsche-authored catalogue, independent archive](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf). Source PDF SHA-256: `c865de9263f5946db4c24874eb10e503be2343762b308695aa7bb6a943bfd2bf`. These are later service-catalogue illustrations, not a dated 2010 UK order guide. © Porsche AG; the repository’s MIT licence does not relicense them.

The original embedded monochrome bitmaps were extracted with Poppler `pdfimages`, keeping native resolution. Page furniture and, where recorded below, the boxed vehicle-locator inset were omitted. White margins were trimmed and a 20-pixel white border added. No numbered component was redrawn, reshaped or generatively altered. Crop coordinates refer to the native bitmap before border padding. Original full-page references remain unchanged.

### `pet-climate-unit.png`

- **Source:** PET **813-005**, [PDF p. 429](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf#page=429); [archived full page](../part-reference/pet-813-005-p429.png).
- **Extraction:** PDF image object **1563 0**, native **2034 × 3136**; crop `[67, 567, 1993, 2960]`. Locator inset omitted at `[0, 2, 672, 513]`. Result **1966 × 2433** pixels.
- **Applicability and limits:** 813-005 distinguishes LHD/RHD, manual PR572, automatic PR573 and other climate applications. Item 1 is supplied with evaporator but without heater core 2. Different motors/controls on the shared plate must not all be assigned to a standard UK car.
- **Local image SHA-256:** `ee40adf72e855b60b5152cd043e3ce32cac181a3d1ca7665e2d2c647d750f42e`.

### `pet-seat-frame.png`

- **Source:** PET **817-008**, [PDF p. 457](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf#page=457); [archived full page](../part-reference/pet-817-008-p457.png).
- **Extraction:** PDF image object **1667 0**, native **2038 × 2665**; crop `[10, 597, 1986, 2458]`. Locator inset omitted at `[0, 0, 669, 507]`. Result **2016 × 1901** pixels.
- **Applicability and limits:** 817-008 contains manual and electric frames, handed variants, optional ventilation and ISOFIX-related bracket 7/fasteners 8. Alternative trims/switches are not all baseline equipment; the illustration is not a complete backrest or airbag assembly.
- **Local image SHA-256:** `30f5259d752d9e9745887c18416d18d4a343fd49caf497bc42ebc0a367297e45`.


## Visual review additions — 13 November 2026

`dashboard-controls.svg`, `seat-ventilation-section.svg`

Original baseline equipment locator and conceptual ventilation section. UK01/10 pp74–77 and the handbook establish baseline black instruments/manualAC bars versus optional AUTO/target control. LHD locator, not an actual dashboard photograph; UK driving controls mirrored. Training Heating/AC p152 establishes fans drawing air inward through perforations/permeable layers and exhausting to cabin. Ducts are unfolded, no refrigerant in cushion. Removed redundant S-dashboard image and its stale “pictured below” wording.

Factory material retains Porsche’s original rights; SVG composition/labels and teaching drawings are original project work. No generative alteration of documentary photographs.


## Seat ventilation refinement — 14 November 2026

`seat-ventilation-section.svg` and `seat-ventilation-layers.svg` are original project drawings. The seat follows the period standard/comfort silhouette: integrated head restraint, taller reclined backrest and shaped cushion. PET817-002/004 distinguishes perforated covering, ventilation inserts, air guides and separate cushion/backrest blowers. The existing Porsche training source supplies inward extraction through the contact face and discharge into the cabin.

The inlet-face blower follows unchanged photographs of current **99762433501** and **99762433701** modules from Sierra Madre Collection, with an annular impeller inlet around the motor, foam seal and metal mounting tabs. PET's00-suffix entries are not silently treated as identical original2010 parts. Exact mounting angles, outlet clocking, blade count, foam layers and passages remain schematic. Numbers are React overlays and the original reference images are not composited.

[Local reference dossier](../part-reference/seat-ventilation-refinement/README.md) records original photograph URLs, publication locators and hashes. Porsche material remains © Porsche AG; commercial photographs retain their rightsholders' rights and are excluded from MIT. No permission to republish asserted.


## Dashboard and climate controls — 14 November 2026

The old `dashboard-controls.svg` block diagram has been removed. Original images are displayed using `AnnotatedFigure` / `ImageComparison`, with separate native labels and CSS viewports.

- `dashboard-rhd-original.jpg`: **Cameron Sports Cars** original1280×853JPEG, [listing U1674](https://www.cameronsportscars.com/vehicle-details/used-porsche-boxster-987-2-9-gen-2-manual-for-sale-in-chippenham-south-gloucestershire-u1674/), [original image](https://img.cdn.dragon2000.net/C1353/U1674/IMG_32624-large.jpg). The photograph depicts a RHD2.9 with optional equipment; its watermark, pixels and full frame are retained. Dealer dates describe the advertised car and do not prove every original MY/option claim.
- `manual-ac-handbook-original.jpg`: Porsche AG,2010 Boxster handbook WKD98702110,5/09, printed106/PDF108, original JPEG object **422 0**,715×345.
- `automatic-climate-handbook-original.jpg`: same publication, printed109/PDF111, original JPEG object **434 0**,710×345. [Original handbook](https://billswebspace.com/Owners_Manual_Boxster_PCNA.pdf).

The factory magnifier/letter labels are part of Porsche's source artwork. No retouching, newly baked circles or simulated active LCD has been added. React crops show the enlarged panels at their original proportions; source bytes remain intact. North American handbook controls are distinct from UK option-availability evidence. All third-party images retain their rightsholders' rights and are excluded from MIT. Full locators, hashes and limits: [reference dossier](../part-reference/dashboard-refinement/README.md).
