# Dashboard and climate-panel refinement

Verified **14 November 2026** for the 2010 European/UK Boxster2.9 reference. The former block-shaped equipment locator has been replaced by original documentary images with separate React layout/labels.

## Dashboard photograph

- **Source/credit:** Cameron Sports Cars Ltd, [2010 Boxster9872.9 manual listing U1674](https://www.cameronsportscars.com/vehicle-details/used-porsche-boxster-987-2-9-gen-2-manual-for-sale-in-chippenham-south-gloucestershire-u1674/).
- [Original JPEG](https://img.cdn.dragon2000.net/C1353/U1674/IMG_32624-large.jpg), **1280×853**, retained unchanged as `../../images/dashboard-rhd-original.jpg`. The original Cameron watermark is retained; no crop, recolouring, generated additions or mirroring.
- Dealer identifies a2.9 manual advertised as2010, supplied April2010, with options including leather, heated seats and larger wheels. This does not independently establish a model-year build record or every original fitted component. The photograph is evidence of visible shape and location, not original ordering availability, performance, mileage or an unchanged car.
- The visible radio was compared with Porsche's original CDR-30 photograph (UK01/10 p82/PDF39, existing chapter17 image). No optional internal CD changer, Bose or telephone capability is inferred merely from the fascia. The A/C marker identifies panel position; the detailed comparison below identifies the fitted climate version from its controls, rather than from an unlit display.
- The instrument faces are dark; wheel/column and perspective partially obscure the dials. Three markers identify the instruments, radio and climate panel without redrawing their proportions. `markers.json` stores original-image percentages. Unlike the removed schematic, this is a real RHD car; no claim that every dashboard/console control simply mirrors across LHD/RHD.

## Factory climate illustrations

Porsche AG, **Boxster, Boxster S Owner's Manual**, WKD98702110, **5/09**, [original PDF](https://billswebspace.com/Owners_Manual_Boxster_PCNA.pdf). North American edition used for mechanism/controls, not UK standard-equipment status. UK01/10 brochure printed76 and110–111 independently distinguishes standard A/C and optional573 automatic climate.

- **Manual A/C:** printed106, PDF108, JPEG object **422 0**, **715×345**; `pdfimages -f108 -l108 -j` image000, retained unchanged as `../../images/manual-ac-handbook-original.jpg`. Full-page render `handbook-p108.png` is retained for the component key and text. F temperature rocker, G AC max, K blower rocker; temperature and fan represented by bars.
- **Automatic climate:** printed109, PDF111, JPEG object **434 0**, **710×345**; `pdfimages -f111 -l111 -j` image000, retained unchanged as `../../images/automatic-climate-handbook-original.jpg`. Full-page render `handbook-p111.png` preserves the original page. F sets target, G AUTO, K manual fan adjustment. Printed110–111 supplies numeric target and override behaviour.
- Both images contain a factory magnifier and original A–K letters/yellow outlines. They are original Porsche artwork, not a new editorial bitmap composite. React displays a **CSS viewport x300,y40,width390,height280** into each original, preserving the enlarged panel, original callouts, rockers, sensor grille, display, demist/recirculation/AC OFF and outlet controls. Source pixels, aspect and colours are unchanged; no fake live display, AUTO text or temperature bars are painted into the blank screens.
- PCM/Sport Chrono/PDK/heating/ventilation pictured in surrounding handbook context are optional/generic illustrative equipment. They do not replace the 2.9's standard CDR-30/manual A/C or imply that every source-picture button is standard.

## Changes and limits

Removed the old simplified rectangle dash, equal-sized circular gauges, invented radio/climate fascia and literal mirrored-controls claim. The real dashboard retains asymmetric contours, vents, instrument binnacle, three-spoke wheel, knobs, buttons and centre-console proportions. The manual/automatic comparison now uses the actual panel outline and switch layout; differences are explained in native captions and a readable source key rather than a made-up display rectangle. The dashboard is a documentary photograph in perspective, not an orthographic dimensional drawing.

Porsche publication artwork © Porsche AG; dealer photograph © its original rightsholder/Cameron Sports Cars, individual photographer not identified. These are excluded from the MIT licence; no permission to republish asserted. React annotations/composition and explanatory captions are project work. SHA-256 and byte counts are in `assets.json`.
