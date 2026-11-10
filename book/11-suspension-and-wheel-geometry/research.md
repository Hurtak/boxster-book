# Chapter 11 research record

Research refreshed 10 November 2026. Baseline: model-year 2010 Boxster 987.2 2.9-litre, European/UK standard specification. This is a source and uncertainty record, not a service procedure.

## Primary claims checked

| Claim | Evidence freshly consulted | Treatment |
| --- | --- | --- |
| Independent coil-over McPherson struts front and rear; aluminium moving parts | Porsche, *The Boxster*, 01/10 UK, printed pp. 50–51 and 126–127. [PDF](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf). Downloaded original PDF, extracted text and rendered chassis spread. | Main baseline; no double-wishbone claim. |
| Front strut suspension has trailing link and wishbone | Porsche, *2009 Technik Introduction*, printed p. 108, [viewer p. 114](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=114). | Explain lower wishbone plus fore/aft guide; no upper wishbone. |
| Rear McPherson axle retained with revised tuning | Same, printed p. 110, [viewer p. 116](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=116). | Springs/dampers/bars, rebound-stop springs and spring pads revised for facelift; not an invented 2010 running change. |
| Separate lower arms, guides, rear track rods; hub/bearing assemblies | Porsche, *Boxster 2009–2012 PET*, 2018 snapshot, illustrations 401-000 and 501-000, PDF pp. 129–130 and 181–182. [PET](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf). Downloaded and rendered both exploded drawings. | Validate terminology and component relationships. Do not infer original production identity or complete interchangeability from a 2018 replacement-parts catalogue. |
| Ordinary struts use double-tube gas-filled dampers and colour-coded springs | *Technik*, printed pp. 109–110, [viewer p. 115](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=115). | Identification paragraph. Avoid reproducing rate tables whose variants require careful mapping and may change during MY. |
| Optional PASM lowers ordinary Boxster/S by 10 mm; 475 offered for both | *The Boxster*, 01/10 UK, printed pp. 54–55 and 107. | Factory ride-height specification separate from mode choice. |
| PASM varies damping at each wheel within Normal/Sport ranges | Same, pp. 54–55; *Technik*, printed p. 111, [viewer p. 117](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=117). | No spring-rate change or on-demand ride-height change assigned to mode button. |
| Rear bars adapted with mechanical differential-lock option | *Technik*, printed p. 108. | Warn against inferring configuration from a single part or generic bar diameter. No annual dimensions table. |
| UK catalogue has no separate 20 mm sports chassis option for ordinary 2.9 or S | *The Boxster*, 01/10 UK, printed p. 107, complete engine/transmission/chassis option table. | Limit statement to this catalogue; do not borrow 981 X73 availability or treat PET's generic option-code vocabulary as market availability proof. |
| Later ordinary models retain broad architecture | PCNA [2011 specifications p. 2](https://newsroom.porsche.com/dam/jcr:6e750179-ddfd-40cb-a969-d1cc825d4717/2011_Boxster_Spyder_Specifications.pdf); [2012 specifications p. 1](https://newsroom.porsche.com/dam/jcr:f533d37f-82ef-4c9c-90cc-56b43185a8de/2012_Boxster_Specs.pdf). | Mechanical corroboration only; not UK annual option evidence. |
| Spyder fixed sports suspension with shorter/stiffer springs and firm bump/rebound; 20 mm lower than standard S at both axles | Porsche, *The Boxster Spyder*, UK 01/10, printed pp. 28–31. [PDF](https://porschecarshistory.com/wp-content/old/brochures2/93/2010%20987%20Boxster%20Spyder.pdf). Downloaded, extracted and visually checked p. 28–29 spread. | Comparison after ordinary 2.9 chronology. Fixed setup distinct from PASM. |
| Black Edition PASM remains extra-cost; 10 mm/Normal/Sport | Porsche, UK *Boxster S Black Edition Price List*, 03/2011, printed pp. 16–17, PDF p. 9. [PDF source](https://www.dropbox.com/scl/fi/gtavw6els2231u61qjomr/2011-987-Porsche-Boxster-Black-Edition-Price-List-UK.pdf?rlkey=7n0i52owbntdg7d17dfgyo7nw&dl=0). Local scan rendered and read. | Spyder-design wheels do not prove Spyder chassis. |

## General principles and illustrations

- Spring/damper operating principles: Monroe's [manufacturer explanation of spring control and energy conversion](https://www.monroeheavyduty.com/en-US/shocks-101/what-do-shock-absorbers-do/), freshly opened and read. Generic physics only; commercial-vehicle examples do not imply that Monroe supplied the Boxster. The indexed Australian technical guide returned 403 on opening and is not needed for the manuscript's citation.
- Alignment terminology: [Bridgestone](https://tires.bridgestone.com/en-us/learn/automotive/tire-maintenance/tire-alignment), freshly opened; [Hunter WinAlign operation manual](https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf), downloaded and text-checked at printed p. 78 and glossary pp. 312–313. No values transferred to the Boxster.
- `suspension-spring-damper`: independent snapshot inputs. Additional spring force = 20 N/mm × compression mm; damper reaction = −1,500 N·s/m × compression velocity m/s. Illustrative, linear, no actual factory calibration; no pretence of a dynamic trajectory.
- `suspension-anti-roll`: signed wheel-travel difference, absolute value shown as twist input in mm. Symmetric equal travel gives zero additional twist in an ideal geometry. It is not torsion angle, torque or a suspension solver.
- Static diagrams separate force paths and viewing directions. All angles and proportions are illustrative.
- Image search was used to locate period Spyder photographs, then original Porsche brochure images were selected instead. Four JPEGs retained, including two actual road photographs and two factory technical assembly images. Captions qualify S-versus-base and give source/creator. See [credits](images/credits.md).

## Deliberate evidence limits

- No complete annual UK price-list sequence for MY2009–2012, no annual alignment targets, and no claims of unchanged every-year tuning, suppliers, software or exact parts.
- No blanket interchangeability, conversion recommendation, unsupported torque figures, alignment procedure or service interval.
- Training overview itself cautions that chassis data may change during a model year and current Porsche technical information takes precedence. Spring-colour identification needs the matching vehicle and equipment context.
- A current car can differ from its build record. Photographs, tyre-to-arch gap, a console button, spring paint or wheel style cannot alone establish the complete present suspension specification.

## Local verification

- Both chapter JavaScript modules passed `node --check`.
- Direct assertions verified spring-position/velocity independence, the reversal of damper force for rebound, equal-travel zero bar input and opposite-travel signed 60 mm input.
- All four original SVG files parse as XML; all six manuscript image references resolve; all 11 chapter-prefixed footnotes have definitions.
- Parent agent rendered the actual interactive modules at 390 and 768 px with no errors or overflow. The chapter uses shared 44 px native controls, retained state, abort-bound listeners and host-owned SVG surfaces.
- Whole-book builds and integration tests remain owned by the parent agent to avoid concurrent output writes.
