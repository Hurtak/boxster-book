# Chapter 10 factory parts reference

Checked 10 November 2026 for the **2010 European/UK Boxster 987.2 2.9**, standard six-speed manual, with the seven-speed PDK kept as an option. These are the actual Porsche factory catalogue pages used to check the chapter, including the application lists beside each drawing. The educational diagrams remain separately authored schematics.

## Source and reproduction

- Author/publisher: Dr. Ing. h.c. F. Porsche AG, *Boxster 2009–2012*, PET model **987209**, catalogue **P33**, issue **19 July 2018**, 583 PDF pages.
- [Porsche-authored catalogue, independently hosted](https://www.porsche-preparation.com/downloaded/pet-porsche/boxster-2009-2012-type-987.pdf). Opened online and checked against the freshly downloaded original on 10 November 2026.
- Original PDF SHA-256: `c865de9263f5946db4c24874eb10e503be2343762b308695aa7bb6a943bfd2bf`.
- Each PNG is a complete, unaltered page rendered with Poppler `pdftoppm -scale-to 1800 -png -singlefile`. All callouts, headings, edition footers and page borders remain. Page numbers below are **one-based PDF pages**, rather than the plate's internal `-1/-2/-3` pagination. The nine drawing pages were visually inspected; application lists were read alongside them.
- Copyright remains Porsche's. The project's MIT licence does not relicense these excerpts. The complete source PDF is not duplicated here.

## Saved application keys

| Saved file | PDF page | Use and qualification |
| --- | --- | --- |
| [Engine applications](pet-engine-applications-p2.png) | 2 | A120 identifies the 2.9; A121 covers the 3.4 applications. This is a catalogue application key, not a European performance or chronology source. |
| [Transmission applications](pet-transmission-applications-p7.png) | 7 | For 2010: G8710 = Boxster manual; G8740 = Boxster S manual; CG200 = Boxster PDK; CG220 = Boxster S PDK. Later Spyder entries are explicitly separate. |
| [Option key, differential and PDK](pet-option-key-p9.png) | 9 | PR219 = ordinary differential; PR220 = locking-differential application; PR250 = PDK. The generic PR220 description includes a 40% label: **do not use it as this model's locking calibration**. Porsche's model-specific technical training and period UK literature establish 22% drive / 27% overrun instead. The same generic key includes legacy entries that do not establish facelift option availability. |
| [Option key, manual](pet-option-key-p11.png) | 11 | PR480 = six-speed manual. PR250 and PR480 must not be reversed. |

## Saved drawings and adjacent lists

| Plate and subject | Drawing | Complete application/parts list | Relevant callouts and applicability |
| --- | --- | --- | --- |
| **109-000 — forward engine support** | [PDF p. 96](pet-109-000-p96.png) | [PDF p. 97](pet-109-000-p97.png) | A120/A121. **1** engine bracket; **2** mounting console with central compliant support; **3** two stops; **4** separate vibration damper; **5–14** attachment hardware. The stops and damper are distinct from the central mounting. |
| **302-000 — complete manual transaxle** | [PDF p. 113](pet-302-000-p113.png) | [PDF p. 114](pet-302-000-p114.png) | G8710/G8740 + PR480. **1** complete manual gearbox, with separate PR219/PR220 entries; **2** lubricant. Several service replacements appear. This identifies whole assemblies, not their internal tooth topology or original production sequence. |
| **302-005 — manual output interfaces** | [PDF p. 115](pet-302-005-p115.png) | [PDF p. 116](pet-302-005-p116.png) | G8710/G8740 + PR480. **3** two drive flanges, with separate G8710/G8740 applications; **4** two radial shaft seals; **1–2** cover seal/fasteners; **6** sealing plugs; **11** breather. Other shift-system parts belong to chapter 8. The flange connects to the inner CV joint; its oil seal is separate from the boot sealing joint grease. |
| **306-000 — manual transmission support** | [PDF p. 117](pet-306-000-p117.png) | [PDF p. 118](pet-306-000-p118.png) | A120/A121 + PR480. **1** right bracket/support assembly; **2** left bracket/support assembly; **3–5** their fixings; **6** engine/transmission threaded joint. The drawing shows two compliant supports. It supplies no mount stiffness or internal filling specification. |
| **320-000 — complete optional PDK** | [PDF p. 119](pet-320-000-p119.png) | [PDF p. 120](pet-320-000-p120.png) | CG200/CG220. **1** complete PDK, with separate PR219/PR220 entries; **2** housing attachment; **4–5** distinct fluid listings. Service assembly availability is not dated UK order eligibility. Chapter 9 owns the clutch/hydraulic mechanisms. |
| **320-005 — PDK output interfaces** | [PDF p. 121](pet-320-005-p121.png) | [PDF p. 122](pet-320-005-p122.png), [continuation p. 123](pet-320-005-p123.png) | CG200/CG220. **15** short and **16** long drive flanges, with different gearbox applications; **17** caps; **18** retaining rings; **1, 19–20** shaft seals; **25** cover O-ring. The drawing supports distinct output interfaces, not a symmetrical manual/PDK parts claim. Hydraulic control and sump items are chapter 9 context, not new chapter 10 internals. |
| **370-000 — optional PDK support** | [PDF p. 127](pet-370-000-p127.png) | [PDF p. 128](pet-370-000-p128.png) | A120/A121 + PR250. **1** right bracket/support assembly; **2** left bracket/support assembly; **3–5** fixings; **6** engine attachment. The bracket numbers differ from manual plate 306-000. This plate reuses a manual-looking gearbox outline: its application list identifies the PDK supports; it does **not** establish literal PDK casing geometry. |
| **501-000 — rear carrier, bearing and hub** | [PDF p. 181](pet-501-000-p181.png) | [PDF p. 182](pet-501-000-p182.png) | **1** carrier; **2** angular ball bearing; **3** bearing-retaining cover; **4** four cover bolts per side; **5–6** wheel-speed sensor and fixing; **7** hub. **8–21** suspension links and attachments are contextual chapter 11 parts. PR603 bracket and PRXRP spacer entries are equipment-dependent, not baseline drive components. No hub replacement sequence proves the original 2010 hub number. |
| **501-005 — shaft, inner joint and hub retention** | [PDF p. 187](pet-501-005-p187.png) | [PDF p. 188](pet-501-005-p188.png) | **1** shaft: ordinary manual Boxster has distinct left `987 332 024 31` / right `987 332 024 30` entries, while ordinary PDK lists `987 332 024 50`, quantity two. S entries differ. **2–3** twelve inner-flange bolts and six paired spacers total; **4–6, 10–15, 17** clips, retaining ring, bellows and joint sealing parts; **11–12** end cap and joint; **7–8** splined hub and outer locknut; **9** joint consumables. The illustration differentiates the bolted inner connection from the splined/nutted wheel connection. |

## Operating principles and limits

The catalogue is **parts identity and connection evidence**. Its exploded separation is neither installed geometry nor a removal sequence. It does not supply joint angle/plunge limits, seal friction, mount damping/stiffness, bearing preload, tooth geometry or an LSD torque map. Current service numbers can include supersessions and do not establish original-build interchangeability.

Differential operation is checked against Porsche AfterSales Training, *2009 Technik Introduction — All Boxster/Cayman Models*, **PCNA 2/09, PNA 987 021 09, printed Transmission p. 86 / viewer p. 92**: [original training reproduction](https://www.manualslib.com/manual/3550487/Porsche-Boxster-2009.html?page=92), [accessible text reproduction](https://www.scribd.com/document/972719474/Boxster-2009). The direct viewer request initially failed; following page 92 from the reachable document index succeeded. This is a Porsche-authored PCNA edition, independently hosted. Its final-drive cutaway is in the **PDK** section; it supports the named differential members and locking mechanism without proving manual-specific gear geometry.

The ideal speed/torque laws and generic CV movement remain separately supported by the manufacturer engineering sources in [the chapter research](../research.md). The period UK sales documents there retain authority for option 220, wheel prerequisites and derivatives. PET's later PR220 service entries do not settle the uncertain date of the manual-only ordering qualifier's removal.

See [verification.md](verification.md) for every chapter topic, image, interactive model and 3D selectable group.
