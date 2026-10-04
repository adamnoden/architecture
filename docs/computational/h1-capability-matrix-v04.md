# H1 Capability Matrix — Pre-H1-PAPER Freeze v0.4

**Status:** current whole-house research audit  
**Date:** 2026-10-04  
**Supersedes for current planning:** [v0.3](h1-capability-matrix-v03.md)  
**Release status:** NOT release-ready  
**H1-PAPER-01 status:** AUTHORISED TO FREEZE/RUN  
**External competent review:** outstanding

## 1. Decision

The final internal blockers identified after S2 are closed at **paper-research** scope.

This does not mean the house is technically proved.

It means the model now contains bounded families/evidence boundaries for the ordinary conditions needed to construct the first complete H1 paper fixture without inventing a new abstraction every few rooms.

H1-PAPER-01 should now proceed.

## 2. What changed since v0.3

### Hybrid ventilation

[H1 Hybrid Ventilation Evidence Trial 01](h1-hybrid-ventilation-evidence-trial-v01.md) established:

- passive-stack/hybrid topology is technically credible and has real precedent;
- the semantic family may be used in H1 paper research;
- real whole-house airflow adequacy remains external specialist evidence;
- CMEV/MVHR remain legitimate alternatives;
- H1 must not claim ventilation-performance PASS without scoped external evidence.

Current state:

**VENT-HYBRID-STACK-01 = RESEARCH-SUPPORTED TOPOLOGY + EXTERNAL PERFORMANCE PROOF REQUIRED.**

### Wet zones

[WZ-BSM-01](wet-zone-family-bonded-sheet-v01.md) now supplies a bounded ordinary bonded sheet-membrane wet-room family with:

- waterproof boundary extent;
- stable substrate;
- falls/drain relation;
- corners/junctions;
- pipe/control penetrations;
- dry-side service access;
- inspection hold points;
- physical/as-built evidence obligations.

### External evidence

[External Evidence Trial 01 — Mapeguard WP](external-evidence-trial-mapeguard-wp-v01.md) demonstrates:

- component versus system versus installed-instance evidence scope;
- applicability dependencies;
- selective invalidation after product/geometry changes;
- product substitution cannot be inferred from category similarity;
- manufacturer evidence does not become whole-building proof.

### Envelope penetrations

[PEN-ENV-01](boundary-family-controlled-penetration-v01.md) now treats wall/roof service penetrations as boundary transitions across:

- weather;
- cavity/moisture;
- airtightness;
- thermal layer;
- structure where applicable;
- fire/acoustic branches where applicable;
- maintenance/replacement geography.

The family supports ordinary planned core-drilled cavity-wall penetrations and proprietary pitched-roof service terminals at H1 research scale.

## 3. Capability-state definitions

- **NATIVE** — evaluable from internal semantics/rules.
- **SUPPORTED RESEARCH FAMILY + EXTERNAL EVIDENCE** — bounded topology/detail family exists; technical proof is external where declared.
- **CANDIDATE** — useful research semantics exist but bounded family/evidence route is incomplete.
- **EXTERNAL** — permissible but outside H1 native family support.
- **UNSUPPORTED** — intentionally outside H1.

A supported research family is not a release certificate.

## 4. Whole-house capability matrix

