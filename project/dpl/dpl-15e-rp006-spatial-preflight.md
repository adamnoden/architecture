# DPL-15E — RP-006 spatial-evidence preflight closeout

**Programme:** DPL  
**Issue:** #842  
**Pull request:** #843  
**Baseline:** `20122fd22e3e0f86706b294d98a97434982704ba` — landed DPL-T11 / current empirical-corpus re-entry base  
**Site:** `DPL-RP-006` — land adjacent to 50 Camelot Close, Thamesmead, SE28 0ET  
**Assurance:** `SCREENING`

## Result

DPL-15E confirms that RP-006 has a materially stronger no-spend spatial-evidence route than the earlier RP-004 document-retrieval trial, but it is **not yet candidate-authoring ready**.

Frozen CI result:

```text
result fingerprint
54c9dc580265e2b74f0cb5fa6113da4a93503265a38e9c96046477f3d48e9d8f

result
RP006_MATERIALLY_STRONGER_PUBLIC_ROUTE_CONFIRMED_NOT_YET_CANDIDATE_READY

candidateAuthoringReady = false
satisfied                = 2 / 6
residual                 = 4 / 6
```

The exact machine source is:

`project/dpl/sites/dpl-rp-006-15e-spatial-preflight-v01.json`

The executable validator is:

`compiler/dpl/dpl15eRp006.ts`

## Frozen parent authority

DPL-15E binds exactly to the existing empirical corpus rather than creating another control or changing the readiness contract:

```text
DPL-15C readiness record blob
b2c46eb08ebe3bd1599bedc8716bcac35f0bdf08

DPL-14 corpus index blob
aeaa0aaf0b97caea066934687a5c350d111d7233

RP-006 corpus record blob
14a6209dc3e75e3690a1db209f0b82448d02dc43
```

The DPL-14 eight-site corpus remains unchanged.

## Evidence recovered

The no-spend pass materially improves the RP-006 evidence surface.

### Exact application identity

Royal Greenwich public planning material controls:

```text
25/3755/F
Land adjacent to 50 Camelot Close, Thamesmead, London, SE28 0ET
```

This is exact application/site identity, not placement geometry by itself.

### Exact-site technical report

The application contaminated-land report supplies:

```text
British National Grid centre = 544654, 179561
reported application-site area ≈ 0.03 ha
```

It also contains north-referenced mapped site material and embeds Enclosure Architects `(P)02 Rev A — Site Plan & Landscape`, stated at `1:100 @ A3`.

This is materially stronger than marketing-map evidence. It establishes that a controlled scaled planning representation exists and supplies a real coordinate/orientation frame. It does **not** make text extraction, approximate area or applicant-house geometry into a placement-ready Reference House boundary.

### Access/context material

The exact-site Design & Access material records the garden-path/front-door approach and Camelot Close turning-head context. That improves the physical approach proposition but does not resolve exact frontage geometry, adopted-highway extent or private rights.

### National spatial-source routes

The HM Land Registry title-boundary dataset via Planning Data and the Environment Agency LiDAR DTM remain valid SCREENING source classes, as already proved by the Lennard control when their limitations are preserved.

For RP-006, however, this packet has **not** acquired the exact title-index polygon or exact EA terrain bytes. Route discovery is not evidence acquisition.

## R1–R6 disposition

