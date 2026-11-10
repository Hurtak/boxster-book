# Chapter 05 research: engine construction and valve gear

Checked 10 November 2026. Baseline: European/UK model-year 2010 Boxster 987.2 2.9. Porsche-authored publications are the technical authorities; a seller's own photographs document only the photographed donor. No workshop procedure or parts-interchange claim is inferred from the diagrams.

## Primary evidence and decisions

| Question | Evidence and chapter decision |
| --- | --- |
| Engine identity | Porsche *2009 Technik Introduction — All Boxster Cayman Models*, printed Engine p. 4 / [ManualsLib viewer p. 10](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=10), gives Boxster MA120, S MA121, Cayman MA120C and Cayman S MA121C. Preserve those distinct labels; do not assign undocumented special-model suffixes. |
| 2010 European output | Porsche *The Boxster*, 01/10 UK edition, printed pp. 126–127: 2,893 cm³; 188 kW / 255 hp DIN at 6,400 rpm; 290 Nm at 4,400–6,000 rpm; 11.5:1. [Original PDF](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf). Book expresses DIN metric horsepower as PS, without silently calling it bhp. |
| Bore/stroke | Technical introduction p. 4 gives 89 × 77.5 mm. Calculation 6 × π/4 × 89² × 77.5 / 1,000 = 2,892.83 cm³ agrees with 2,893. The [PCNA 2010 sheet, p. 1](https://newsroom.porsche.com/dam/jcr:e5abc517-c680-47c0-974f-b84aefde568f/2010-Boxster-Specifications.pdf) instead prints 88 mm: not adopted because it conflicts with the dedicated training document and capacity. The later [2012 sheet](https://newsroom.porsche.com/dam/jcr:f533d37f-82ef-4c9c-90cc-56b43185a8de/2012_Boxster_Specs.pdf) gives 89 mm for the base model. |
| Injection | The 2010/2012 PCNA sheets separate base sequential multipoint injection from S DFI. Porsche training printed Fuel/ignition p. 59 / [viewer p. 65](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=65) locates the 2.9 injectors in the intake-port flange area. No “all 987.2 engines are DFI” claim. |
| Crankcase | Training printed Engine p. 7 / [viewer p. 13](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=13): vertically split two-part Alusil crankcase, exposed silicon running surface, no cast-in iron sleeves. |
| Rotating components | Training printed Engine pp. 9–11 / [viewer p. 15](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=15), [p. 16](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=16), [p. 17](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=17): forged crankshaft with eight bearing locations, forged fracture-split rods, forged light-alloy pistons; base and DFI piston crown forms differ. |
| Heads | Training printed Engine p. 14 / [viewer p. 20](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=20): one-piece head without separate hydraulic-tappet guide housing; base/S valve sizes differ. PCNA 2010 sheet confirms four cams, four valves/cylinder and hydraulic clearance compensation. |
| No intermediate shaft | Training printed Engine p. 17 / [viewer p. 23](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=23) explicitly removes the former shaft and identifies two chains, guide/tension rails and two hydraulic oil-fed tensioners. January 2010 brochure printed p. 39 still mentions intermediate shafts in generic servicing text. Dedicated technical evidence takes precedence. No conclusion about elimination of all engine failures follows. |
| VarioCam Plus applicability | UK 01/10 brochure printed p. 36 expressly captions VarioCam Plus for both Boxster and Boxster S, describes stepless inlet timing and two-stage inlet lift. PCNA 2010/2012 tables agree. |
| Exact inlet lifts | Training “Camshafts”, printed Engine p. 16 / [viewer p. 22](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=22): **2.9 = 3.6/10.0 mm**, **3.4 = 3.6/10.5 mm**. The chapter's lift plot uses the 2.9 values. Equal curve durations are an explicitly labelled conceptual simplification. No measured opening-angle curve is reproduced. |
| Phase range | Training printed Engine p. 18 / [viewer p. 24](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=24): vane-type electro-hydraulic control; 40° **crank-angle** range; controller uses measured/desired angles and speed/load/temperature. This is not a 40° cam-angle claim. |
| 2010 options | 01/10 UK catalogue printed pp. 38, 42–47, 56–57, 107: sports exhaust, PDK, Sport Chrono. Ordinary engine's advertised output remains 188 kW. Catalogue does not present internal engine configurations as 2.9 options. This does not exhaust every special-order possibility. |
| Other 2.9 years | [UK launch brochure](https://porschecarshistory.com/wp-content/old/brochures5/26/2009%20987%20Boxster%20UK.pdf), 08/08, printed pp. 126–127, establishes the same headline engine specification at launch. PCNA 2012 sheet corroborates core mechanical specification later; no complete annual UK internal-change/part-number history recovered. |
| Related models | UK S tables and training give 3,436 cm³, 97 × 77.5 mm, 12.5:1, 228 kW/310 PS and 360 Nm. [UK Spyder brochure](https://porschecarshistory.com/wp-content/old/brochures2/93/2010%20987%20Boxster%20Spyder.pdf), printed pp. 24–27, 42–43, and [Porsche Netherlands Black Edition release, 2 February 2011](https://nieuws.porsche.nl/slechts-987-exemplaren-rijk-uitgeruste-boxster-s-black-edition/), support 235 kW/320 PS at 7,200 rpm and 370 Nm at 4,750 rpm. No complete parts commonality inferred. |

## Generic mechanics sources

- Porsche Newsroom, [The flat engine tradition](https://newsroom.porsche.com/en_US/technology/porsche-flat-engine-sports-car-tradition-design-principle-internal-combustion-engine-lightweight-power-dynamic-15767.html), 3 July 2018: opposed staggered cylinders, balance and low installation. Later pictured engines are not used as the 2010 reference.
- NASA Glenn, [Internal Combustion Engine Stages](https://www.grc.nasa.gov/WWW/K-12/airplane/engstage.html) and [Combustion Chamber](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/combustion-chamber/): basic four-stroke operation, gas pressure and piston. Their Wright engine is a mechanism teaching source, not Porsche fitment evidence.
- NASA Glenn, [Bore and Stroke](https://www.grc.nasa.gov/WWW/K-12/BGP/stroke.html) and [Engine Thermodynamic Analysis](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/engine-thermodynamic-analysis/): displacement and compression-volume definitions; cycle work and power. Chapter's torque/rpm conversion and numerical examples are calculations, not a measured output curve.

## Visual evidence and simplifications

Two local photographs, both visually inspected: Redline's 2009 Cayman 2.9 donor assembly and Porsche's period Boxster S 3.4 accessory-end photograph. See [image credits](images/credits.md) for originals, identification and copyright distinction. The first illustrates related 2.9 architecture; the second is explicitly a 3.4 comparison.

Original diagrams: `engine-layout.svg`, `timing-drive.svg`, `engine-four-stroke`, `engine-timing-lift`. Plan geometry and chain connections are schematic, not CAD or disassembly/routing instructions. Four-stroke valve events are idealised; the timing/lift curve is teaching geometry with documented peaks, not an ECU map. No autoplay. Native sliders, text explanations and persistent state are provided.

## Unresolved boundaries

- No full 2009–2012 UK revision/engine-number-breakpoint history or current Porsche parts supersession comparison was established.
- No special-model internal component inventory or engine-code suffix equivalence is claimed.
- Neither brochure illustrations nor similar architecture establish complete engine, cylinder-head, piston or controller interchangeability.
- No failure rate, preventive replacement schedule, timing-setting procedure or diagnostic conclusion is supplied.
