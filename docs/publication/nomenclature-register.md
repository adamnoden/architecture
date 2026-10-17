<!-- nav-exclude: redirect -->
# PUB-NOM — NOM-00 Nomenclature Baseline Register

**Status:** NOM-00 baseline frozen; no rename or exposure decision is made by this record.  
**Programme baseline:** `e031fbabcb17724fb5561839fb4ff0ec27bd9790`  
**Inventory implementation head before this record:** `37e45d0829fbb34fc8dcfaa8f47bbd3bd2459bc9`  
**Tracking issue:** #156  
**Draft PR:** #157

## 1. What this register proves

NOM-00 establishes the identity landscape before PUB-NOM changes it.

The inventory is deliberately broader than the `HSA-P-*` trigger. It scans canonical repository text, current reader-facing source paths, publication sources, public SVG/media sources, public machine outputs, rendered VitePress HTML, the generated Working Edition PDF text layer and the Primer PDF text layer. It then reports known namespace families and a secondary queue of compact tokens not yet assigned to a family.

Counts across public columns **overlap**. A token present in a publication source can also appear in the rendered site and final PDF. They are exposure measurements, not quantities to sum.

This register is descriptive. Classification into `PUBLIC_NAME`, `PUBLIC_REFERENCE`, `PUBLIC_TECHNICAL`, `INTERNAL_STABLE`, `WORKFLOW`, `PROVENANCE_ONLY` or `LEGACY_PROHIBITED` begins at NOM-01/NOM-02.

## 2. Baseline public objects

At the baseline, canonical publication metadata records:

- Working Edition: **217 A4 pages**, 109 duplex leaves, 40 publication entries and 11 registered figures;
- Primer: **15 A4 pages**, 8 duplex leaves and 5 publication entries;
- active pattern corpus: **21 patterns**, plus 3 strategies and 4 held candidates;
- public route count in the project data plate: **103**.

The project data plate also records Reference House output schema `OH-RH-OUTPUT-1`, source-compile schema `HK-RH-COMPILE-1`, source-compile fingerprint `8993f24a8feded8a03d55bc7463654034d3ddd0bc54e283b81f2fbb466ad8aba`, and generated-artefact-set fingerprint `3a37a56878eaa746f28f39a574dd5dfc1fdc1b1e36b10115d1a58f4d9671ffff`.

Those machine identities are recorded here because they are part of the nomenclature landscape, not because this gate has decided whether they should change.

## 3. Inventory method

`scripts/nomenclature-inventory.ts` is the repeatable NOM-00 scanner. It recognises the following surfaces:

| Scanner surface | Meaning |
| --- | --- |
| `REPO_TOTAL` | occurrences in scanned repository text |
| `SITE_PUBLIC_SOURCE` | authored Markdown included by the current public-surface policy |
| `PUBLICATION_SOURCE` | source files and adapter dependencies entering either publication |
| `PUBLIC_MEDIA_SOURCE` | reader-facing SVG/media source under manuscript or generated Reference House output paths |
| `PUBLIC_MACHINE_SOURCE` | selected public JSON/register outputs |
| `SITE_RENDERED` | built VitePress HTML |
| `BOOK_FULL_RENDERED` | text extracted from the generated Working Edition PDF |
| `BOOK_PRIMER_RENDERED` | text extracted from the generated Primer PDF |
| `INTERNAL_OR_PROVENANCE` | scanned repository material outside the public-source classes |

The PR workflow builds the site and both PDFs before running the inventory. Workflow run `39033257338` passed repository health, publication builds, metadata verification and the nomenclature inventory.

## 4. Known namespace-family baseline

