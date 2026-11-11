# Chapter 04 factory-parts verification

Checked **10 November 2026**. The baseline is the 2010 European/UK 2.9 with six-speed manual; PDK is an explicit option. [README.md](README.md) records all **46 unaltered full-page PNGs**, their original PDF page/plate numbers, callouts, source hash and application limits. All **20 drawing pages** were visually inspected, not accepted from text extraction alone. Parts-list text and selected list-page images establish identity, handedness, quantities and conditions. This pass does not turn the later PET snapshot into original option or model-year evidence.

**Disposition vocabulary:** confirmed = factory evidence supports the identity/relationship; corrected = an actual contradiction was removed; improved = supported detail was added; illustrative = teaching geometry/physics beyond what a parts drawing measures; unresolved = evidence does not establish a more exact claim. No retained chapter statement required a factual reversal. The substantial changes add assembly detail which the previous broad concept views omitted.

## Every existing illustration and interactive figure

| File / figure ID | Complete check and evidence | Disposition |
| --- | --- | --- |
| `images/body-load-paths.svg` | All labels: front/rear bulkhead regions, both sills, floor, tunnel and crossmember. PET **801-010/020/035/045/050** supplies component families; Porsche P001 p.5.4 and the 01/10 UK body illustration supply structural continuity. The illustrated rear crossmember and member spacing are conceptual, with no one-way force arrow or numerical strength. | **Confirmed / illustrative; retained.** This is a connection diagram, not a PET repair-section map. |
| `images/body-airflow.svg` | Front radiators and coolant heat transport belong to chapter 07. Left induction versus right engine-bay ventilation follows P001 p.2.29; PET **801-080** visually separates left guide and right channel/scoop/fan, items **5, 13–15, 18**. Vehicle left is left when facing forwards. | **Improved:** added a fan symbol in the right duct and explicit duct/fan wording. Arrows, outline, outlet regions, fan location and symbol blade count remain **illustrative**, not CFD or measured duct routing. |
| `images/porsche-material-zones.jpg` | Factory material-category artwork already credited to January 2010 UK brochure p.66. Visually inspected; the colour image and PET **801-045/050** consistently distinguish an open shell with reinforced frame/sills. | **Confirmed / retained.** PET line art adds no steel-grade, gauge, weld or material-percentage proof. Existing JPEG and source credit preserved. |
| `images/porsche-two-luggage-compartments.jpg` | Visually inspected photo shows the named red S, both luggage lids raised and the ordinary roof bay between cabin and rear boot. PET **803-000/005**, **807-000/001**, **811-013** independently distinguish the closures and linings. | **Confirmed / retained.** S comparison stays explicit; the 150/130-litre values and aluminium lids come from the dated UK brochure. |
| `diagrams/body-packaging-layers/index.js` / **body-packaging-layers** | All four choices audited individually below. PET **807-005** items **1, 5, 7, 10–12**, **807-001** items **18–26**, **811-013** item **1**, and **803-005** distinguish internal covers, roof cover, filler flap and luggage lid. The roof/engine/luggage spaces overlap in side projection without being one cavity. | **Improved:** top-cover seal shown as a separate boundary; service explanation now identifies carpet, cover and seal and the separate rear-wall cover. Shapes, roof-fold symbol, vertical gaps and filler positions remain **illustrative**. Native controls, retained state and lifecycle unchanged. |
| `diagrams/body-packaging-layers/poster.svg` | Entire static fallback inspected in Chrome after matching its seal line, `Cover + seal` label and descriptive text to the D3 figure. It still explains all three spaces without interaction. | **Improved / matched to live view.** |
| `diagrams/body-explorer/index.js` / **body-explorer** | Chapter entry still delegates lifecycle, model loading and controls to the shared explorer. All four tour states, all nine named groups, all twelve connections and all chapter-owned strings reviewed below. Factory families are PET **801-010/020/035/045/050** and **807-005**. | **Improved:** added seat-support pair, inner sill webs and separate notched rear-wall service cover/opening. The seven earlier body-region identities remain; no shared car geometry changed. |
| `diagrams/body-explorer/poster.svg` | Existing seven-region fallback was visually inspected and correctly described the prior model. The model now has nine groups. | **Regenerated centrally by the parent agent** using `npm run posters -- body-explorer`; the nine-part model/fallback is checked by the parent integration pass. Its assembly image was inspected locally after regeneration. |

