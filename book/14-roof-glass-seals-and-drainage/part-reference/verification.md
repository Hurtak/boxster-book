# Chapter 14 verification against factory parts drawings

Checked 10 November 2026. The source, file-by-file factory page manifest, applicable model/PR rows and reuse limits are in [README.md](README.md). All fifteen saved factory drawing pages were visually inspected; the adjacent parts lists were read, including quantities and ordinary/Spyder alternatives. The original mechanism is the **2010 European/UK 2.9 ordinary powered roof**, independent of standard manual or optional PDK transmission.

**Confirmed** means the cited evidence supports identity or connection. **Corrected** includes a specific clarification/addition made in this pass. **Illustrative** means an educational abstraction supported in principle but without measured installation geometry. **Unresolved** identifies what the recovered primary evidence does not establish. These dispositions can apply to different aspects of the same asset.

## Every chapter SVG and interactive figure

| Asset / ID | Evidence | Disposition and complete scope |
| --- | --- | --- |
| `images/roof-drive-chain.svg` | 811-012 pp. 410–411, items 1/3/13, 4/10/15/16/38; handbook printed p. 187 independently names roof and cover rods | **Confirmed / illustrative, retained.** One motor, two rotary shafts, distinct paired gearboxes and articulated drives to one roof/cover mechanism. Drawing branches, reduction symbols, lever sweep and coordination are functional, not factory pivot positions, ratios, routing or timing. No motor duplication or pull-cable arrows. |
| `images/roof-window-seal.svg` | 804-020 pp. 285–286 item 13; 804-030 pp. 287–288 items 1/2; 811-010 pp. 408–409; handbook printed pp. 18, 27–28; WM 644019 | **Confirmed / illustrative, retained.** Closed/seated glass, handle-related short drop, then local outward door movement are distinct. Motor and cable regulator move the glass. Seal section/drop/motion are exaggerated; roof-operation window lowering is a separate event. PET does not establish switch logic or drop distance. |
| `diagrams/roof-opening/index.js`, ID `roof-opening` | 811-000/005/012/013, pp. 399–400, 403–404, 410–413; handbook printed pp. 182–185; January 2010 UK brochure printed pp. 80–81 | **Confirmed / illustrative, retained.** All five selectable stages—Closed, Released, Clearance, Folding, Stowed—retain manual latch, window clearance, fixed body, overlapping cover/frame travel, rigid glass and stowage behind seats. No exact motion reconstruction or control trigger is claimed. Slider/button states are explanatory snapshots rather than continuous kinematics. |
| `diagrams/roof-opening/poster.svg` | Same opening evidence | **Confirmed / illustrative, retained.** Four print snapshots simplify the same five-stage interactive sequence; glass stays one rigid panel and the ordinary roof does not enter either boot. |
| `diagrams/roof-drainage/index.js`, ID `roof-drainage` | 811-012 item 25; 811-013 items 9/10; 812-000 items 12/13/24, pp. 410–413, 418–420; TI 29/09 ENU 5393 | **Confirmed / illustrative, retained.** Clear and blocked buttons plus water-amount slider cover dry, draining, retained water and possible overflow states. Wet side and interior remain distinct; an open outlet reaches outside and the blockage closes that path. Shape, amount, threshold, rate and spill route are not measured. Filter servicing and the actual separate collection components remain in the text and 3D cutaway. |
| `diagrams/roof-drainage/poster.svg` | Same drainage evidence | **Confirmed / illustrative, retained.** Two static sections show clear versus blocked outlet; no intact floor crosses the drain throat. This is a functional section, not a concealed routing map. |
| `diagrams/roof-explorer/index.js`, ID `roof-explorer` | Factory plates below; chapter-owned `model.js` supplies the scene and descriptions to the shared explorer | **Corrected / illustrative.** Nine direct selectable groups, ten supported named connections and four tour stops; ordinary roof only. Added seals, centring journals, an identifying heating wire and open filter grilles. All separation offsets are illustrative. Shared reference car, viewer and loader unchanged. |
| `diagrams/roof-explorer/poster.svg` | Same explorer evidence | **Regenerated and visually checked during parent integration.** Its nine groups match the revised assembly. Both standalone schematics and the opening/drainage fallbacks were also rendered and visually inspected afresh. |

## Every 3D component group

