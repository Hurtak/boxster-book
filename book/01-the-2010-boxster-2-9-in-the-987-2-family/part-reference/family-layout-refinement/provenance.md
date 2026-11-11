# Family-layout refinement references

Checked 11 November 2026. These references support the revised original `../../images/family-layout.svg`; the reference remains the **2010 European/UK Boxster 987.2 2.9, six-speed manual**. The figure is a photo-guided explanatory cutaway, not factory CAD.

## Contemporary Porsche brochure

Porsche, *The Boxster*, **UK 01/10**, publication **WSLB1101000125**, © Porsche AG 2010. [Original Porsche publication, independently hosted by Mr Sportscars](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf). The URL was opened independently with the web tool. Source spreads were rendered from the existing local original and inspected with `view_image`. Original PDF SHA-256: `69b7491a26a7ec3609a0ef92299f276f158b311207e8cad1596c8049ac4031ac`.

| Saved reference | Source and preparation | What it supports |
| --- | --- | --- |
| [Factory side photograph](uk-01-10-pdf-p5-side-000.jpg) | PDF p.5, photograph object **13 0**, **2365 × 810**. Extracted with `pdfimages -f 5 -l 5 -j`, without crop, resampling, retouching or mirroring. The drawing faces the opposite way. | Low nose, front-wing/bonnet relationship, windscreen rake, open cockpit, integrated seat head restraint, rear hoop, door contour, side intake, rear haunch and deck. This red photograph depicts the **S**: it supplies shared visible body/cabin form, not the 2.9 engine, standard wheel size, hidden equipment, or measured installation coordinates. |
| [Technical-data spread](uk-01-10-pdf-p59-technical.png) | Printed pp.126–127 / PDF p.59. Uncropped full-page Poppler render at 1800 pixels on the long edge. | Ordinary 2.9: **4342 mm length**, **2415 mm wheelbase**, **1292 mm roof-erected height**; **7J × 17 / 205/55 ZR17 front**, **8.5J × 17 / 235/50 ZR17 rear**; two luggage volumes **150/130 litres**, manual standard and PDK optional. The figure depicts an open roof, so its screen/seat height is photo-guided, not a claim that the screen equals the roof-erected height. |
| [Luggage spread](uk-01-10-pdf-p37-luggage.png) | Printed pp.78–79 / PDF p.37. Uncropped full-page Poppler render at 1800 pixels on the long edge. | Real front well and shallower rear compartment, their separate lids and their longitudinal relation to the open cabin. The red illustrated car has S-style wheels; no 2.9 standard-wheel claim comes from this image. Compartment silhouettes are explanatory projections, not traced section measurements. |

The existing [ordinary green 2.9 front photo](../../images/boxster-2-9-front.jpg) was also viewed: it confirms the reference-car nose, lamps, side intake and cabin form. Its source/object and rights are recorded in [the chapter credits](../../images/credits.md); it was not duplicated.

### Coherent dimensional anchors

- Main body runs from `x=28` to `x=572`: **544 SVG units for 4342 mm**, or `0.125287886` units/mm.
- Axles at `x=165` and `x=467.57`: **302.57 units**. Ratio `302.57/544 = 0.556195`, matching `2415/4342 = 0.556195` within rounding. The earlier figure used 358 units within a 550-unit body, overstating the wheelbase fraction.
- Nominal tyre diameters calculated from the documented fitments are `17 × 25.4 + 2 × 205 × .55 = 657.3 mm` front and `17 × 25.4 + 2 × 235 × .50 = 666.8 mm` rear. The drawing uses radii **41.18 / 41.77** units and a **27.05-unit** rim radius at the same scale. These are nominal geometric diameters, not loaded rolling radii. The spoke/lip design is simplified.
- **Separate front and rear overhang dimensions have not been established.** Their allocation, screen angle, panel curvature, seat/hoop envelopes and component positions are photo-guided approximations. Perspective in the photograph prevents literal tracing from yielding orthographic factory coordinates. No independent front/rear overhang number is claimed.

## Factory assembly evidence, reused without duplication

Porsche **PET 987209, 2009–2012, P33, 19 July 2018**. [Porsche-authored catalogue, independently hosted](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf), independently reopened online. Existing local full-page drawings were viewed directly:

- [302-000 / PDF p.113](../pet-302-000-p113.png), item 1: flared engine joint/bellhousing, side output region and ribbed case tapering aft. The figure replaces a rectangle with these recognisable external features. [Application list p.114](../pet-302-000-p114.png) and [transmission key p.7](../pet-transmission-numbers-p7.png) keep the reference manual **G8710** distinct from the S and optional PDK.
- [501-005 / PDF p.187](../pet-501-005-p187.png), shaft item 1 and hub item 7: supports the functional two-output/two-rear-wheel path. Exploded spacing is not installed shaft length.
- [807-001 / PDF p.295](../pet-807-001-p295.png), liner item 1 and service-cover/frame items 18/19/22: supports a real rear luggage enclosure; the small filling access is not a full engine lid. It is deliberately not added as a large cutaway hole.
- Chapter 5's existing [crankcase 101-005 / p.35](../../../05-engine-construction-and-valve-gear/part-reference/pet-101-005-p035.png), [head/cover 103-000 / p.44](../../../05-engine-construction-and-valve-gear/part-reference/pet-103-000-p044.png), [accessory drive 101-010 / p.37](../../../05-engine-construction-and-valve-gear/part-reference/pet-101-010-p037.png) and [intake 107-010 / p.92](../../../05-engine-construction-and-valve-gear/part-reference/pet-107-010-p092.png) were viewed for the low side bank, three-runner intake and accessory-face cues. Their assembly/application records remain in that chapter. No DFI pump or injection feature from the S is drawn.

The [Porsche 2010 technical sheet](https://newsroom.porsche.com/dam/jcr:e5abc517-c680-47c0-974f-b84aefde568f/2010-Boxster-Specifications.pdf), independently opened online, corroborates the mid-mounted flat-six, common engine/transmission drive unit and rear-wheel drive. Its disputed overall-length entry is **not** used. The engine is drawn immediately behind the seats and ahead of the rear axle, with the manual transaxle aft and below the rear luggage space, consistent with the chapter's existing contemporary-source record.

## Scope, rights and checks

All saved reference photographs/pages remain Porsche-copyrighted material for the private source audit; they are not original MIT-licensed artwork and no new reuse permission is claimed. No full brochure/PET PDF is duplicated here. The final illustration remains original vector artwork with explicit transparency and simplified internals.

The body and rear wheel are transparent so the low engine and the gearbox/output region can be read in one longitudinal view. The seat/hoop drawing is one side projection of two side-by-side occupants/hoops, not a tandem seating arrangement. The torque chart below is a **connection diagram**, with no installation scale or operating-motion claim.

XML parsing, unique IDs/local-reference resolution and the dimensional arithmetic were checked locally. Browser rendering, phone-size label bounds and the integrated book checks belong to the parent integration pass. No shared build, generated poster, MDX, research baseline, credit file, staging or commit was changed by this diagram pass.