## Packaging-layer choices

| State ID / native button | Verified relationship | Limit |
| --- | --- | --- |
| `all` / All spaces | Roof stowage bay, rear boot and engine region; separate external roof/boot covers and internal top engine cover. PET **811-013**, **803-005**, **807-005**. | Combined schematic expands gaps; no physical clearance is implied. |
| `luggage` / Rear boot | Rear luggage closure and liner; separate filler service flap. PET **803-005**, **807-001**. Brochure p.79 establishes 130 litres with hood down and filler contents. | Capacity is not computed from the SVG. |
| `roof` / Roof bay | Dedicated roof space and its outer cover, distinct from rear luggage lid. PET **811-013**; ordinary brochure pp.80–81. | The zigzag is a folded-roof symbol. Chapter 14 owns the mechanism. |
| `access` / Service layers | Top carpet **807-005:1**, top cover **5**, seal **7**, plus separate rear-wall cover **10** behind trim **11/12**. Rear-boot hatch is **807-001:18–26**. | Access boundaries are not a removal procedure, and PET does not identify every sealing compound. |

## Every body-explorer model group and its smaller geometry

The original car axes remain **+X vehicle left, +Y up, +Z forwards**. All positions, dimensions, section thicknesses, rib counts, opening sizes, seams and separation offsets are approximate teaching geometry. The model does not reproduce each PET service part as its own group; joined shell regions and a genuinely removable service cover are explicitly distinguished.

| Group ID | Geometry and text checked | Factory reference / disposition |
| --- | --- | --- |
| `floor` | Two floor areas, raised-centre relationship, ribs, edge flanges and illustrative transverse connections. Four full-width generic beams were reduced to front/rear concept connections so the actual paired seat-support frames can be seen separately. | **801-020:1** shows formed floor/tunnel. **Improved / illustrative profile**; the selected tunnel view is a subdivision of the floor. |
| `seat-supports` | **New pair**, one on each side of the tunnel. Each simplified open frame has two longitudinal sides and transverse portions. The group description distinguishes a service listing from bolt-on removal. | **801-020:2**, quantity one left and one right. **Improved** actual assembly identity; opening shape and positions remain approximate. |
| `left-sill` | Hollow side section, two joining flanges and **new inner web**. Inner and outer components are named in the description. Positive X still means vehicle left. | **801-050:7/8**, with inner side/floor members **801-020:3/4**. **Improved / illustrative section**. |
| `right-sill` | Mirrored lower side structure, flanges and **new inner web**. Description retains connection to floor and opposite side. Negative X still means vehicle right. | Corresponding handed **801-050:7/8**. **Improved / illustrative section**. |
| `tunnel` | Raised top and side sections, joining flanges and generic ribs; no separate ladder frame claimed. | Raised centre in **801-020:1**; **confirmed / illustrative subdivision**, rather than a separately detachable PET assembly. |
| `front-bulkhead` | Formed transverse wall, top/lower flanges, generic stiffeners and two toe-board slopes. | **801-010:3/12/14** front transverse panel family, **801-045** frame/pillar family; **confirmed region / illustrative construction**. No one-to-one claim that its flat wall is a factory pressing. |
| `rear-bulkhead` | Formed wall, transverse edges and outer stiffeners. **New service opening** replaces the previously solid centre. Wall remains joined to floor/sides; decorative boxes at the opening were removed. | **801-035:6** cabin boundary; **807-005:10–12** rear-wall access/trim. **Improved**, opening and stiffening shapes remain approximate. |
| `rear-service-cover` | **New separate cover**, lower clearance notch and two illustrative stiffening ribs. It closes the opening in the assembled view. Text distinguishes top cover/seal **5/7** from rear-wall cover **10**. | **807-005:10** visually inspected. **Improved** identity and lower-notched outline; no exact dimensions, fastener positions or universal seal specification. |
| `windscreen-frame` | Curved metal frame, lower transverse member and foot connections. Glass, trim and roof bow remain absent. | **801-045:1–5**, with A-pillar reinforcement **4** and the 2010 material illustration. **Confirmed / illustrative profile**; no steel grade or rollover rating inferred. |

