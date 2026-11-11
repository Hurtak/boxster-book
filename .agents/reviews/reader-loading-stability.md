# Reader loading stability

Reviewed 11 November 2026. This review covers loading and navigation behaviour, not changes to the mechanical content or reference-car geometry.

## Reproduction

The supplied slow-network recording showed the static poster being replaced by a taller live car panel. With GLB requests held, the front-brake panel at a 390-pixel viewport grew from 1083.5 to 1527.6875 pixels when its complete controls and explanation arrived. The initial HTML also exposed the cover before hydration selected a deep-linked chapter. All 163 manuscript/cover images lacked a complete intrinsic width/height reservation.

## Changes

- Extract intrinsic SVG, PNG, JPEG and WebP dimensions during asset collection and render matching width/height attributes in both prerendered and hydrated output. Images keep their established responsive styles.
- Set a pending state in the document head before the first paint. Reveal the requested chapter after fonts and its lightweight interactive panel layouts settle, then perform the final anchor scroll. Cancel superseded route work. Same-chapter section and source links do not reload the reading sheet.
- Keep the navigation visible during chapter preparation and show a paper-coloured loading placeholder in the reading area. The cover stays hidden during chapter startup.
- Construct complete car-panel controls and retained-state explanations before fetching models. The shared viewer and dedicated brake viewer announce their measurable layout, wait until near the viewport, then download and render their scenes.
- Retain measured diagram reservations through loading, offscreen disposal and chapter changes. Show a quiet placeholder until the live host is ready. Static posters remain available on failure, without JavaScript and in print.
- Fail open to the prerendered manuscript if the reader script fails. Browser-only initialization still happens after hydration; no additional server or dependency is required.

The optional `whenVisible` promise and `diagram-layout` event are documented in `interactive/README.md`. Future asynchronous viewers should follow that sequence rather than waiting for model downloads before constructing their panels.

## Verification

`npm test` passes all **48 tests**, including TypeScript checking and portable, web and Pages builds. The suite checks every chapter, all 39 interactive diagrams and all 15 component tours at phone, tablet and desktop widths, plus offline operation, hydration, lazy assets, saved diagram state, navigation/history, note links, print and static fallbacks.

New regressions deliberately delay the reader entry script, GLBs and image requests, and abort the entry script. They verify that the cover is hidden before hydration, every image has intrinsic dimensions, a photograph and SVG keep their height/position after decoding, and the failed-script edition remains readable. Existing manuscript preservation fixtures pass without being changed for this loading fix.

| Viewport width | Viewer | Before GLB delivery | After GLB delivery | Change in following-content position |
| --- | --- | --- | --- | --- |
| 390 px | Brake | 1527.6875 px | 1527.6875 px | 0 px |
| 390 px | Cooling/oil/exhaust | 1756.0625 px | 1756.0625 px | 0 px |
| 1440 px | Brake | 1073.6875 px | 1073.6875 px | 0 px |
| 1440 px | Cooling/oil/exhaust | 1349.6875 px | 1349.6875 px | 0 px |

These measurements cover model-arrival shifts at a fixed viewport. Changing a control, reading size or viewport can intentionally change a panel's layout.

The delayed-load checks write measurements to `dist/previews/loading-layout.json` and phone/desktop loading/loaded screenshots to `dist/previews/`. These are ignored build artifacts. The loading and finished states were visually inspected alongside the supplied recording.
