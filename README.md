# Porsche Boxster 2.9 book

The book uses the **2010 European/UK Boxster 987.2 2.9-litre** as its reference car. Its 18 main chapters lead from the family, yearly timeline and specification into component explanations, options and comparisons. A nineteenth reference section collects the annual equipment matrix, wheel/seat/colour atlases, audio capabilities, option-code index and glossary.

The chapters combine original explanatory diagrams, interactive examples and locally stored period photographs and factory illustrations. Chapter-local research and image credits preserve the evidence behind them. The [editorial review](.agents/book-editorial-notes.md) explains the reading order and where shared explanations belong. The [diagram review](.agents/reviews/diagram-review.md) records the correctness, detail and responsive checks. The [text and source review](.agents/reviews/text-and-source-review.md) records the subsequent 18-chapter factual audit and its evidence limits. The [rendering verification](.agents/reviews/render-verification.md) records the desktop and phone release checks.

The [coverage and consolidation review](.agents/reviews/coverage-and-consolidation.md) records the later mechanism additions, reference appendix, reduced repetition and validation of all 19 reading sections.

The [MDX migration review](.agents/reviews/mdx-migration.md) records manuscript preservation, export compatibility, responsive verification and payload measurements for the Node/React/Vite build.

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

## Build the reading edition

Requires **Node 22.12+**; CI uses Node 24. Install dependencies once:

```sh
npm ci
```

From the project directory, run:

```sh
npm run build
```

Open `dist/book.html` in a browser. On macOS:

```sh
open dist/book.html
```

The HTML includes all chapters in numerical order, a book cover and a chapter reader. From 1000 px wide (landscape tablets and up) the contents stay beside the page; narrower screens use a contents drawer. Styles, fonts, images, JavaScript and 3D models are embedded, so the interactive book works offline without a server. External source links still require an internet connection. Rebuild after editing MDX or diagram code; the HTML is generated output.

For development, `npm run dev` starts Vite at the displayed local URL. It prerenders the manuscript, hydrates the reader and reloads chapter/asset edits; shared React edits use Vite's development pipeline. `npm run serve` starts the Node preview server on port 8000 for the generated editions. Use `npm run serve -- --port 8001` if that port is occupied.

For a larger book, build the **web edition**, which downloads diagram code and models as the reader approaches them:

```sh
npm run build:web
npm run serve
```

Open <http://localhost:8000/web/book.html>. This edition needs a server; keep `dist/web/book.html` and the adjacent `book-assets/` folder together. The portable edition remains at `dist/book.html`. Builds preserve older hashed web assets so an already open edition can finish loading; deploy to a fresh directory when cleaning up unused assets.

Optional paths:

```sh
node --import tsx scripts/build.ts --source book --output dist/book.html
```

Default paths are relative to this project; explicit paths are relative to the working directory. Run the direct CLI from the project directory, or use `npm --prefix /path/to/boxster-book run build` from elsewhere.

## GitHub Pages

The [Pages workflow](.github/workflows/pages.yml) builds and tests the book on pushes to `main`, pull requests and manual runs. It installs Node 24 and Chromium, then runs `npm test`, including the TypeScript gate. After a successful build on `main`, GitHub Actions publishes `dist/site/` to <https://hurtak.github.io/boxster-book/>.

`npm run build:pages` creates the web edition at `dist/site/index.html`, with relative asset URLs that work under the `/boxster-book/` project path. With `npm run serve`, preview it at <http://localhost:8000/site/>. Browser tests also serve this artifact under `/boxster-book/` to check code and 3D-model loading.

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

Vite builds the HTTP editions with lazy diagram/model chunks and content-hashed media. The portable export retains esbuild's IIFE and binary-GLB path, using the MDX esbuild integration with the same compiler options. Image imports become stable asset keys: portable hydration reads the already embedded image URLs from the prerendered document, while HTTP editions use the emitted media manifest. Fonts and CSS remain embedded. Nested local SVG resources are embedded and external SVG/CSS dependencies are rejected. Builds replace the HTML only after successful compilation, rendering and asset assembly.

React owns navigation, disclosures and figure wrappers. Each live diagram receives a dedicated imperative host, retained state and an AbortSignal. D3/Three.js own the host contents. Viewport disposal reserves the measured height before removing those contents; cancellation and cleanup also support React development Strict Mode. Diagram/model modules do not run during Node rendering.

`npm run typecheck` checks implementation types; compiling every chapter separately validates MDX syntax and book component metadata. `tests/fixtures/manuscript-baseline.json` records the pre-migration content and public destination contract. Its hashes normalise typography/whitespace while preserving letters, numbers and ordering. Update this contract deliberately when reviewing future manuscript changes, alongside the owning evidence; ordinary build/runtime changes must preserve it.

