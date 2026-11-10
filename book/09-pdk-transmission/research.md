# Chapter 09 research: PDK transmission

Checked **10 November 2026**. Reference car is the **2010 European/UK 987.2 Boxster 2.9**, with standard six-speed manual and optional seven-speed PDK. The manuscript contains approximately **2,030 words before footnote definitions**, including headings, captions and table cells. Research, illustrations and changes are restricted to this chapter folder.

## Primary publications inspected

1. Porsche AG, [*The Boxster*, UK 01/10](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf), **WSLB1101000125 GB/UK**. Independently opened through the web tool. The local previously downloaded original `/tmp/boxster-ch05/brochure-2010.pdf` and extracted text were inspected; relevant PDF spreads were rendered with Poppler, and two embedded images extracted and viewed. Archive filename is not the publication's date/market authority.
2. Porsche AfterSales Training, *2009 Technik Introduction — All Boxster/Cayman Models*, **PNA 987 021 09, edition 2/09**. [ManualsLib page index](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html) identifies the complete document. Individual page fetches returned cache errors/403, so the complete publisher-authored training text was independently read at this [Scribd archive](https://www.scribd.com/document/972719474/Boxster-2009), including its cover, copyright, contents and relevant full sections. The archive's AI-generated title/summary is not used. Its original notice says Porsche AG English content was edited by Porsche Cars North America; UK equipment claims therefore use the UK brochure. Printed numbers are six below ManualsLib viewer numbers.
3. Porsche AG, [*Boxster, Boxster S Owner's Manual*](https://billswebspace.com/Owners_Manual_Boxster_PCNA.pdf), **WKD 987 021 10, 5/09**, original North American manual. Independently opened; relevant full text in `/tmp/boxster-ch14/owner.txt` read for actual PDK controls/protection, not UK fitment.
4. Porsche AG, [*The Boxster Spyder*, UK 01/10](https://porschecarshistory.com/wp-content/old/brochures2/93/2010%20987%20Boxster%20Spyder.pdf). Independently opened; local original `/tmp/suspension-spyder-uk.pdf` text-extracted for the PDK, Chrono and performance table. Printed pp. 30–31 (PDF p. 14) and p. 41 (PDF p. 19).
5. Porsche AG, [*Boxster S Black Edition Price List*, UK 03/2011](https://www.dropbox.com/scl/fi/gtavw6els2231u61qjomr/2011-987-Porsche-Boxster-Black-Edition-Price-List-UK.pdf?rlkey=7n0i52owbntdg7d17dfgyo7nw&dl=0). The direct web endpoint failed. Independently rendered and visually read the original local scanned PDF at `/tmp/boxster-black-edition-uk-pricelist.pdf`, PDF pp. 7 and 9, printed pp. 12–13 and 16–17. Text extraction is empty because the source is scanned; no claims inferred from an empty extraction.
6. Porsche Netherlands, [facelift announcement, 19 November 2008](https://nieuws.porsche.nl/de-nieuwe-porsche-boxster-en-cayman-krachtiger-en-zuiniger/), independently opened: standard six-speed manual; optional PDK replaces Tiptronic S. Its early consumption figures differ from January 2010 catalogue; not used for baseline consumption or annual update claims.
7. Porsche Cars North America, [*2012 Boxster Technical Specifications*, p. 1](https://newsroom.porsche.com/dam/jcr:f533d37f-82ef-4c9c-90cc-56b43185a8de/2012_Boxster_Specs.pdf), independently opened: seven-speed PDK continuity and forward ratios. US equipment is not imported into UK catalogue claims.
8. Bosch Mobility, [*Components for automatic transmissions*](https://www.bosch-mobility.com/en/solutions/transmission-technology/automatic-transmissions/), “Operating principle” and component descriptions, independently opened. Generic corroboration for DCT preselection, electronic/hydraulic control and sensing. Current Bosch parts, pressures and newer transmission functions are not assigned to the 987.2.

## Claim and page evidence

| Subject | Exact primary evidence and handling |
| --- | --- |
| Optional seven-speed; sixth maximum speed, seventh long | UK 01/10, printed pp. **42–43**, PDF p. **19**; standard/optional table printed **126**. The manuscript does not infer maximum speed from the number of ratios. |
| Concentric inputs; clutch/gear assignment | Training printed **68**, **80–82**, **89–91**, corresponding viewer **74**, **86–88**, **95–97**. K1 is the outer clutch, inner input shaft 1, odd gears plus reverse; K2 inner clutch, hollow outer shaft 2, even gears. Inner/outer terminology distinguishes pack from shaft. |
| Dual-mass flywheel; wet multi-disc packs | Training printed **90–92**, viewer **96–98**. Packs radially nested, hydraulic actuation, cooling flow; open when inactive/depressurised. No invented disc count or exact pressure schedule. |
| Gear selection and synchronisation | Training printed **80–87**, viewer **86–93**; meshing gears, sleeves, synchronisers, hydraulically moved shift rods and interlocking. Main text explains function without duplicating manual-chapter detailed synchroniser tutorial. |
| Handover | UK 01/10 printed **44–45**, PDF **20**, explicitly calls it an overlap shift. Training **72–74** describes engine-torque treatment differing with mode. Original diagram does not assert constant wheel torque or fixed clutch torque percentages. |
| Selector P/R/N/D/M | Owner's Manual printed **174–179**, PDF **176–181**. Printed **176** gives P/R/N/D, **178–179** M, limits and kickdown; **177** states seventh not selected in SPORT PLUS. Training printed **88** specifically explains mechanical parking catch acting on pinion shaft. |
| Original switches, optional paddles | UK 01/10 printed **46–47**, PDF **21**; switch can up/down with either hand; right paddle up/left down. Selector forwards up/back down. Printed **113**, PDF **52**, paddle wheel code **840**. No exact first delivery date established. |
| Hydraulic block and distinct ECU | Training printed **93–95** hydraulic block in sump, valves and actuators; **97–101** speed/position/pressure/temperature sensing; **102** ECU in rear-right luggage compartment, CAN and driver/vehicle inputs. Avoid generic integrated-mechatronic-ECU assertion. |
| Separate fluids and cooling | Training printed **66**, **91–92**, **96**. Hydraulic fluid actuates/cools clutch packs and operates selectors; separate gear oil lubricates gearing/final drive. Oil/water heat exchanger outside gearbox serves clutch/hydraulic fluid. Gear-wheel oil sufficiently cooled by housing. No service capacities, modern fluid substitution, current interval or workshop fill procedure is supplied. |
| Sport Chrono | UK 01/10 printed **56–57**, PDF **26**; options **639 / 640**, Plus only with PCM at printed **107**, PDF **49**. PDK-dependent SPORT PLUS/Launch Control/shift strategy. No claim that Chrono increases rated peak power or includes PASM. |
| 2.9 0–100 km/h figures | UK 01/10 printed **126–127**, PDF **59**: manual **5.9 s**, PDK **5.8 s**, SPORT PLUS with Chrono/Plus **5.6 s**, qualification in footnote 2. Owner's Manual printed **177** supplies Launch Control context and component-life warning. No launch procedure reproduced. |
| Rounded sixth/seventh ratios | Training printed **65** and 2012 sheet p. **1**: **0.88 / 0.62**; shared forward ratios base/S. Calculation **3000 × 0.62 / 0.88 = 2113.6 rpm**, rounded **2110 rpm**, relative speed **70.45%**. No road speed, tyre circumference or final-drive assumption required. |
| Spyder | UK Spyder printed **30–31** (PDF **14**) and **41** (PDF **19**): optional PDK, Chrono; **5.0 s**, qualified **4.8 s** with SPORT PLUS. Variant comparison, not baseline figures. |
| Black Edition | UK 03/2011 price list printed **13**: standard SportDesign wheel, paddles with optional PDK. Printed **16–17**: PDK **250** and Chrono Plus **640** optional; Chrono has PDK-dependent SPORT PLUS content. PDF pp. **7 / 9** visually checked. |

## Uncertainties and editorial decisions

- A full annual UK ordinary-model price-list sequence and running PDK hardware/software history were not recovered. Basic seven-speed architecture/ratios continue; no claim of identical parts or calibrations throughout production.
- The technical introduction's hydraulic-control overview includes a broad parking-lock-control bullet, while its dedicated parking-lock section explicitly describes mechanical selector/catch operation. The manuscript follows the detailed printed **p. 88** mechanism and does not draw a hydraulic parking-lock actuator.
- Training transmission tables contain downstream gearing labels/numbers that do not justify a simple universal final-drive value. The text uses the unambiguous sixth/seventh comparison only, avoiding a wheel-speed calculation and keeping differential detail in chapter 10.
- No timing, pressure, slip-speed, torque-split or shift-map calibration is reverse-engineered. The sequence below is explanatory. The controller's actual next preselection can change with demand.
- The period PDK wheel photograph depicts a personalised catalogue cabin. It is not evidence of a particular car's factory options. Source resolutions and original rights are retained; see [image credits](images/credits.md).

## Original diagrams and interaction contract

**`pdk-power-path`** explains the shift sequence. It uses D3 via the shared SVG helper, panel and native labelled stage slider, plus a native labelled gear-change select. All events use the lifecycle AbortSignal, resize observation is shared, state is persisted in the supplied object, and there is no timer or automatic motion. Stage height is 620 px so 20–23 px labels remain full size on a phone. The poster matches the initial **1→2 / Ready** state.

`state.shift`: **0** = 1→2, **1** = 2→3, **2** = 3→4, **3** = 4→3. Changing the gear-change select resets phase to 0. `state.phase`: **0 Ready**, **1 Transfer**, **2 New gear**, **3 Prepare next**. Test-visible datasets are `pdkShift`, `pdkPhase`, `pdkK1`, `pdkK2`, `pdkOddGear`, `pdkEvenGear`, `pdkDriving` on the mounted host.

| Shift | Phase | K1 / selected odd gear | K2 / selected even gear | Drive |
| --- | --- | --- | --- | --- |
| 1→2 | 0 | closed / 1 | open / 2 | 1 |
| 1→2 | 1 | releasing / 1 | applying / 2 | transfer |
| 1→2 | 2 | open / 1 | closed / 2 | 2 |
| 1→2 | 3 | open / 3 | closed / 2 | 2 |
| 2→3 | 0 | open / 3 | closed / 2 | 2 |
| 2→3 | 1 | applying / 3 | releasing / 2 | transfer |
| 2→3 | 2 | closed / 3 | open / 2 | 3 |
| 2→3 | 3 | closed / 3 | open / 4 | 3 |
| 3→4 | 0 | closed / 3 | open / 4 | 3 |
| 3→4 | 1 | releasing / 3 | applying / 4 | transfer |
| 3→4 | 2 | open / 3 | closed / 4 | 4 |
| 3→4 | 3 | open / 5 | closed / 4 | 4 |
| 4→3 | 0 | open / 3 | closed / 4 | 4 |
| 4→3 | 1 | applying / 3 | releasing / 4 | transfer |
| 4→3 | 2 | closed / 3 | open / 4 | 3 |
| 4→3 | 3 | closed / 3 | open / 2 | 3 |

The passive path's selected gear changes only with its clutch open. Both paths remain mechanically selected during handover, and both clutches are never labelled closed simultaneously. Transfer colours show activity rather than numeric torque shares. `images/pdk-concentric-inputs.svg` and `images/pdk-oil-control.svg` are static originals in the chapter's `images/` folder, with explicit accessible descriptions and sans-serif fonts.

## Scoped verification

- Module passed `node --check` and the repository `scripts/build-diagrams.mjs` bundled the chapter into `/tmp/boxster-ch09/bundle`.
- Pandoc converted the manuscript; all **17** footnote references match definitions, all referenced local images exist, and all **four SVGs** parse as XML.
- An isolated headless Chrome harness checked all **16 logical states** and **32 rendered states** across **760 px / 390 px** viewports, keyboard ArrowRight operation, labelled select behaviour/reset, persistent state after abort/remount, no horizontal page overflow and no out-of-bounds SVG text. No page errors occurred.
- Screenshots `/tmp/boxster-ch09/figures-390.png` and `/tmp/boxster-ch09/figures-760.png` were visually inspected, alongside both extracted JPEGs and source spreads. A shaft-label line crossing was corrected with a white text halo in both dynamic diagram and poster, then checks repeated.
- Parent owns the full book build and cross-chapter browser integration. No shared files, staging or other chapters were changed.

## Car-to-component 3D explorer

`diagrams/pdk-explorer/` adds a spatial companion to the shift-sequence diagram. Its eight selectable groups are the dual-mass flywheel, outer K1 pack with inner shaft, inner K2 pack with hollow outer shaft, sample gears/selectors, final drive/outputs, sump-area hydraulic block, separate electronic controller and external oil-to-coolant exchanger. Eleven functional links distinguish drive, hydraulic operation/cooling and electrical commands/feedback.

The January 2010 UK brochure, printed pp. 42–45 and 126, establishes **optional** PDK on the 2.9. The chapter's local factory cutaway was inspected for the broad clutch-end, gear-train and differential relationships. Freshly read Porsche-authored training text at the [Scribd mirror](https://www.scribd.com/document/972719474/Boxster-2009) confirms outer K1/inner K2 and odd/reverse versus even paths on printed p. 68, separate oil volumes on p. 66, the external hydraulic/clutch-fluid cooler on p. 96 and the controller in the rear-right luggage-compartment area on p. 102. Direct ManualsLib page 96/108 fetches failed; no claim depends on their availability.

The rings deliberately omit a sector so the nested packs and concentric inputs can be inspected. Their visible plate counts, sample gears, solenoids, tooth forms, clearances and separation offsets are illustrative. The gear train does not reconstruct all seven ratios or the actual output-shaft topology. The two oil functions stay distinct; coloured cooler ports identify separate fluid sides without establishing factory hose routing. Controller coordinates indicate the documented rear-right region, not a bracket location. None of these offsets is clutch travel or a workshop disassembly sequence.

Node validation checked all eight part metadata records, all eleven connection endpoints, finite vertex/normal values and explosion offsets, nonempty geometry and a sensible installed envelope. The assembly contains 244 meshes / 44,192 vertices within approximately X ±0.691 m, Y 0.215–0.688 m, Z −1.875 to −1.045 m. Descriptions are 187–223 characters and the figure note is 206 characters. Shared-renderer, generated-poster, browser, phone, printing and full-book checks belong to the parent integration.


## Text and source correctness audit — 10 November 2026

Re-read the complete chapter, image credits, all accessible SVG text, the four-stage D3 logic and every 3D part/connection description independently of the previous layout checks. Fresh web reads of Porsche's training text and catalogue originals were checked against local PDF extraction; the ordinary PDK and wheel spreads, Spyder technical table and scanned Black Edition equipment/option pages were also rendered and visually inspected.

- Corrected the Spyder acceleration citation from printed pp. 42–43 / PDF p. 21 to **printed p. 41 / PDF p. 19**. Its 5.0-second PDK and qualified 4.8-second SPORT PLUS figures remain correct. PDK/Chrono descriptions are printed pp. 30–31 / PDF p. 14. The colophon identifies UK 01/10, **WSLB1101000225 GB/UK**, at PDF p. 23.
- Removed **“solid”** from the explorer's inner-shaft description: Porsche documents inner shaft 1 inside hollow shaft 2, but the cited passages do not establish the absence of an internal bore in shaft 1. UK 01/10 printed p. 43 / PDF p. 19 and training printed pp. 68, 89 and 91 establish the nested shafts, outer K1/inner-shaft odd-and-reverse path and inner K2/even path. The drawn shaft remains schematic.
- Corrected the attribution of automatic low-engine-speed downshifts in M to training printed pp. **72–74** (viewer pp. 78–80); the owner's manual printed pp. **178–179** / PDF pp. **180–181** supports kickdown, multiple successive requests, gear-speed refusal and M's control limits. The main text now states the behaviour directly, with both sources in the note.
- Explicitly identified the retained 2012 ratio comparison as **North American**. The PCNA sheet p. 1 confirms forward ratios; it does not establish annual UK component/calibration continuity. The 19 November 2008 Porsche Netherlands release confirms PDK replacing Tiptronic S at the facelift. Exact UK paddle introduction remains unresolved; UK 01/10 printed pp. 46 and 113 / PDF pp. 21 and 52 documents availability and code 840.
- Clarified the D3 poster's accessible description: both paths connect to the common final drive, but only K1 carries engine drive in its initial steady state. The interactive handover already distinguishes selected gears, open clutches and controlled slip. Its 16 teaching states stay within the independently verified odd/even assignments; its next-gear choices are illustrative, not a shift-map reconstruction.
- Retained and independently rechecked: six-speed standard/PDK optional; wet radial clutch nesting and dual-mass flywheel; hydraulic sleeve/synchroniser actuation; mechanical P lock (training p. 88); regulated overlap, sensing and CAN inputs; separate rear-right ECU and sump hydraulic block (pp. 93–102); two oil chambers and external clutch/hydraulic oil-to-coolant exchanger with gear-oil housing cooling (pp. 66, 91–92, 96). PET **987209**, 19 July 2018, illustrations **320-005** (PDF pp. 121–123) and **360-000** (PDF pp. 124–125), corroborates distinct hydraulic control and external oil/water plumbing; service catalogue supersessions do not establish original part fitment.
- UK 01/10 printed pp. **42–47, 56–57, 107, 113, 126–127** / PDF pp. **19–21, 26, 49, 52, 59** confirms sixth-gear maximum speed, long seventh, shift-control directions, option codes/dependencies and the 2.9's 5.8 / 5.6-second qualification. The ratio calculation was independently repeated: **0.62 / 0.88 = 0.704545…; 3,000 × that = 2,113.64 rpm**, consistent with the stated approximate 70% / 2,110 rpm.
- The original Black Edition scan identifies **03/2011, LGB 200 105 85**, at PDF p. 1; printed p. **13** / PDF p. **7** confirms the standard SportDesign wheel with PDK-dependent paddles, while printed pp. **16–17** / PDF p. **9** shows optional PDK 250 and Chrono Plus 640. Both period JPEGs match their captioned UK 01/10 source images; the credits now include the 3D explorer without an obsolete SVG count.

Access limits: individual ManualsLib pp. 95–96 and the Dropbox link could not be fetched by the web tool. The live ManualsLib index independently confirms the +6 viewer offset; the complete Scribd training text and original local Black Edition scan supplied the evidence. A bounded CLI fetch of Scribd failed DNS in this sandbox, so no new local training PDF is claimed. Bosch's live page supports only the generic principles already distinguished in the footnotes. No universal final-drive number, exact preselection algorithm, disc count, pressure schedule, diagnostic threshold, current service interval or annual hardware identity is asserted.

Local checks: all 17 footnotes match definitions; all six chapter image references and chapter-relative links resolve; all four SVGs parse as XML; JavaScript syntax and chapter-scoped whitespace checks pass. The explorer model text changed and is flagged for the parent's poster regeneration. No global build, staging, shared-code edit or other-chapter change was performed.

Parent reconciliation: independently extracted the ordinary UK original PDF pp. 25–26. PASM/differential printed54–55 is PDF25; Sport Chrono printed56–57 is PDF26. Corrected this chapter's Chrono link and evidence locators accordingly.
