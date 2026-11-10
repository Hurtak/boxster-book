# Chapter 06 research: air, fuel, ignition and control

Checked 10 November 2026. Reference: European/UK 2010 987.2 Boxster 2.9, six-speed manual, optional PDK. Primary Porsche technical and catalogue publications establish fitment; Bosch and HELLA explain generic mechanisms. Contemporary Porsche material hosted by an archive remains Porsche-authored. No current supplier component specification is transferred to the 2010 car.

## Porsche evidence

The principal technical authority is *2009 Technik Introduction — All Boxster Cayman Models*, Porsche AfterSales Training, hosted at [ManualsLib](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html). The introductory notice says original Porsche AG English content was edited for North America; use UK catalogue for UK options. Printed Fuel/ignition pagination is six below the viewer page number.

| Subject | Exact primary location and use |
| --- | --- |
| Controller and sensing | Printed p. 58 / [viewer 64](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=64): ME 7.8.2, MAF-7, LSU4.9 ahead and LSF4.2 downstream, EV14, active coils, PDK communication. Prefer this exact controller label to sales brochure ME7.8 family shorthand. |
| Air cleaner | Printed p. 51 / [viewer 57](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=57): retained air-cleaner architecture; Boxster outlet Helmholtz-resonator revision. Its 3.4-manifold subsection is not assigned wholesale to 2.9. |
| 2.9 intake and injectors | Printed p. 59 / [viewer 65](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=65): base-specific manifold, port flange injector location, tuning/distribution flaps, EV14, approximately 4 bar. |
| Ignition | Printed pp. 49–50 / [viewer 55](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=55), [56](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=56): coils, driver, knock control and surface-gap plugs. |
| Sensor placement | Printed p. 53 / [viewer 59](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=59): LSU before first catalyst; LSF between first and second catalyst. Avoid the imprecise statement that downstream sensors follow every catalyst. |
| Emissions difference | Printed p. 60 / [viewer 66](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=66): 2.9 secondary air retained; European Euro5. Printed p. 56 / [viewer 62](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=62): DFI warm-up without secondary air. |
| DFI comparison | Printed p. 41 / [viewer 47](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=47): 3.4 high-pressure system, 40–120 bar; no assignment to 2.9. |

[Porsche January 2010 UK brochure](https://mrsportscars.com/wp-content/uploads/2019/11/Porsche-Boxster-987-Gen-2-Sales-Brochure-UK-US-2010-2011.pdf), printed pp. 28–31, explicitly labels its high-pressure illustration **3.4 Boxster S**. Printed pp. 56–57 establish Sport Chrono's accelerator characteristic and PDK-dependent functions; the plotted Normal/Sport curves meet at maximum. Printed pp. 126–127 retain one ordinary 2.9 peak-output specification. Its general engine-control diagram on pp. 34–35 lists fuel-pump control and contains a broader input list; it is not a claim that both variants share every listed pressure sensor.

[UK launch brochure, 08/08](https://porschecarshistory.com/wp-content/old/brochures5/26/2009%20987%20Boxster%20UK.pdf), printed pp. 34–35, supplies the documented input/output diagram. [PCNA 2012 technical sheet](https://newsroom.porsche.com/dam/jcr:f533d37f-82ef-4c9c-90cc-56b43185a8de/2012_Boxster_Specs.pdf), p. 1, supports injection/controller-family continuity. It is not UK equipment evidence; no annual software/part history established. Its other numerical irregularities are irrelevant to the injection distinction.

[Spyder UK January 2010 brochure](https://porschecarshistory.com/wp-content/old/brochures2/93/2010%20987%20Boxster%20Spyder.pdf), printed pp. 24–27, 42–43, and [Porsche Netherlands Black Edition release, 2 February 2011](https://nieuws.porsche.nl/slechts-987-exemplaren-rijk-uitgeruste-boxster-s-black-edition/) establish DFI and variant output. European DIN horsepower is expressed as PS.

## Mechanism sources

- Bosch Mobility: [accelerator-pedal module](https://www.bosch-mobility.com/en/solutions/air-management/accelerator-pedal-module/) and [electronic throttle sheet, p. 2](https://www.bosch-mobility.com/media/global/solutions/commercial-vehicles/powertrain-solutions/natural-gas/electronic-throttle-valve/ds_productdatasheet_electronicthrottlevalve.pdf): torque request, motor/angle feedback and system coordination.
- Bosch Mobility: [port injection](https://www.bosch-mobility.com/en/solutions/powertrain/gasoline/gasoline-port-fuel-injection/), generic metering; current example pressures explicitly unused.
- Bosch: [Automotive Electrics and Automotive Electronics, fifth edition](https://device.report/m/14f02593b29bf3a81944c4dc5e9ef8c3ffc497fa6b4f1c6f826418e60878add1), printed pp. 20–22 for coil principle and 336–338 for air-mass measurement. Manufacturer-authored text, archive-hosted.
- Bosch: [knock sensor sheet, p. 2](https://www.bosch-mobility.com/media/global/solutions/commercial-vehicles/powertrain-solutions/natural-gas/knock-sensor/product_data_sheet_knock_sensor.pdf), generic vibration/retard principle.
- Bosch: [Lambda sensors, Technology](https://www.boschaftermarket.com/xrm/media/images/country_specific/sg/services_and_support_6/downloads_18/lambda_sensors.pdf) and [wideband sensor](https://www.bosch-mobility.com/en/solutions/sensors/wideband-lambda-sensor/), generic feedback/heating.
- HELLA: [secondary-air system, Basics](https://www.hella.com/techworld/en/technical/car-electronics-and-electrics/secondary-air-injection-system/), oxidation and catalyst heating; no example duration/threshold assigned to Boxster.

## Original figures and limits

`air-path.svg` is a functional flow sequence, not a drawing of physical pipe routing. `injection-location.svg` compares fuel location and documented system-pressure ranges; no injector angle, cylinder shape or valve timing is to scale. `engine-mixture-feedback` is an original D3 teaching model with persistent native sliders and no autoplay. Metered air and base fuel are normalised to one; actual air = 1 + extraAir/100; each abstract step adds 60% of the remaining fuel deficit. Lambda = actual air / fuel. There is no real time axis, calibration claim, controller identification method, trim limit or diagnostic verdict.

One real period photograph of Sport Chrono equipment is locally retained and visually inspected; see [credits](images/credits.md). It neither documents a particular owner's options nor identifies hidden engine hardware.

No detailed fuel-pump replacement inventory, VIN breakpoints, ECU software revision history or current parts supersessions was established. Fuel-pressure values describe the documented systems; this is not a workshop test procedure. Exact Sport throttle curves are not reverse-engineered from a sales graphic.

## Scoped verification

The manuscript parses with Pandoc; footnote references/definitions and local image references match. All three SVGs parse as XML, and the module passes `node --check`. Direct calculation checks cover zero/10%/20% extra air, monotonic approach to lambda one, six-percent first-step fuel correction for the ten-percent example, and final correction convergence. Isolated Chrome rendering at 760 px and 390 px passed control, state-remount and horizontal-overflow checks; screenshots and the cropped photograph were visually inspected. Temporary evidence: `/tmp/boxster-ch06/figures-760.png`, `/tmp/boxster-ch06/figures-390.png`. The root author performs the complete book build and integration checks.
