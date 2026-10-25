# DPL-R1 — 92 Uphill Road instrumented real-control readiness

**Issue:** #647  
**Control site:** `DPL-R-CONTROL-001`  
**Snapshot:** 92 Uphill Road, Mill Hill, London, NW7 4QE — `24/1141/FUL` / accepted `25/1691/NMA` Rev B drawing lineage  
**Assurance profile:** `SCREENING`  
**Result:** **`CONTROL_SITE_CANDIDATE_AUTHORING_READY`**

## 1. Purpose

DPL-Q correctly stopped the ordinary eight-site real corpus at an external spatial-evidence boundary. DPL-R asks a narrower, deliberately different question:

> Can one genuine London site, deliberately selected as an evidence-rich control, prove the real-site candidate-authoring seam without changing the corpus sample or weakening the R1–R6 evidence contract?

This packet answers **yes** for one frozen historical real-site snapshot.

It does **not** show that the Reference House fits the site, that the site is representative, or that the Reference House is deployable across London.

## 2. Why the control snapshot is historical

The correct object for this experiment is not necessarily the latest commercial or planning state. It is a coherent real-site evidence snapshot whose decision-critical spatial facts all belong to one controlled lineage.

The selected authority is therefore:

```text
24/1141/FUL — approved 18 October 2024
    ↓
25/1691/NMA — accepted Rev B substitutions
    ↓
255402/12 Rev B — Proposed Location and Site Plan
255402/13 Rev B — Proposed Plans
255402/14 Rev B — Proposed Elevations
255402/15 Rev B — Proposed Site Section
```

The later `26/1039/FUL` permission and `26/2819/CON` condition submission are **not** part of DPL-R1 authority. Their geometry, levels, access or other facts may not leak backwards into this snapshot.

This is preferable to combining the strongest evidence from several applications merely because they share an address.

## 3. Frozen source set

The machine-readable evidence register is:

`project/dpl/sites/dpl-control-001-92-uphill-road-readiness-v01.json`

### U24-S1 — controlled planning drawing mirror

`255402/12 Rev B — Proposed Location and Site Plan`

Public document:

`https://docs.planning.org.uk/20250423/78/SUWUKPJIHG600/w3t0gwc2drqj4gz6.pdf`

Admitted drawing facts include:

- red proposal demise;
- blue applicant-ownership demise;
- site plan at `1:200 A1`;
- location plan at `1:1250`;
- section at `1:100`;
- proposed datum marker;
- existing ground level `21.10`;
- proposed ground level `20.93`;
- pavement level `20.23`;
- Uphill Road / Marsh Lane relationship;
- new crossover / access drive;
- maximum access-drive gradient `1 in 10`.

The public mirror exposes the controlled document identity and indexed drawing content. The current retrieval path did not expose stable raw document bytes for repository hashing, so DPL-R1 records the byte-fingerprint state as unavailable rather than inventing one.

### U24-S2 — accepted drawing-lineage supporting document

`Non-material minor amendments for 92 Uphill Road 24/1141/FUL`

Public document:

`https://docs.planning.org.uk/20250423/78/SUWUKPJIHG600/a2qm1l117h78ej1k.pdf`

It explicitly states that Rev B drawings `255402-12` through `255402-15` supersede the corresponding Rev A approved documents associated with `24/1141/FUL`.

### U24-S3 — NMA application form

Planning Portal `PP-13956981` / `25/1691/NMA`.

Public document:

`https://docs.planning.org.uk/20250423/78/SUWUKPJIHG600/2na2wjqk6t6jp6si.pdf`

It independently records the exact site address and old/new Rev A → Rev B drawing numbers.

### U24-S4 — public register index

The public Barnet-derived index records `24/1141/FUL` as approved on 18 October 2024 and the subsequent NMA at the same site.

This is secondary register evidence and is not used to manufacture geometry.

## 4. R1–R6 result

DPL-R1 reuses the DPL-15C dimensions **unchanged**.

| Dimension | Result | Reason |
| --- | --- | --- |
| `R1_CONTROLLED_SPATIAL_IDENTITY` | `SATISFIED` | Exact address + permission lineage + explicit red proposal demise identify the planning site being tested. The red line is not treated as legal title. |
| `R2_FOOTPRINT_TEST_GEOMETRY` | `SATISFIED` | Accepted drawing `255402/12 Rev B` supplies the real proposal demise at declared `1:200 A1` scale. DPL-Q explicitly permits controlled scale **and/or** dimensions. Candidate authoring must reconstruct from that controlled drawing geometry, never screenshot/web-map pixels. |
| `R3_REAL_ORIENTATION_FRAME` | `SATISFIED` | The controlled location/site drawing is tied to Uphill Road, Marsh Lane and surrounding numbered properties, giving a real site frame rather than the synthetic Reference-Site frame. |
| `R4_DATUM_LEVEL_EVIDENCE` | `SATISFIED` | Proposed datum plus `GL 21.10`, proposed `GL 20.93` and pavement `20.23` give a screening-usable house/ground datum relationship. |
| `R5_PHYSICAL_ACCESS_STREET_GEOMETRY` | `SATISFIED` | Controlled crossover/access relationship to Uphill Road is shown; the drive has an explicit maximum `1 in 10` gradient. Legal access rights remain separate evidence. |
| `R6_SITE_IDENTITY_COHERENCE` | `SATISFIED` | Address, permission, accepted NMA substitution and proposal demise all describe one coherent frozen site snapshot. Later applications are excluded rather than blended in. |

