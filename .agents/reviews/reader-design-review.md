# Reader design review

Reviewed 10 November 2026. This change treats the project as a readable online book: a cover, a contents spine, one chapter at a time and illustrations within the text. It preserves the manuscript, the green and tan model, the existing diagram controls and the Pandoc/esbuild build.

## Findings and changes

The previous first screen was dominated by a two-column contents list. On a phone it became a long list before the reader reached any prose. Seventeen title-only chapters then appeared as consecutive headings, so the complete brakes sample was hard to find. The 30px book title, 24px chapter titles and 21px subheadings gave little separation; diagram notes were only 13px.

| Area | Before | After |
| --- | --- | --- |
| Entry | Contents followed by the entire manuscript | Illustrated cover with a direct link to the complete sample |
| Reading type | Georgia, 18px / 1.7 | Source Serif 4, 20px / 1.65 on desktop; 18px / 1.65 on phones |
| Headings and navigation | System UI | Source Sans 3, with a clearer chapter/subsection hierarchy |
| Cover title | 30px desktop, 27px phone | 64px desktop, 44px phone; at most two lines at review widths |
| Navigation | In-document contents | Sticky desktop contents, native modal drawer below 1100px, previous/next links |
| Chapter context | No persistent section guide | Active chapter highlight; section outline and progress on wide desktops |
| Unwritten chapters | Bare headings between other chapters | Dedicated planned-chapter state with a link to the sample |
| Notes | Global endnotes | Notes alongside their owning chapter, preserving reference IDs and backlinks |
| Diagrams | 13px notes, 14px buttons | 16px notes/buttons, 14px chart labels, native controls at least 44px high |
| Reading preferences | Fixed type size | Text-size controls, saved locally, with a 17–24px range |

The reading sheet stays capped rather than stretching across a wide monitor. The outer grid has equal gutters; narrower screens remove the side rails and give the page the available width. Tables contain their own overflow. Links, source URLs and diagram controls wrap within the page.

## Direction and assets

The dealt direction was **The page is the object**, seed **1298968287**. The idea: **the 2010 2.9 reference car becomes an illustrated field guide, with the contents as its spine and mechanical diagrams as inserted plates.** The live element is the existing car-to-brake explorer and the two D3 explanations.

The dealt condensed Archivo display typography was replaced with Source Serif 4 and Source Sans 3 because a long mechanical chapter needs comfortable sustained reading. The dealt promotional hero/ambient imagery and scroll scenes were adapted to a book cover and stationary reading page. Stock photographs and autoplay motion would add no explanatory material here; the original car illustration and user-controlled diagrams supply the imagery and interaction. Inspector allowances are explicitly limited to `few-pictures`, `still-page` and `no-footage` for this reason.

