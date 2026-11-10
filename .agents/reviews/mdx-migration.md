# MDX migration implementation and validation

Completed locally on 10 November 2026 against baseline commit `3a3ee94ef10705717e0a8e82834b2a403cbbf7fa`. This implements the [migration plan](../mdx-react-vite-migration-plan.md). The mechanical manuscript, source research, photographs, SVGs, posters and models are preserved.

## Result

- All **19** numbered chapter entries are `index.mdx`. Research and credits remain Markdown. The authoring interface is documented in [README](../../README.md#mdx-conventions).
- Shared React components own the reader, figures, sources and diagram wrappers. Node prerenders the complete document with `renderToString`; the browser hydrates the same tree before applying the fragment, chapter visibility and saved preferences.
- The shared compiler configuration enables `remark-gfm` for existing tables/footnotes and `remark-smartypants` for typography. Explicit component mappings avoid a separate `@mdx-js/react` provider. Generated manifests validate chapter numbers, headings, links, diagram IDs and figure alternatives.
- Public fragments retain their `book__...__index.md__...` spelling. Cross-chapter source links use `.mdx`, with `.md` aliases accepted during compilation. All **409** published note destinations and reference backlinks remain stable, including repeated references with separate Pandoc-era destinations and chapter-local displayed numbering.
- Portable, HTTP and Pages exports retain their documented paths. Vite builds HTTP modules and lazy diagram/model chunks. The portable export retains esbuild's IIFE/binary-GLB path, with the same MDX compiler options; esbuild also remains necessary for the model preview and poster tools.
- Portable image imports resolve through stable asset keys read from the prerendered image elements before hydration, avoiding a second embedded image payload. HTTP images are content-hashed assets. Nested local SVG/CSS resources are embedded; unresolved network dependencies fail the export. Dependency and font notices accompany both editions.
- Builds stage their output in a temporary directory and replace the HTML after successful assembly. HTTP assets are additive, preserving older hashes needed by an open edition.
- Node/Vite supply development and preview serving. The Python builder, Pandoc template, old bundling helper and imperative reader/runtime are removed. CI uses Node and Chromium, retaining the existing Pages artifact and deployment configuration. CI was updated but has not been run remotely as part of this local migration.

## Reader and diagram compatibility

All **39** interactive modules remain chapter-owned. React provides a persistent empty host; D3/Three.js own only its children. The wrapper handles lazy import, asynchronous mount, cancellation, retry, WebGL fallback and disposal, while keeping the diagram's control state outside the live scene. Module imports during Node rendering do not create a browser or WebGL context.

Browser verification found and resolved three migration regressions:

1. A pending interactive host could exceed the reading column around the tablet breakpoint. Its positioning and width now follow its figure's containing block.
2. Clearing a tall live SVG before React committed its placeholder triggered scroll anchoring and interrupted controls. Disposal now reserves the measured height synchronously; chapter-hidden figures restore their static fallback until remounting.
3. A source section opened by a fragment could lose that state when printing immediately, before a queued disclosure event. The print hook now snapshots actual native disclosure states synchronously and restores them afterwards. Source and technical-detail disclosures share that behaviour.

Route scrolling runs after the matching React layout commit. The old reader initializer is gone. Development Strict Mode mounting, cancellation and cleanup were checked in Chrome; changing a real MDX chapter triggered reload, and the temporary edit was restored.

## Validation

- Clean `npm ci` succeeded. Final **`npm test`: 42 passed, 0 failed**. This includes explicit TypeScript checking, all three builds, compiler failure cases, maths/models and the browser suite.
- Every chapter compiles. A checked-in baseline contract compares chapter/section IDs, ordered prose, table cells, **162** figure descriptions/captions and **409** note destinations/texts in all three prerendered editions. Hashes normalise whitespace and typographic punctuation while retaining letters, numbers and order. No content discrepancy was found.
- Portable reading and interaction work under `file://` with networking disabled. No-JavaScript reading, unavailable-WebGL fallbacks, print expansion/restoration, fragment links/backlinks, history, reading preferences and keyboard/modal controls pass.
- All 39 modules and their models load through both HTTP registries, including the `/boxster-book/` Pages prefix. The cover requests no GLBs. Hydration warnings, browser errors, missing resources and dependency/font-notice omissions are checked as failures.
- All interactive controls and canvas bounds pass at **390, 768 and 1440 px**. Component tours retain state across chapters and release resources offscreen.
- Additional production Pages sweep: **19 chapters × 3 widths × 4 reading states = 228 states**. Top, middle, end and expanded-source positions had no page overflow, clipped prose, failed images, missing fonts or diagram notices. This is Chromium-based responsive verification rather than physical-device or cross-browser certification.
- Before/after cover, family, brakes and appendix screenshots were compared at all three widths. Cover and brakes inspection reports have zero failures/warnings with the evidence-based exceptions below. Native GFM table sizing permits some column/line-wrap differences from Pandoc's generated column widths; contents, readable type and contained horizontal scrolling remain intact.
- Deliberate validation and bundling failures preserve the last successful HTML and clean the temporary directory. Nested-resource tests cover local embedding, circular SVGs and rejected remote dependencies. `git diff --check` passes.

Local artifacts: `dist/mdx-review/summary.json`, `comparison-{390,768,1440}.jpg`, `cover/`, `brakes/`, and `inspector-exception-evidence.json`. Baseline snapshots are in `/tmp/boxster-mdx-baseline/`. Full gate: `/tmp/boxster-mdx-final-test.log`; development check: `/tmp/boxster-mdx-dev-final.log`. Screenshots/builds are ignored output.

## Payload and retained limits

| Artifact | Before | After | After, gzip |
| --- | ---: | ---: | ---: |
| Portable `dist/book.html` | 20,811,159 B | 21,974,968 B | 10,102,573 B |
| HTTP `dist/web/book.html` | 7,992,295 B | 1,027,909 B | 313,328 B |
| Pages `dist/site/index.html` | 7,992,296 B | 1,028,235 B | 313,341 B |
| Initial Pages reader JavaScript | — | 1,064,359 B | 251,972 B |

Gzip figures are local compression measurements; hosting determines actual transfer encoding. HTTP figures exclude adjacent photographs, chunks and models, so the smaller HTML is not a claim that total book content shrank. The portable file grows about **5.6%**, principally from the React/MDX implementation and included notices.

As planned, all chapter component code is in the initial browser bundle. Vite reports its size above 500 kB; the warning is retained. The cover's measured JavaScript requests consist of that reader bundle, while diagram/model imports remain deferred. Chapter-level lazy hydration remains a later optimisation rather than a second routing/compiler system. There is no duplicate JSON copy of the rendered chapter HTML.

## Visual critique

Existing direction: **The page is the object**, seed **1298968287**. Source Serif 4, Source Sans 3, the green accent, white reading sheet and contents spine are retained. No new imagery, promotional sections or autoplay motion were introduced by this migration.

### ROUND 1

Seen in one second: a book cover or named mechanical chapter, with clear reading controls.

Idea (one sentence): the green-and-tan reference car leads into mechanisms presented as explanatory plates in a readable field guide.

Live thing: chapter navigation, source disclosures, adjustable D3 examples and car-to-component tours.

Layout words by section: cover=object / chapter=reading column / mechanism=plate / appendix=reference grid / sources=disclosure.

Scores: design 6.5 · usability 7 · creativity 7 · content 8.5 → overall 7.0.

Caps applied: limited photographs in an individual component chapter and the established stationary reading page; the intent is migration fidelity rather than an award-style redesign.

Top three problems (most visible first), with evidence and fix:

1. `overflow-1024.png` in the local baseline working folder: an invisible pending host widened the tablet page. Contain its absolute width inside the figure.
2. `grip-diagnosis.png` in that folder: leaving a tall live illustration changed scroll anchoring while a control was clicked. Reserve the height before removing the imperative children.
3. The source/print browser test exposed a fast fragment-open/print state race. Snapshot native disclosure flags rather than waiting for React state from a queued toggle.

### ROUND 2 — final

Seen in one second: the same book, with a clear title, comfortable measure and stable surrounding navigation.

Idea (one sentence): the reference car and its working diagrams remain the reading material while the underlying compiler and reader change.

Live thing: all 39 figures respond to their native controls, restore their state and retain usable static fallbacks.

Layout words by section: cover=object / chapter=reading column / controls=interactive plate / atlas=reference grid / sources=disclosure.

Scores: design 6.5 · usability 8 · creativity 7 · content 8.5 → overall 7.3.

Caps applied: the same limited-photography and stationary-page caps; the result remains below 7.5 on the skill's promotional-page rubric.

Top three remaining limitations, with screenshot evidence and disposition:

1. `comparison-768.jpg`, brakes table: GFM's intrinsic column sizing changes wrapping relative to Pandoc. Text and cell order are preserved and the table remains legible; arbitrary historical column fractions were not added to the manuscript.
2. `brakes/mobile-page-01.jpg`: the component tour and controls span more than one phone screen. The existing native target sizes and wrapped part buttons are preserved.
3. `comparison-1440.jpg`, appendix: wide annual matrices scroll inside the table. Prose and the page fit the viewport; reducing reference text further would hurt reading.

### Inspector exceptions

- **off-centre, cover:** the text-edge heuristic reports 64/40 px at 768 px. DOM measurements show equal 24 px sheet margins and equal 40 px inner padding; at 1440 px the sheet margins are 200 px each with 48 px inner padding, and at 390 px the sheet has equal 24 px padding. Keep the balanced frame.
- **untitled-section, cover:** `cover-intro` continues the cover's existing `Porsche Boxster 2.9` heading. It does not introduce a separate subject needing another heading.
- **eyebrow, brakes:** “22” is the linked superscript `doc-noteref` to `#fn270`, ending the preceding paragraph. Preserve the reference and backlink.
- **few-pictures / still-page / no-footage:** the reviewed component chapter explains mechanisms with diagrams, and the book uses reader-controlled interaction. Its existing cover rendering is an illustration. These allowances retain the established design and content.

Source lint reports zero failures and one warning for the existing outlined diagram buttons. Their borders distinguish actual controls and pressed states; they are functional UI inside `data-ui` figures. Nothing was hidden or removed to satisfy the inspector.
