# Porsche Boxster 2.9 book

The book uses the **2010 European/UK Boxster 987.2 2.9-litre** as its reference car. Its 18 main chapters lead from the family, yearly timeline and specification into component explanations, options and comparisons. A nineteenth reference section collects the annual equipment matrix, wheel/seat/colour atlases, audio capabilities, option-code index and glossary.

The chapters combine original explanatory diagrams, interactive examples and locally stored period photographs and factory illustrations. Chapter-local research and image credits preserve the evidence behind them. The [editorial review](.agents/book-editorial-notes.md) explains the reading order and where shared explanations belong. The [diagram review](.agents/reviews/diagram-review.md) records the correctness, detail and responsive checks. The [text and source review](.agents/reviews/text-and-source-review.md) records the subsequent 18-chapter factual audit and its evidence limits. The [rendering verification](.agents/reviews/render-verification.md) records the desktop and phone release checks.

The [coverage and consolidation review](.agents/reviews/coverage-and-consolidation.md) records the later mechanism additions, reference appendix, reduced repetition and validation of all 19 reading sections.

The [MDX migration review](.agents/reviews/mdx-migration.md) records manuscript preservation, export compatibility, responsive verification and payload measurements for the Node/React/Vite build.

The [factory parts reference review](.agents/reviews/parts-reference-review.md) links the chapter-by-chapter checks against Porsche's PET drawings. Each chapter's `part-reference/` folder keeps the selected factory page images, original page and illustration numbers, applicability notes and verification record. These supporting research files are separate from the compiled manuscript. The original Porsche material retains its own copyright; the project MIT licence does not relicense it.