| Family | Example | Repo occurrences | Repo files | Site source | Publication source | Public media | Public machine | Rendered site | Working Edition | Primer |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `project.ovids-house` | `Ovid’s House` | 2526 | 243 | 519 | 372 | 1 | 5 | 922 | 329 | 8 |
| `project.house-kernel` | `House Kernel` | 229 | 88 | 25 | 7 | 0 | 1 | 48 | 6 | 0 |
| `project.metamorph-compiler` | `Metamorph Compiler` | 213 | 58 | 13 | 6 | 0 | 1 | 27 | 4 | 0 |
| `legacy.house-systems-architecture` | `House Systems Architecture` | 11 | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `legacy.house-design-doctrine` | `House Design Doctrine` | 27 | 13 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `legacy.long-life-house` | `Long-Life House` | 12 | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `pattern.hsa` | `HSA-P-001` | 1103 | 84 | 88 | 135 | 11 | 8 | 179 | 122 | 6 |
| `grammar.g01` | `G-01` | 708 | 58 | 35 | 16 | 1 | 2 | 104 | 16 | 0 |
| `grammar.g01-version` | `G-01 v0.1` | 109 | 34 | 8 | 3 | 0 | 1 | 22 | 3 | 0 |
| `grammar.gate` | `D8`, `D10-S`, `D12` | 644 | 52 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `maturity.level` | `M1`–`M5` | 775 | 70 | 58 | 11 | 0 | 55 | 138 | 11 | 0 |
| `reference-house.design-gate` | `RH-00`–`RH-11` | 730 | 57 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `reference-house.compiler-gate` | `RH-C0`–`RH-C5` | 1068 | 93 | 60 | 35 | 0 | 13 | 196 | 33 | 0 |
| `reference-house.fact` | `RHCF-*` | 1234 | 139 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `compiler.p0` | `P0` | 229 | 61 | 24 | 14 | 0 | 1 | 74 | 14 | 0 |
| `compiler.pattern-crosswalk` | `PAT-XW-01` | 160 | 43 | 10 | 8 | 0 | 1 | 29 | 8 | 0 |
| `compiler.cf` | `CF-01` | 248 | 60 | 24 | 14 | 0 | 1 | 73 | 14 | 0 |
| `compiler.ch` | `CH-*` | 776 | 77 | 42 | 33 | 0 | 8 | 141 | 33 | 0 |
| `compiler.coa` | `COA-*` | 376 | 49 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `compiler.h1` | `H1-*` | 811 | 77 | 34 | 55 | 4 | 1 | 57 | 55 | 0 |
| `publication.pr` | `PR-*` | 222 | 27 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `publication.pub-san` | `PUB-SAN` | 87 | 12 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `publication.drw` | `DRW-*` | 98 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `publication.pub-nom` | `PUB-NOM` | 28 | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `publication.nom-gate` | `NOM-*` | 167 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `prototype.id` | `P01`–`P04` | 321 | 33 | 29 | 0 | 0 | 4 | 89 | 0 | 0 |
| `prototype.w2` | `W2` | 376 | 38 | 11 | 0 | 0 | 0 | 34 | 0 | 0 |
| `figure.legacy-df` | `D-F*` | 32 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `machine.rh-compile-schema` | `HK-RH-COMPILE-1` | 5 | 3 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| `machine.rh-output` | `OH-RH-*` | 123 | 23 | 11 | 7 | 0 | 2 | 35 | 7 | 0 |
| `machine.house-kernel-build-meta` | `__HOUSE_KERNEL_BUILD_*__` | 9 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## 5. Representative current public exposure

The inventory confirms that the same namespace can reach several qualitatively different public surfaces.

- `HSA-P-*` occurs in the pattern system itself, the computational/public technical material, the project data plate, rendered site, full book and Primer. It is therefore not a local TOC formatting defect.
- `G-01` and `G-01 v0.1` appear in grammar pages, the grammar appendix, publication prose and the data plate. They require a semantic/public-reference decision rather than automatic suppression.
- `M1`–`M5` appear heavily in site/status and public-machine output, but only lightly in the Working Edition. Their current public role is different from a workflow gate and must be evaluated separately.
- `RH-C*`, `P0`, `PAT-XW-*`, `CF-*`, `CH-*` and `H1-*` all cross the current reader/public boundary to varying degrees. Their presence is concentrated in computational/reference material, but several also enter the full PDF.
- prototype identities `P01`–`P04` and `W2` are visible on the site but not in the Working Edition.
- long-form legacy names — `House Systems Architecture`, `House Design Doctrine`, `Long-Life House` — are absent from all measured public surfaces. PUB-SAN's existing public-history boundary is therefore working for those names.
- grammar-development gates, Reference House design-development gates, source-fact IDs, current publication-workflow gates and legacy `D-F*` figure IDs are all internal/provenance-only at this baseline.
- public machine namespaces already use two different project/system-derived prefixes: `HK-RH-COMPILE-*` and `OH-RH-*`. They are not primary-reader leaks, but NOM-01 must decide what stability promise public machine identity actually makes.
- House Kernel-derived site build metadata keys are internal at the baseline.

