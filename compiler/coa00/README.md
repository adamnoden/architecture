# COA-00 — baseline and output audit

**Programme:** COA — Compiler Output Architecture  
**Status:** PASS subject to repository CI  
**Planning baseline:** `2bacd97889caa7da1fe83ad4cbd7a7cdfb7be22c`  
**Programme-plan commit:** `7eae354cfb095705d91a5d5d6e3cf7bf1a529e9d`  
**Execution baseline:** `836cf9624d90bd8f0dfa71e26b25bc718d1c6911`  
**Issue:** #95  
**Authority effect:** none — computational M4 and Reference House M3 remain unchanged

## Question

Can later presentation changes prove that they changed only representation, not architectural meaning or the frozen CH baseline?

**Answer: yes.** The six RH-C1…RH-C4 artefacts frozen by CH-00/CH-08 are still the correct preservation boundary. COA can now create a successor output family without editing or re-baselining them.

## Reorientation after PR-00C

COA was planned on `2bacd978…`. The plan itself landed at `7eae354…`. PR-00C then completed and merged at `836cf962…` before COA execution began.

The intervening PR-00C changes are publication authority/claim wording and its closeout record. They do not modify compiler source, generated RH-C artefacts, CH manifests, Reference House semantics or computational proof boundaries. COA therefore begins from `836cf962…`; it does not reset to the older planning baseline.

This is also the correct sequencing boundary with publication: PR-00C is complete; PR-00D figure freeze should consume the trustworthy COA successor views rather than freeze the legacy inspection artefacts.

## Frozen legacy artefacts

The CH baseline owns six exact generated artefacts:

| Artefact | Current role | COA disposition |
|---|---|---|
| `rhc1-ground-floor.svg` | RH-C1 deterministic projection | preserve byte-identical; supersede for current inspection |
| `rhc1-first-floor.svg` | RH-C1 deterministic projection | preserve byte-identical; supersede for current inspection |
| `rhc1-principal-section.svg` | RH-C1 deterministic projection | preserve byte-identical; supersede for current inspection |
| `rhc2-structural-topology.svg` | RH-C2 deterministic projection | preserve byte-identical; supersede for current inspection |
| `rhc3-service-topology.svg` | RH-C3 deterministic non-spatial projection | preserve byte-identical; replace primary inspection use with report |
| `rhc4-boundary-topology.svg` | RH-C4 deterministic non-spatial projection | preserve byte-identical; replace primary inspection use with report |

Their expected Git-blob identities remain owned by `compiler/ch00/reference-house-baseline.json`. `compiler/coa00/coa00.test.ts` deliberately checks the COA inventory against that manifest rather than inventing a second hash authority.

## Actual generation map

The current historical generation path is:

```text
RH-C1  createReferenceHouseSource()
       → compileReferenceHouse()
       → compiler/reference-house/drawings.ts
       → 3 SVGs

RH-C2  createReferenceHouseSource()
       → compileReferenceHouseStructuralView()
       → compiler/structure-slice/drawing.ts
       → 1 SVG

RH-C3  createReferenceHouseSource()
       → compileReferenceHouseServiceView()
       → compiler/service-slice/drawing.ts
       → 1 SVG

RH-C4  createReferenceHouseSource()
       → compileReferenceHouseBoundaryView()
       → compiler/boundary-slice/drawing.ts
       → 1 SVG
```

These wrappers remain valuable historical regression/provenance surfaces. They are not the canonical production compilation path after CH-03.

The canonical current production path is:

```text
createReferenceHouseSource()
  → compileReferenceHouseSystem(source)
       ├─ house
       ├─ plan
       ├─ structure
       ├─ services
       ├─ boundary
       ├─ calculations
       ├─ coordination
       ├─ identity
       └─ lineage
```

**COA successor outputs should consume this one system result.** Historical generators stay untouched.

## Output classification

### RH-C1 ground and first-floor plans

- classes: `SPATIAL_INSPECTION`, `HISTORICAL_EVIDENCE`, `PUBLICATION_SOURCE_CANDIDATE`;
- SVG is the correct medium because metric location and proportion carry meaning;
- semantic discipline is good, but the current visual language is compiler-facing rather than architectural-inspection-facing.

### RH-C1 principal section

- classes: `SPATIAL_INSPECTION`, `HISTORICAL_EVIDENCE`, `PUBLICATION_SOURCE_CANDIDATE`;
- SVG is the correct medium;
- current layout has a visible annotation-clipping defect.

### RH-C2 structural topology

- classes: `SPATIAL_INSPECTION`, `HISTORICAL_EVIDENCE`, `PUBLICATION_SOURCE_CANDIDATE`;
- SVG is the correct medium because support/span topology is tied to plan coordinates;
- current renderer uses a different world→SVG convention from RH-C1 and is visually north/south inverted relative to the plans.

### RH-C3 service topology

- classes: `SEMANTIC_REPORT`, `HISTORICAL_EVIDENCE`;
- primary content is a sorted route/register table: network, service class, from/to, role, crossing;
- removing XY placement does not reduce meaning;
- successor primary format should therefore be generated Markdown/HTML, with a graphical network companion only if later testing proves it adds genuine inspection value.

### RH-C4 boundary topology

- classes: `SEMANTIC_REPORT`, `HISTORICAL_EVIDENCE`;
- primary content is carrier, transition and drainage-route registers rendered as positioned text;
- removing XY placement does not reduce most of the meaning;
- successor primary format should therefore be generated Markdown/HTML. A later small spatial drainage/boundary companion may be justified for genuinely directional/geographic relationships.

### Existing machine/proof outputs

