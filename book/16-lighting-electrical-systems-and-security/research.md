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
- **Printed pp. 159–162 / viewer pp. 165–168:** optional bi-xenon, dynamic beam adjustment, cornering, LED DRLs and cleaning; gas-discharge mechanism; cornering diagram. Viewer p. 166 was readable in full, including gas-discharge explanation and the double-lens projection/cornering mechanism. Pages 165, 167 and 168 were available in the document's own page summaries but individual fetches intermittently returned cache misses. The chapter consequently uses the UK brochure and owner's manual for detailed package, levelling and cornering claims rather than inventing control thresholds from incomplete access.
- **Printed pp. 163–164 / viewer pp. 169–170:** page summaries describe combined rear clusters and LEDs used for tail/brake/rear fog functions. Individual page fetches returned cache misses. The manuscript confines itself to the LED rear-light concept supported also by the UK brochure and owner manual; it does not reproduce an unverified lamp-by-lamp wiring chart.

### Porsche, *Boxster, Boxster S Owner's Manual*, WKD 987 021 10, 5/09

Archived Porsche PDF: <https://billswebspace.com/Owners_Manual_Boxster_PCNA.pdf>. Independently opened; first pages confirm publication identifier. Local extracted text already present at `/tmp/boxster-ch03-owner.txt` was inspected for the relevant passages. This is the **North American** manual. It is used for common construction/control principles and source-dated operating behaviour, never to infer UK standard options or exact UK DRL coding. PDF page equals printed page + 1.

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

- **pp. 20–21:** minimal LED position lights in front intakes.
- **pp. 36–37:** P74 bi-xenon with dynamic cornering; 191 lithium-ion lightweight battery; P12 dimming mirrors/rain sensor. This is explicitly variant-specific. No claim that P74 and ordinary-car P75 are identical bundles, and no ordinary-2.9 lithium-ion battery advice is given.

### Black Edition UK price list, Edition 03/2011

<https://www.dropbox.com/scl/fi/gtavw6els2231u61qjomr/2011-987-Porsche-Boxster-Black-Edition-Price-List-UK.pdf?rlkey=7n0i52owbntdg7d17dfgyo7nw&dl=0>. The web viewer could not open the archive link this turn. The provenance-matched local primary scan `/tmp/boxster-black-edition-uk-pricelist.pdf` was rendered and visually read, rather than relying on its essentially empty text extraction.

- **p. 11:** standard automatically dimming mirrors with rain sensor.
- **p. 12:** standard bi-xenon with dynamic cornering; separate LED position and daytime lights; LED rear fog on driver's side, rear/third brake lighting; Welcome Home. Standard immobiliser, central locking/remote and alarm.

These statements concern the dated UK Black Edition package, not the US 2012 designation or ordinary-car standard equipment. No comprehensive annual UK ordinary-model option sequence was recovered. Chapter therefore does not invent a 2011 or 2012 ordinary 2.9 electrical redesign.

## General mechanism sources

- DENSO, [“Alternator troubleshooting”, 31 March 2022](https://www.denso-am.eu/news/alternator-troubleshooting), alternator overview: accessory-belt drive converts mechanical to electrical energy; alternator supplies loads/recharges battery; battery supports a deficit; regulator controls voltage. General mechanism only. DENSO does not identify the Boxster supplier or rating.
- HELLA, [*Earth (31) – troubleshooting*](https://www.hella.com/techworld/en/ti/pdf/earth-31-troubleshooting/earth-31-troubleshooting.pdf), pp. 1–2: return connections as important as supply; contamination/contact resistance causes voltage loss and malfunctions. General principle only; numerical examples are not adopted as Porsche limits.
- HELLA, [“Rain, sun or something else perhaps?”](https://www.hella.com/techworld/ae/lounge/functions-of-rain-sensors-light-sensors/), rain-sensor section: optical infrared transmission/reflection and received-light change from wetting. This explains optical sensing without attributing HELLA's current multi-function modules, LIN interface, cameras, HUD or light-control options to the 987.

## Original diagrams and interaction contract

1. **`electrical-energy.svg`**, static original schematic: starting battery→starter→engine versus running engine→alternator→loads/charging. Electrical current and mechanical rotation use different colours with written labels. It is not physical cable routing.
2. **`electrical-current-path`**, D3 interactive with matching `poster.svg`: ideal 12 V source; each connected lamp nominally 24 W/6 Ω at 12 V. Parallel branches each receive 12 V. State is persisted in supplied `state`; all button events bind the abort signal; ResizeObserver lifecycle is handled by the shared SVG helper. No timers or automatic motion.
3. **`lighting-functions.svg`**, static original schematic: ordinary halogen/fog/LED-position functions versus P75 bi-xenon/cornering/levelling/LED-DRL arrangement. This is function and placement, not a measured beam pattern or optical design.

Interactive default: `connected=true`, `lamps=1`, `fault='intact'`. Lamp 1 on, lamp 2 absent, **2 A** supply. Two lamps yields **4 A**. Opening switch yields **0 A**. Either `fault='fuse'` or `fault='earth'` yields **0 A** in all switch/load combinations; both present lamps are off. Restoring intact circuit restores current only with closed switch. Dataset evidence: `data-electrical-current`, `data-electrical-lamps`, `data-electrical-fault`, `data-electrical-switch`. Native buttons expose pressed state. Poster matches the default and explains the current calculation without scripting.

No exact Porsche circuit, fuse assignments, pinouts, lamp-power rating, charging-voltage calibration, parasitic-current threshold or battery replacement/coding procedure is inferred from the teaching diagram.

## Checks

- Manuscript: approximately 2,340 words before footnote definitions, including captions and table entries.
- All three SVGs parsed as XML; footnote references/definitions agree and referenced media exist.
- D3 module passed `node --check` and bundled successfully through repository `scripts/build-diagrams.mjs` with the shared runtime. Full-book build/integration remains parent-owned.
- Isolated headless-Chrome verification passed at 390 and 768 px: all 12 switch/load/fault combinations, calculated current, native button pressed states, abort/remount state persistence, no horizontal overflow or page errors. All three static SVGs rendered; SVG text bounds stayed inside their viewBoxes. Screenshots in `/tmp/boxster-ch16/` were visually inspected. Initial sandboxed Chrome launch aborted; the authorised local headless-browser run succeeded outside that restriction.
- Both extracted Porsche JPEGs were visually inspected, and the original lighting/options spreads and Black Edition standard-equipment pages were rendered and read. Image-object provenance is recorded in `images/credits.md`.
