# Reference atlas image credits

Source: Porsche AG, *The Boxster*, UK edition01/10, WSLB1101000125 GB/UK. [Original brochure](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf). Individual photographers are not named. These are third-party Porsche catalogue photographs/samples; the project’s MIT licence does not relicense them. Visible group credits and source notes appear in the manuscript.

Extracted with Poppler pdfimages as PNG, retaining original dimensions; each image was matched to the complete labelled spread. No generated car/seat/wheel photograph, substitution or retouching. The GT Silver and two-tone samples are bounded renders of their PDF vector/composite swatch areas, not guessed RGB fills.

## Wheels

Baseline: copied original chapter12 `boxster-iii-17-inch.jpg`, PDF24 object’s original165×209 JPEG. Optional designs from PDF50:

| File stem | Extraction index | Object / native size |
| --- | --- | --- |
| cayman-ii-17 | 0 | 272 / 165×138 |
| cayman-s-ii-18 | 1 | 273 / 165×138 |
| boxster-s-ii-18 | 2 | 274 / 165×138 |
| carrera-s-ii-19 | 3 | 275 / 165×138 |
| carrera-classic-19 | 4 | 276 / 165×138 |
| sportdesign-19 | 5 | 277 / 165×138 |
| carrera-sport-19 | 6 | 278 / 165×138 |
| 911-turbo-19 | 7 | 279 / 165×138 |
| 911-turbo-ii-19 | 8 | 280 / 346×301 |

The extracted image order is CaymanII, CaymanSII, BoxsterSII, CarreraSII, CarreraClassic, SportDesign, CarreraSport, 911Turbo, 911TurboII. All are offered on the ordinary2.9 in this dated UK table.

## Seats

PDF35, printed74–75: `comfort-seat.png` index0/object141; `adaptive-sports-seat.png` index2/object143; `sports-bucket-seat.png` index1/object142. Each165×209. Baseline support SVG is original project artwork linked from chapter15.

## Catalogue colour samples

PDF48, printed101–104. Extraction indices below refer to a separate page48-only `pdfimages -png` run. Hood samples are small catalogue car photographs. Other entries reproduce paint/material samples; colour appearance is subject to print/screen reproduction.

| File stem | Extraction index |
| --- | --- |
| black | 1 |
| guards-red | 2 |
| carrara-white | 3 |
| speed-yellow | 4 |
| basalt-black | 0 |
| platinum-silver | 5 |
| dark-blue | 6 |
| ice-blue | 7 |
| macadamia | 8 |
| meteor-grey | 9 |
| aqua-blue | 10 |
| racing-green | 11 |
| cream-white | 12 |
| gt-silver | bounded render of original swatch |
| amethyst | 13 |
| ruby-red | 14 |
| black-hood | 15 |
| stone-grey-hood | 16 |
| metropole-blue-hood | 17 |
| cocoa-hood | 18 |
| red-hood | 19 |
| black-interior | 31 |
| stone-grey-interior | 30 |
| sand-beige-interior | 29 |
| ocean-blue-interior | 28 |
| terracotta-interior | 36 |
| cocoa-interior | 47 |
| two-tone-interior | bounded render of original swatch |
| dark-grey-interior | 42 |
| natural-brown-interior | 39 |
| carrera-red-interior | 48 |

GT Silver crop: x533/y207/137×63 in a2000px-wide render of PDF48. Two-tone crop: x1520/y299/133×63 in the same render. Both crops include only the intended catalogue swatch. Source originals and mapping contact sheet inspected locally in `/tmp/boxster-coverage-sources/`.

## Factory-reference verification, 10 November 2026

All 44 Porsche atlas assets are unchanged. Forty-one native PNGs byte-match fresh `pdfimages -png` extraction from the original UK 01/10 PDF; the baseline JPEG byte-matches PDF24's original image object 1. The GT Silver and two-tone images exactly match the documented crop pixels of a fresh full-page PDF48 render at 2,000 pixels wide. The complete labelled wheel, seat and palette spreads were visually inspected again.

The [chapter reference inventory](../part-reference/README.md) records the source editions, SHA-256 hashes, individual page filenames and rendering scales for 27 Porsche PET pages, 12 dated ordinary UK brochure spreads and one UK Black Edition price-list spread. These are unaltered complete-page manufacturer references, with numbered callouts, application columns and source footers retained. They remain Porsche copyrighted material, separate from the original project seat-support SVG imported from chapter 15; neither the PET pages nor the catalogue reproductions are MIT-licensed project artwork.
