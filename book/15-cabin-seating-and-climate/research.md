# Cabin, seating and climate: evidence and limits

Research checked 10 November 2026. Reference: 2010 European/UK Boxster 987.2 2.9. The chapter explains support, adjustment and heat/air paths; belts, airbags, roof sealing and entertainment remain in their owning chapters.

## Primary documents inspected

1. Porsche, *The Boxster*, UK edition **01/10**, publication WSLB1101000125. [Original Porsche brochure, collector-hosted PDF](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf). Independently opened online; the existing `/tmp/boxster-ch05/brochure-2010.pdf` and text were read, relevant spread rendered and photographs extracted. The edition/UK baseline agrees with the colophon already recorded in the repository source library.
2. Porsche, *Boxster, Boxster S Owner's Manual*, **WKD 987 021 10, 5/09**. [Original Porsche-authored North American manual](https://billswebspace.com/Owners_Manual_Boxster_PCNA.pdf). Online PDF opened; the locally downloaded text in `/tmp/boxster-ch14/owner.txt` was inspected, including publication identifiers. Used for adjustment, control operation and mechanisms, not to transfer US standard equipment to the UK.
3. Porsche, *2009 Technik Introduction — All Boxster Cayman Models*, printed Heating and air conditioning **p.152 / viewer p.158**. [Actual seat-ventilation page](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=158). Independently opened through the source viewer's page link after direct page opens failed. Full page text inspected, not merely the index/search snippet. Direct shell download was denied by the remote host (HTTP403); no local training PDF is claimed.
4. Porsche, *PET 987209*, model life **2009–2012**, snapshot **19 July 2018**. [Original parts catalogue](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf). Independently opened online and relevant existing local text inspected. Used as later architecture evidence, not a guarantee of every original part revision or original equipment by registration year.
5. Porsche, *The Boxster Spyder*, UK edition **01/10**, WSLB1101000225 GB/UK. [Original brochure](https://porschecarshistory.com/wp-content/old/brochures2/93/2010%20987%20Boxster%20Spyder.pdf). Independently opened online and relevant local text inspected at `/tmp/suspension-spyder-uk.txt`.
6. Porsche, *Boxster S Black Edition Price List*, UK **03/2011**. [Original scanned price list](https://www.dropbox.com/scl/fi/gtavw6els2231u61qjomr/2011-987-Porsche-Boxster-Black-Edition-Price-List-UK.pdf?rlkey=7n0i52owbntdg7d17dfgyo7nw&dl=0). Direct web opening failed. Existing `/tmp/boxster-black-edition-uk-pricelist.pdf` has provenance in `model-year-research.md`; PDF **p.7**, printed **pp.12–13**, was visually inspected from the source render. Its text extraction is empty because it is scanned.

## Findings and exact references

| Claim | Evidence |
| --- | --- |
| Baseline seat | UK brochure printed p.74: Alcantara centres, manual height/fore-and-aft, electric backrest. Owner manual pp.32–33 corroborates mechanisms and integrated non-adjustable head restraints. |
| Sports seat | Brochure p.74: firmer leather upholstery, higher cushion/backrest bolsters; same manual height/fore-and-aft/electric backrest pattern. |
| Comfort seat | Brochure p.74: electric longitudinal, height, backrest, lumbar and cushion tilt; driver memory includes mirrors. Manual p.33 illustrates controls and lumbar support curvature. No unsupported motor count is given. |
| Adaptive sports | Brochure pp.74–75: comfort adjustments plus independent electrically adjusted cushion/backrest side bolsters. Memory excludes those side-bolster settings. “Adaptive” here does not mean automatic lateral-g detection. |
| Sports bucket | Brochure p.75: glass/carbon-fibre-reinforced backrest shell, high pivots, folding backrest, manual longitudinal movement. Manual pp.32–33 excludes bucket from normal height/recline setting steps. No arbitrary fixed angle is asserted. |
| Heating/ventilation | Brochure p.75: two heating settings on compatible seats excluding bucket; three ventilation settings. Training printed p.152 explains fans drawing air **inwards** through perforated centres, permeable mat and ducts, then exhausting into the cabin. No refrigerated seat or outward cold-air jet is invented. |
| Ventilation eligibility | Training p.152 specifies at least ~15°C measured by both seat and cabin sensors. Owner manual p.38 specifies engine running and cabin ambient threshold. Chapter combines these narrowly, without copying the detailed electrical duty cycle or promising cooling performance. |
| UK ventilation prerequisite | Brochure p.75 explicitly limits it to **standard or comfort seats**, with **heated seats, automatic climate control and part/full leather**. Printed p.111's shorter row mentions heating alone; the chapter records rather than silently loses the longer requirements. |
| Option codes | Brochure pp.110–111: P15 comfort, P77 sports, P01 adaptive sports, P03 bucket,342 heating,541 ventilation,573 climate,345 heated wheel. Printed p.73 excludes steering wheel heating with sports wheel gearshift paddles; requires heated seats. |
| Standard vs automatic A/C | UK brochure p.76: A/C standard on ordinary Boxster and S; optional climate uses temperature and solar sensors. Manual pp.106–107: standard panel has temperature bars. pp.109–111: AUTO/temperature target and automatic quantity/distribution, with overrides. Do not call the ordinary system dual-zone or assign 981 hardware. |
| Air intake/filter/delivery | Manual p.112 locates fresh inlet between luggage lid and windscreen and describes vent controls; p.211 describes combination filter and reduced airflow when dirty. pp.106–111 cover face/footwell/screen routing and recirculation. |
| Heating and refrigeration hardware | PET 813-000 heating supply/return (PDF pp.423–424), 813-005 heater core/evaporator/expansion valve (pp.429–431), 813-025 refrigerant circuit/two condensers (pp.438–440); brochure p.39 compressor belt drive. Original diagrams use general heat-transfer principles, not a to-scale hose map. |
| Drying/condensate/demisting | Manual pp.107,110–111: keep compressor available for drying in damp weather; stop recirculation and use screen demisting if glass fogs; cold-weather/engine-load compressor limitations; evaporator water below car can be normal. No guaranteed clearing time. |
| Spyder | UK Spyder brochure pp.10–11 and 32–35: standard sports buckets, no A/C in light specification. pp.38–39 table (PDF p.18): 573 automatic climate, P77 sports; 342 heating requires **sports seats + automatic climate**. No unsupported Spyder ventilation option is offered. |
| Black Edition | UK03/2011 price list printed pp.12–13: automatic climate with active-carbon filter; partial-leather seats, manual height/longitudinal and electric backrest. Does not imply full electric/memory seats. |

## Unknowns kept explicit

- No complete annual UK ordering-list sequence for ordinary 2011/2012 cars was recovered. The chapter does not invent annual seat/heater changes.
- The “externally controlled compressor” detail is present in the technical source index, but full compressor pages151–154 were unavailable during this run. The manuscript therefore explains the sourced belt-driven refrigeration loop without claiming a particular internal control map, compressor displacement or duty cycle.
- The schematic air route deliberately separates functions. It does not recreate blend-door geometry, flow percentages, every automatic interlock, outlet temperatures or moisture kinetics. An active evaporator **can** dry the air; it needs condensation conditions to do so.
- Build records and installed controls should be checked together; a retrim or perforated cover is not original ventilation evidence.

## Original diagrams and expected interaction

- `cabin-seat-support.svg`: load-bearing structure, cushion and runners; three adjustment directions; standard-seat adjustment split. Static original artwork.
- `cabin-heat-paths.svg`: separate coolant heater and refrigerant loops, with heat directions. Functional cycle only; condenser layout and hoses are not workshop routing. Static original artwork.
- Interactive ID **`cabin-air-route`**, with meaningful `poster.svg`: initial state **fresh**, **face**, heater **0** (bypass), A/C **on**. Native control IDs: `cabin-air-source`, `cabin-air-outlet`, `cabin-air-ac`, `cabin-air-heat`. Heat0/1/2 mean bypass/some/more; they are not calibrated percentages.
- Host data attributes: `data-air-source=fresh|recirculate`, `data-air-outlet=face|feet|screen`, `data-air-heat=0|1|2`, `data-air-ac=on|off`.
- **Demisting principle** sets fresh/screen/2/on. **Cooling principle** sets fresh/face/0/on. Other choices are retained independently. At recirculate/off, explanatory text explicitly says outside supply is interrupted and A/C drying unavailable.
- State lives in runtime-supplied `state`; remount restores all four controls. All listeners use the supplied abort signal; SVG resize observer is owned by shared helper. No timers, animation loop or external fetches.

## Local verification

- `node --check` passed for the chapter module. All three SVGs parsed as XML. Pandoc successfully converted the single manuscript to HTML.
- Bundled the real module and shared helpers into a local harness using the repository's esbuild. Chrome checked all 36 source/outlet/heater/A/C combinations at **760px and 390px** (72 states), native slider keyboard movement, both presets and abort/remount state restoration.
- Browser assertions found no JavaScript errors, SVG text beyond its viewBox or viewport horizontal overflow. Both screenshots were visually inspected: `/tmp/boxster-ch15/figures-760.png` and `figures-390.png`. Diagram text and controls remain legible; narrow rendering stacks the five air-path stages vertically.
- The initial restricted Chrome launch failed at the sandbox boundary; the same local check passed when authorised to run outside that sandbox. No test failure was attributed to the chapter.
- Original photograph extractions were visually checked against the full seat spread. A final source check corrected the Spyder option-table reference to printed pp.38–39/PDF p.18, and PET 813-000 to PDF pp.423–424.
- No full-book build, shared runtime edit, staging or git mutation was performed. Full-book integration belongs to the parent task.