CH manifests, identity/fingerprint records, diagnostics and calculation results already occupy the `MACHINE_PROOF` class. COA should link to those where useful rather than duplicate them into drawing metadata beyond the minimum traceability fields.

## Verified findings

### 1. Structural north/south mismatch — VERIFIED

The authored coordinate convention is south-west origin, +X east, +Y north. `createPlanProjection()` flips world Y into drawing Y, making north visually up in RH-C1.

`renderStructuralTopologySvg()` instead emits `spanField.bounds`, line-element coordinates and reaction-node coordinates directly into SVG coordinates. Therefore world south appears toward the top and world north toward the bottom. The screenshot observation is reproduced by source inspection; the semantic structural topology itself is not wrong.

**Successor requirement:** all plan-like views use one north-up transform.

### 2. Principal-section right-edge clipping — VERIFIED

The section renderer emits the full `outer cornice/eaves control +6250` string. The current fixed viewBox/annotation placement leaves insufficient right-side text allowance, and the rendered artefact visibly clips the annotation.

**Successor requirement:** deterministic reserved annotation column; layout bounds derived from the annotation zone rather than accidental margin.

### 3. Single-headed span-axis notation — VERIFIED

The structural source owns `spanAxis: 'x' | 'y'`. The renderer draws one line with `marker-end="url(#arrow)"`. That introduces visual direction not owned by the semantic model.

**Successor requirement:** double-headed or otherwise undirected span-axis notation.

### 4. Orientation / cross-view registration — VERIFIED

The current plans do not render a north arrow or section-cut reference. The section subtitle says N–S, but its ends are not graphically labelled S/N and it has no stable matching cut identifier on plan.

**Successor requirement:** north arrow on plan-like views; `A–A` cut on plans and section; S/N end labels in section.

### 5. Qualitative opening relationships disappear — VERIFIED

`createReferenceHouseSource()` contains qualitative east/west courtyard relationships and north garden relationships whose numeric centres are deliberately absent. `renderPlanSvg()` loops only over derived numeric/projectable `openings`. It therefore correctly avoids fake geometry but emits no visible mark for these retained obligations.

This produces a misleading visual ambiguity: “known relationship, unresolved geometry” can look identical to “no relationship”.

**Successor requirement:** qualitative unresolved-opening marker tied to the known host boundary, with no invented centre/width.

### 6. Required adjacency can read as a sealed boundary — VERIFIED

The source carries required room adjacencies separately from numeric opening geometry. Current RH-C1 plans render spaces, boundaries and projectable openings, but no adjacency/required-connection marker. Where an internal connection is required but a doorway is not numerically authored, the plan can read as sealed.

**Successor requirement:** explicit “required connection — position unresolved” notation which cannot be mistaken for an exact door.

### 7. RH-C3 is a report rendered through SVG — VERIFIED

`renderServiceTopologySvg()` sorts routes and positions five text columns. There is no metric service-routing geometry in the artefact. The SVG itself states `TOPOLOGY ONLY — NOT PLAN GEOMETRY`.

**Disposition:** generated document first; optional graph later only if useful.

### 8. RH-C4 is primarily a report rendered through SVG — VERIFIED

`renderBoundaryTopologySvg()` lays out carrier rows, transition rows and drainage rows as text. Carrier and transition registers are non-spatial. Drainage direction can justify a later spatial companion, but not a giant text canvas.

**Disposition:** generated document first; selective spatial companion later.

### 9. Compiler IDs lead the graphic hierarchy — VERIFIED

Current plan space labels render the semantic ID as the bold primary line and the human room label below it. This is useful for debugging but backwards for competent architectural inspection.

**Successor requirement:** architectural label first; stable ID secondary and retained in `data-entity`.

## Semantically present information currently hidden or weakly communicated

The successor family must preserve or expose, without inventing geometry:

- qualitative courtyard opening relationships;
- qualitative north garden opening relationships;
- required room adjacency/connectivity;
- exact/approximate/ranged/unknown opening authority;
- provisional boundary state;
- structural interruption precision (qualitative stair opening vs approximate service opening envelope);
- system compile status/identity and proof boundary;
- cardinal orientation and section registration.

## Proof-boundary check

Nothing in this audit changes the existing proof boundary.

COA may improve representation of already-owned facts. It does not establish structural capacity, service performance, envelope performance, drainage capacity, regulatory compliance, product adequacy, construction tolerances or architectural merit.

The Reference House remains M3 at virtual-design scope. The computational workstream remains M4 at its bounded internal scope.

## Preservation invariants for COA-01 onward

1. The six CH-frozen SVG files and their historical generators remain byte-identical and reproducible.
2. `compiler/ch00/reference-house-baseline.json` remains the authority for their hashes.
3. Successor outputs use new stable paths; no in-place “improvement” of historical evidence.
4. Successor outputs consume `compileReferenceHouseSystem()` once wherever practical.
5. Output code remains downstream; semantic runtime domains do not import it.
6. A `FAIL` system compile cannot emit canonical successor inspection outputs.
7. `REVIEW` output, if projectable, must be visibly and machine-readably marked.
8. No output may invent missing wall, door, stair, service or technical geometry.
9. Non-spatial registers default to generated Markdown/HTML.
10. Spatial views use one explicit north-up projection and shared uncertainty language.
11. Human architectural labels lead; semantic IDs remain inspectable.
12. Better graphics do not widen technical authority or maturity.

## COA-00 exit

The baseline is now sufficiently explicit to redesign the output system without confusing representational change with architectural change.

**Next gate:** COA-01 — output contract and dependency architecture.