[Read the online book](https://hurtak.github.io/boxster-book/). GitHub Actions builds and publishes the latest edition after each successful push to `main`.

## Chapter files

Each chapter has a numbered folder and an `index.mdx` file:

```text
book/
  01-the-2010-boxster-2-9-in-the-987-2-family/
    index.mdx
  02-the-yearly-timeline/
    index.mdx
  ...
  18-occupant-protection-and-system-integration/
    index.mdx
  19-reference-atlas-and-index/
    index.mdx
```

Keep one chapter per `index.mdx`, with exactly one `# Chapter title`; imports can precede it. Use `##` and deeper headings within a chapter. Numbered folders determine the reading order; numbers must be positive and unique. Research and image-credit files remain ordinary Markdown outside the compiled manuscript.

The [book guidelines](.agents/boxster-987-2-book-guidelines.md) define the chapter coverage. [Historical research](.agents/model-year-research.md) supplies source notes. AI guidance and review records live in `.agents/`, with reading instructions in [AGENTS.md](AGENTS.md). These documents are separate from the manuscript. The [migration plan](.agents/mdx-react-vite-migration-plan.md) records the MDX/React/Vite compatibility requirements.

## Build and preview

Requires **Node 22.18+, 24.11+ or 26+**; CI uses Node 24. Install dependencies, build the book and start its preview:

```sh
npm ci
npm run build
npm run build:preview
```

Open <http://localhost:8000/site/>. There is one production build: **`dist/site/index.html` and its `index-assets/` folder**, the same files deployed to GitHub Pages. Keep that directory together and serve it over HTTP. Diagram code and 3D models load on demand; the complete manuscript, photographs, static illustrations and sources are in the prerendered document. Fonts and styles are bundled locally. Rebuild after editing MDX or diagram code.

For development, `npm run dev` runs `vp dev` directly using [vite.config.ts](vite.config.ts). The book's Vite plugin prerenders the manuscript, hydrates the reader and reloads chapter/asset edits; shared React edits use Vite's development pipeline. The displayed local URL is normally <http://127.0.0.1:5173/>. Standard Vite flags work, for example `npm run dev -- --port 5174` or `npm run dev -- --host 0.0.0.0`. `npm run build:preview -- --port 8001` selects another build-preview port. The build preview also serves `/boxster-book/`, matching the published project path.

Builds preserve older content-hashed assets so an already open book can finish loading; use a fresh output directory when cleaning up unused assets. The HTML is replaced only after a successful build. Optional paths:

```sh
npm exec -- vpx ./scripts/build.ts --source book --output dist/site/index.html
```

Default paths are relative to this project; explicit paths are relative to the working directory. Run the direct CLI from the project directory, or use `npm --prefix /path/to/boxster-book run build` from elsewhere.

## Code quality and tests

Vite+ owns the build, Vitest runner, Oxlint and Oxfmt. All authored application code, diagrams, geometry factories, build scripts and tests use TypeScript. Chapters remain MDX, and research and source notes remain Markdown.

| Command                                   | Purpose                                                                                  |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| `npm run validate`                        | Run all quality checks, build the Pages edition, then run all tests; this is the CI gate |
| `npm run check`                           | Check formatting, lint and types with `vp check`; warnings fail the check                |
| `npm exec -- vp check --no-fmt --no-lint` | Check strict TypeScript across the application, scripts, diagrams and tests              |
| `npm exec -- vp lint --deny-warnings`     | Run type-aware Oxlint; warnings fail the check                                           |
| `npm exec -- vp fmt`                      | Apply Oxfmt formatting to code and tooling documents                                     |
| `npm exec -- vp fmt --check`              | Check formatting without writing files                                                   |
| `npm run check:fix`                       | Apply safe formatting and lint fixes                                                     |
| `npm test`                                | Run Vitest, including Playwright browser checks against the existing build               |
| `npm run test:watch`                      | Watch tests during development                                                           |

The shared configuration is [vite.config.ts](vite.config.ts). Formatting leaves the manuscript, research, provenance records, model/image assets and agent guidance unchanged. Tests do not build implicitly: run `npm run build` first after manuscript or runtime edits, or use `npm run validate`. Browser checks require Chrome or Chromium; set `BROWSER_EXECUTABLE_PATH` if it is not installed at the default location. CI installs Chromium explicitly. Task caching is disabled so validation always checks the current build and browser state.

## Print or save the whole book as PDF

Open the deployed book or the local build preview, then choose **Print whole book** on the cover. On a phone, the same action is at the top of **Contents**. The button waits for the book's images and fonts before opening the browser's print dialog. The browser's normal Print command also works.

Choose **Save as PDF** and **All pages**. Print preview includes the cover, contents, all 19 chapters, notes and sources, optional explanations and every static diagram poster, regardless of the chapter or diagram view currently selected. Each chapter starts on a new page; A4 margins, page numbers and repeated table headings are supplied by the print stylesheet. Turn off the browser's own headers and footers to avoid duplicating its page numbers and URL. Closing the print dialog restores the reader's disclosure states and chapter view.

The browser tests generate tagged, bookmarked PDFs in `dist/previews/` and check the full print layout with and without JavaScript. These PDFs are verification artifacts; PDF export is done through the browser, not a separate production build.

## GitHub Pages

The [Pages workflow](.github/workflows/pages.yml) validates the book on pushes to `main`, pull requests and manual runs. It installs Node 24 and Chromium, then runs `npm run validate`: Vite+ formatting, lint and strict type checks, the single Pages build and the Vitest suite. After successful validation on `main`, GitHub Actions publishes `dist/site/` to <https://hurtak.github.io/boxster-book/>.

Relative asset URLs work under the `/boxster-book/` project path. Browser tests serve the same build at the local preview and project-prefixed URLs to check navigation, code and 3D-model loading.

The repository's Pages source is **GitHub Actions**. The deployment uses the `github-pages` environment and GitHub's built-in token; no personal access token or committed build output is needed. The `petrhurtak.com` repository supplies the existing build/deploy pattern and owns its custom domain. This project has its own Pages address and no `CNAME` file.

## Reference material and optional detail

The [reference appendix](book/19-reference-atlas-and-index/index.mdx) collects the annual evidence matrix and visual atlases. **U** means the annual UK evidence has not been established; it is distinct from unavailable equipment. The January 2010 palette preserves its advertised September-at-earliest and through-July qualifications.

The component chapters include crankcase ventilation/oil separation, fuel delivery and vapour recovery, accessory and vacuum drives, cockpit instruments and ParkAssist. The tyre-grip interactive uses illustrative force units and a constant circular envelope; it is not a Porsche tyre calibration. Chapter 18 owns the full Sport Chrono equipment/function matrix.

Wrap optional calculations in native `<details className="technical-detail">` with a `<summary>` title and blank lines around their Markdown content. The reader expands these and source sections for printing, restores the previous open states afterwards, and opens a disclosure when following a fragment or source backlink into it. Main mechanism explanations and all diagram fallbacks remain readable without scripting.

## MDX conventions

- Paragraphs, lists, links and headings use [MDX](https://mdxjs.com/docs/what-is-mdx/). `remark-gfm` supplies the manuscript's pipe tables and `[^note]` footnotes. `remark-smartypants` preserves the book's typographic punctuation. Literal braces and angle brackets that would start JSX/JavaScript expressions must be escaped; use `className` for JSX classes.
- Import images from the owning chapter's `images/` folder and use `Figure`. Interactive figures keep their imported `poster.svg` in `diagrams/` and use `Diagram`. Missing imports, diagram modules, IDs or non-empty descriptive alternatives fail the build.
- Give photographs one concise visible caption with variant, credit and source. Keep the longer visual description separately in the `alt` prop. Figure captions support Markdown links and emphasis, with blank lines around their content:

```mdx
import { Figure, Diagram } from '../../src/book/components';
import photograph from './images/front-axle.jpg';
import poster from './diagrams/brake-explorer/poster.svg';

<Figure src={photograph} alt="Front axle with struts, lower arms and steering rack">

Boxster S front axle. Photo: Porsche AG. [Source](https://example.com).

</Figure>

<Diagram id="brake-explorer" poster={poster} alt="The wheel brake in context and its separated main parts." />
```

- Existing explicit heading fragments use `<Heading level={2} id="existing-fragment">` with Markdown children. Ordinary headings get book-scoped IDs using the existing slug convention.
- Links such as `[Oil circuit](#oil-circuit)` can target a heading within the same chapter. Chapter-local identifiers and footnotes are kept distinct when the files are combined.
- The contents list is generated from chapter titles. Cross-chapter links such as `[Unsprung mass](../11-suspension-and-wheel-geometry/index.mdx#compliance-and-unsprung-mass)` become internal navigation. Legacy `index.md` source links remain accepted as aliases. Published URLs keep their `book__...__index.md__...` IDs even though the source file extension changed. Builds reject unresolved chapters/headings and duplicate chapter/diagram IDs.
- Chapter content should explain the 2010 2.9 first, then its options, changes in other years and differences on other models.

Edit `scripts/book.css` for presentation and `src/reader/` for the React reader. Shared figure and source-disclosure components are in `src/book/`. The build never changes chapter files.

## MDX and rendering

`scripts/mdx/inventory.ts` discovers the current chapter and diagram files, builds a typed manifest and validates source links. `scripts/mdx/compiler.ts` is the single MDX configuration for both bundlers: GFM, typography, stable sections, chapter-local notes and existing global note/backlink IDs. It deliberately retains a separate destination for each repeated reference to match published links.

Node prerenders the complete React/MDX tree with `renderToString`; the browser hydrates the matching tree before applying the URL hash and saved preferences. All chapter content remains available without JavaScript and for full-book printing. The first migration includes compiled chapter code in browser assets; it does not embed a second JSON copy of the rendered manuscript.

Vite+ builds one Pages edition with lazy diagram/model chunks and content-hashed media. Image imports become stable asset keys resolved through the same emitted media manifest during prerendering and hydration. Fonts and CSS remain embedded. Nested local SVG resources are embedded and external SVG/CSS dependencies are rejected. Builds replace the HTML only after successful compilation, rendering and asset assembly.

React owns navigation, disclosures and figure wrappers. Each live diagram receives a dedicated imperative host, retained state and an AbortSignal. D3/Three.js own the host contents. Viewport disposal reserves the measured height before removing those contents; cancellation and cleanup also support React development Strict Mode. Diagram/model modules do not run during Node rendering.

Image dimensions are read at build time and emitted as intrinsic width/height attributes. On startup and chapter navigation, the reader settles fonts and prepares the selected chapter's lightweight diagram layouts before revealing the reading sheet and performing the final anchor scroll. Car viewers construct their complete controls and text before waiting for visibility and fetching models; a loading placeholder keeps that measured space until the scene is ready. Hidden chapters retain their last measured reservations. Failed reader scripts fall back to the static manuscript, and disabled JavaScript never hides it.

`npm exec -- vp check --no-fmt --no-lint` checks all TypeScript implementation, diagram, model-authoring and test files in strict mode; compiling every chapter separately validates MDX syntax and book component metadata. `tests/fixtures/manuscript-baseline.json` records the pre-migration content and public destination contract. Its hashes normalise typography/whitespace while preserving letters, numbers and ordering. Update this contract deliberately when reviewing future manuscript changes, alongside the owning evidence; ordinary build/runtime changes must preserve it.

## Interactive diagrams

The brakes sample includes three working examples:

- **Car to brake, in 3D:** click a stage, use Back/Next or move the visible slider through the whole car, hydraulic connections, wheel brake and exploded assembly. Start again returns to the whole car. Compact part buttons highlight and zoom in on the disc, pads, one-piece caliper, four pistons, hub or wheel. The selected part's explanation appears once, above its buttons. Drag to orbit and scroll or pinch to zoom.
- **Hydraulic clamping:** a D3 cutaway shows connected pressure chambers and four opposing pistons clamping two pads, with force increasing as relative pressure rises.
- **Speed and energy:** D3 plots kinetic energy as speed and illustrative total mass change.

Every component chapter, from body structure through occupant protection (chapters 4–18), also has a **3D location and component tour**. The fourteen additional assemblies cover the flat-six, intake and engine control, fluids and exhaust, manual clutch/gearbox, optional PDK, driveline, suspension, steering and wheels, roof, cabin and climate, electrical system, audio and restraints. All fifteen tours share the guided layout: clickable stages above the model, navigation and a slider above the description, and an always-visible component section. Numbered part buttons focus individual components; a checkbox shows their functional connections.

[Diagram authoring and architecture](interactive/README.md) explains the boundary between shared code and chapter assets. D3 handles SVG diagrams and charts; Three.js renders GLB models and chapter-owned procedural assemblies. The component viewers share framing, selection, controls, resource handling and the reference car; each chapter owns its geometry and explanations. `npm run model:posters` regenerates their printable illustrations. All runtime dependencies are bundled locally. Dependency license notices are embedded in the HTML and also shipped as `THIRD_PARTY_NOTICES.txt` in the web assets.

Every interactive figure has a static SVG for printing, disabled JavaScript or unavailable WebGL. Its **Interactive / Static diagram** tabs also let readers choose the poster directly, including while a model downloads. The tabs sit against the diagram card and support arrow keys, Home and End. The view choice and interactive control values are retained while moving between chapters; returning to Interactive restores the controls. Static view releases the live diagram's resources. Controls use native labelled sliders and buttons. The runtime releases 3D resources offscreen while retaining control values, and renders on interaction rather than running a continuous animation loop.

The car is an original **photo-guided model**, with deep metallic green paint, a tan cabin, curved body panels, split-spoke wheels, projector lamps and twin exhaust tips. The [model source notes](interactive/models/boxster/README.md) describe the reference choices and geometry. The mechanical assemblies remain educational schematics: the front disc has the stated nominal 318 × 28 mm envelope, while pipe routing, clearances and most other component dimensions are illustrative. `npm run model:generate` regenerates the GLBs from the TypeScript geometry sources; the book build uses the existing GLBs.

For a larger model inspection view, run `npm run model:preview`, then `npm run build:preview`, and open <http://localhost:8000/model-preview/>. Front, rear, side, low-front and cabin camera presets help compare revisions. The photographs and their backgrounds are not embedded in the model.

Run `npm run validate` for the complete check: formatting, lint, strict TypeScript, the Pages build, then tests. Use `npm test` to run only the tests against the existing build; rebuild first after changes to the manuscript or runtime. The tests check calculations, GLB contents, all chapters and interactive figures, cross-chapter links, local images, keyboard controls, resource cleanup, phone layout, printing and fallbacks. Browser tests use an installed Google Chrome; set `BROWSER_EXECUTABLE_PATH` to use another compatible Chromium executable. Test screenshots are written to `dist/previews/`.

## Reader design

The reader follows **The page is the object** direction (seed `1298968287`): the contents acts as the book’s spine, with a white reading sheet and a green accent taken from the reference car. Source Serif 4 carries the text; Source Sans 3 carries headings and navigation. The fonts are bundled in `assets/fonts/` under the SIL Open Font License, with notices included in the reading edition. No font service is contacted while reading.

The enhanced reader shows one chapter at a time, preserving section and footnote deep links, browser history and chapter-local notes, numbered from 1 in each chapter. The current chapter's sections are listed under it in the contents; wide desktops also show them as an outline beside the page. A bar under the header shows progress through the chapter, and the cover offers a link back to the last section read. The reading place is saved locally, and text follows the responsive typography. Photographs and drawings sit on a common plate whatever their size, and interactive panels run to the screen edges on phones. Without JavaScript, the complete document and contents remain available; printing includes every chapter and static diagrams.

The reader follows the device's light or dark appearance by default. **Theme** in the header offers **Device setting**, **Light** and **Dark**; a manual preference is saved locally and applied before the reader loads. Device setting resumes automatic changes. Illustrations retain their original light plates and colour coding, while the reader and diagram controls follow the selected theme. Printing always uses the light palette. Without JavaScript, the screen edition follows the device setting.

The cover lists drafted chapters automatically, and title-only chapters are marked as planned. It uses the supplied green-and-tan Boxster photograph, with its provenance recorded in [cover photograph credits](#cover-photograph). The component chapters combine original explanatory diagrams with credited period photographs. Chapter-local `research.md` files record technical evidence and uncertainties; `images/credits.md` files record image origins. The [design review](.agents/reviews/reader-design-review.md) records the reader’s layout and responsive checks. Screenshots are generated under `dist/design-review/`.

## Shared image credits

### Cover photograph

[assets/book-cover.png](assets/book-cover.png) is the 1440 × 1080 photograph supplied by the user on 10 November 2026: a dark green Boxster with tan seats, photographed from a low front three-quarter angle against a blue sky. It replaces the previous model rendering.

The supplied file is stored unchanged. The screen layout crops some sky and road with CSS; the print edition shows the full photograph. The photographer and original publication were not supplied. The project MIT licence does not relicense this photograph.

## License

Original project material is licensed under the [MIT License](LICENSE). Credited third-party photographs and reproduced illustrations retain their original rights; the MIT grant does not relicense them. Third-party dependencies retain their own licenses; their notices are included in the generated reading editions. The added photographic chapter drafts are kept local for personal reading.
