# Chapter 18 verification inventory

Checked 10 November 2026. **Confirmed** means the named identity/relationship is supported. **Illustrative** means the educational geometry/function remains deliberately schematic. **Corrected/expanded** records this pass's material improvement. Factory pages and applicability are itemised in [README](README.md).

## Component topics

| Chapter topic | Evidence and disposition |
| --- | --- |
| Passenger space, deformation and seat location | **Confirmed; illustrative geometry.** UK 01/10 pp. 66–67 establish the restraint/structure concept; chapter 04 owns the shell and load paths. PET 801-020 items 1/2 support floor/seat-support identity; 809-004 and 817-006 support dashboard/backrest attachments. No crush geometry, impact load or survivable space inferred. |
| Three-point belt routing, anchors and buckle | **Corrected/expanded.** PET 812-000 items 1–11 show the joined rear structure, guide/retractor, separate latch and mounting hardware. Seat-mounted buckle support is now explicit in prose, static illustration and explorer connection/geometry. Upper rear-bar guide and outer lower body anchorage remain distinct. The Black Edition period UK safety list explicitly names seat-mounted buckles. |
| Reel locking, pretensioning, force limiting | **Confirmed as separate functions; hidden hardware illustrative.** Porsche MY2010 handbook pp. 42–43 supports normal reel/deceleration locking, single-use tensioners and fault indication. NHTSA operating sources support slack removal and controlled yield. PET 812-000/902-010 names tensioner connection hardware, but is not used to invent the exact Porsche internal limiter/tensioner design, force, travel or timing. |
| Front airbags | **Confirmed; support detail expanded.** UK brochure pp. 66–67 and PET 403-006 items 1/2/4/14 establish wheel/dashboard modules. Those alternative wheel modules are not extra installed bags. PET 809-004 items 18/19 supports the passenger bracket; item 3 in 403-006 identifies the steering contact unit. Module packs/internals remain schematic. Explorer explicitly labels LHD geometry and reversed UK RHD front positions. |
| POSIP thorax modules | **Confirmed; attachment detail expanded.** UK brochure p. 67 locates the two outer-seat thorax bags and gives the approximate volume. PET 817-006 items 1/2/3/5/14 show frame, carrier, wire set, module and fastener; 817-021 covers the sports-seat family. Added carrier/fastener detail and ordinary-seat scope to the explorer. |
| POSIP door head modules and door protection | **Confirmed; inflator detail expanded.** UK p. 67 identifies door head bags and door impact elements; PET 403-006 item 6 shows the long module and separate cylindrical inflator; PET 902-015 identifies separate airbag wire sets. The explorer now distinguishes the external inflator from the folded pack. It does not show a roof curtain, upward deployment trajectory or event outcome. |
| Restraint control unit, sensors, wire sets, diagnosis | **Confirmed; prose expanded.** PET 403-006 items 8/10/12 identify the control unit and side/front sensors; 902-010/902-015 identify separate module/tensioner leads. Handbook pp. 44–45/48 supports directional/severity assessment and diagnostic indication. No sensor installation coordinates or exact network topology were added to the spatial explorer. |
| Child-seat preparation | **Confirmed, retained.** UK 01/10 p. 67 specifically identifies Tequipment ISOFIX bracket plus passenger-airbag key switch, excluding sports buckets. PET 817-008 items 7/8 confirms the bracket/attachment kit on the seat frame; 903-005 items 4/11 identifies the separate switch and warning lamp. US passenger-weight sensing is kept market-specific. PET's general airbag/connector listings do not override this dated UK statement. No child-seat fitting/deactivation procedure added. |
| Permanent rollover structure | **Confirmed; joined assembly clarified.** UK pp. 66–67 gives the reinforced windscreen frame and high-strength steel rear bars/upper belt anchors. PET 812-000 item 1 shows both rear hoops joined in one fixed bolted assembly, separate from covers and roof hardware. Added outer mounting webs/guide brackets in the explorer. No pop-up operation, clearance or roof-load prediction. |
| Bend, tyres, suspension, differential and wheel forces | **Confirmed as a functional synthesis.** Mechanisms remain owned by chapters 10–13. PET restraint drawings cannot validate tyre-force predictions; none are added. |
| Pedal demand/DME and manual control | **Confirmed function, retained.** Bosch pedal module and Porsche training p. 58 support demand/control. Manual clutch and selector actions are different from electronic PDK handover. No wiring map or control timing inferred from the airbag plate. |
| Optional PDK cooperation | **Confirmed function, retained.** Porsche training pp. 72–74/102 and UK brochure pp. 42–45. Mode-dependent torque treatment remains qualified; no universal torque cut or measured shift overlap. |
| PSM, brake prefill, hydraulic assist and ABS | **Confirmed function, retained.** Handbook pp. 63–65 and training pp. 120–121. Examples assume normal modes/PSM on; additional assist qualifications remain explicit, distinct from vacuum boost/ABS. These are driving functions, not crash deployment triggers. |
| Sport Chrono/Plus, PCM, PASM | **Confirmed equipment dependence, retained.** Dated UK 01/10 pp. 54–57/107, codes 639/640/475: Plus requires PCM; PDK/PASM remain separate; Sport Plus/Launch Control require PDK+Chrono. No increase in rated 2.9 output and no spring-rate or ride-height control attributed to PASM. PET is supporting identity only. |
| Other model years and derivatives | **Confirmed limits, expanded bucket detail.** Period ordinary UK launch/01/10 brochures establish layout; annual hidden sensor/software continuity stays unresolved. Spyder brochure retains restraints; PET 817-036 item 7 explicitly retains PR388/389 bucket side airbags with different suffixes from ordinary seats. Black Edition UK 03/2011 safety/equipment distinctions remain. No whole-assembly interchangeability assumed. |
| Identification and ageing | **Confirmed limits, retained.** Installed seat/module identity, diagnostics and physical condition remain distinct. No restraint service instructions or inspection guarantee added. |

