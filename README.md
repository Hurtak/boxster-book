# Porsche Boxster 2.9 book

The book uses the **2010 Boxster 987.2 2.9-litre** as its reference car. [Chapter 13, Brakes and stability systems](book/13-brakes-and-stability-systems/index.md), is the first complete sample draft. The other chapters currently contain their titles only.

## Chapter files

Each chapter has a numbered folder and an `index.md` file:

```text
book/
  01-the-2010-boxster-2-9-in-the-987-2-family/
    index.md
  02-the-yearly-timeline/
    index.md
  ...
  18-occupant-protection-and-system-integration/
    index.md
```

Keep one chapter per `index.md`, starting with `# Chapter title`. Use `##` and deeper headings within a chapter when writing begins. Numbered folders determine the reading order; numbers must be positive and unique. Add chapters using the same `NN-chapter-name/index.md` pattern, with at least two digits.

The [book guidelines](boxster-987-2-book-guidelines.md) define the chapter coverage. [Historical research](model-year-research.md) supplies source notes. These planning documents are separate from the manuscript and are excluded from the HTML build.

## Build the reading edition

Requires **Python 3.9+**, **Pandoc 3.10+** and **Node 22+**. Pandoc installation instructions are at [pandoc.org](https://pandoc.org/installing.html); no Python packages are required. Install the JavaScript build dependencies once:

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

The HTML includes all chapters in numerical order, a linked collapsible contents list, mobile styles and print styles. Styles, images, JavaScript and 3D models are embedded, so the interactive book works offline without a server. External source links still require an internet connection. Rebuild after editing Markdown or diagram code; the HTML is generated output.

For a larger book, build the **web edition**, which downloads diagram code and models as the reader approaches them:

```sh
npm run build:web
npm run serve
```

Open <http://localhost:8000/web/book.html>. This edition needs a server; keep `dist/web/book.html` and the adjacent `book-assets/` folder together. The portable edition remains at `dist/book.html`. Builds preserve older hashed web assets so an already open edition can finish loading; deploy to a fresh directory when cleaning up unused assets.

Optional paths:

```sh
python3 scripts/build_book.py --source book --output dist/book.html
```

Default paths are relative to this project, so the script also works when invoked from another directory. Explicit paths are relative to the directory where you run the command.

## Markdown conventions

- Paragraphs, lists, links, tables, code blocks and footnotes use [Pandoc Markdown](https://pandoc.org/MANUAL.html#pandocs-markdown).
- Store images beside their chapter and reference them relative to that chapter, for example `![Description](images/diagram.png)`. The build embeds them into the HTML and fails if a referenced resource cannot be loaded.
- Links such as `[Oil circuit](#oil-circuit)` can target a heading within the same chapter. Chapter-local identifiers and footnotes are kept distinct when the files are combined.
- The contents list is generated from chapter titles. Use it to navigate between chapters; links to other `index.md` files are source-file links and are not converted into book navigation.
- Chapter content should explain the 2010 2.9 first, then its options, changes in other years and differences on other models.

Edit `scripts/book.css` for presentation and `scripts/book.html` for the reading layout. The build never changes chapter files.

## Interactive diagrams

The brakes sample includes three working examples:

- **Car to brake, in 3D:** move one slider through the whole car, hydraulic connections, wheel brake and exploded assembly. Part buttons highlight and zoom in on the disc, pads, one-piece caliper, four pistons, hub or wheel. Drag to orbit and scroll or pinch to zoom.
- **Hydraulic clamping:** a D3 cutaway shows four pistons taking up pad clearance, then increasing relative pressure.
- **Speed and energy:** D3 plots kinetic energy as speed and illustrative total mass change.

[Diagram authoring and architecture](interactive/README.md) explains the boundary between shared code and chapter assets. D3 handles SVG diagrams and charts; Three.js renders the 3D GLB models. All runtime dependencies are bundled locally. Dependency license notices are embedded in the HTML and also shipped as `THIRD_PARTY_NOTICES.txt` in the web assets.

Every interactive figure has a static SVG for printing, disabled JavaScript or unavailable WebGL. Controls use native labelled sliders and buttons. The runtime releases 3D resources offscreen while retaining control values, and renders on interaction rather than running a continuous animation loop.

The car and brake are original **educational schematics**, not manufacturer CAD. The front disc has the stated nominal 318 × 28 mm envelope; bodywork, pipe routing, clearances and most component geometry are illustrative. `npm run models` regenerates the GLBs from the JavaScript geometry sources; the book build uses the existing GLBs.

Run `npm test` to rebuild both editions and check the energy calculation, GLB contents, offline interaction, keyboard controls, resource cleanup, phone layout, printing and fallback behaviour. Browser tests use an installed Google Chrome; set `BROWSER_EXECUTABLE_PATH` to use another compatible Chromium executable. Test screenshots are written to `dist/previews/`.

## Reader design

The reader uses the Achromatic ledger direction (seed `1652698549`), with a pale blue-grey ground and a centred paper sheet. The initially suggested icon rail was replaced with text navigation because the book has 18 named chapters. The contents list answers “Which chapter do I want to read?” and keeps the 2010 2.9 reference visible in the book heading. System fonts keep the output independent of font downloads.

Chapters other than the brakes sample remain intentional manuscript placeholders. The brakes chapter includes original schematics and interactive diagrams; no photographs have been added. The text column is deliberately capped at 68 characters and centred for reading.

## License

This project is licensed under the [MIT License](LICENSE). Third-party dependencies retain their own licenses; their notices are included in the generated reading editions.
