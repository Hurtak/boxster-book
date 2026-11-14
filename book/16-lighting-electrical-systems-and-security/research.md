# Lighting, electrical systems and security — research

Checked 10 November 2026. Baseline: 2010 European/UK 987.2 Boxster 2.9. This chapter owns supply/circuit principles, lighting, basic body-electrical control, key/immobiliser/locking/alarm, wipers and dimming mirrors. Roof/window mechanisms and entertainment-network specifics stay with chapters 14 and 17.

## Primary period evidence

### Porsche, *The Boxster*, January 2010 UK edition

Original: <https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf>. Independently opened through the web tool. Local provenance-matched copy: `/tmp/boxster-ch05/brochure-2010.pdf`, also with layout text. Colophon identifies January 2010 and WSLB1101000125 GB/UK. Page references below are printed numbers, not PDF numbers. The lighting and options spreads were rendered locally and viewed.

- **pp. 34–35:** functional engine-management diagram names a CAN interface with driving-dynamics control, transmission control, immobiliser, instruments, climate and other functions. This supports the concept of shared information. It does not prove a complete module inventory, precise physical bus routing, node order or gateway topology. No such topology is drawn in this chapter.
- **p. 39:** alternator, power-steering pump and A/C compressor use the accessory belt. The same paragraph has an inherited intermediate-shaft statement inconsistent with the 2.9 training material; it is not used for engine architecture. Chapter cites only the relevant accessory-drive assertion.
- **p. 17 versus pp. 64–65:** genuine internal conflict. P. 17 calls standard auxiliary LEDs “daytime running lights”. Detailed p. 64 identifies halogen headlamps, LED **position** lights and fog lamps in the auxiliary front units. P. 65 assigns LED DRLs to optional bi-xenon/dynamic cornering. The manuscript states the inconsistency explicitly, adopts the detailed functional distinction corroborated by training p. 158, and avoids universal claims about UK halogen DRL programming.
- **pp. 64–65:** standard halogen; rear LED light concept; optional bi-xenon with dynamic cornering and LED DRLs on both ordinary models. Headlamp cleaning is built in; separate front fog lights no longer required for that configuration. Cornering inputs named as speed, lateral acceleration and steering lock; maximum swivel 15°, including main beam. The text does not establish a comprehensive swivel-control law.
- **p. 77:** standard adjustable intermittent wipers, two heated/filtered washer nozzles; rain sensor optional with dimming mirrors; Welcome Home automatic locator lighting. PCM plus Sport Chrono Package Plus allows delay adjustment. The chapter does not import modern automatic high beam, matrix LED, camera assistance or automatic headlamp functions from a later generation.
- **pp. 78–79:** in-key immobiliser standard; S exterior alarm standard; interior radar surveillance offered on request; ordinary Boxster alarm/interior surveillance optional. Tracking preparation includes loom, higher-capacity battery and tilt sensor, supporting a subsequently installed tracking system. This is distinct from merely having a radio key.
- **p. 106:** P75 bi-xenon/dynamic cornering/LED DRLs and P12 automatic dimming interior/exterior mirrors with rain sensor, available on both ordinary models.
- **p. 110:** 534 alarm plus interior surveillance for ordinary Boxster, 534 interior surveillance for S; 674 tracking preparation; 608 HomeLink. Rendered option circles checked rather than relying only on extracted bullet characters. The manuscript makes no claim about a specific owner's option list.

### Porsche, *2009 Technik Introduction — All Boxster Cayman Models*

Original Porsche training publication archived at <https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html>. Independently opened and table of contents plus relevant pages inspected. Viewer numbering includes front matter. Printed Electrics and electronics p. 158 is viewer p. 164.