| Domain | H1 state | Primary route |
|---|---|---|
| source model / semantic entities | NATIVE | formal architectural model |
| contextual roles / route classes | NATIVE | formal model + G01 pilot |
| architectural hierarchy / scoped order | RESEARCH-SUPPORTED | G01-PILOT-P0 |
| evidence/provenance/dependencies | NATIVE CONCEPT, PAPER-TESTED | evidence architecture |
| target/version applicability | NATIVE CONCEPT | compiler targets |
| masonry wall structure | SUPPORTED + EXTERNAL | SAB-H1-01 |
| I-joist upper floor | SUPPORTED + EXTERNAL | SAB-H1-01 |
| simple trussed roof | SUPPORTED + EXTERNAL | RF-TRUSS-DUO-01 |
| foundations / geotechnics | EXTERNAL | deliberate H1-v0 boundary |
| private stair | SUPPORTED + EXTERNAL | ST-PRIVATE-01 |
| ordinary two-storey fire/escape route | RESEARCH-SUPPORTED + EXTERNAL REVIEW | FIRE-H1-2S-EGRESS-01 |
| principal external entrance | SUPPORTED + EXTERNAL | ENTR-DOOR-MCW-01 |
| windows / wall interfaces | SUPPORTED + EXTERNAL | BF-WIN-MCW-01 |
| wall corner | SUPPORTED + EXTERNAL | BF-CORNER-MCW-01 |
| ground-floor/wall perimeter | SUPPORTED + EXTERNAL | BF-GF-MCW-01 |
| controlled wall/roof service penetration | SUPPORTED RESEARCH FAMILY + EXTERNAL | PEN-ENV-01 |
| hybrid passive-stack ventilation topology | SUPPORTED RESEARCH FAMILY + EXTERNAL PERFORMANCE | VENT-HYBRID-STACK-01 |
| CMEV fallback | SUPPORTED + EXTERNAL | VENT-CMEV-01 |
| MVHR alternate | CANDIDATE / EXTERNAL | future supported family if selected |
| ASHP + low-temp radiators | SUPPORTED + EXTERNAL | HEAT-ASHP-RAD-01 |
| room electrical/data geography | SUPPORTED SEMANTICS + EXTERNAL DESIGN | SR-ROOM-LOW-01 |
| wet/service core | SUPPORTED TOPOLOGY + EXTERNAL DESIGN | WET-CORE-01 |
| bonded wet-room waterproofing | SUPPORTED RESEARCH FAMILY + EXTERNAL PRODUCT/AS-BUILT | WZ-BSM-01 |
| potable water / drainage sizing | EXTERNAL TECHNICAL within supported topology | H1 services target |
| accessibility Category 1 | TARGET-SUPPORTED / WHOLE-HOUSE AUDIT REQUIRED | Part-M target route |
| Part-L whole-dwelling performance | EXTERNAL CALCULATION | target evidence |
| Part-O overheating | EXTERNAL WHOLE-DWELLING ANALYSIS | target evidence |
| as-built commissioning / physical proof | FUTURE PHYSICAL EVIDENCE | release manifest |

## 5. Evidence still deliberately unresolved

A correct H1-PAPER-01 run is expected to fail building release while at least these remain absent:

- structural calculations/member/connection/foundation proof;
- actual geotechnical/foundation evidence;
- whole-dwelling energy/SAP evidence;
- Part-O overheating analysis;
- hybrid-ventilation specialist airflow/control/energy evidence;
- exact heating loss/plant/emitter/hydraulic design;
- water/drainage sizing;
- exact product certifications for selected instances;
- as-built airtightness/commissioning/wet-zone evidence;
- competent fire/building-control review.

This is not a reason to delay the paper fixture.

The paper fixture exists partly to prove that these unresolved obligations can be scoped and reported without pretending they are solved.

## 6. Remaining candidate gaps that do NOT block H1-PAPER-01

The following remain real, but do not justify more pre-fixture family work:

- detailed kitchen source-capture family;
- validated Georgian proportional grammar;
- rainwater drainage beyond ordinary roof/site semantics;
- PV/battery/EV;
- complex foundations;
- complex façade/roof/basement types;
- arbitrary MEP;
- Category 2/3 accessibility;
- robust MVHR family if later selected.

If H1-PAPER-01 reveals one of these is actually necessary for the bounded source, the preferred response is to simplify the fixture inside its declared domain rather than opportunistically widen H1.

## 7. Complexity gate

The pre-H1 work still passes the provisional complexity test.

Recent additions have strengthened existing abstractions rather than multiplied authoring concepts:

- wet-zone interfaces feed the existing moisture/boundary graphs;
- penetrations are one generic boundary-transition concept with supported subtypes;
- external evidence is represented as scoped dependencies rather than discipline-specific attachment lists;
- hybrid ventilation uses environmental obligations/capabilities rather than a new building-physics ontology.

Risk remains high at whole-house scale.

H1-PAPER-01 is the correct next falsification test.

## 8. Gate-B verdict

### Research integration gate

**PASS TO H1-PAPER-01.**

### Building release gate

**FAIL / NOT CLAIMED.**

### External competent review gate

**OPEN.**

These states must not be conflated.

## 9. Immediate sequence

1. freeze H1-PAPER-01 research brief and source package;
2. compile the complete bounded house once;
3. run deliberate whole-house mutations;
4. red-team the result, especially authoring complexity, evidence scope and cross-domain invalidation;
5. produce the final pre-implementation capability matrix / unresolved-risk register;
6. stop adding paper architecture.

After that, meaningful progress requires external competent review, real technical/product prototyping, or implementation.