## Every static image and SVG

| Asset | Evidence and disposition |
| --- | --- |
| `images/belt-functions.svg` | **Corrected.** Seat-mounted inboard buckle now named in the description and visible text and shown with a seat-support mark; load path explicitly includes body/seat. Three functional panels remain generic; arrow lengths/hidden mechanisms are not Porsche calibration. PET 812-000 backs part relationships; NHTSA/handbook back operation. Parent rendered and visually inspected this edited standalone SVG; complete-reader/all-width checks remain with integration. |
| `images/fixed-rollover-structure.svg` | **Confirmed; illustrative.** Both side and transverse views agree with permanent rear hoops and upper guides in PET 812-000. Existing transverse base already joins both sides. PET 801-045 items 1–5 separates the scuttle frame and A-pillar reinforcement; the UK brochure establishes its steel construction. No change required. |
| `images/porsche-posip-2010.jpg` | **Confirmed factory original, visually inspected.** Ordinary S illustration, correctly credited; p. 67 text applies to ordinary Boxster/S. Six inflated bags indicate positions, not simultaneous firing. JPEG is not changed. |
| `diagrams/protection-system-scenarios/poster.svg` | **Confirmed functional fallback.** Initial acceleration/manual state, separate permanent structure. This static SVG is not an exploded parts drawing or crash simulation. No change required. |
| `diagrams/protection-explorer/poster.svg` | **Regenerated and checked by parent.** `protection-explorer` now reflects the updated model/config, with vector labels and installed-car inset retained. Parent rendered/visually inspected all four current chapter SVGs and reran nine geometry/math/model tests successfully. |

## Every interactive ID and state

`protection-system-scenarios` has ten combinations. Existing native select controls, IDs, AbortSignal lifecycle and state keys are retained; source audit found no contradiction requiring a behavioural change.

| Situation | Manual focus | Optional PDK focus | Disposition |
| --- | --- | --- | --- |
| `acceleration` | `dme` | `dme` | **Confirmed functional map:** pedal/engine inputs → DME → torque actuators; transmission route is explained separately. |
| `shift` | `driver` | `pdk,dme` | **Confirmed:** driver clutch/selector versus coordinated PDK/DME handover. No actual shift animation or universal torque cut. |
| `grip` | `psm,dme` | `psm,dme` | **Confirmed conditional example:** selected-wheel brakes and engine torque as needed. Does not predict both will always act. |
| `braking` | `psm` | `psm` | **Confirmed conditional example:** prefill, assist and ABS have distinct conditions; normal-mode/PSM-on assumption and mode exclusions remain visible. |
| `impact` | `restraint` | `restraint` | **Confirmed role only:** sensing → assessment → conditional tensioner/inflator commands. PET backs distinct controller/sensor/module hardware, not thresholds/sequence. All six bags are not commanded together. |

