# MDX, React and Vite migration plan

Status: implemented and validated locally, 10 November 2026. This plan replaces the earlier Markdown-it proposal and records the migration requirements. See the [implementation and validation review](reviews/mdx-migration.md) for the result and measured limits.

**Output-contract update, 11 November 2026:** the user's subsequent instruction replaces the three export contracts below with one Pages build: `npm run build` produces `dist/site/index.html` and adjacent assets; `npm run build:preview` previews it. The portable exporter and separate web/Pages commands are retired. Whole-book PDF export uses the browser's Print command or the reader's Print whole book action. The historical migration requirements below remain a record; [README](../README.md#build-and-preview) defines the current build and print interface. Manuscript preservation, stable links, useful static/print output, hydration and lazy interactive resources still apply.

## Target

Replace the Python/Pandoc build with **MDX + React + TypeScript + Vite**, using Node for build-time rendering and export assembly. Convert chapter entry files from `index.md` to `index.mdx`, retaining their numbered folders, prose, research, images and diagram assets.

MDX will be the chapter compiler. Shared React components will supply the book layout, figures, diagrams and reader interface. Existing D3 and Three.js modules will continue to implement their subject-specific illustrations. This migration preserves the book's design and behaviour; it does not include a visual redesign or a rewrite of its mechanical content.

Preserve the existing output contracts:

| Command | Output | Required behaviour |
| --- | --- | --- |
| `npm run build` | `dist/book.html` | One self-contained HTML file, readable and interactive offline through `file://` |
| `npm run build:web` | `dist/web/book.html` and adjacent assets | HTTP edition with diagram code and models loaded on demand |
| `npm run build:pages` | `dist/site/index.html` and adjacent assets | Static GitHub Pages edition under `/boxster-book/` |

Keep hash-based chapter navigation and existing published deep links. Keep planning/research documents as Markdown outside the compiled manuscript. No production server is required.

## Packages and optional remark-gfm

| Responsibility | Proposed packages |
| --- | --- |
| Reader and component rendering | `react`, `react-dom` |
| Development and browser builds | `vite`, `@vitejs/plugin-react` |
| MDX compilation in Vite | `@mdx-js/rollup` |
| Types | `typescript`, `@types/react`, `@types/react-dom`, `@types/mdx` |
| Tables and footnotes, if needed | `remark-gfm` |
| Existing diagrams | Retain `d3`, `three` and the chapter-owned modules |

**Optional remark-gfm note:** MDX works without this plugin. Add it if needed to preserve pipe tables and `[^note]` footnotes. The current manuscript already uses both, so enabling it is the expected compatibility choice. It supplies syntax support; the book's React components and CSS still control appearance and behaviour. It runs during compilation, without a GitHub service or browser dependency. If those features are instead deliberately implemented as explicit components, omit the plugin after equivalent behaviour is demonstrated.

Use a single shared MDX configuration for the Node and browser builds. Configure book-specific remark/rehype transformations for headings, source-relative links, image handling, captions and notes. Additional packages must correspond to a demonstrated requirement; do not retain Markdown-it as a second chapter compiler.

`@mdx-js/react` is optional: start with an explicit `components` mapping passed to each compiled chapter. Add its provider only if the component hierarchy benefits from context-based mapping. Write typed implementation code in `.ts`/`.tsx`; MDX chapters contain Markdown, JSX, imports and JavaScript expressions.

