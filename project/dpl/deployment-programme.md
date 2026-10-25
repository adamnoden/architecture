# Deployment Programme

**Programme code:** DPL  
**Owning issue:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Current main baseline at S1 admission:** `e498e55b479ece575872068d39cab82cc0a66608`  
**Latest merged gate:** [#660 — DPL-S](https://github.com/adamnoden/architecture/issues/660) / PR #661 — second machine-readable real-control admission  
**Current authorised packet:** [#663 — DPL-S1](https://github.com/adamnoden/architecture/issues/663) — machine-readable real-control selection and R1–R6 admission  
**Programme maturity:** **M4 — internally controlled at the bounded synthetic SCREENING-result scope. Real-site deployment remains unvalidated.**

## Purpose

DPL establishes the machinery required to ask whether the controlled Ovid’s House Reference House can be deployed honestly onto real land under declared site, jurisdiction, evidence and assurance conditions without confusing architectural authorship, site truth, external authority, compiler proof or professional judgement.

The deployment question remains:

> **Can this controlled Reference House revision be deployed on this site, under this exact target composition and evidence state, while preserving its architectural identity and satisfying every obligation due for the requested assurance profile?**

Governing rules remain:

> **Compatibility before adaptation.**

> **The compiler evaluates architecture; it does not silently author it.**

> **Unknown reality stays unknown. Missing evidence is not a pass.**

> **A controlled planning or cadastral polygon is spatial evidence at its stated authority; it is not silently upgraded into legal-title certainty.**

---

# Current controlled state

## 1. Synthetic deployment machinery — controlled

DPL-01 through DPL-13 establish the current ontology, Reference House conformance contract, assurance/result semantics, target composition, site/interface model, canonical synthetic site machinery and SCREENING aggregation path.

The controlled synthetic programme has proved, among other things:

- deterministic site / candidate / target / interface / result identity;
- owner-complete SCREENING coverage composition;
- explicit separation of architectural review, native computation and external evidence;
- bounded London strategic + borough target composition;
- canonical whole-site `UNRESOLVED @ SCREENING` authority;
- refusal to emit `COMPATIBLE` merely because represented checks are green;
- refusal to emit `INCOMPATIBLE` without separately controlled invariant-blocker / route-exhaustion authority.

That remains the basis of DPL's M4 statement.

It does **not** establish real-site deployability, planning permission, regulatory compliance, legal clearance or M5 external validation.

## 2. Real London corpus — controlled but spatially evidence-blocked

DPL-14 froze the eight-site empirical London corpus:

`DPL-RP-001 … DPL-RP-008`

DPL-15A–D and the intervening gates established the current real-site frontier:

```text
DPL-15C candidate-authoring readiness = 0 / 8
DPL-16 deployment envelope            = HELD
```

The `0 / 8` result is an **external spatial-evidence finding**, not eight incompatibility verdicts and not a compiler defect.

DPL-Q froze the unchanged SCREENING reopening contract:

1. controlled spatial identity;
2. footprint-test geometry;
3. real orientation frame;
4. datum / level evidence;
5. physical access / street geometry;
6. coherent site identity.

Do not weaken this contract to make public planning material appear more complete than it is.

## 3. Instrumented real control 1 — 92 Uphill Road — evidence-ready, geometry not acquired

DPL-R admitted the historical control snapshot:

```text
DPL-R-CONTROL-001
92 Uphill Road, Mill Hill, London, NW7 4QE
24/1141/FUL + accepted 25/1691/NMA Rev B lineage
```

### DPL-R1

DPL-R1 applied the unchanged R1–R6 contract and established:

```text
R1 = SATISFIED
R2 = SATISFIED
R3 = SATISFIED
R4 = SATISFIED
R5 = SATISFIED
R6 = SATISFIED
CONTROL_SITE_CANDIDATE_AUTHORING_READY
```

The important result was **evidence sufficiency in principle**: the controlled planning lineage contains a scaled, coherent real-site package adequate to support candidate authoring if its geometry can be recovered faithfully.

### DPL-R2

DPL-R2 attempted the actual candidate-authoring seam and failed closed before inventing geometry:

```text
controlled proposal-demise geometry = EXISTS IN SOURCE
machine-recoverable boundary path   = NOT RECOVERED
Reference House candidate           = NOT AUTHORED
result                              = REAL_CONTROL_CANDIDATE_NOT_AUTHORED_GEOMETRY_RECOVERY_FAILED
```

This is a valid result. DPL must not convert a drawing-scale proposition into coordinates through screenshot, raster or display-pixel measurement merely to advance the programme.

## 4. DPL-S — post-R2 decision — complete

DPL-S / PR #661 accepted DPL-R2's geometry-acquisition boundary and rejected the wrong next problem:

Do **not** build:

- OCR machinery;
- raster measurement;
- generic council scraping;
- a generic PDF/vector extraction subsystem.

Those would optimise document transport rather than prove the deployment proposition.

DPL-S instead authorises exactly one second **instrumented real control** whose authoritative spatial package is natively machine-readable.

The control remains excluded from DPL-16 sampling. It exists to prove the pipeline, not to improve the empirical corpus conveniently.

---

# Current packet — DPL-S1

[DPL-S1 — #663](https://github.com/adamnoden/architecture/issues/663) must select exactly one Greater-London instrumented real control and freeze a coherent machine-readable source package before any Reference House candidate is authored.

The selected package must satisfy all six unchanged dimensions:

```text
R1_CONTROLLED_SPATIAL_IDENTITY
R2_FOOTPRINT_TEST_GEOMETRY
R3_REAL_ORIENTATION_FRAME
R4_DATUM_LEVEL_EVIDENCE
R5_PHYSICAL_ACCESS_STREET_GEOMETRY
R6_SITE_IDENTITY_COHERENCE
```

Required source characteristics:

- native polygon / coordinate geometry for the exact tested land;
- enough shape/dimensions to test the unchanged `12.0 m × 10.8 m` RH footprint;
- declared CRS / orientation semantics;
- controlled topography / level evidence sufficient for a SCREENING datum;
- controlled physical street/access relationship;
- coherent source-to-site identity.

One file need not contain everything. Admissible controlled source composition may include:

- submitted planning Site Location GeoJSON / controlled application polygon;
- measured/topographic survey GIS/CAD;
- HM Land Registry / Planning Data title-index geometry at its actual accuracy boundary;
- Environment Agency LiDAR or equivalent authoritative elevation data;
- authoritative/open road/access geometry;
- first-party planning-register identity/document lineage.

Selection is categorical, not scored. Prefer an ordinary detached-residential condition and avoid a needlessly pathological plot, but do not select for planning likelihood, commercial appeal or because the Reference House is likely to fit.

DPL-S1 result universe:

```text
CONTROL_SITE_CANDIDATE_AUTHORING_READY
CONTROL_SITE_NOT_READY_EVIDENCE_GAP
CONTROL_SITE_NOT_READY_SOURCE_CONFLICT
```

A READY result authorises candidate authoring only.

Exact next packet after READY:

> **DPL-S2 — machine-readable real-control Reference House candidate authoring**

DPL-S2 must author exactly one explicit unchanged Reference House placement. The compiler must not search alternatives.

---

# Frozen programme boundaries

Until separately reopened:

```text
DPL-14 eight-site corpus              = UNCHANGED
DPL-15C corpus readiness              = 0 / 8
instrumented real controls            = EXCLUDED FROM DPL-16 SAMPLE
Reference House                       = UNCHANGED
COMPATIBLE @ SCREENING                = NOT ADMITTED FOR REAL CONTROL
INCOMPATIBLE                          = NOT ADMITTED
route search / exhaustion             = NOT IMPLEMENTED
DPL-16 deployment envelope            = HELD
DPL-17 publication integration        = HELD
DPL-18 final validation               = HELD
```

Do not infer a deployment envelope from instrumented controls.

Do not turn planning geometry into title certainty.

Do not use a real site to silently author or deform the Reference House.

Do not mistake candidate-authoring readiness for compatibility.

---

# Restart discipline

For current work, resume from this file plus the latest DPL-S1 issue / packet record. Older DPL packet records remain historical authority for the decisions they own, but they are not the current programme status.

Every new packet must record:

`baseline main SHA → exact question → controlled inputs → evidence/authority → deterministic result → boundaries → artefacts changed → checks → exact next packet`

If a later packet exposes a conflict, reopen the owning authority explicitly rather than patching around it downstream.