- **Printed p. 158 / viewer p. 164:** main headlamp direction indicators; separate auxiliary units, fog lamps standard, rectangular on Boxster, round on Cayman; bright LED position lights. This corroborates the detailed brochure language and distinguishes the two models' front modules.
- **Printed pp. 159–162 / viewer pp. 165–168:** optional bi-xenon, dynamic beam adjustment, cornering, LED DRLs and cleaning; gas-discharge mechanism; cornering diagram. The full Porsche text was independently read during the source audit at [Scribd](https://www.scribd.com/document/972719474/Boxster-2009), resolving the earlier ManualsLib cache misses. The chapter omits activation thresholds because the training prose/table are not wholly consistent; its broad function and maximum-swivel claims are also supported by the UK brochure.
- **Printed pp. 163–164 / viewer pp. 169–170:** the full Porsche text on Scribd confirms combined rear clusters and LEDs for tail/brake/rear fog functions. The chapter retains the broader LED rear-light explanation and does not imply every light source in the cluster is an LED. The training original is PNA 987 021 09, Edition 2/09, a PCNA-edited publication with an explicit market-applicability notice.

### Porsche, *Boxster, Boxster S Owner's Manual*, WKD 987 021 10, 5/09

Archived Porsche PDF: <https://billswebspace.com/Owners_Manual_Boxster_PCNA.pdf>. Independently opened; first pages confirm publication identifier. Local extracted text already present at `/tmp/boxster-ch03-owner.txt` was inspected for the relevant passages. This is the **North American** manual. It is used for common construction/control principles and source-dated operating behaviour, never to infer UK standard options or exact UK DRL coding. The inspected passages have two PDF front pages: PDF page equals printed page + 2. The printed labels, rather than a blanket assumed offset, were checked for every cited range in the source audit below.

- **p. 15:** transponder stored code checked by ignition-lock system; authorised key required to deactivate immobiliser and start. Key radio range and coin cell are not equated with transponder authorisation. No bypass or programming procedure is supplied.
- **pp. 19–26:** distinct sections for cars with/without alarm. Alarm contacts and interior monitoring separate from lock actuation. Interior surveillance switched off with hood open. No unsafe alarm tests, deactivation sequence or security bypass appears in the manuscript.
- **pp. 29–31:** manual mirror lever; optional anti-glare mirror light sensors front/rear; mirror heating a separate function. Reverse-gear detail is not needed in the chapter and is not presented as an exhaustive control map.
- **pp. 78–80:** separate halogen/bi-xenon light-switch descriptions. Bi-xenon front auxiliary DRLs, dynamic headlamp-height adjustment, country-specific DRL differences and distinct Welcome Home lamp use. The North American manual's USA-only menu and Canada-specific illumination are deliberately not prescribed to UK readers. A DRL alone is not adequate night-road illumination.
- **pp. 82–83:** standard four-stage interval adjustment versus rain-sensor sensitivity; sensor requires driver selection and has ignition-cycle operating conditions. Chapter explains the distinction without publishing a condensed replacement for the actual operation instructions.
- **pp. 245–247:** electrical loads/fuses; panel in driver's footwell; cover carries assignment; same-rated fuses; timed shutdown and remote-control standby after prolonged parking. No parasitic-current threshold is inferred. The text's Radio/PCM timing differs from other-year manuals, so chapter keeps the behaviour general.
- **pp. 249–252:** charge balance and load use, cold/short-trip effects, lead-acid battery construction/care in this manual; battery under cover in front luggage compartment area, illustrated at p. 252. No universal capacity, CCA figure or battery-coding procedure is asserted.
- **p. 255:** 12 V electrical system established by stated battery voltage. No jump-start procedure repeated.
- **p. 266:** front side/position light, bi-xenon DRL, rear lights and additional brake lights are LED/long-life units, distinguishing them from a generic replaceable filament bulb. The chapter does not promise individual LED replacement.

## Variant evidence

### Spyder, January 2010 UK brochure

<https://porschecarshistory.com/wp-content/old/brochures2/93/2010%20987%20Boxster%20Spyder.pdf>. Independently opened online; matched local `/tmp/suspension-spyder-uk.pdf` and layout text.

- **Unnumbered front-design spread / PDF p. 8:** minimal LED position lights in front intakes. It lies between printed pp. 16–17 and 20–21; the earlier pp. 20–21 locator was wrong.
- **Printed pp. 38–39 / PDF p. 18:** P74 bi-xenon with dynamic cornering; 191 lithium-ion lightweight battery; P12 dimming mirrors/rain sensor. This is explicitly variant-specific. No claim that P74 and ordinary-car P75 are identical bundles, and no ordinary-2.9 lithium-ion battery advice is given.

### Black Edition UK price list, Edition 03/2011

<https://www.dropbox.com/scl/fi/gtavw6els2231u61qjomr/2011-987-Porsche-Boxster-Black-Edition-Price-List-UK.pdf?rlkey=7n0i52owbntdg7d17dfgyo7nw&dl=0>. The web viewer could not open the archive link this turn. The provenance-matched local primary scan `/tmp/boxster-black-edition-uk-pricelist.pdf` was rendered and visually read, rather than relying on its essentially empty text extraction.

- **Printed p. 11 / PDF p. 6:** standard automatically dimming mirrors with rain sensor.
- **Printed p. 12 / PDF p. 7:** standard bi-xenon with dynamic cornering; separate LED position and daytime lights; LED rear fog on driver's side, rear/third brake lighting; Welcome Home. Standard immobiliser, central locking/remote and alarm.

These statements concern the dated UK Black Edition package, not the US 2012 designation or ordinary-car standard equipment. No comprehensive annual UK ordinary-model option sequence was recovered. Chapter therefore does not invent a 2011 or 2012 ordinary 2.9 electrical redesign.

## General mechanism sources

- DENSO, [“Alternator troubleshooting”, 31 March 2022](https://www.denso-am.eu/news/alternator-troubleshooting), alternator overview: accessory-belt drive converts mechanical to electrical energy; alternator supplies loads/recharges battery; battery supports a deficit; regulator controls voltage. General mechanism only. DENSO does not identify the Boxster supplier or rating.
- HELLA, [*Earth (31) – troubleshooting*](https://www.hella.com/techworld/en/ti/pdf/earth-31-troubleshooting/earth-31-troubleshooting.pdf), pp. 1–2: return connections as important as supply; contamination/contact resistance causes voltage loss and malfunctions. General principle only; numerical examples are not adopted as Porsche limits.
- HELLA, [“How rain-light sensors can provide comfort and safety”](https://www.hella.com/techworld/ae/lounge/functions-of-rain-sensors-light-sensors/), rain-sensor section: optical infrared transmission/reflection and received-light change from wetting. This explains optical sensing without attributing HELLA's current multi-function modules, LIN interface, cameras, HUD or light-control options to the 987.

## Original diagrams and interaction contract

1. **`images/electrical-energy.svg`**, static original schematic: starting battery→starter→engine versus running engine→alternator→loads/charging. Electrical current and mechanical rotation use different colours with written labels. It is not physical cable routing.
2. **`electrical-current-path`**, D3 interactive with matching `poster.svg`: ideal 12 V source; each connected lamp nominally 24 W/6 Ω at 12 V. Parallel branches each receive 12 V. State is persisted in supplied `state`; all button events bind the abort signal; ResizeObserver lifecycle is handled by the shared SVG helper. No timers or automatic motion.
3. **`images/lighting-functions.svg`**, static original schematic: ordinary halogen/fog/LED-position functions versus P75 bi-xenon/cornering/levelling/LED-DRL arrangement. This is function and placement, not a measured beam pattern or optical design.

Interactive default: `connected=true`, `lamps=1`, `fault='intact'`. Lamp 1 on, lamp 2 absent, **2 A** supply. Two lamps yields **4 A**. Opening switch yields **0 A**. Either `fault='fuse'` or `fault='earth'` yields **0 A** in all switch/load combinations; both present lamps are off. Restoring intact circuit restores current only with closed switch. Dataset evidence: `data-electrical-current`, `data-electrical-lamps`, `data-electrical-fault`, `data-electrical-switch`. Native buttons expose pressed state. Poster matches the default and explains the current calculation without scripting.

No exact Porsche circuit, fuse assignments, pinouts, lamp-power rating, charging-voltage calibration, parasitic-current threshold or battery replacement/coding procedure is inferred from the teaching diagram.

## Checks

- Manuscript: approximately 2,340 words before footnote definitions, including captions and table entries.
- All three SVGs parsed as XML; footnote references/definitions agree and referenced media exist.
- D3 module passed `node --check` and bundled successfully through repository `scripts/build-diagrams.mjs` with the shared runtime. Full-book build/integration remains parent-owned.
- Isolated headless-Chrome verification passed at 390 and 768 px: all 12 switch/load/fault combinations, calculated current, native button pressed states, abort/remount state persistence, no horizontal overflow or page errors. All three static SVGs rendered; SVG text bounds stayed inside their viewBoxes. Screenshots in `/tmp/boxster-ch16/` were visually inspected. Initial sandboxed Chrome launch aborted; the authorised local headless-browser run succeeded outside that restriction.
- Both extracted Porsche JPEGs were visually inspected, and the original lighting/options spreads and Black Edition standard-equipment pages were rendered and read. Image-object provenance is recorded in `images/credits.md`.

## 3D electrical location and connection explorer

`diagrams/electrical-explorer/` adds eight selectable groups: front battery/partial cover, main positive feed, driver-footwell circuit protection, body/engine earth continuity, starter/flywheel drive, alternator/accessory drive, a standard halogen/lower light module, and ignition/lighting request controls. The installed model follows the book's +Z-front, +X-left left-hand-drive reference car. Controller and terminal positions are approximate; the teaching geometry is not a factory harness or bracket map.

Fresh primary checks on 10 November 2026:

- Porsche owner manual, printed pp. 249 and 252 / PDF pp. 251 and 254, explicitly locates the battery under a black cover in the front luggage compartment; printed p. 247 / PDF p. 249 locates the fuse panel in the driver's footwell. Printed p. 15 establishes the key/transponder authorisation function. [Manual](https://billswebspace.com/Owners_Manual_Boxster_PCNA.pdf).
- Porsche PET **987209**, illustration **902-005**, PDF pp. **519–522**, groups the battery, power distributor, starter and alternator. Its text identifies the distributor-to-engine cable, starter/alternator wire set, and separate body-to-engine earth line. Illustration **101-010**, PDF pp. 37–38, identifies the alternator in the belt drive. This supports the distinct long positive path and earth connections, without claiming every branch passes through a particular fuse. [PET](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf#page=519).
- January 2010 UK brochure, printed p. **39**, supports accessory-belt drive of the alternator. Printed pp. **64–65** support the standard halogen headlamp and separate lower fog/LED-position module. The chapter's stored Porsche lighting photograph was inspected for the two modules' body locations, not as proof of the photographed car's standard lighting specification. [Brochure](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf#page=29). Its p. 39 intermediate-shaft sentence is not used.

The starter cutaway explains motor/pinion/ring-gear engagement, not internal supplier detail. The alternator shows rotor, windings, partial housing, rectification block and only a partial accessory-belt loop; no complete belt routing is implied. Representative fuse shapes are not a fuse count, assignment or rating. The main headlamp includes schematic separate road-light bulbs and an indicator; detailed beam-forming optics are omitted. Supply, return, mechanical drive and control roles are explained separately; no pinouts, current ratings, CAN topology, security bypass or electrical testing procedure is supplied. Shared renderer/poster generation and whole-book browser checks remain parent-owned.

## Independent whole-chapter text and source audit — 10 November 2026

Read all manuscript prose, footnotes, JPEG captions/alt text and credits, the two static SVGs, both diagram modules and every 3D part/connection description. The circuit's illustrative 12 V / 24 W / 2 A values, the conventional-current loop, and the separate energy-flow explanation remain correct; they are explicitly not factory lamp ratings. No binary image or geometry change was needed.

Material corrections and fresh evidence:

- **Handbook locators:** original WKD 987 021 10, 5/09, independently opened online and read from the matching original PDF. Verified printed/PDF pairs: 15/17, 19–26/21–28, 29–31/31–33, 78–80/80–82, 82–83/84–85, 245–247/247–249, 249–252/251–254, 255/257 and 266/268. Printed p. 246 is PDF p. 248. Corrected every chapter handbook URL that previously landed one page early, including the erroneous fresh-check pairs above. Rendered/viewed PDF pp. 249 and 254 confirm fuse-panel and battery illustrations with their printed numbers.
- **Spyder locators:** visually read PDF pp. 8 and 18 of the January 2010 UK original (colophon PDF p. 23). The position-light passage is on the unnumbered front-design spread; P74/191/P12 are printed pp. 38–39, not 36–37.
- **Tracking preparation:** UK January 2010 brochure printed p. 79 / PDF p. 37 specifies preparation in conjunction with the alarm. Added that dependency to prose and option table. Printed pp. 78–79 and 110 / PDF pp. 37 and 51 retain the ordinary 2.9/S alarm distinction.
- **Electrical construction:** independently read and rendered PET 987209 (19 July 2018) illustrations 902-005 / PDF pp. 519–522 and 101-010 / PDF pp. 37–38. Corrected the previous one-page-early PET locators. Added this construction evidence and DENSO's rotating-electrics FAQ to the starter explanation. The 3D starter wording now separates solenoid engagement from motor rotation; its key description states that the ignition system checks the transponder code. These are general mechanisms, not a claim about a specific installed supplier or starter internals.
- **Images:** visually inspected the chapter JPEGs against the brochure's printed p. 65 / PDF p. 30. The front photograph shows the optional bi-xenon arrangement, now stated in caption/alt/credit; no 2.9/S identity is inferred from its unbadged front. The rear S comparison label remains correct.

Retained after independent primary checks: halogen/fog/LED-position versus P75 bi-xenon/cornering/levelling/cleaning/LED-DRL functions; the brochure p. 17 versus pp. 64–65 wording conflict; market-specific DRL operation; maximum 15° swivel; belt-driven alternator; battery load balance; fuse purpose/location; CAN as a functional interface rather than a wiring topology; key/transponder, alarm/hood-open monitoring, timed standby; wipers, rain-sensor and mirror functions. Sources were the original Porsche passages already listed, not prior research assertions. DENSO's alternator overview and technical-manual “Rectification” section and HELLA's earth/rain-sensor passages independently support the general explanations.

Black Edition check: rendered/read the primary UK scan cover/colophon (PDF p. 1: Porsche Cars Great Britain, Edition 03/2011) and standard-equipment printed pp. 11–12 / PDF pp. 6–7. The stated standard lighting/mirrors/alarm are supported. The later appended Spyder wording in this scan is not used to identify these clearly headed Black Edition pages. Web access to Dropbox failed and a bounded direct download met a DNS failure; the identity-checked cached original was sufficient.

Remaining scope limits: no annual 2011/2012 ordinary-2.9 equipment continuity or universal DRL coding is inferred; no exact harness routing, ratings, sleep-current limit or diagnosis is claimed. Training text is now accessible via Scribd, but its conflicting cornering activation thresholds are intentionally not reproduced. Local syntax/XML, image/footnote-reference, arithmetic and diff-whitespace checks passed; integrated builds remain parent-owned. The changed `electrical-explorer/model.js` needs parent poster regeneration.

## Coverage and consolidation — 10 November 2026

### ParkAssist addition

Re-read UK01/10 printed78/106 for option635, rear sensors, reverse activation and acoustic warning. Handbook printed70–71 describes four ultrasonic sensors and sensing limits. HELLA’s ultrasound-based parking-aid article supplies pulse/echo principle only, not modern automatic steering/braking or sensor-fusion fitment. New section and option-table row distinguish the warning function from driver control.

## Factory-parts audit and saved source pages — 10 November 2026

Freshly opened the Porsche-authored [PET 987209 original](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf) and [UK 01/10 brochure](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf). The downloaded 583-page PET is snapshot **19 July 2018, P33**, SHA-256 `c865de9263f5946db4c24874eb10e503be2343762b308695aa7bb6a943bfd2bf`. Saved **57 full-page PNGs**, including **20 actual factory drawing pages**, their relevant application lists and five PR-key pages; every drawing was visually inspected. [The source inventory](part-reference/README.md) records each file/page/plate and its item/application limits. [The verification matrix](part-reference/verification.md) enumerates every manuscript topic group, all four existing SVGs, both interactive IDs, every explorer group/tour/connection and both photographs.

The chapter's useful additions follow assembly boundaries in those drawings:

- **902-005, pp. 519–522:** distributor/fuse links (items 10–11) are distinct from the footwell fuse carrier in **902-000, pp. 514–516**. Added this identity within the existing positive-feed explorer group, plus its covered engine connection and bracket (items 15–17). Distributor mounting and harness path remain schematic; no exact fuse allocation or current rating is implied.
- **905-000, pp. 552–553:** standard main cluster has H7/H9 road-light bulbs and an indicator bulb (items 2–5), carrier/connector arrangement (12–17), and separate lower fog/LED-position components (20–22). The 3D model now includes separate symbolic road-light bulbs, indicator, carrier/connector and a **rectangular Boxster** fog optic instead of the previous round representation. Optics remain illustrative.
- **905-001, pp. 554–556**, plus **904-010/020, pp. 548–551:** named optional xenon/control/servomotor/cornering components and the cleaning circuit's dedicated pump/two nozzle connection in prose. The dated brochure retains **P75 bi-xenon with dynamic cornering**; no later PDLS branding was introduced or inferred from PET PR 603/605/288.
- **905-005, pp. 557–558:** explicitly explained conventional reversing/indicator bulbs inside the rear cluster; “LED rear lights” is not “every source is LED”. **PR 465/466** distinguishes rear-fog side; **PR 492**, key p. 11, means **left-hand traffic**, separate from **098/099** steering side.
- **802-005, pp. 269–271; 901-003, pp. 508–510; 902-020, pp. 528–530:** added the four rear ParkAssist sensors → rear wire set → separate controller chain. No automated steering/braking claim.
- **804-000/020, pp. 280–281/285–286:** added driver-side mechanical lock-cylinder applicability. **904-000/010, pp. 546–549:** clarified one motor/crank/two pivots, screen-pump/reservoir/T-piece/two jets and steering-side applications. **809-010**, **898-000**, **901-004**, **903-000/004/005** retain local factory evidence for mirrors, lock sets, access/alarm/tilt, horns, interior lighting and switches without inventing operating logic from the parts lists.

The [MY2010 North American handbook](https://billswebspace.com/Owners_Manual_Boxster_PCNA.pdf), [DENSO rotating-electrics FAQ](https://www.denso-am.eu/products/rotating-electrics), [HELLA earth paper](https://www.hella.com/techworld/en/ti/pdf/earth-31-troubleshooting/earth-31-troubleshooting.pdf) and [HELLA rain-sensor explanation](https://www.hella.com/techworld/ae/lounge/functions-of-rain-sensors-light-sensors/) were freshly opened for shared operating/general principles. These do not establish UK equipment assignments or original suppliers. The source distinction for timing, control calibration, exact routing, internal geometry and current parts availability remains explicit.

Narrow checks passed: `node --check` for both behaviour/model modules; actual Three.js assembly import with **eight unique groups, 12 valid connection records, 211 meshes and finite vertices/bounds**; chapter MDX syntax compilation; all **four SVGs** parse; all **57 PNGs** have valid 1,800-pixel long-edge dimensions and inventory links. The **33 footnote references, 22 definitions, 13 heading texts and two diagram IDs** are unchanged in sequence/count. No standalone SVG was changed. Parent owns final browser checks and regeneration of **`electrical-explorer`**'s poster from the revised model; no other diagram regeneration is needed for this pass.


## Visual review integration — 13 November 2026

Uses unchanged existing PET905-000 p552 halogen drawing beside the existing UK01/10 p65 optionalP75 front photograph. Explicit drawing/photo comparison rather than an unsupported “standard halogen photo”. Standard lower fog/LEDposition vs P75 lowerLEDDRL follow detailed catalogue64–65 and training158, respecting the existing p17 brochure wording conflict. No beam photometry, RHD pattern or fitment by projector appearance. See [image credits](images/credits.md) for asset provenance. Existing factual qualifications remain.


## Halogen / P75 photograph pairing — 14 November 2026

Replaced the mismatched PET-drawing/photograph comparison with two frontal photographs. The new original Cameron Sports Cars image **IMG_32632-large.jpg**, from its advertised2010 Boxster2.9 manual U1674, shows the standard lower rectangular fog reflectors and upper halogen arrangement. Identity follows the visible lower hardware checked against Porsche UK01/10 printed64–65 and PET905-000, not projector appearance alone or the dealer's ambiguous “LED Daytime Running Lights” wording. No original build record or all-standard car is inferred from the sales listing.

Both photographs remain original files. React viewports use the same aspect ratio and focus on the main and lower lamps; no composite bitmap or recolouring. The night-time P75 photo remains the existing Porsche original; different ambient illumination is not beam-output or colour-temperature evidence. PET905-000 remains above as the dedicated assembly drawing. Source and crop details: [halogen-photo reference](part-reference/halogen-photo/README.md).
