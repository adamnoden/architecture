# DPL-15C — Corpus-Wide Real-Site Candidate-Authoring Readiness Sweep

**Issue:** #582  
**Admitted by:** DPL-O #580 / PR #581  
**Assurance profile:** `SCREENING`  
**Corpus:** `DPL-CORPUS-1`  
**Status:** implementation candidate; exact-head validation required

## 1. Result

The same six candidate-authoring readiness tests were applied to all eight admitted DPL-14 real sites.

Derived result:

```text
CANDIDATE_AUTHORING_READY = 0 / 8
NOT_READY                 = 8 / 8
Reference House candidate = NOT_AUTHORED
DPL-16 deployment envelope = HELD
```

This is not an incompatibility result.

It establishes that the current real-site corpus is rich enough to expose diverse deployment conditions, but the frozen evidence is not yet spatially complete enough to author a controlled Reference House placement on any site without invention.

## 2. Readiness contract

A site must positively satisfy all six dimensions:

1. `R1_CONTROLLED_SPATIAL_IDENTITY` — controlled real parcel/application extent suitable for placement;
2. `R2_FOOTPRINT_TEST_GEOMETRY` — explicit shape/dimensions sufficient to test the 12.0 m × 10.8 m Reference House footprint;
3. `R3_REAL_ORIENTATION_FRAME` — real orientation/frame rather than synthetic Reference-Site inheritance;
4. `R4_DATUM_LEVEL_EVIDENCE` — enough levels/topography to author the house-ground relation;
5. `R5_PHYSICAL_ACCESS_STREET_GEOMETRY` — enough physical approach/street/access geometry to place the house honestly;
6. `R6_SITE_IDENTITY_COHERENCE` — no unresolved parcel/source identity edge about which land is being tested.

The test is intentionally stricter than “we know the address” and intentionally weaker than title/survey/construction assurance.

Title/control, private rights, planning judgement, geotechnics, drainage, utilities and specialist evidence may remain unresolved at candidate-authoring stage if explicitly carried forward.

## 3. Corpus result

| Site | Ready? | Principal candidate-authoring gaps |
|---|---|---|
| `DPL-RP-001` Finchley | **NO** | controlled extent, dimensions/shape, orientation, levels, access geometry |
| `DPL-RP-002` Bromley | **NO** | current parcel extent, dimensions/shape, orientation, levels, current access geometry |
| `DPL-RP-003` Croydon / Woodside Green | **NO** | controlled red-line geometry, dimensions/scale, orientation frame, levels, access dimensions |
| `DPL-RP-004` Havering / Nelmes Way | **NO** | application boundary geometry, dimensions, orientation, levels, exact access geometry |
| `DPL-RP-005` Hounslow | **NO** | spatial identity, dimensions, orientation, levels, access geometry, parcel/source coherence |
| `DPL-RP-006` Greenwich | **NO** | controlled extent, dimensions, orientation, levels, access/highway geometry |
| `DPL-RP-007` Croydon / Kenley | **NO** | controlled extent, dimensions, orientation, measured levels, access gradients/geometry |
| `DPL-RP-008` Lambeth | **NO** | controlled extent, exact dimensions/shape, orientation, levels, exact access geometry |

The machine-readable source is:

`project/dpl/sites/dpl-corpus-1-candidate-readiness-v01.json`

## 4. Important negative controls

### RP-001 — area is not geometry

The ~491.7 m² marketed area is close to the synthetic Reference Site's gross area but gives no width/depth/shape. It therefore cannot satisfy `R2`.

This protects the original corpus lesson: similar gross area does not imply similar deployability.

### RP-002 — no geometry migration

The ~950 m² figure belongs to the larger historical rear-of-8-and-10 application. It is not transferred to the narrower rear-of-10 working parcel.

Historical lane width is likewise context evidence, not current complete access geometry.

### RP-003 — DPL-15B remains authoritative

DPL-15C imports the DPL-15B result:

```text
NOT_READY_PUBLIC_GEOMETRY_INSUFFICIENT
```

The corpus sweep cannot reclassify RP-003 as ready while that controlled evidence result remains unchanged.

### RP-006 / RP-008 — approximate marketing area is not a fit test

Approximate areas of ~217 m² and ~97 m² remain marketing measurements. They do not become precise parcel polygons.

For RP-008 in particular, the approximate 97 m² figure is smaller than the 129.6 m² Reference House footprint area, but DPL does **not** convert an approximate marketing measurement plus unknown shape into site `INCOMPATIBLE`.

### RP-007 — “steep” is not a datum

The site is materially evidenced as steep/sloping, but no measured contours, gradients or placement datum are admitted. Therefore `R4` remains unsatisfied.

Knowing that level change is important is not the same as knowing the levels.

## 5. Site identity coherence

Most sites have a coherent screening subject even though their exact geometry is inadequate.

`DPL-RP-005` is different: the current marketing, asserted planning reference and rear-garage subarea retain only a `LIKELY_OVERLAP` identity relationship. It therefore fails `R6` as well as the geometry dimensions.

That distinction matters. Missing geometry and uncertain site identity are different evidence failures.

## 6. Public-evidence acquisition candidate

The sweep marks exactly one site as the current categorical next public-evidence candidate:

```text
DPL-RP-004 — 4 Nelmes Way, Hornchurch
```

This is **not a site ranking or compatibility preference**.

It is selected for a narrower reason: the frozen corpus already contains an exact current Havering application reference, an ordinary public-street replacement-dwelling context and a July 2026 approval, without the obvious source/sub-parcel identity conflict of RP-005 or the already-exhausted first public pass on RP-003.

The next gate may decide whether recovering RP-004's current planning drawing/document set is worth a bounded evidence-acquisition packet.

## 7. No scalar ranking

The executable result exposes categorical gaps only:

- `CONTROLLED_SPATIAL_IDENTITY_GAP`;
- `FOOTPRINT_TEST_GEOMETRY_GAP`;
- `REAL_ORIENTATION_FRAME_GAP`;
- `DATUM_LEVEL_EVIDENCE_GAP`;
- `PHYSICAL_ACCESS_STREET_GEOMETRY_GAP`;
- `SITE_IDENTITY_COHERENCE_GAP`.

No readiness percentage, suitability score, planning score or purchase score exists.

## 8. Authority locks

The sweep binds:

- the exact DPL-14 corpus index bytes;
- all eight site-record git blobs;
- the exact eight-site universe;
- the DPL-15B RP-003 readiness result.

If any site record or corpus membership changes, the assessment fails closed as stale.

This is intentionally stronger than relying on a file name or site ID alone.

## 9. Proof boundary

DPL-15C retains:

```text
Reference House candidate = NOT_AUTHORED
COMPATIBLE                 = NOT_ADMITTED
INCOMPATIBLE               = NOT_ADMITTED
routeExhaustion             = NOT_IMPLEMENTED
DPL-16 deployment envelope  = HELD
scalarSiteScore             = FORBIDDEN
```

No Reference House mutation is earned.

## 10. Programme consequence

DPL-15A/B established that RP-003 is evidence-blocked before candidate authoring.

DPL-15C generalises the lesson correctly:

> **The current DPL real-site corpus is not candidate-ready as frozen. Every admitted site needs additional spatial evidence before a real Reference House placement can be authored honestly.**

That is now a corpus-level evidence finding rather than an anecdote about one awkward Croydon parcel.

## 11. Next gate

The next gate should decide whether to:

- acquire RP-004's current official planning document/drawing set as the shortest public-evidence path;
- seek a new ninth corpus site with already-available dimensioned geometry;
- or declare that real candidate authoring now requires externally supplied survey/planning-plan evidence rather than further generic compiler work.

DPL-16 remains held until real candidate/evaluation evidence exists.