## 6. Secondary compact-token queue

The scanner deliberately performs a generic second pass so the programme cannot overfit to namespaces known in advance. The highest-frequency tokens not yet assigned to a NOM-00 family are recorded below. Their presence in this list is **not evidence that they are wrong or public**; it means NOM-01 must either assign them to an owned namespace family or explicitly dismiss them as domain/reference data outside PUB-NOM's governance scope.

| Token | Occurrences | Files |
| --- | ---: | ---: |
| `PAT-CANON` | 170 | 31 |
| `SYS-REP-001` | 166 | 51 |
| `ML-L2` | 112 | 6 |
| `VAL-TH` | 86 | 9 |
| `RH-STR-001` | 78 | 12 |
| `RH-STR-002` | 74 | 11 |
| `REF-TH` | 67 | 5 |
| `EVO-111` | 65 | 7 |
| `ART-RH-FP` | 51 | 5 |
| `FB-KSP-W2` | 50 | 5 |
| `FPC-W30` | 50 | 4 |
| `IEA-EBC` | 49 | 13 |
| `FPA-S5` | 48 | 5 |
| `IPC-J01` | 43 | 2 |
| `MELD-S1` | 43 | 6 |
| `HOUSE-MAINT` | 42 | 17 |
| `DOC-BED` | 40 | 6 |
| `UCL-EBL` | 39 | 12 |
| `S1-S` | 36 | 5 |
| `W1-W2` | 36 | 3 |
| `MHW-D5` | 31 | 6 |
| `DSH-D6` | 29 | 6 |
| `RH-TOL-001` | 28 | 4 |
| `P01-W2` | 27 | 4 |
| `PRI-001` | 24 | 7 |
| `RH-KO-001` | 24 | 8 |
| `CAD-MODEL` | 21 | 4 |
| `ML-H1` | 19 | 3 |
| `SYNT-HOUSE` | 19 | 10 |
| `VAL-SPLIT` | 18 | 8 |
| `MC-F` | 17 | 2 |
| `PAT-C` | 17 | 1 |
| `STUB-01` | 17 | 2 |
| `N-D` | 15 | 8 |
| `NEW-HOUSE` | 14 | 9 |
| `PAT-COMP-V` | 14 | 2 |
| `PRECEDENT-C` | 14 | 1 |
| `REFERENCES-LATEST` | 14 | 2 |
| `COA-CLOSEOUT` | 13 | 7 |
| `RH-OCC-01` | 13 | 5 |
| `TEST-S1` | 13 | 2 |
| `RB-01` | 12 | 6 |
| `RR-B` | 12 | 4 |
| `SHA-256` | 12 | 6 |
| `S2-S` | 12 | 3 |
| `CA-LOW` | 11 | 2 |
| `RR-C` | 11 | 4 |
| `F1-B` | 10 | 3 |
| `SEL-SOF` | 10 | 5 |
| `W1-LC2` | 10 | 2 |
| `RH-01` | 9 | 8 |
| `RH-02` | 9 | 7 |
| `RH-03` | 9 | 5 |
| `TEMP-04` | 9 | 3 |
| `TEMP-07` | 9 | 3 |
| `MAP-EVID` | 8 | 5 |
| `PLT-UPGR` | 8 | 5 |
| `AR-BOU` | 7 | 4 |
| `AS-ISO` | 7 | 4 |
| `CH-F1` | 7 | 2 |
| `DL-01` | 7 | 3 |
| `EDGE-02` | 7 | 2 |
| `PAT-EST` | 7 | 2 |
| `PAT-RET` | 7 | 2 |
| `STR-PATH` | 7 | 3 |
| `KPI-002` | 6 | 3 |
| `RES-001` | 6 | 2 |
| `RES-002` | 6 | 2 |
| `RH-06` | 6 | 4 |
| `TEMP-01` | 6 | 3 |
| `TEMP-02` | 6 | 3 |
| `TEMP-03` | 6 | 3 |
| `TEMP-05` | 6 | 3 |
| `TEMP-06` | 6 | 3 |
| `VAL-EVID` | 6 | 3 |
| `WALL-EXT-A` | 6 | 2 |
| `W1-LD` | 6 | 2 |
| `CAD-CAM` | 5 | 2 |
| `PVC-U` | 5 | 5 |