## Interactive diagrams

The brakes sample includes three working examples:

- **Car to brake, in 3D:** move one slider through the whole car, hydraulic connections, wheel brake and exploded assembly. Part buttons highlight and zoom in on the disc, pads, one-piece caliper, four pistons, hub or wheel. Drag to orbit and scroll or pinch to zoom.
- **Hydraulic clamping:** a D3 cutaway shows connected pressure chambers and four opposing pistons clamping two pads, with force increasing as relative pressure rises.
- **Speed and energy:** D3 plots kinetic energy as speed and illustrative total mass change.

Every component chapter, from body structure through occupant protection (chapters 4–18), also has a **3D location and component tour**. The fourteen additional assemblies cover the flat-six, intake and engine control, fluids and exhaust, manual clutch/gearbox, optional PDK, driveline, suspension, steering and wheels, roof, cabin and climate, electrical system, audio and restraints. Like the brake viewer, they move from the whole green-and-tan car through connections and assembled parts to an exploded view. Numbered part buttons focus individual components; a checkbox shows their functional connections.

[Diagram authoring and architecture](interactive/README.md) explains the boundary between shared code and chapter assets. D3 handles SVG diagrams and charts; Three.js renders GLB models and chapter-owned procedural assemblies. The component viewers share framing, selection, controls, resource handling and the reference car; each chapter owns its geometry and explanations. `npm run posters` regenerates their printable illustrations. All runtime dependencies are bundled locally. Dependency license notices are embedded in the HTML and also shipped as `THIRD_PARTY_NOTICES.txt` in the web assets.

Every interactive figure has a static SVG for printing, disabled JavaScript or unavailable WebGL. Controls use native labelled sliders and buttons. The runtime releases 3D resources offscreen while retaining control values, and renders on interaction rather than running a continuous animation loop.

The car is an original **photo-guided model**, with deep metallic green paint, a tan cabin, curved body panels, split-spoke wheels, projector lamps and twin exhaust tips. The [model source notes](interactive/models/boxster/README.md) describe the reference choices and geometry. The mechanical assemblies remain educational schematics: the front disc has the stated nominal 318 × 28 mm envelope, while pipe routing, clearances and most other component dimensions are illustrative. `npm run models` regenerates the GLBs from the JavaScript geometry sources; the book build uses the existing GLBs.

For a larger model inspection view, run `npm run preview:model`, then `npm run serve`, and open <http://localhost:8000/model-preview/>. Front, rear, side, low-front and cabin camera presets help compare revisions. The photographs and their backgrounds are not embedded in the model.

Run `npm test` to rebuild the portable, web and Pages outputs and check the calculations, GLB contents, all chapters and interactive figures, cross-chapter links, offline images, keyboard controls, resource cleanup, phone layout, printing and fallbacks. Browser tests use an installed Google Chrome; set `BROWSER_EXECUTABLE_PATH` to use another compatible Chromium executable. Test screenshots are written to `dist/previews/`.

## Reader design

The reader follows **The page is the object** direction (seed `1298968287`): the contents acts as the book’s spine, with a white reading sheet and a green accent taken from the reference car. Source Serif 4 carries the text; Source Sans 3 carries headings and navigation. The fonts are bundled in `assets/fonts/` under the SIL Open Font License, with notices included in both reading editions. No font service is contacted while reading.

The enhanced reader shows one chapter at a time, preserving section and footnote deep links, browser history and chapter-local notes, numbered from 1 in each chapter. The current chapter's sections are listed under it in the contents; wide desktops also show them as an outline beside the page. A bar under the header shows progress through the chapter, and the cover offers a link back to the last section read. Text-size buttons and the reading place are kept as local preferences. Photographs and drawings sit on a common plate whatever their size, and interactive panels run to the screen edges on phones. Without JavaScript, the complete document and contents remain available; printing includes every chapter and static diagrams.

The cover lists drafted chapters automatically, and title-only chapters are marked as planned. It uses an original render of the project’s green and tan car model. The component chapters combine original explanatory diagrams with credited period photographs. Chapter-local `research.md` files record technical evidence and uncertainties; `images/credits.md` files record image origins. The [design review](.agents/reviews/reader-design-review.md) records the reader’s layout and responsive checks. Screenshots are generated under `dist/design-review/`.

## License

Original project material is licensed under the [MIT License](LICENSE). Credited third-party photographs and reproduced illustrations retain their original rights; the MIT grant does not relicense them. Third-party dependencies retain their own licenses; their notices are included in the generated reading editions. The added photographic chapter drafts are kept local for personal reading.