| Group ID and label | Factory evidence | Disposition / limits |
| --- | --- | --- |
| `header` — Windscreen header | 804-010 item 1; 811-000 items 3/4/8; 805-000 glazing/seal separate | **Confirmed / illustrative.** Fixed front contact and receiver, distinct from travelling roof front frame. Windscreen glass/trim omitted for cutaway visibility. |
| `roof-frame` — Frame and front latch | 811-000 items 3/4/8; 811-005 items 1/2/8/10/11/27/28 | **Corrected / illustrative.** Added paired centring journals; catch retains what the journals locate. Articulated members, bows and travelling manual hook retained. Bow count, bearings and pivot coordinates are not a factory reconstruction. |
| `covering` — Fabric and lining | 811-000 items 1/2/15/17; brochure printed p. 80 | **Corrected / illustrative.** Outer covering, moulded headliner and cloth-guiding tension wires distinguished from rotating shafts. Approximate seams, thickness and wire paths; no invented cloth properties. |
| `rear-glass` — Rigid heated rear glass | Brochure printed p. 80; 811-000 item 9 heating wire set; handbook printed p. 31 | **Corrected / illustrative.** Added a short identifying heating wire/connector. Pane stays whole. Exact aperture attachment, element pattern, connector shape and wiring route unestablished; motor wiring and heating are separate functions. |
| `motor-shafts` — Motor and two shafts | 811-012 items 13 (one 986 624 117 01), 3 (two 987 561 107 00), 14/37 | **Confirmed / illustrative.** One reversible motor feeds two flexible rotary paths; motor/shaft packaging and curves approximate. Not axial Bowden-cable pull. |
| `side-drives` — Side gearboxes and rods | 811-012 items 1, 4/10/15/16/38; 811-005 | **Confirmed / illustrative.** Separate left 987 561 179 03 / right 987 561 180 03 gearboxes, levers and rods. Connections to frame and cover are functional; no inferred calibrated crank positions or timing. |
| `cover-well` — Cover and stowage well | 811-013 items 1/5/6/9/10; brochure printed p. 80 | **Confirmed / illustrative.** Dedicated stowage cover, different from rear boot lid. Closed-roof cutaway deliberately omits the packed roof. Cover shape/well dimensions approximate. |
| `drainage` — Side pans and drains | 812-000 items 12/13/24; 811-012 item 25; 811-013 items 9/10; TI 29/09 | **Corrected / illustrative.** Added open grilles identifying paired filters above outlets. Text distinguishes side pans/pipes from separate plates and compartment hoses. Mesh shape/capacity and the displayed drops do not reconstruct hidden routes or prove filter fitment to an individual car. |
| `roof-seals` — Roof and compartment seals | 811-010 items 1–4/8/9; 811-013 items 5/9 | **Corrected / illustrative.** Added a separate ninth selectable group for front/side/B-pillar/arch contact paths and stowage seal. Rounded tubes identify contacts, not true seal profiles or adjustment dimensions. Door seals stay in the separate window illustration and prose. |

All ten connection records reference existing group IDs and use valid `mechanical`, `structure` or `fluid` kinds. The new seal connection denotes retention/contact, not a fluid passage between the compartment seal and pan. No hidden electrical routing is invented as a connection to an unrelated 3D group.

## Every explorer tour stop

| Stop | Verification |
| --- | --- |
| 0 — car/location | **Confirmed / illustrative:** roof over cabin; ordinary motor, linkages and well behind occupants ahead of rear boot. Shared reference car locates the system and does not simulate the roof. |
| 30 — overview | **Corrected / illustrative:** centring/catch, cloth/glass, one motor/two gearboxes, seals and filtered side pans; functional connection topology only. |
| 65 — assembled cutaway | **Confirmed / illustrative:** closed frame under cloth, rigid rear pane in aperture, motor beside the well; no claim of exact factory packaging. |
| 100 — separated assembly | **Corrected / illustrative:** nine identification groups including separate seals; glass remains rigid and offsets reverse without defining a removal order or opening pose. |

## Every component/topic group in the manuscript

