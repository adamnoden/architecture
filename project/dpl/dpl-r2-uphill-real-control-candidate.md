# DPL-R2 — 92 Uphill Road real-control candidate authoring

**Issue:** #658  
**Parent:** DPL-R / #647  
**Dependency:** DPL-R1 / PR #655 / merge `cb2838b6489fc6d6c82bafb999ebdd01b07be0eb`  
**Control site:** `DPL-R-CONTROL-001`  
**Frozen snapshot:** `24/1141/FUL` + accepted `25/1691/NMA` Rev B drawing lineage  
**Result:** **`REAL_CONTROL_CANDIDATE_NOT_AUTHORED_GEOMETRY_RECOVERY_FAILED`**

## 1. Question

DPL-R1 proved that the frozen 92 Uphill Road planning package satisfies the unchanged six-part candidate-authoring readiness contract.

DPL-R2 asks the next, stricter question:

> **Can the actual red proposal-demise geometry be recovered in a reproducible form and used to author one unchanged 12.0 m × 10.8 m Reference House placement?**

The answer on the present controlled pipeline is **not yet**.

This is not a finding that the Reference House does not fit.

It is a finding that the project cannot yet state the placement coordinates honestly from the source geometry available to the current retrieval path.

## 2. DPL-R1 remains valid

There is no rewind of DPL-R1.

The controlled drawing `255402/12 Rev B` genuinely contains:

- the red proposal demise;
- a declared `1:200 A1` site-plan scale;
- real street/context geometry;
- proposed datum and explicit levels;
- crossover/access geometry.

That is enough to establish that the evidence package contains the information class required by R1–R6.

DPL-R2 exposes a different seam:

```text
source contains sufficient controlled spatial information
    ≠
current pipeline can recover the boundary path as coordinates/vector geometry
```

The first proposition remains true. The second has not yet been proved.

## 3. Geometry-recovery attempts

The machine record is:

`project/dpl/sites/dpl-control-001-92-uphill-road-candidate-v01.json`

### GR-01 — indexed controlled planning document

The indexed public copy of `255402/12 Rev B` exposes the exact drawing identity, declared scales, proposal-demise legend, datum/levels and access notes.

What it does **not** expose through the current indexed-text path is the actual red proposal-demise path as coordinates or reusable vector geometry.

Result:

```text
DOCUMENT_IDENTITY_SCALE_AND_TEXT_RECOVERED_ONLY
```

### GR-02 — public PDF bytes / vector object recovery

The public document resolves as a one-page planning PDF, but the current retrieval path does not expose reusable source bytes/vector objects for deterministic geometry extraction.

A rendered screenshot would not solve this authority problem anyway: DPL-R2 explicitly forbids deriving the site boundary through raster-display pixel measurement.

Result:

```text
DOCUMENT_BYTES_NOT_RETRIEVABLE_CURRENT_PIPELINE
```

### GR-03 — alternative machine-readable same-authority search

A bounded search was made for:

- an exact machine-readable proposal-demise polygon;
- explicit boundary coordinates;
- same-lineage dimensional geometry capable of reconstructing the boundary without display-pixel measurement;
- a first-party/faithful machine source of the same controlled drawing geometry.

No such substitute was recovered.

Barnet's open planning-application datasets establish application records but do not provide the required `24/1141/FUL` proposal-demise geometry through the available machine path. The national Planning Data planning-application specification is not a reliable substitute here because application data participation remains incomplete and no exact controlled `24/1141/FUL` geometry was recovered from it.

Result:

```text
NO_EQUIVALENT_CONTROLLED_BOUNDARY_GEOMETRY_FOUND
```

## 4. Why DPL-R2 refuses to place the house

The Reference House footprint is exact:

```text
12,000 × 10,800 mm
```

To claim a real candidate, DPL needs an exact enough site polygon / transform relationship to prove that footprint lies inside the admitted proposal demise.

The following would be easy but invalid:

