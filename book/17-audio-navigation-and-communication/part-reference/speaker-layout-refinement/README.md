# Speaker-package locator reference

Checked **14 November 2026** for the **2010 European/UK Boxster987.2 2.9**. The diagram compares the standard4-speaker, Sound Package Plus7-speaker and BOSE11-speaker arrangements.

## Primary references

1. Porsche, *The Boxster*, UK **01/10**, document WSLB1101000125, printed **82,87–89**, [original brochure](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf). The provenance-matched original was read again and its printed88–89 spread inspected. `porsche-uk-01-10-p42.png` preserves that full spread, including the component captions. Body dimensions and wheelbase are from printed126/PDF59.
2. Porsche **PET987209**,19July2018, **911-005 / PDF579–580**, [drawing](../pet-911-005-p579.png) and [application list](../pet-911-005-p580.png). Re-read the list directly from the original PDF. The drawing supplies mounting/assembly boundaries; it is not dimensioned CAD.
3. VDL Adelaide, [part99764502100, item987A_349202](https://vdladelaide.au/products/987a_349202), [original photograph](https://vdladelaide.au/cdn/shop/files/349202_1.jpg?v=1788070067&width=1946), retained unchanged as `tweeter-99764502100-original.jpg`. It shows a small round tweeter housing, protective radial ribs, mounting features and its connector. Seller identifies a CaymanR donor; use here is the same PET-listed part identity and visible shape, not proof of an individual2010 Boxster's equipment.

4. Porsche AG, [factory overhead photograph of the 987 Spyder](https://www.stuttcars.com/wp-content/uploads/2021/10/stuttcars-987-spyder-20-copyright-porsche.jpg), [archive page identifying Porsche copyright](https://www.stuttcars.com/porsche-boxster-spyder-2011-2012/), retained unchanged as `porsche-spyder-overhead-original.jpg`. Used to cross-check the common body silhouette, bonnet/headlamp relationship, windscreen projection and cockpit orientation. Its distinctive rear deck, bucket seats, door trim and speaker equipment are **not** transferred to the 2010 2.9. The normal Boxster's rear lid, roof bay, seats and rear enclosure continue to follow the period UK01/10 photograph. An overhead photograph still has lens/perspective distortion; it is not an orthographic dimensioned plan.

## Original Porsche photographs

The following are native JPEGs extracted with `pdfimages -f42 -l42 -j` from the unchanged UK01/10 original. No resampling, compositing, new circles, annotations or retouching. Source PDF SHA-256: `69b7491a26a7ec3609a0ef92299f276f158b311207e8cad1596c8049ac4031ac`.

| File suffix | Object | Native size | Content |
| --- | --- | --- | --- |
| `p89-000.jpg` |179 0|496×292|Factory BOSE cabin cutaway and component locations|
| `p89-001.jpg` |180 0|165×141|70mm dashboard centre speaker position|
| `p89-002.jpg` |181 0|165×141|25mm outer dashboard tweeter grille|
| `p89-003.jpg` |182 0|165×141|Door trim, midrange and bass positions|
| `p89-005.jpg` |184 0|346×141|Rear enclosure behind the seat|

The source's steering-column microphone photo, object183, is not used as a speaker reference. Source photographs remain reference evidence; the manuscript's diagram is original SVG artwork with native live text.

## Corrected physical count

| Package | Dashboard | Doors, both sides | Rear | Total |
| --- | --- | --- | --- | --- |
| Standard |2 tweeters|2 bass drivers|0|4|
| Sound Package Plus |2 tweeters +1centre|2 midrange +2bass|0|7|
| BOSE |2×25mm tweeters +1×70mmcentre|2×80mm midrange +2×200mm bass|2×130mm bass +2×65mm mid/high|11|

The older locator incorrectly put **three speakers in each BOSE door and only two in the rear**. UK01/10 printed89 and PET580 contradict that. The revised live state, all static illustrations and accompanying prose now agree. The UK brochure's65mm rear nominal size is retained rather than the64mm in the older general-repair publication. The old CDR24 amplifier architecture is not applied to CDR30.

PET separates standard PR441 bass99764555100, Plus PR490 bass99764555300 / midrange99764554300, and BOSE PR680 bass99764555500 / midrange99764554500. Standard/Plus share99764502100 tweeters; BOSE uses99764502500. Rear subwoofer catalogue01/02 service suffixes are chassis-dependent alternatives, not a second enclosure or proof of a2010 retail revision.

## Geometry and presentation

### Cabin and body correction — 14 November 2026

The earlier plan had malformed seat-cushion path coordinates: adjacent interpolated numbers were concatenated without separators. That left the cushions invisible or grossly distorted. Both cushions are now closed, bounded paths with side bolsters and transverse upholstery seams; the backrests and head restraints are behind them. Seats flank the console symmetrically. In a nose-left plan the vehicle's left is **below** the centreline: the LHD wheel and instrument binnacle now align with the lower seat, ahead of its cushion. The heading explicitly identifies LHD.

The windscreen has a wider fore/aft projection, a bowed lower edge and a separate header; the dashboard, steering and footwells sit together beneath/behind it. Body contours now distinguish the front wings, narrower door waist and rear haunches. Headlamps are curved housings with two lens positions, rather than polygons; rear lamps have shaped red lenses and a clear strip. The bonnet, normal-Boxster clamshell and rear lid are separate panel outlines. Dashed tyre outlines indicate hidden wheel positions instead of opaque blocks drawn over the fenders. Body length/width and axle spacing retain the published scale; contour and cabin placement remain photo-guided, not exact fitting geometry.

The live figure and all three static states share this geometry. Browser checks guard LHD orientation, seat/steering alignment, bounded visible cushions, symmetric seating, body aspect ratio and wheelbase, as well as the existing speaker counts.


- The car body envelope has the **4,342:1,801** length/width ratio and **2,415mm** axle spacing at the same scale. Curved nose/tail, bonnet and rear lid, wheel positions, windscreen, seats, console and rollbars make the orientation explicit. Interior trim and component zones remain illustrative. The plan is shown with the roof and trim cut away, front to the left.
- Speaker positions are highlighted as **regions**, rather than pretending that vertically separated door speakers sit in a fore/aft line. A separate door elevation shows midrange above bass and the four-bolt housing. Standard has no centre or door midrange; only BOSE gets the rear enclosure.
- The enlarged dashboard tweeter follows the photographed round ribbed clip-in housing. Bass/centre/midrange frames and mountings follow PET; the rear shelf outline and front grilles follow the original enclosure photo and PET. The rear drawing cuts away the cover to reveal the two larger bass drivers and preserves the two front-facing mid/high drivers.
- BOSE **nominal driver-size** ratios guide the relative drawing sizes:25:70 on the dashboard,80:200 in the door,65:130 at the rear. These nominal classes do not establish exact diaphragm or housing measurements; an outer decorative grille is a different dimension. Details use separate enlargements, not a shared car-scale physical diameter.
- Hidden structure, mounting coordinates, grille rib count, exact enclosure angles, brackets, offsets, stereo-channel allocation and crossovers remain schematic. This is not a fitting, removal, electrical or acoustic calibration guide.

## Authoring

`../../diagrams/speaker-package-locator/drawing.ts` is shared by the live view and the static generator. Native HTML explains each enlarged group in the live view and stacks on narrow screens. The package selector stays above the drawings, so adding the BOSE rear detail does not move the controls. The body plan stays identical between packages.

Regenerate static illustrations and the standard poster after an artwork change:

```sh
npx vpx ./book/17-audio-navigation-and-communication/diagrams/speaker-package-locator/generate.ts
```

Porsche publication imagery remains © Porsche AG; VDL imagery remains © its original rightsholder. They are excluded from the project MIT licence; no permission to republish is asserted. Original project drawings and code are separate. Byte counts and SHA-256 hashes for saved source assets are in `assets.json`.