### Four tour states

- **0 — car location:** locates the ordinary 2010 2.9 passenger shell, not a separate ladder chassis. Shared appearance car is untouched; its omitted deployable spoiler is intentional.
- **30 — context exposed:** overview now includes the seat supports and rear-wall access cover alongside the shell members; closure identities match PET.
- **65 — assembly:** explains the paired seat frames beside the tunnel and the service cover closing its rear-wall opening. Geometry does not claim measured installation coordinates.
- **100 — separated:** distinguishes joined body regions from the removable cover. Absolute illustrative offsets support reversing the tour without implying a repair cutting/removal order. No automatic or simulated crash motion was introduced.

### Every named connection

All original structural connections remain conceptual continuity, without load direction or quantified strength. A PET exploded view by itself does not establish a particular weld, joining method or force share.

| From → to | Kind / meaning | Evidence and disposition |
| --- | --- | --- |
| `floor` → `left-sill` | Structural floor-to-side continuity | **801-020/050**, P001 p.5.4; confirmed concept, illustrative endpoints. |
| `floor` → `right-sill` | Corresponding right continuity | Same handed families; confirmed concept. |
| `floor` → `tunnel` | Raised centre connects floor areas | **801-020:1**; confirmed formed-floor relationship, selected regions illustrative. |
| `front-bulkhead` → `left-sill` | Front lower cabin joins left side | **801-010/020/045/050**, P001 p.5.4; confirmed regional continuity, no exact seam map. |
| `front-bulkhead` → `right-sill` | Corresponding right joint region | Same families; confirmed concept. |
| `rear-bulkhead` → `floor` | Cabin boundary meets lower shell | **801-020/035**, material-zone illustration; confirmed regional continuity. |
| `windscreen-frame` → `front-bulkhead` | Frame continues into cabin front | **801-045:1/4/5**, P001 p.5.4; confirmed concept. |
| `tunnel` → `front-bulkhead` | Raised centre meets front transverse region | **801-010/020**; confirmed concept, illustrative endpoint. |
| `rear-bulkhead` → `left-sill` | Rear transverse region to left side | **801-035/050**; confirmed concept. |
| `rear-bulkhead` → `right-sill` | Corresponding right continuity | Same handed families; confirmed concept. |
| `seat-supports` → `floor` | **New structural relationship**, paired frames on floor | **801-020:1/2**; improved identity, no bolt-on implication. |
| `rear-service-cover` → `rear-bulkhead` | **New mechanical closure**, cover at access boundary | **807-005:10–12**; improved; no load-bearing claim for the closure connection. |

## Complete component-topic audit

