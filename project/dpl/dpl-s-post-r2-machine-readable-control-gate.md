# DPL-S — Post-R2 machine-readable real-control admission gate

**Issue:** #660  
**Depends on:** DPL-R2 #658 / PR #659 / merge `68a18d0ac8eaa88d2440b4dfbe30ff513659b401`  
**Decision:** **DO NOT BUILD PDF-EXTRACTION MACHINERY; ADMIT ONE MACHINE-READABLE SECOND REAL CONTROL.**

## 1. Decision

DPL-R2 is accepted as a successful fail-closed result.

The programme should **not** respond by building OCR, raster measurement, a Barnet-specific document scraper or a generic PDF/vector extraction subsystem merely to rescue 92 Uphill Road.

The exact next experiment is:

> **Select one second instrumented real London control whose authoritative spatial boundary is natively machine-readable, then apply the unchanged R1–R6 readiness contract.**

If that site becomes candidate-authoring-ready, candidate authoring should follow as a separate packet.

## 2. Why Uphill Road should not dominate the programme

DPL-R1 proved that the `24/1141/FUL` / `25/1691/NMA` planning package contains the right information classes.

DPL-R2 proved that the current pipeline cannot recover the red proposal demise as coordinates/vector geometry without an inadmissible approximation.

That is useful evidence about the document-acquisition seam, but the programme objective is not:

> build a universal machine reader for every council planning PDF.

The programme objective is:

> prove that the controlled Reference House can be evaluated honestly against real site geometry and real target/evidence conditions.

Continuing to optimise around one inaccessible PDF would mistake a transport format for the architectural problem.

## 3. Second-control authority contract

The next control must possess a coherent real-site package containing all of the following **before candidate authoring begins**.

### A. Machine-readable boundary

A controlled polygon / coordinate geometry representing the exact land being tested.

Preferred authority classes:

- measured/topographical survey GIS/CAD geometry;
- authoritative local/national government GIS polygon;
- controlled planning/application polygon in coordinates;
- another survey/title/site geometry source with explicit provenance and accuracy boundary.

A map image, rendered PDF or marketing polygon is insufficient.

### B. Footprint-test geometry

The machine boundary must be explicit enough to test the unchanged Reference House footprint:

```text
12,000 × 10,800 mm
```

No gross-area surrogate.

### C. Orientation / coordinate frame

The geometry must have an explicit coordinate reference system or otherwise controlled real orientation.

### D. Datum / topography

Use a controlled level source sufficient for SCREENING house-ground placement.

Environment Agency LIDAR is a legitimate candidate source class where its survey date, resolution, CRS and vertical accuracy are explicit. Current EA composite DTM coverage is available at 1 m resolution, referenced to OS Newlyn / EPSG:27700, and constituent survey accuracy is stated as ±15 cm RMSE. A local measured survey remains preferable where available.

### E. Access / street geometry

The site package must show enough controlled relationship to a real public approach/street/access point to author the placement honestly.

This may come from the same GIS/survey source or another coherently linked authoritative/open geometry source.

### F. Site identity coherence

Every geometry/elevation/access source must be demonstrably tied to the same real land.

Where sources have different accuracy, date or legal meaning, preserve those differences rather than normalising them into one generic `KNOWN` state.

## 4. Current source landscape confirms this route is viable

The gate found that machine-readable London site polygons do exist as ordinary public data rather than requiring a new internal parser.

Examples include:

- the GLA Brownfield Register Feature Layer, which is explicitly a polygon service in EPSG:27700 and supports JSON / GeoJSON queries;
- borough-specific polygon services such as Lambeth's Brownfield Land Register;
- London Datastore Brownfield Register GIS packages published as GeoPackage in EPSG:27700;
- other borough/open GIS datasets where the exact site identity can be controlled.

These are **source classes**, not yet an admitted control site.

The GLA Brownfield Register itself warns that its boundaries are indicative and borough confirmation may be needed. That limitation must be preserved. A brownfield polygon cannot silently become legal title or survey truth.

The purpose of DPL-S1 is therefore to find one site where the GIS boundary, level source and access/source identity are collectively strong enough for SCREENING candidate authoring under the unchanged DPL-Q contract.

## 5. Selection discipline

The second control remains an **instrumented pipeline control**.

It must not be selected for:

- commercial attractiveness;
- likely planning approval;
- similarity to the synthetic Reference Site;
- likelihood that the Reference House fits;
- statistical representativeness of London.

It should be selected for:

- machine-readable authority;
- source coherence;
- an ordinary enough residential/site condition that the end-to-end result remains interpretable;
- sufficient size/shape evidence to run the footprint test without first solving another acquisition problem.

## 6. Corpus / deployment-envelope boundary

Freeze:

```text
DPL-R-CONTROL-001 Uphill Road            = instrumented control, excluded
DPL-S future second control              = instrumented control, excluded
DPL-RP-001 … DPL-RP-008                  = empirical corpus unchanged
DPL-15C                                  = 0 / 8 candidate-authoring-ready
DPL-16                                   = HELD
```

Even if the second control runs end to end, it proves the machinery, not the London deployment envelope.

DPL-16 still requires real deployment evidence from a sample not selected principally for data convenience.

## 7. Why no PDF subsystem is admitted

DPL-S explicitly rejects, at this stage:

- OCR as planning geometry authority;
- raster/screenshot measurement;
- generic council scraping;
- generic PDF-to-SVG/vector extraction;
- a Barnet-specific adapter;
- inferred polygons from map tiles;
- automatic substitution of a later planning application;
- a geometry-recovery project detached from an actual deployment need.

A future real project may still ingest PDFs through a controlled document workflow, but DPL does not need that machinery to answer its current architectural question.

## 8. Next authorised packet

Exactly one:

> **DPL-S1 — machine-readable real-control selection and R1–R6 admission**

DPL-S1 should:

1. search for one real Greater-London site with a controlled machine-readable boundary;
2. prefer primary/government GIS/survey authority;
3. bind exact geometry source, CRS, update/version/date and accuracy/claim boundary;
4. bind controlled elevation/datum authority;
5. bind controlled street/access relationship;
6. preserve source-to-source site identity coherence;
7. apply the **unchanged** DPL-15C R1–R6 contract;
8. produce exactly one READY / EVIDENCE_GAP / SOURCE_CONFLICT result;
9. author **no Reference House candidate yet**;
10. keep the site excluded from DPL-16 sampling.

If DPL-S1 cannot find such a site after a bounded search, record that result rather than weakening the contract.

## 9. Closeout

DPL-R2 has narrowed the problem usefully.

The next missing object is not a better PDF parser. It is a real site whose authoritative geometry already speaks a machine-readable spatial language.
