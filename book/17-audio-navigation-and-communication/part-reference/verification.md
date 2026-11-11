# Chapter 17 verification record

Completed **10 November 2026**. Every chapter manuscript section, photograph, static SVG, interactive module, explorer group and named connection was read. All twelve saved factory pages were visually inspected, including the three actual drawings, and their list entries were checked. [Source identity, files and applicability](README.md).

## Component and topic coverage

| Topic | Factory evidence | Operational evidence / disposition |
| --- | --- | --- |
| Standard source, tuner, CDR-30 case/controls and integral single CD | 911-000 pp. 566, 568–569, item 1 PR695 | UK 01/10 p. 82 and training p. 167 establish functions and four-speaker baseline. Confirmed; optional changer is not silently modelled. PET's reused front-panel art is not used to redraw the period unit. |
| Output stages, electrical supply/earth and moving-coil sound | PET does not expose head-unit electronics or transducer sections | Training p. 167 supports integral 2 × 25 W stages. Supply/current/force/cone principles remain generic educational explanations, with schematic board and cable geometry. No factory internals, crossover or fuse location claimed. |
| Dashboard tweeters and door bass drivers | 911-005 pp. 579–580, items 1–2, 7–8, PR441 | Confirmed identities; improved explorer to represent two retaining clips per tweeter and four bolts per bass housing. Magnets, coil, dome/cone and support sections remain generic. |
| Sound Package Plus | 911-000 p. 573 item 4; 911-005 p. 580 items 1, 3, 5, 7 PR490 | Training p. 168 / UK 01/10 p. 87 establish analogue fully active system, 7 speakers/185 W. Added centre and door-midrange positions, separate bass-driver variant and complete live-figure breakdown. |
| BOSE amplifier, drivers, centre and rear enclosure | 911-000 p. 573 item 4; 911-005 pp. 579–580 PR680 | UK 01/10 pp. 88–89 / training pp. 180–181 establish eleven drivers, 7 channels/385 W and processing. Added enclosure-as-assembly distinction; PET does not enumerate all internal transducers. AudioPilot is not confused with telephone speech capture. |
| PCM, touchscreen, HDD/GPS navigation, prompts and map updates | 911-000 pp. 567, 573 items 1, 9, 12 | Training pp. 169–174 / UK 01/10 pp. 83–85 control the integrated architecture and functions. GPS reception, stored maps and audible guidance remain distinct. No factory internal layout inferred from PET. |
| Radio aerial, signal amplifier and reception connections | 911-000 pp. 566, 573–574 items 13–19 and unnumbered PR695 cable | Added aerial signal amplifier inside the existing explorer group and distinguished it from speaker amplification. Antenna pattern, amplifier location, complete diversity topology and cable path remain illustrative/unresolved. PR440 or PR461 hardware is not treated as standard. |
| Six-disc changers and CD/DVD formats | 911-000 pp. 567–569 item 1 PR692/693 variants | UK 01/10 pp. 82–84 / training p. 180 establish integration and source-drive distinctions. PCM/BOSE DVD 5.1 does not require the optional changer. CDR gets no DVD capability. |
| Analogue audio versus MOST / recorded versus derived surround | PET identifies amplifier assemblies, not programme transport | Training p. 171 drawing 9_26.2_09 and pp. 180–181 remain controlling. MOST assigned only to PCM/BOSE in this diagram. Exact CDR/BOSE transport remains unclaimed. |
| Universal audio interface, external player, AUX/USB/iPod and return control | 911-000 pp. 574–575 items 29–32, PR665/695 with PR870 | Confirmed separate interface/cable identities. Dated UK 01/10 pp. 86–87, 117–118 controls **CDR AUX-only versus PCM AUX/USB/iPod**; PET does not expand compatibility. |
| HFP preparation, optional cradle, microphone and cellular link | 911-010 pp. 581–583 items 1–2, 7, 9–20, 25, PR618/619 and LHD/RHD | UK 01/10 p. 86 / 08/08 p. 117 and training p. 178 establish phone-radio role and compatible cradle exception. Pairing establishes neither a successful call nor music streaming. |
| PCM GSM module, direct SIM, SAP, handset and voice control | 911-010 pp. 581–583 items 7–8, 12, 22–25, PR666/669/671 | Training pp. 169–171, 177–179 / UK 01/10 pp. 85–86, 118 establish functions. Microphone variants and service modules do not imply every part fits every option. Handset cannot handle HFP calls; no current network guarantee. |
| Logbook, Sport Chrono Plus, S/Spyder/Black Edition, model years and retrofits | 911-000 p. 573 lists PR641 software; later parts chronology is insufficient | Existing dated UK/launch/Spyder/Black Edition evidence retained. No new retail or annual hardware/software claim derived from PET; PCM/490 dependencies and non-original CarPlay/Android Auto wording unchanged. |
| Identification/ageing and installed equipment | Catalogue variant lists support checking assembly/equipment identity | Faceplate, sockets, badges, amplifier and build record remain complementary clues. Fault-chain prose is qualitative, with no workshop diagnosis or repair procedure. |

