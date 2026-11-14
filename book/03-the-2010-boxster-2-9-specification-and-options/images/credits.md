# Chapter 03 image credits

Both images are real Porsche catalogue photographs, extracted from the publisher's PDF image objects. Copyright remains with Dr. Ing. h.c. F. Porsche AG. These personal-reading reproductions are not covered by the repository's MIT licence. No generated image was used.

Source for both: Porsche, *The Boxster*, UK edition **01/10**, publication **WSLB1101000125 GB/UK**, © 2010. Exact source URL: <https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf>. Its colophon identifies the edition; the host's filename is not used as market/model-year evidence.

| Local file | Publication location | Extraction and modifications |
| --- | --- | --- |
| `boxster-2-9-period-front.jpg` | Printed p. **21**, PDF page **8**, image object **26**, 567 × 283 px | `pdfimages -f 8 -l 8 -j`; JPEG copied directly, no crop, retouch, recolouring or added labels. Image caption in source identifies **Boxster**, not S. Depicts a catalogue car with equipment; does not document any owner's specification. |
| `boxster-personalised-cabin.jpg` | Printed pp. **98–99**, PDF page **47**, image object **199**, 1,106 × 427 px | `pdfimages -f 47 -l 47 -j`; JPEG copied directly, no crop, retouch, recolouring or added labels. Original visible caption describes macassar interior package, macassar multifunction wheel, leather trim and optional equipment. A manual gear lever is visible. |

The three SVG diagrams are original explanatory illustrations by the book author, based on figures and option conditions credited in the manuscript. They are not Porsche factory drawings or measured performance plots.

The separately archived factory PET drawings, applicability/key pages and dated UK catalogue sheets are listed in [the chapter's parts-reference archive](../part-reference/README.md). Those unaltered publisher-page renders retain Porsche's copyright and are not additional author-created SVGs. Both chapter JPEGs were viewed again and independently matched byte for byte to fresh PDF image-object extractions during the 10 November 2026 parts-reference pass.


## Visual review additions — 13 November 2026

`vehicle-data-fields.svg`, `gearbox-acceleration.svg`

Original diagrams using UK01/10 technical tables pp126–127 and North American handbook WKD98702110 p274 (record fields only). Record values are intentionally anonymised, not an actual sticker. Acceleration chart has a zero origin and replaces the highlight-only interactive; the full table remains.

Factory material retains Porsche’s original rights; SVG composition/labels and teaching drawings are original project work. No generative alteration of documentary photographs.

## Photograph-based dimension overlays — 13 November 2026

The vector `reference-dimensions.svg` has been replaced by two original Porsche photographs composed with the shared React `DimensionedFigure`. SVG draws only the dimension and extension lines, with plain right-angle corners; HTML supplies the labels. The length and wheelbase labels interrupt their dimension lines. No source image is recoloured, resampled, mirrored, embedded in another SVG or saved as a composite.

- **Side:** unchanged `../../01-the-2010-boxster-2-9-in-the-987-2-family/part-reference/family-layout-refinement/uk-01-10-pdf-p5-side-000.jpg`, **2365 × 810**, UK 01/10 PDF p. 5, image object **13 0**. Porsche photograph of a red Boxster S with the roof down. The caption identifies the comparison variant; only length and wheelbase are placed here.
- **Front:** unchanged `../../16-lighting-electrical-systems-and-security/images/porsche-front-lights.jpg`, **381 × 282**, UK 01/10 printed p. 65 / PDF p. 30. Factory head-on photograph with raised roof and optional bi-xenon equipment; the source chapter's credits retain its extraction record. Display is capped to avoid upscaling the original pixels. Height, body width and mirror width are located here.

All five numbers remain those in UK 01/10 printed pp. 126–127, for the standard-chassis reference 2.9. Endpoints were inspected against the visible body ends, wheel centres, roof, ground, mirror tips and body edges. Photography has perspective: overlay line lengths are not a common millimetre scale, and the pictures do not establish an individual car's options or ride height. The front/rear depth difference can make the mirror span appear smaller than the nose. These are explicitly measurement locators, not photogrammetry.