The cover is an original render of the project’s photo-guided model (`assets/book-cover.png`), not a photograph or a claim of exact geometry. No external photographs or footage were introduced. Fonts are Adobe’s [Source Serif 4](https://github.com/adobe-fonts/source-serif) and [Source Sans 3](https://github.com/adobe-fonts/source-sans), distributed under the SIL Open Font License. Their exact notices are in `assets/fonts/OFL-*.txt` and are included in the HTML and web asset notices. All three WOFF2 files are embedded in the reading editions; browser verification found no font-service requests.

## Visual review rounds

Scores use the design skill’s rubric, including its cap for fewer than four photographs. That rubric favours promotional pages; this book deliberately uses drawings and has no autoplay footage.

### ROUND 1 — original reader

Seen in one second: a contents list inside a generic document wrapper.

Idea (one sentence): the baseline car is present in the title, but the page does not yet behave like a book.

Live thing: the diagrams work once the reader finds chapter 13.

Layout words by section: title=small heading / contents=two-column list / manuscript=continuous column / diagrams=embedded panels.

Scores: design 5 · usability 5 · creativity 6 · content 7 → overall 5.4.

Caps applied: measured layout failures; fewer than four photographs; stationary page.

Top three problems, with screenshots and fixes:

1. `before/mobile-fold.jpg`: contents crowds out reading. Move navigation into a drawer on small screens.
2. `before/desktop-fold.jpg`: small title and weak hierarchy. Set an editorial cover and stronger chapter typography.
3. `before/desktop-page-01.jpg`: title-only chapters interrupt the route to the sample. Introduce a focused chapter view with honest planned states.

### ROUND 2 — first book layout

Seen in one second: the green Boxster and a clear book title.

Idea (one sentence): the contents forms the spine beside an illustrated reading sheet.

Live thing: direct chapter navigation, adjustable reading type and the existing mechanical diagrams.

Layout words by section: cover=illustrated page / chapters=reading column / diagrams=plates / notes=reference list.

Scores: design 6.5 · usability 7 · creativity 7 · content 7 → overall 6.0 (capped from 6.8 by measured failures).

Caps applied: fewer than four photographs; initial chapter-layout failures.

Top three problems, with screenshots and fixes:

1. `round-1/desktop-fold.jpg`: the tall illustration pushes the reading link below the fold. Use a tighter responsive illustration crop.
2. `chapter-1/mobile-fold.jpg`: programmatic heading focus leaves a large rectangle around the title. Retain keyboard outlines for controls and links; remove them from reading destinations.
3. `chapter-1/desktop-fold.jpg`: contents and the reading guide compete at intermediate widths. Correct responsive visibility and align the frame.

### ROUND 3 — final

Seen in one second: an illustrated Boxster book, with an obvious sample chapter to open.

Idea (one sentence): the 2010 2.9 becomes the field guide’s cover subject and the starting point for its mechanical plates.

Live thing: chapter navigation and explanatory diagrams work with touch, keyboard and offline resources.

Layout words by section: cover=illustrated page / chapter=focused column / navigation=spine and outline / diagrams=interactive plates / notes=reference list.

Scores: design 6.5 · usability 8 · creativity 7 · content 7 → overall 7.1.

Caps applied: photography cap retained; no invented material added to improve the score. The final score remains below 7.5 under this rubric.

Top three remaining limitations, with evidence and disposition:

1. `final-chapter/mobile-page-02.jpg`: the long sample still requires substantial scrolling. Section navigation is available through the wide-screen outline; further shortening would be a manuscript edit, outside this cleanup.
2. `final-cover/mobile-fold.jpg`: the cover uses the existing procedural illustration rather than a production-quality photograph. Model fidelity remains separate work.
3. Planned chapter states are intentionally sparse. The reader identifies them as planned; filling them requires writing the remaining manuscript.

## Verification

`npm test` rebuilds portable, web and Pages editions and runs 12 tests. Browser checks cover the portable file offline, project-prefixed asset URLs, model lazy loading, keyboard diagram controls, retained state, no-WebGL/no-JavaScript fallbacks, printing, chapter navigation, note deep links, browser history, the modal contents and saved type size. Responsive checks cover **320, 390, 600, 768, 1024, 1280, 1440 and 1920px**, including mounted interactive figures at 320 and 768px. No horizontal page overflow was found at those widths.

Chrome screenshots were reviewed at 1440, 768 and 390px for both cover and chapter, including every contact sheet emitted by the inspector. Additional screenshots check the phone contents drawer and notes. This is browser-based responsive verification, not testing on physical devices or a claim of Safari/Firefox coverage.

- `dist/design-review/before/`: original measurements and screenshots.
- `dist/design-review/final-cover/`: final cover; zero inspector failures and warnings.
- `dist/design-review/final-chapter/`: final chapter; zero inspector failures. Remaining measurement warnings concern text-node margins within the two navigation rails and the second introductory paragraph continuing the chapter heading. The grid gutters are equal and that paragraph is intentionally a continuation.
- `dist/design-review/phone-contents.png`, `phone-notes.png`, `desktop-notes.png`: additional reading states.
- `dist/design-review/print-sample.pdf`: browser print check; all chapters are included and interactive figures use their static illustrations.

The source lint reports no failures. Its outlined-control warning refers to real diagram buttons, inside the explicitly marked interface figures. Main text has **15.25:1** contrast on paper; muted text has **6.54:1** on paper and **5.86:1** on the surrounding grey; the green reading action has **9.95:1** contrast.

Generated output remains ignored. No chapter Markdown was rewritten, and no commit or deployment is part of this design cleanup.