- measure the displayed PDF in pixels;
- measure a Google/OSM/web map;
- take an estate-agent plot polygon;
- infer the red boundary from the blue ownership boundary;
- borrow geometry from `26/1039/FUL`;
- use the already-approved replacement-house footprint as the Reference House position;
- visually eyeball a position that obviously appears to fit.

All would convert a real source into a synthetic placement while still calling the result real.

DPL-R2 therefore stops before candidate authorship.

## 5. Result

```text
DPL-R1 readiness                         = CONTROL_SITE_CANDIDATE_AUTHORING_READY
controlled proposal-demise geometry      = EXISTS IN SOURCE
machine-recoverable boundary path        = NOT RECOVERED
Reference House candidate                = NOT AUTHORED
result                                   = REAL_CONTROL_CANDIDATE_NOT_AUTHORED_GEOMETRY_RECOVERY_FAILED
COMPATIBLE @ SCREENING                   = NOT ADMITTED
INCOMPATIBLE                             = NOT ADMITTED
route exhaustion                         = NOT IMPLEMENTED
Reference House mutation                 = FORBIDDEN
DPL-16                                   = HELD
```

This result is intentionally narrower than `FOOTPRINT_NO_FIT`.

No fit test has occurred because there is not yet an admitted site polygon against which to run it.

## 6. Corpus boundary

The original empirical corpus remains untouched:

```text
DPL-RP-001 … DPL-RP-008 = unchanged
CANDIDATE_AUTHORING_READY = 0 / 8
NOT_READY                 = 8 / 8
```

`DPL-R-CONTROL-001` remains an instrumented control and remains excluded from any DPL-16 deployment-envelope sample.

## 7. What this teaches

DPL-Q's external-evidence boundary can be decomposed more precisely.

There are at least two distinct gates:

1. **evidence sufficiency** — does a controlled source contain the required geometry/orientation/levels/access facts?
2. **geometry acquisition** — can those source facts be brought into the controlled computational evidence graph without inventing coordinates?

DPL-R1 proves the first for this snapshot.

DPL-R2 currently fails the second.

That distinction is useful and should survive. It prevents `a scaled PDF exists` from silently becoming `the compiler knows the site polygon`.

## 8. Do not respond with a generic PDF scraper

The correct reaction is not automatically to build OCR, screenshot measurement, a council scraper or a generic drawing-vector extractor.

The missing object is still **controlled spatial geometry**, not parsing sophistication for its own sake.

A later gate should compare two routes:

### Route A — acquire the exact source geometry

For this same control, obtain one of:

- original/vector PDF bytes that can be deterministically parsed;
- CAD/GIS/source drawing geometry;
- explicit same-lineage coordinates/dimensions sufficient to reconstruct the proposal demise;
- an exact first-party/faithful machine-readable boundary source.

Then rerun DPL-R2 from the same frozen snapshot.

### Route B — select a second instrumented control whose spatial authority is natively machine-readable

This may be epistemically better if the purpose is to prove the end-to-end deployment seam rather than to prove PDF extraction.

A second control would need to be selected specifically for a **machine-readable controlled boundary**, not merely convenient documents, and would remain excluded from the empirical deployment-envelope sample.

Examples of suitable authority classes could include controlled survey/CAD/GIS geometry or another planning/site source with explicit coordinate geometry.

## 9. Next gate

Open a short post-R2 gate before doing either route.

It should decide:

> **Is recovering `255402/12 Rev B` source geometry the shortest valuable experiment, or should DPL deliberately choose a machine-readable real control to prove the end-to-end candidate path?**

Do not keep searching indefinitely around Uphill Road merely because DPL-R1 selected it.

The programme's objective is a trustworthy real deployment experiment, not loyalty to one address.

## 10. Closeout

DPL-R2 has not failed because the house does not fit.

It has refused to turn a picture of a boundary into a coordinate boundary without authority.

That is exactly the distinction the deployment compiler exists to preserve.