Every combination retains `protectionDeploys = not-predicted` and `protectionFixedStructure = present`; unknown state falls back to acceleration/manual. Manual is standard, PDK optional. No timing, automatic animation or outcome calculation is introduced.

`protection-explorer` retains eight selectable groups and all four tour stages:

| Tour stage | Evidence and disposition |
| --- | --- |
| 0: car location | **Illustrative:** installed cabin positions; fixed frame/rear bars and distinct module regions. Front module geometry is LHD, explicitly qualified for UK RHD. |
| 30: reveal structure | **Confirmed topology, illustrative geometry:** floor/seat support, joined rear-bar assembly and belt-anchor relationships. Sheet metal/trim omitted; not a body repair map. |
| 65: assembled system | **Expanded:** buckle stalk reaches the seat support; front passenger bracket, steering contact ring, thorax fasteners and door inflators distinguish neighbouring parts. |
| 100: separated groups | **Illustrative:** offsets reveal eight groups; they are not removal directions, rollover-bar extension or airbag deployment. Scrubbing uses the existing absolute-position viewer. |

| Selectable part | Evidence and disposition |
| --- | --- |
| `passenger-cell` | UK brochure/chapter 04 and PET 801-020 items 1–4; schematic floor/seat/side supports. No new load map. |
| `windscreen-frame` | UK brochure pp. 66–67 and PET 801-045 items 1–5; fixed steel reinforcement with glazing omitted. Approximate shape retained. |
| `rear-bars` | PET 812-000 item 1; **expanded** connected assembly, outer webs and upper-guide brackets, fixed to body. |
| `seats` | PET 817-006 frame family; ordinary seats/runners, seat-owned latch mount. Options not rendered as standard buckets. |
| `belt-system` | PET 812-000 items 2/4/5/7–11; **expanded** seat-mounted latch stalk/bolt, reel and upper/lower routes remain separate. |
| `front-modules` | PET 403-006 items 1/2/3/4/14 and 809-004 items 18/19; **expanded** support bracket/contact ring; LHD qualification. No exact bag folds. |
| `seat-modules` | PET 817-006 items 2/3/5/14; **expanded** carrier/fasteners/electrical interface. PR388/389 bucket alternatives described, not substituted. |
| `door-modules` | PET 403-006 item 6/7 and 902-015 wire set; **expanded** long folded pack, separate cylindrical inflator and short indicative joining passage. No inflator internals or expansion path. |

Nine connection records are checked: passenger-cell→windscreen-frame, →rear-bars, →seats, →belt-system and →front-modules; rear-bars→belt-system; **new seats→belt-system**; seats→seat-modules; passenger-cell→door-modules. All are `structure`, deliberately separate from unspecified electrical pinouts. Dedicated connectors in the geometry identify electrical interfaces without inventing a controller location or wiring network.

## Checks and remaining limits

- The period UK brochure was freshly rechecked at printed pp. 54–57, 66–67 and 107; the Sport Chrono and restraint spreads were also visually inspected from the cached original after web PDF screenshots returned a cache miss.
- Every saved factory drawing was visually inspected, with key applicability pages also inspected as rendered images; list text was checked directly from the same PDF. None is described as an original project illustration.
- Chapter SVG XML parsing, JavaScript syntax checks, eight direct selectable group identities, nine connection endpoints/types, finite mesh positions/normals, metadata and assembly bounds passed. Geometry contains 157 meshes within approximately X ±0.751 m, Y 0.25–1.199 m, Z −0.625–0.876 m.
- Published heading text/IDs, diagram IDs, 19 footnote-reference occurrences/order and all 13 footnote definition IDs are preserved. Existing source notes are augmented rather than inserting new notes.
- Parent completed poster regeneration, all four SVG renders/visual inspection and nine geometry/math/model tests in this pass. Parent owns the subsequent integrated builds and full-reader/all-width browser validation. No earlier implementation result is claimed as a new check.
- Exact UK hidden restraint part suffixes by VIN/build, sensor mounting coordinates, electrical routing, deployment thresholds/trajectories, load/clearance capability and annual calibration changes remain unproved. PET's later service variants do not close those gaps.