| Chapter topic group | Factory-parts evidence / disposition |
| --- | --- |
| Monocoque, formed floor, tunnel, transverse members, sills, pillars, bulkheads, attachment regions | **801-000/010/020/035/045/050** plus existing contemporary brochure/training. **Confirmed identities; improved inner sill/seat detail.** General bending/torsion explanations remain mechanics, not computed vehicle strength. Jack sockets/support tubes are documented in references without adding a service procedure. |
| Front and rear crash structure, bumper cover versus carrier, door reinforcement, windscreen/rollover protection | **801-010/035**, **802-000/005**, **804-000**, existing p.66–67 illustration. **Improved** cover/carrier distinction in prose; exact crash rating, energy absorption, steel grade and rollover performance remain **unresolved**. Fixed rollover hardware belongs to chapter 18; no extra chapter-04 model part is implied. |
| Exterior panels, doors, wings, hinges, latches, strikers, seals, gas supports | **801-040/050**, **803-000/005/006**, **804-000**. **Improved** luggage-lid hardware and front two/rear one strut distinction. Door/wing assembly identities documented locally. Aluminium comes from dated brochure; PR:599 code only confirms an application branch. |
| Engine placement, seats, roof bay, rear luggage and service access | **807-005**, **811-013**, **803-005**, **807-001**. **Improved** separate top-cover seal, rear-wall hatch and filler-hatch frames. Actual engine/transmission/fuel-tank locations are introduced by chapter 01 and not reconstructed as CAD from body PET. |
| Front and rear boots, lining, service hatch, packing and load restraint | **807-000/001**, **803-000/005**. **Confirmed** identities; **improved** filler-hatch frame/sealing detail. 150/130 litres, aluminium and hood-down luggage capacity stay anchored to the January 2010 brochure; PET supplies no packing/load limit. |
| Front radiator cooling, left intake, right ventilation | **801-080**, with chapter-07 cooling references and P001 p.2.29. **Improved** right fan/duct symbol. Duct flow direction and exits remain functional generalisations, with no measured streamlines. |
| Underbody panels, heat insulation and tunnel brace | **801-070:1/3/4/5/7/13/15**. **Improved** split covers, brackets, insulation and separate transverse strut. No unsupported material or aerodynamic coefficient added. |
| Ordinary deployable spoiler and its controls | **803-007:1/3/6/9/10/12**, handbook pp.67–68. **Improved** upper/carrier/drive/motor/seal/drain identity; operating approx.120/80 km/h thresholds retained. No deployed spoiler added to the shared appearance car. |
| 2010 options: XAL, badge deletion, paint/trim, optional hardtop, PDK context | Existing dated UK brochure is the authority. PET **802-000**, **803-007**, **804-000** supplies equipment-dependent replacement branches. **Confirmed within cited scope; original availability is not inferred from PET.** Hardtop mechanism remains chapter 14; no duplicate drawing added here. |
| Other 2.9 years and structural carryover | Existing 2009 Technik p.126 supports broad inherited concept. **Unresolved** annual UK revisions and original suffix chronology remain explicit. Later common parts are not treated as proof of unchanged annual production. |
| S, Spyder, Black Edition comparison | **803-005 versus 803-006**, **803-007:20 PR:778**, **804-000 PR:599**, **801-080** variant rows, plus existing dated publications. **Confirmed** distinct Spyder upper package; ordinary S/Black Edition roof/boot arrangement retained. No complete conversion/interchangeability claim. |
| Identification, panel gaps, hinges/seals, sill/attachment condition, missing guides, spoiler faults and drainage context | PET separates the relevant assemblies; existing handbook supplies panel-condition and spoiler guidance. **Confirmed limited explanation.** No fault prevalence, repair instruction or diagnosis from panel gaps alone. Sill drain, roof drainage and spoiler drain are not conflated. |

## Checks and remaining integration

- `node --check` passes for both changed JS modules.
- Instantiating the chapter model in Node succeeds: **9 selectable direct-child groups**, **12 valid connections**, **62 meshes**, **2,951 geometry vertices**. Every position/normal/UV value is finite, every group has non-empty bounds, and every connection names an existing group. No new calculation or animation simulation was added.
- All four chapter SVGs were rendered by local headless Chrome and visually inspected; the updated airflow and packaging fallback have legible, separate labels. Initial sandbox Chrome launch failed with `SIGABRT`/`EPERM`; the same local-only render passed with approved escalation. Temporary screenshots are `/tmp/ch04-{load,air,layers,body}-check.png`.
- All existing heading text/diagram IDs and **15 endnote reference IDs/order** are preserved. Existing source notes were extended; none inserted. XML parsing of all four SVGs, all local image/research links, the exact 46-page README inventory, and chapter-only whitespace checks pass.
- A focused live D3 check at **390 px** passed all four choices (`all`, `luggage`, `roof`, `access`), each native button's `aria-pressed` state, the new seal boundary and state retention after abort/remount; no page errors. `/tmp/ch04-live-layers-390.png` was visually inspected.
- Parent integration regenerated **`body-explorer`**; its nine geometry/model tests including body framing pass. The parent owns final real-reader checking. No global build/test or shared-model generation was run by this chapter agent.
- Exact installation coordinates, factory pressing profiles, seam/joining methods, material grades, strength, crash outcomes, calibrated aerodynamics, production supersessions and annual UK specification changes remain **unresolved** at this evidence level. The chapter retains visible schematic limits and teaches no workshop procedure.