`RH-01`, `RH-02`, `RH-03` and `RH-06` in this secondary queue are a useful warning that the first-pass Reference House gate regex deliberately recognises only the current canonical two-digit gate family where it was initially specified; NOM-01 should distinguish historical gate syntax from current gate syntax rather than silently widening a regex and conflating them.

## 7. NOM-00 findings

### F0-01 — the trigger is systemic, not cosmetic

`HSA-P-*` has **122 occurrences in the final Working Edition text layer**, 179 in rendered site HTML, 135 in publication source and 88 in current public-site Markdown. Removing it only from the contents page would leave the same legacy-derived identity architecture intact.

### F0-02 — PUB-SAN did not fail

The long-form legacy project names measured by this audit have zero current public exposure. PUB-NOM is dealing with technically current namespace design, not rediscovering the development-history prose that PUB-SAN removed.

### F0-03 — public technical material currently carries substantial workflow identity

`RH-C*`, `P0`, `PAT-XW-*`, `CF-*`, `CH-*` and `H1-*` all occur in the full Working Edition as well as public technical/site material. NOM-02 must decide whether each occurrence is a useful technical reference, an inappropriate workflow leak, or a mixed family requiring surface-specific rendering.

### F0-04 — some visible compact systems are plausibly legitimate

`G-01`/`G-01 v0.1` identify a grammar instance/version and `M1`–`M5` identify an explicit project maturity model. Their visibility cannot be judged by the same rule as `CH-08` or `PR-01` merely because all are compact codes.

### F0-05 — stable machine identity is already brand-coupled in more than one direction

`HK-RH-COMPILE-*` and `OH-RH-*` exist on public-machine or public-technical surfaces. A future neutralisation rule for `HSA-P-*` cannot be adopted honestly without deciding whether machine namespaces may encode `House Kernel` or `Ovid’s House` elsewhere.

### F0-06 — identity and ordering are demonstrably separate in the pattern system

The publication deliberately orders patterns by architectural/generative reading logic rather than ID sort order. The current displayed numbers therefore create a false ordinal cue. NOM-03 must freeze **display policy** and **canonical machine identity** as separate decisions.

### F0-07 — the unclassified tail is large enough to require an ownership rule, not endless hand curation

The secondary queue includes research corpus IDs, evidence/test identifiers, structural/reference-house IDs, prototype/detail IDs and ordinary technical abbreviations. NOM-01 should establish a small rule for deciding what counts as a governed namespace family and what remains domain data. PUB-NOM should not become a universal acronym catalogue.

## 8. Boundary of this gate

NOM-00 has intentionally **not**:

- removed `HSA-P-*` from the book;
- selected `PAT-*`, `OH-P-*` or any replacement namespace;
- decided whether pattern IDs remain public at all;
- hidden computational codes;
- changed pattern order;
- reclassified G-01, maturity levels, prototype identities or machine schemas;
- created compatibility aliases;
- changed any architectural claim, evidence status or maturity assessment.

The next gate is **NOM-01 — nomenclature ontology and exposure contract**. Its first job is to turn this descriptive register into a small typed ownership/classification system; its second is to classify or dismiss the secondary candidate queue without broadening PUB-NOM into general repository tidying.
