# Chapter 06 parts and figure verification

Checked 10 November 2026 against the visually inspected factory drawings and parts lists indexed in [README](README.md), then compared with the period technical and mechanism sources in [research](../research.md). The reference remains the 2010 European/UK A120 2.9, manual standard and PDK optional. No chronological or option-availability inference is made from PET's 2018 snapshot.

## Every existing figure and interactive module

| Asset / ID | Evidence and scope | Disposition |
| --- | --- | --- |
| `images/air-path.svg` | 106-000 items 8/14/16; 107-010 bank distributors, centre tube, vacuum units; 107-007 six port injectors. Training p. 59 supplies operating description. | **Corrected/detail added:** cylindrical pleated filter and vacuum operation now explicit. Functional sequence remains deliberately unlike installed hose routing. |
| `images/injection-location.svg` | 107-007 A120 versus 107-005 A121; training pp. 41–42/59 supplies pressures and injector location. | **Confirmed, illustrative:** upstream port versus in-cylinder location and separated pressures correct. Section geometry, valve position, spray and timing remain explicitly approximate. |
| `images/fuel-supply-and-vapour.svg` | 201-000/005/020 distinguishes tank, pump/gauge, feed, breather, canister and purge line; training p. 39 supplies the MPI regulator description. | **Confirmed, functional:** liquid and vapour branches are separate; filter/regulator block is a functional grouping, not a factory module explosion. Canister/regeneration operation uses HELLA, not inferred PET arrows. |
| `images/crankcase-ventilation.svg` | 104-002/005/010 separation hardware, external separator and breather lines; training p. 19 establishes blow-by/pre- and fine separation. | **Confirmed, functional:** gas to intake and oil recovery are distinct from tank vapour and oil-pressure supply. Manuscript now makes explicit that the single block groups several components. Internal sequence/pressure is not inferred from the parts drawing. |
| `diagrams/engine-mixture-feedback/index.js`, ID `engine-mixture-feedback` | 106-000 MAF, 107-007 injectors, 901-003 DME, 202-000 lambda probes; training pp. 53–54/58 identifies upstream sensing. | **Confirmed, illustrative:** existing sensor → DME → injector loop; extra-air 0–20% and correction 0–8 controls. Each step removes 60% of remaining normalised fuel deficit. Abstract steps are not a timing animation, calibration or diagnostic verdict. No code change required. |
| `diagrams/engine-mixture-feedback/poster.svg` | Static counterpart of the preceding loop and 10% initial extra-air case. | **Confirmed, illustrative:** retained; no unverified hardware or physical timing implied. |
| `diagrams/intake-explorer/index.js`, ID `intake-explorer` | Thin chapter module delegates controls/lifecycle to the shared explorer and imports the chapter model. | **Confirmed:** existing ID, native tour, selection and static-fallback conventions retained. |
| `diagrams/intake-explorer/model.js` | 106-000/107-007/107-010/901-000/003; inherited left inlet and broad electronics location have separate workshop evidence in research. | **Corrected/detail added:** flat filter replaced by cylindrical pleated element; flexible MAF–throttle guide/clamps; manifold sleeve/clamp joints, two vacuum units and change-over valves; connected two-bank fuel pipe, feed stub, six clips and both injector seal sets. Still eight selectable groups. |
| `diagrams/intake-explorer/poster.svg` | Generated from the chapter model/config, including its geometry and limits. | **Regenerated and visually checked during parent integration:** the cylindrical filter and updated connections now match the live assembly. The flat-filter render is superseded. |
| `images/sport-chrono-stopwatch.jpg` | Period January 2010 Porsche UK brochure p. 57 and existing image credit. | **Confirmed:** real sourced equipment photo; unrelated to hidden engine fitment. PET cannot replace the dated brochure as option evidence. |

These are all **six SVG assets** (four static images and two posters), **two interactive IDs**, **one chapter-owned 3D model/tour**, and **one photograph** present in the chapter. No autoplay animation exists.

## Every selectable 3D group and tour stage

| Group | Check and outcome |
| --- | --- |
| `left-inlet` | Inherited factory workshop evidence identifies left induction opening, distinct from right engine-bay ventilation. Internal inlet duct remains approximate; no mirror-image induction pair added. |
| `air-cleaner` | 106-000 item 8 is cylindrical, with cover 3 and retaining plate 9: corrected former flat element and made cylindrical pleats/end rings visible in a cutaway housing. |
| `maf` | 106-000 items 13–17: sensor/airbox seal and clamped flexible guide before throttle. Added connecting sleeve/clamps/ribs; housing and sensor insert remain simplified. |
| `throttle` | 107-010 item 10 and seal 9: distinct motor/butterfly unit before centre tube. Existing actuator/feedback teaching retained, without cable linkage or fixed pedal-angle claim. |
| `plenum-runners` | 107-010: two A120 distributors, six seals, sleeve/clamp joints, centre tube, two vacuum units and two change-over valves. Added the missing outer actuators/links and joints within this existing group. DME signal connection now names valve-mediated vacuum control. |
| `ports-injectors` | 107-007: one connected pipe assembly, six injectors, clips and two seal sets. Added bank crossover, short feed stub, six clips and twelve seals. Approximate runner/flange positions remain; no DFI pump. |
| `coils-plugs` | 901-000 lists six of each. Retained direct coil-to-plug grouping, independent of fuel/air path; no distributor or central high-voltage harness. |
| `dme` | 901-003 distinguishes BOXSTER and S part entries; only broad rear-left region is represented. Existing ME 7.8.2 label follows training. No S bracket/connector identity inferred. |
| Whole car, slider 0 | Locates left induction opening and rear engine relative to the cabin; shared car geometry is untouched. Exact hidden coordinates remain approximate. |
| Connections, slider 30 | All ten named edges have existing component endpoints. Airflow edges remain distinct from sensor/actuator commands; the new vacuum-control command does not depict fuel flow. |
| Assembled, slider 65 | Six runners and injectors, connected bank pipes, MAF–throttle sleeve and vacuum apparatus supply useful assembly detail. Camera/envelope checks run locally; parent supplies final rendered inspection. |
| Separated, slider 100 | Same eight groups with existing reversible absolute offsets. Exposure is for inspection, not operational travel or factory removal order. No invented mechanical motion is added. |