## Complete figure and asset coverage

| Asset / interactive ID | Disposition and boundary |
| --- | --- |
| `images/audio-amplification.svg` | Confirmed functional separation of source information, DC energy, output current and sound. Generic moving-coil section; PET does not establish its internal geometry. Retained without churn. |
| `images/telephone-paths.svg` | Confirmed HFP/direct-SIM/SAP roles against period sources; optional microphone/aerial/module identities corroborated by 911-010. Cradle omission remains visible. Functional relationships, not RF/wiring routing. Retained. |
| `diagrams/audio-source-path/index.js` / ID `audio-source-path` | All five source choices, two head units, three sound packages and interface dependency branches read. Added the seven-speaker Plus distribution; all existing availability rules retained. No arbitrary animation or simulated amplifier performance. |
| `diagrams/audio-source-path/poster.svg` | Confirmed initial CDR/radio/standard/no-interface route. Its initial-state strings/geometry are unchanged by the Plus detail; retained. |
| `diagrams/audio-explorer/index.js` / `model.js` / ID `audio-explorer` | All stages 0/30/65/100, eight groups and eight connections checked. Added factory-backed reception amplifier and speaker mount counts inside existing groups. Separation is illustrative, never removal order. Parent regenerates poster. |
| `diagrams/audio-explorer/poster.svg` | Regenerated and visually checked during parent integration; its eight labels and assembly detail agree with the live model. Both standalone schematics and the source-path fallback were also rendered and visually inspected afresh. |
| `images/cdr-30-period.jpg` | Original UK 01/10 p. 82 photograph and caption retained: **optional integrated six-disc changer**. Factory drawing is not used to remove this qualification. |
| `images/pcm-3-period.jpg` | Original UK 01/10 p. 83 photograph and caption retained: optional PCM/navigation, separate speaker choice. |

No other chapter SVGs, interactive IDs, animation modules or chapter-owned explorer models exist. The source-path diagram redraws selected routes; it is not a time-based simulation. The explorer interpolates display poses, not physical dismantling or speaker motion.

## Explorer groups, tour and connection audit

| Existing selectable group | Factory match / retained limits |
| --- | --- |
| `head-unit` | 911-000 item 1 PR695; CDR appearance checked against period photo, integral single drive against dated source. Case/board placement remains schematic. |
| `output-stages` | Integral stages established by training, not a separately catalogued factory box. Its display separation exposes the teaching cutaway only. |
| `left-tweeter` | 911-005 items 1–2 PR441: left dashboard driver, approximate clip positions and generic section. |
| `right-tweeter` | Same reference for right dashboard driver; no handed internal construction asserted. |
| `left-woofer` | 911-005 items 7–8 PR441: left door bass housing/four bolts. Dimensions/section illustrative. |
| `right-woofer` | Same reference for right door bass housing; no Plus/BOSE driver silently substituted. |
| `windscreen-aerial` | 911-000 item 13 / PR695 lead supports reception amplifier identity. Existing stable group ID retained; windscreen/conductors remain context, with no exact installation map. |
| `vehicle-supply` | Electrical energy/return context; owning electrical chapter covers supply. Generic battery/cables do not assert fuse, connector or harness positions. |

All eight existing connections remain: reception group → head unit (**signal**); supply → head unit and output stages (**electrical**); selected programme → output stages (**signal**); output stages → each of four speakers (**electrical**). These express functions and reach every group; they do not specify crossover topology or separate power-stage circuits. Whole-car location, connections, installed assembly and display separation all retain the standard four-speaker 2010 2.9 baseline. Manual/optional PDK does not alter this audio example.

## Checks and remaining limits

Post-edit checks passed: all three chapter JavaScript modules pass `node --check`; the actual explorer import yields **8 groups, 8 connected links and 168 finite meshes** within the installed-car envelope; all **10 existing source-availability cases** still pass; all **4 SVGs** parse with titles/descriptions; the exact sequence of **18 footnote references** and all **9 headings** matches the pre-edit manuscript; reference-page links resolve; scoped `git diff --check` passes. No global build, browser launch, staging or commit was performed here. Parent regenerated **`audio-explorer`** and checked the edited **Sound Package Plus** source-path state at 390, 768 and 1440 pixels: no clipped labels, page overflow or runtime errors. No standalone SVG artwork changed.

Unresolved evidence remains explicit: exact baseline antenna pattern/coordinates, complete CDR/BOSE network topology, internal factory transducer/electronics geometry, full annual UK software history, present phone/network/device compatibility, and VIN-specific replacement selection. PET cannot close those gaps.