| Dimension | DPL-15E state | Reason |
| --- | --- | --- |
| `R1_CONTROLLED_SPATIAL_IDENTITY` | `NOT_SATISFIED` | exact application identity, BNG centre and mapped outline exist, but no placement-ready boundary coordinates/vector have yet been acquired |
| `R2_FOOTPRINT_TEST_GEOMETRY` | `NOT_SATISFIED` | a 1:100 application plan exists, but no controlled boundary shape/dimensions have been recovered in a form that can test the unchanged 12.0 m × 10.8 m RH |
| `R3_REAL_ORIENTATION_FRAME` | **`SATISFIED`** | exact-site BNG centre plus north-referenced mapping supplies a real SCREENING frame |
| `R4_DATUM_LEVEL_EVIDENCE` | `NOT_SATISFIED` | exact EA DTM elevation/terrain has not been acquired for the site |
| `R5_PHYSICAL_ACCESS_STREET_GEOMETRY` | `NOT_SATISFIED` | gate/path/turning-head relation is evidenced, but exact frontage/access geometry and adopted-highway overlap remain unresolved |
| `R6_SITE_IDENTITY_COHERENCE` | **`SATISFIED`** | application identity and exact-site technical/supporting material converge on the same land |

Thus RP-006 moves from the frozen DPL-15C state of only R6 positively evidenced to **R3 + R6**, while remaining fail-closed on R1/R2/R4/R5.

The `2 / 6` count is a readiness-dimension count only. It is not compatibility progress, planning likelihood or a deployment score.

## Adversarial locks

The executable packet proves all of the following:

- an evidenced `1:100` application drawing does not automatically become placement-ready geometry;
- applicant-house dimensions cannot be transferred into the Reference House;
- approximate `0.03 ha` site area cannot satisfy the footprint-fit question;
- discovery of the HMLR/Planning Data API route does not satisfy R1;
- the BNG frame may satisfy R3 without supplying R4 elevation evidence;
- access/context prose and a gate/path do not silently satisfy R5;
- R1–R6 remain the exact six-part readiness universe;
- candidate authoring remains prohibited while any required readiness dimension is unresolved;
- `COMPATIBLE`, `INCOMPATIBLE`, route exhaustion and DPL-16 remain unavailable.

CI on the first exact executable head passed repository health and all publication/render validation with **288 DPL tests passing, 0 failing**.

## What is genuinely left

The residual no-spend frontier is now exact:

1. **R1 / R2 — controlled placement geometry**  
   Recover the exact RP-006 HMLR title-index polygon and/or actual current planning site-arrangement/location-plan bytes in a form that yields controlled placement geometry without screenshot or raster-pixel measurement. Keep planning red-line and title-index authority distinct.

2. **R4 — screening terrain/datum**  
   Acquire Environment Agency 1 m DTM at the exact controlled RP-006 extent/point and freeze ODN terrain evidence. Do not call it a measured private topo survey.

3. **R5 — physical street/access geometry**  
   Reconcile the planning-site outline, physical Camelot Close approach/frontage and possible adopted-highway overlap at SCREENING authority. Do not infer private rights.

The current execution environment can identify the Planning Data and EA source routes but cannot reliably submit the required custom spatial request / retain those exact response bytes. That is a tooling/acquisition boundary, not authority to infer the missing values.

## Next packet

Admit a bounded **DPL-15F — RP-006 residual spatial-evidence recovery gate**.

DPL-15F should attempt only the four residual readiness dimensions using the now-exact source routes. Its result must be one of:

```text
RP006_SCREENING_CANDIDATE_AUTHORING_READY
RP006_NOT_READY_RESIDUAL_PUBLIC_GEOMETRY_DATUM_BOUNDARY
RP006_NOT_READY_SOURCE_CONFLICT
```

If all R1–R6 become positively evidenced, candidate authoring may be opened in a following packet. DPL-15F must not silently author the candidate itself.

If RP-006 remains blocked after those exact routes are exhausted, compare RP-007 and RP-008 categorically for the next no-spend corpus path rather than adding another instrumented control.

## Proof boundary

```text
Reference House mutation       PROHIBITED
Reference House candidate      NOT_AUTHORISED
COMPATIBLE @ SCREENING         NOT_ADMITTED
whole-site INCOMPATIBLE        NOT_ADMITTED
route exhaustion               NOT_IMPLEMENTED
DPL-16                         HELD
external spend                 NONE
DPL-14 corpus membership       UNCHANGED
```