## Every component-topic group in the manuscript

| Component topics | Evidence / outcome |
| --- | --- |
| Left intake, airbox, filter, MAF, air guide, throttle and joints | 106-000; 107-010; factory workshop location. **Corrected** cylindrical filter; **added** installed sleeve/clamp relationships. |
| Bank manifolds, runners, centre tube, resonance/distribution flaps, vacuum units, change-over valves | 107-010 with A120 entries; training p. 59. **Added** actuators and joints; published 3,800/5,500 rpm wording retained without turning it into a full control map. |
| Pedal, motor and throttle-position feedback | 702-010 manual/PDK pedal alternatives; 107-010 throttle identity; Bosch principles. **Confirmed** torque request rather than cable or one-to-one angle. |
| Front tank, filler, pump, level sender, filter/regulation and engine feed | 201-000/005 plus training p. 39 for regulation. **Confirmed** sender/pressure distinction, separate A120 pump entry, no S high-pressure stage. UK RHD tank differences recorded in references. |
| Fuel pipe, six port injectors, clips and seals | 107-007, training p. 59. **Added** connected assembly, clips and both sealing interfaces. Eight-hole/4-bar system description preserved. |
| S/Spyder/Black Edition DFI, high-pressure pump, pipes, injectors | 107-005 A121 and period training/brochures. **Confirmed comparison only**; no S hardware moved into the reference model. |
| Tank breather, activated carbon, purge pipe and control | 201-005/020; intake workshop text and HELLA mechanism. **Confirmed** separate vapour path, without market-specific leak-test/calibration inference. |
| Blow-by, oil separation, pressure control, breather connections and oil recovery | 104-002/005/010, training p. 19. **Clarified** several physical components behind the single functional block; no separator cutaway or diagnostic vacuum value invented. |
| Coils, plugs and electronic drivers | 901-000; training pp. 49–50, Bosch coil principle. **Confirmed** six individual coil/plug units and period plug description. |
| Knock sensors and cylinder-selective retard | 101-005 item 24 and training p. 49. **Confirmed** two acoustic sensors; no false oxygen-sensor equivalence or knock timing map. |
| Crank and cam position, engine/coolant temperature, throttle feedback and DME | 101-005/103-000/105-003/107-010/901-003, Porsche input/output diagram and training. **Confirmed** distinct sensor jobs; engine-bay-temperature item 21 is not called coolant temperature. |
| Upstream wideband sensing, between-brick switching probes, catalyst monitoring and mixture correction | 202-000 plus precise training pp. 53–54/58; Bosch lambda principle. **Confirmed** bank-specific arrangement, abstract feedback and heating limits. PET's broad “after” wording is not substituted for training's between-brick sequence. |
| Secondary-air pump, valve, hose and bank connection lines | 108-005 A120, training p. 60 and HELLA principle. **Added** concrete air-delivery components in prose, distinct from induction, purge and DFI warm-up. |
| Optional Sport Chrono, throttle response, manual versus PDK communication | Dated UK brochure and training p. 58. **Confirmed** separate option/equipment scope and unchanged peak rating; PET not used as retail-option proof. |
| Model-year continuity, derivative comparison, identification/ageing | Existing dated Porsche evidence retained. **Unresolved limits retained:** no complete annual UK hardware/software history, ECU maps, current replacement recommendations or part-specific failure rates. |

## Checks and remaining integration

Local checks cover chapter JavaScript syntax; eight unique/selectable groups; ten valid connected edges; finite vertices/normals; installed envelope; assembled/exploded framing at phone and desktop aspect ratios; the feedback calculation; XML parsing for all six SVGs; unchanged heading list and footnote-reference sequence; resolved local imported images; all 36 saved PNG names/pages/plates; and chapter-only whitespace checks. No shared files, global build, global tests, poster generator, staging or commits are run by this chapter task.

Final browser rendering and the changed `intake-explorer` poster are owned by parent integration. The system Quick Look thumbnail command failed within the local sandbox, so no additional local raster-preview claim is made for the edited air-path SVG. Its two changed labels fit the existing text blocks and retain accessible title/description metadata.