References: [MDX setup and types](https://mdxjs.com/docs/getting-started/), [Vite integration](https://mdxjs.com/packages/rollup/), [GFM support](https://mdxjs.com/guides/gfm/).

## Build and browser pipeline

```text
book/NN-chapter/index.mdx + imported React components
                         |
            Shared MDX compiler configuration
     remark / rehype rules, stable IDs and link validation
                         |
                  React chapter modules
                         |
          +--------------+----------------+
          |                               |
   Node build-time render           Vite browser build
   Complete book HTML               Reader + MDX components
   Captions, notes, posters          Lazy diagram/model imports
          |                               |
          +---------------+---------------+
                          |
                 Export assembly
         portable HTML / local web / Pages
                          |
           Browser hydrates the React tree
        Diagrams mount near the viewport on demand
```

Render the complete book into HTML at build time, including all chapter text, images, notes and useful diagram fallbacks. Hydrate a matching React tree in the browser, then enhance it into the current one-chapter-at-a-time reader. Read the URL hash, local preferences and browser-only state after initial hydration, avoiding server/client markup mismatches.

For the first migration, keep all chapter content in the rendered book and retain diagram/model lazy loading. A conventional hydrated MDX tree also includes chapter component code in browser assets; measure the resulting payload and avoid embedding a second JSON copy of the rendered chapter HTML. Chapter-level lazy hydration or a different routing architecture is a later optimisation if measurements justify it.

Use React for navigation, the contents drawer, chapter outline, pagination, text size, reading progress, source disclosures and shared figure wrappers. Give imperative diagram code its own host element: React owns its wrapper and fallback, while D3/Three.js own only the host's contents. Browser-only modules load after hydration and visibility checks; importing a chapter during the Node build must not create a WebGL context or access `window`/`document`.

## Chapter authoring after migration

Replace Pandoc-specific diagram fences with a shared component, for example:

```mdx
import { Diagram, Figure } from '../../src/book/components';
import poster from './diagrams/caliper-pressure/poster.svg';
import illustration from './images/braking-chain.svg';

# Brakes and stability systems

Existing explanatory prose remains here.

<Diagram
  id="caliper-pressure"
  poster={poster}
  alt="A section showing hydraulic pressure acting on opposing pistons."
/>

<Figure src={illustration} alt="The connections between the braking components.">
  A concise caption with the existing credit and source link.
</Figure>
```

The component names and import paths above are proposed interfaces. `Diagram` resolves its ID through the generated lazy registry, avoiding an eager import of Three.js or a model from the chapter. `Figure` renders semantic figure/caption markup. Ordinary Markdown headings, prose, lists, links and tables remain available alongside components.

## Implementation sequence

### 1. Establish the baseline and source inventory

- Record the current revision and uncommitted state before implementation. Coordinate with concurrent book work and preserve it.
- Read the current project guidance, manuscript/editorial conventions, diagram architecture and previous reader/diagram reviews before converting content or changing figure wrappers.
- Discover the current chapters, diagrams, models, posters, photographs, fonts, links and notes from the filesystem. Avoid freezing an earlier diagram count into the implementation.
- Build reference portable, web and Pages editions into a separate baseline directory. Record representative screenshots, artifact sizes and existing deep-link targets.
- Inventory all Pandoc-specific syntax, including fenced divs, image attributes, linked captions, heading IDs, footnotes, relative paths, raw HTML and characters that acquire meaning in MDX/JSX.

Checkpoint: a baseline against which both manuscript preservation and runtime behaviour can be verified. Preparing this plan does not require rebuilding the current book.

### 2. Build the MDX compatibility prototype

- Add React/TypeScript, Vite and the MDX integration in a separate development/build entry. Compile a representative chapter through the same MDX configuration for Node and browser output.
- Start with the family and brakes chapters, plus fixtures covering syntax found elsewhere. Enable `remark-gfm` if required by their tables and footnotes, as expected.
- Prove the shared `Diagram` and `Figure` components before converting every chapter. Preserve caption links, credits and separate descriptive alt text.
- Define a stable heading/footnote ID strategy matching the existing `book__...__index.md__...` URLs. Renaming source files to `.mdx` must not silently rename public fragment IDs.
- Build a typed chapter manifest containing order, title, headings, IDs and diagram references. Reject duplicate chapter numbers, duplicate diagram IDs, missing modules and unresolved fragments.
- Compile relative links through a complete chapter index. Support old `index.md#heading` references during conversion, update internal source links deliberately, and emit the same public destination anchors.
- Preserve chapter-local note numbering, repeated-reference backlinks, collapsed source sections, source deep links and expansion for print.

Checkpoint: static HTML and hydrated output preserve the representative chapters' content, navigation and fallbacks. Resolve compiler compatibility here before bulk conversion.

### 3. Prove static rendering and the offline export early

- Add a Node/TypeScript build entry that renders the MDX React tree to HTML and assembles an edition. Use a hydratable React rendering API for interactive output; do not use `renderToStaticMarkup` as the source for a tree intended for hydration.
- Keep initial render state deterministic and shared between Node and browser. Verify that text and static figures remain usable without JavaScript or WebGL.
- Prototype the portable export before migrating the whole reader: embed CSS, fonts, photographs, SVGs, React/MDX browser code and model bytes into one file.
- Eliminate portable network dependencies, adjacent-file fetches and unresolved dynamic module URLs. Include resources nested inside SVGs and CSS; preserve inline-script escaping and dependency/font notices.
- Use Vite for the normal browser build. If the existing esbuild IIFE/binary-GLB path is reused temporarily for portable output, use the MDX esbuild integration with the same compiler options and parity tests. Keep one chapter compiler configuration; consolidate bundling only when offline behaviour is proven.
- Build into a temporary directory and replace successful outputs atomically. A failed conversion or missing asset must leave the last successful edition usable.

Checkpoint: a prerendered, hydrated sample and its diagrams work from a single file with network access disabled.

### 4. Migrate the reader and diagram lifecycle

- Move layout and reader controls from the Pandoc template and imperative reader into focused React/TypeScript components, reusing the established CSS, fonts and responsive design.
- Preserve the cover, contents, mobile dialog, focus management, skip links, active chapter/section state, previous/next navigation, history, progress and reading preferences. Keep existing local-storage keys or migrate their values explicitly.
- Retain all chapters for the no-JavaScript document and full-book print view. Apply enhanced chapter visibility only after the reader is ready.
- Adapt the existing `mount(host, { state, signal }) -> cleanup` contract behind `Diagram`. Keep asynchronous mounts, AbortController cancellation, retries, WebGL fallback, viewport-based disposal and the measured offscreen placeholder.
- Retain diagram state outside a transient live host so leaving the viewport or navigating away and back restores slider values and selections. Account for React development Strict Mode by making initialization, cancellation and cleanup safe under repeated setup/teardown.
- Ensure React updates do not reconcile or replace D3/Three.js-owned nodes. Keep diagram callbacks and wrapper identity stable; release model resources when their live scene is removed.
- Retire the old reader initialization when the React reader takes ownership. Do not run both `mountReader` and its React replacement or mount a figure through two observers.

Checkpoint: reader interactions and diagram lifecycle tests pass with the current design at phone, tablet and desktop widths.

### 5. Convert all chapter entries and connect assets

- Convert each `book/NN-.../index.md` to `index.mdx`, preserving the chapter folder and its assets. During transition, allow discovery of either entry format but reject both in the same chapter. Finish with MDX for every manuscript chapter.
- Convert Pandoc fenced diagrams and image attributes into tested component forms. Escape literal braces/angle brackets where MDX treats them as expressions or JSX. Do not rewrite technical claims, add facts or change captions/credits as a side effect of syntax conversion.
- Compare each converted chapter's text, headings, references, table cells, note definitions and figure inventory against its baseline. Keep research and credit files as `.md`; they are not chapter entry points.
- Generate the chapter and diagram import registries automatically. Keep diagram code, GLBs and heavy dependencies behind lazy imports in the web editions.
- Resolve images, SVGs, fonts, CSS and models through an edition-aware asset manifest. Verify model URLs against `loadModel` and `import.meta.url` rather than assuming Vite matches esbuild's existing loader behaviour.
- Test local web paths, the `/boxster-book/` Pages base and portable embedded assets independently. Keep checked-in model/poster authoring commands working; ordinary book builds should not regenerate geometry or posters.
- Preserve dependency/font notices and the handling of previously emitted hashed assets needed by an open edition during local rebuilds. Watch MDX, shared components and diagram edits in the Vite development server.

Checkpoint: every current chapter compiles, every reference resolves, and every discovered diagram has a functioning live view and static fallback.

### 6. Validate, switch npm commands and update CI

- Preserve meaningful checks in `tests/reader.test.js`, `tests/math-and-model.test.js` and `tests/component-explorers.test.js`. Update structural selectors intentionally; retain the behaviour protected by each test.
- Add focused build/compiler checks for MDX syntax, chapter ordering, stable legacy fragments, captions, alt text, table output, repeated notes, asset paths and actionable errors for missing references or imports.
- Run TypeScript checking explicitly; Vite's transpilation is not the type-checking gate. `@types/mdx` types imports, but do not assume `tsc` alone validates every JSX expression or prop inside MDX. Compile every chapter and validate the generated manifest, diagram IDs and shared component metadata separately.
- Run the full browser suite on portable, local web and Pages output. Cover offline operation, no JavaScript, unavailable WebGL, keyboard controls, saved state, navigation/history, print and responsive layouts. Treat hydration warnings, browser runtime errors and missing assets as failures.
- Inspect before/after screenshots, especially long captions, source disclosures, tables, dense SVGs and 3D tours. Check for horizontal overflow, clipping, layout shifts and unexpected diagram/model requests at the cover.
- Point the existing npm build commands to the Node build entry, retaining documented output paths and supported CLI options. Replace the Python preview server with Node/Vite serving while retaining usable preview URLs for all editions.
- Update GitHub Actions after parity passes: remove Python and Pandoc installation, retain Node/browser setup, run type checks plus builds/tests, then publish the existing `dist/site` artifact through the same Pages environment and permissions.

Checkpoint: a clean `npm ci`, type check and `npm test` succeed without Python or Pandoc installed. The output remains a static deployment.

### 7. Remove superseded code and document the result

- Remove the Python builder and Pandoc-only template once their replacements are active. Remove shared JavaScript build helpers only after proving they have no remaining portable-export, model-preview or poster-generation callers.
- Update README, interactive authoring documentation and planning references for `.mdx`, React components, MDX syntax and the Node/Vite commands. Keep dependency and build output ignores current.
- Record the `remark-gfm` decision and the reasons for any retained export helper. Avoid installing unused parallel Markdown pipelines.
- Deliver implementation changes and validation evidence for review. Staging, committing, pushing and deployment require their own user request; preparing this plan performs none of them.

## Completion criteria

- Every manuscript chapter is authored in MDX, with its prose, figures, tables, sources and credits preserved.
- Existing published chapter, heading and note links still resolve after source-file renaming.
- Shared React components render useful static content and hydrate without mismatches; browser-only diagrams retain their established controls, state and resource lifecycle.
- All current diagrams, model assets and printable fallbacks work across phone, tablet and desktop layouts.
- Portable, web and Pages exports pass their tests, with offline assets, correct project-prefixed URLs and included notices.
- The book build, development preview and CI use Node tooling without Python or Pandoc.
- The optional `remark-gfm` choice is explicit and tested against the manuscript's actual table and footnote requirements.

Additional references: [MDX esbuild integration](https://mdxjs.com/packages/esbuild/), [Vite rendering/build foundations](https://vite.dev/guide/ssr.html), [React prerendering](https://react.dev/reference/react-dom/static/prerender), [React hydration](https://react.dev/reference/react-dom/client/hydrateRoot).