Therefore:

```text
R1 = SATISFIED
R2 = SATISFIED
R3 = SATISFIED
R4 = SATISFIED
R5 = SATISFIED
R6 = SATISFIED

CONTROL_SITE_CANDIDATE_AUTHORING_READY
```

## 5. Why R2 does not violate the anti-pixel rule

DPL-Q did not require every site boundary to arrive as a list of coordinates. Its Package A permits a controlled planning/survey drawing carrying explicit **scale and/or dimensions** sufficient for placement.

The important distinction is:

```text
controlled 1:200 planning geometry  = admissible source geometry
marketing screenshot / web map      = not admissible placement geometry
```

DPL-R1 does not measure the displayed PDF or infer a dimension from rendered pixels.

The **next** packet must convert the controlled planning geometry into one explicit placement proposition through the source drawing scale/vector/document geometry and must record that derivation. If that geometry cannot actually be recovered faithfully at candidate-authoring time, DPL-R2 must fail closed rather than treating DPL-R1 readiness as a licence to guess.

## 6. Corpus boundary remains intact

Nothing about the original DPL-15C result changes:

```text
DPL-RP-001 … DPL-RP-008 = unchanged
CANDIDATE_AUTHORING_READY = 0 / 8
NOT_READY                 = 8 / 8
```

The control site is intentionally **not** `DPL-RP-009`.

```text
controlSiteKind                    = INSTRUMENTED_REAL_CONTROL
deploymentEnvelopeSampleMembership = EXCLUDED
DPL-16                              = HELD
```

A site deliberately chosen for unusually complete public spatial evidence may prove the pipeline. It may not be smuggled into the empirical deployment envelope as though its selection were neutral.

## 7. Result authority

DPL-R1 earns only:

> **Enough controlled real spatial evidence exists to author one Reference House placement proposition against this frozen site snapshot.**

It does not earn:

- a Reference House candidate itself;
- `COMPATIBLE @ SCREENING`;
- `INCOMPATIBLE`;
- planning permission for the Reference House;
- title/control/private-right clearance;
- geotechnical/drainage/utility evidence;
- route exhaustion;
- Reference House mutation;
- DPL-16 deployment-envelope derivation;
- any claim that 92 Uphill Road is representative of London sites.

## 8. Implementation / regression boundary

DPL-R1 adds an **adjacent** control-site readiness validator rather than widening `corpus-candidate-readiness.ts`.

That is deliberate.

The existing DPL-15C implementation must continue to assert exactly eight sites and `0 / 8` ready. DPL-R1 tests additionally prove:

- the exact R1–R6 contract is inherited;
- all six dimensions are required;
- one missing dimension produces `CONTROL_SITE_NOT_READY_EVIDENCE_GAP`;
- a source conflict produces `CONTROL_SITE_NOT_READY_SOURCE_CONFLICT`;
- later 2026 application facts cannot enter the frozen source graph;
- the control does not alter the DPL-15C corpus result;
- candidate/compatibility/incompatibility/route-exhaustion/DPL-16 authority remains held;
- ordering is identity-neutral;
- material evidence mutation changes identity.

## 9. Next authorised packet

DPL-R1 admits exactly:

> **DPL-R2 — real control-site Reference House candidate authoring**

DPL-R2 should:

1. recover the controlled `255402/12 Rev B` proposal-demise geometry in a reproducible non-pixel form;
2. author **one** explicit Reference House placement against it;
3. use the current controlled Reference House unchanged;
4. state transform/orientation/datum/access relationship explicitly;
5. prove the `12.0 m × 10.8 m` footprint fit or fail closed;
6. preserve all unresolved title, planning, ground, drainage, utility and professional evidence classes;
7. emit no compatibility conclusion yet;
8. hand the authored real candidate into the existing conformance / SCREENING machinery only after the candidate identity is frozen.

Do not optimise the site or deform the house to obtain success.

## 10. Closeout

DPL-Q's stop was correct for the empirical corpus.

DPL-R1 demonstrates a separate fact: when a real site is deliberately selected as an evidence-rich control, the frozen evidence contract can be satisfied without fabricated geometry or a weaker readiness standard.

The next unknown is finally architectural rather than documentary:

> **What happens when the unchanged Reference House is actually placed on this real controlled site?**