| Topic | Evidence / disposition |
| --- | --- |
| Cloth, headliner, wires, bows and frame | **Corrected / confirmed:** 811-000/005. Narrow prose identifies the separate moulded headliner, tension wires and heating loom. Shape/folding remains illustrative. |
| One motor, two rotary shafts, paired gearboxes, rods and cover | **Confirmed:** 811-012/013. Original topology retained. Factory drawing does not establish continuous motion/timing. |
| Manual catch, centring and electrical controls | **Corrected / confirmed:** 811-000 items 4/8; handbook pp. 182–185; WM 616419 front-lock microswitch. New prose distinguishes paired location guides from retention. Every other switch location and precise control sequence **unresolved**. |
| Operating time/speed, cold/clearance conditions and completion messages | **Confirmed from operating/sales primary evidence, not PET:** UK brochure p. 80, North American handbook pp. 168, 182–185 with its regional scope retained. No workshop bypasses or new procedures. |
| Door glass, handle sensing, regulator, stored end position | **Corrected / confirmed:** 804-020/030 and handbook pp. 18, 27–28. Two guide rails and separate motor now explicit. Front-glazing page 805-000 preserves ordinary/Spyder glass differences; no motor suffix inferred independently of LHD/RHD. Exact short-drop calibration **unresolved**. |
| Roof, B-pillar, arch, door-opening and door-top seals | **Corrected / confirmed:** 811-010, 804-010. Separate retaining strips and adjacent door-seal distinctions added. Contact/compression explanation is general mechanics; actual profiles/settings **unresolved**. |
| Rear-glass heating and windstop ventilation | **Confirmed:** 811-000 item 9 plus brochure p. 80 and handbook pp. 31, 189. Heating is separate from sealing/draining. |
| Side pans, filters, pipes, plates, compartment seal and hoses | **Corrected / confirmed:** 812-000 items 12/13/24, 811-012 item 25, 811-013 items 9/10. Prose prevents treating all as one drain hose. Complete concealed network/capacity **unresolved**. |
| Debris, blockage, ingress and filter running change | **Confirmed by Porsche TI 29/09 ENU 5393:** date 31 August 2009, earlier-car retrofit and continuing inspection. PET alone does not date the change. No service-position/fitting steps copied. |
| Hood colours, hardtop option 550, deflector option 551 | **Confirmed by dated UK 01/10 brochure:** options/codes/colour names retained; later PET is not substituted for annual availability. Full annual UK choice sequence **unresolved**. |
| Hardtop mounting, seals, glass, heating, interior trim and accessory distinction | **Confirmed:** 811-015/016; dated Tequipment 801-51; handbook pp. 190–193. Separate catches/supports/inserts/wire set and trim now located in existing source note. PET bare shell explicitly lacks accessories; no blanket Spyder fitment/current stock claim. |
| Three-piece wind deflector and mounts | **Confirmed:** 812-001 items 2/3/4/6; dated brochure p. 81. Outer pieces/centre/mountings separate from rollover structure; original optional status comes from brochure. |
| Other 2.9 years and S | **Confirmed within evidence:** shared service-architecture coverage, launch brochure broad features and dated filter change. No claim of unchanged annual suffixes or every option. |
| Spyder sunshield/weather protector | **Confirmed:** explicit PR:778 plates 811-003/008, distinct side pans in 812-000; UK Spyder brochure pp. 20–21/41. Manual/two-piece roof, stowage, mass and closed-hood limit derive from brochure. No powered ordinary mechanism transplanted. |
| Black Edition | **Confirmed by 03/2011 UK price list/release:** powered black hood and standard wind deflector retained. PR:013 service covering alternative is not used to invent a 2010 option. |
| Symptoms, materials ageing and care | **Illustrative / confirmed boundaries:** symptom table offers possibilities, not a single-part diagnosis; handbook pp. 215/218 supports care. No PET exploded drawing proves material fatigue or diagnostic causation. |

## Existing photographs

The five original Porsche brochure JPEGs remain unchanged and keep [their source/rights notes](../images/credits.md): `ordinary-roof-closed.jpg` / `ordinary-roof-folding.jpg` identify the powered roof and cover; `ordinary-wind-deflector.jpg` identifies the three-piece assembly; `ordinary-hardtop.jpg` identifies the option; `spyder-sunshield.jpg` shows the separate lightweight arrangement. PET sheets corroborate component identity, not the photographed car's exact trim or original option order. Brochure photos are not installation-coordinate evidence.

## Checks and remaining integration

Narrow checks: chapter MDX parses, unchanged heading/diagram IDs and exact footnote-reference order/count, all five SVGs parse as XML, nine-group assembly imports successfully with finite geometry and valid connection endpoints/kinds. Factory PNG signatures/dimensions and all local manifest links are checked. Parent owns central `roof-explorer` poster regeneration and final live/static figure checks at phone/tablet/desktop sizes. No other static SVG or sequence/drainage module required correction in this pass. No new original-source footnote reference was inserted.
