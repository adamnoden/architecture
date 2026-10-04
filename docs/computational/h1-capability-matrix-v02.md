# H1 Capability Matrix — Post-Services v0.2

**Status:** Gate-B audit  
**Purpose:** reassess the first whole-house domain after S1 plus entrance, ventilation, heating, wet-core, roof, stair and fire-family convergence.  
**Supersedes for current planning:** v0.1  
**Release status:** NOT release-ready.  
**External competent review:** still outstanding.

> **H1 now has enough ordinary-house families to test connected architecture. It does not yet have enough external validation or real evidence to claim trusted whole-house release.**

## 1. Capability states

- **NATIVE** — compiler can evaluate from internal semantics/rules.
- **SUPPORTED + EXTERNAL EVIDENCE** — bounded family exists; technical proof comes from scoped competent evidence.
- **CANDIDATE** — route exists but still needs hardening.
- **EXTERNAL** — permitted but not a supported H1 family.
- **UNSUPPORTED** — deliberately outside H1.

## 2. Core compiler architecture

| Capability | State |
|---|---|
| semantic entities / source of truth | NATIVE |
| typed relationships / contextual roles | NATIVE concept |
| shared structural / boundary / service graphs | NATIVE concept |
| scope-correct obligation derivation | NATIVE concept |
| evidence provenance / versioning | NATIVE concept |
| selective invalidation | NATIVE concept, tested S0/S1 |
| target version / transition dependencies | NATIVE concept |
| grouped author-facing issue surface | NATIVE concept, paper-tested |
| release manifest / as-built verification | CANDIDATE |

### Assessment

The formal compiler architecture is no longer the main risk.

## 3. Structure

| Condition | State | Family / route |
|---|---|---|
| masonry walls | SUPPORTED + EXTERNAL | SAB-H1-01 |
| I-joist upper floor | SUPPORTED + EXTERNAL | SAB-H1-01 |
| window / door heads | SUPPORTED + EXTERNAL | opening topology + engineer evidence |
| private stair | SUPPORTED + EXTERNAL | ST-PRIVATE-01 |
| simple trussed roof | SUPPORTED + EXTERNAL | RF-TRUSS-DUO-01 |
| foundations / ground | EXTERNAL | deliberate H1-v0 boundary |
| arbitrary transfers | UNSUPPORTED | deliberate |

### Assessment

No general native structural solver is required for H1 research.

The remaining risk is evidence scoping, not missing structural nouns.

## 4. Envelope

| Condition | State |
|---|---|
| masonry cavity-wall field | SUPPORTED |
| window / wall | SUPPORTED + EXTERNAL |
| external masonry corner | SUPPORTED + EXTERNAL |
| ground-floor / wall perimeter | SUPPORTED + EXTERNAL |
| principal external entrance | SUPPORTED + EXTERNAL |
| simple trussed roof | SUPPORTED + EXTERNAL |
| eaves / gable implementation | CANDIDATE within roof family |
| controlled service penetration | PARTIAL |
| basement / complex façade / flat roof | UNSUPPORTED |

### Assessment

The ordinary detached-house envelope is now mostly bounded.

## 5. Ventilation

Selected family:

**VENT-CMEV-01**

State:

**SUPPORTED + EXTERNAL airflow / product / commissioning evidence**

H1 supports:

- wet-room continuous extract;
- habitable-room background inlets;
- transfer-air routes;
- purge windows;
- accessible central plant;
- service-zone ducts.

MVHR remains:

**higher-performance extension candidate**

### Important caveat

Noisy or polluted sites may make distributed background inlets an architecturally poor choice.

The compiler must permit family migration rather than force CMEV everywhere.

## 6. Heating / hot-water plant

Selected space-heating family:

**HEAT-ASHP-RAD-01**

State:

**SUPPORTED + EXTERNAL competent heating design**

H1 supports:

- air-to-water heat pump;
- accessible plant;
- low-temperature radiators;
- accessible hydronic service routes;
- hot-water-cylinder relationship.

External evidence supplies:

- room heat loss;
- heat-pump capacity;
- emitter sizing;
- hydraulics;
- controls;
- commissioning.

Wet underfloor heating is not an H1 baseline.

## 7. Wet services / drainage

Selected family:

**WET-CORE-01**

State:

**SUPPORTED topology + EXTERNAL competent technical design**

H1 supports:

- clustered wet rooms;
- accessible riser;
- zonal hot/cold isolation;
- short fixture branches;
- short gravity branches to stack;
- rodding/repair access;
- planned floor/substructure crossings;
- cylinder safety-discharge route;
- appliance failure geography.

Target coverage now includes:

- Part G;
- Part H;
- water-efficiency target;
- hot-water safety;
- drainage/access obligations.

### Remaining wet-room gap

A first **waterproofing / shower-bath wet-zone assembly family** is still needed before release-grade H1.

That is materially smaller than “wet services are undefined”.

## 8. Fire / escape

Candidate family:

**FIRE-H1-2S-EGRESS-01**

State:

**SUPPORTED RESEARCH CANDIDATE — EXTERNAL REVIEW REQUIRED**

The candidate supports:

- detached two-storey dwelling;
- upper floor <=4.5 m route;
- one ordinary stair;
- upper habitable-room escape windows;
- alarm-system obligation;
- ground hall → principal entrance final-exit topology;
- explicit inner-room handling.

It deliberately excludes:

- habitable loft level;
- open-plan special fire-engineered stair;
- integral garage;
- taller/more complex routes.

### Assessment

This is sufficient to pressure S2 circulation topology.

It is not trusted until competent external review.

## 9. Accessibility / circulation

| Capability | State |
|---|---|
| M4(1) entrance-storey room access | SUPPORTED target route |
| principal entrance / threshold | SUPPORTED candidate |
| private stair geometry | SUPPORTED candidate |
| M4(2)/M4(3) migration | TARGET MIGRATION / not baseline |
| whole-house Category-1 audit | PARTIAL |

## 10. Architectural grammar

Available for research:

**G01-PILOT-P0**

It can test:

- hierarchy;
- principal / service route distinction;
- sequence;
- scoped axis/order;
- opening rank;
- no-universal-ratio guardrail.

It cannot claim:

- validated Georgian grammar;
- numeric room proportion rules;
- façade-generation authority.

This is sufficient for S2 compiler research.

## 11. Services beyond the selected families

| Service | State |
|---|---|
| room electrical/data geography | SUPPORTED semantic route |
| electrical design / Part P | EXTERNAL competent |
| low-temp radiator branch | SUPPORTED |
| potable hot/cold | SUPPORTED topology |
| sanitary drainage | SUPPORTED topology |
| CMEV extract | SUPPORTED |
| kitchen enhanced source capture | CANDIDATE / not H1 gate |
| rainwater drainage | PARTIAL via roof/site route |
| PV / battery / EV | OUTSIDE current H1 research core |
| arbitrary MEP | UNSUPPORTED |

## 12. Regulatory / analytical evidence still external

H1 may remain credible while these are externally discharged:

- structural calculations;
- SAP / dwelling Part-L compliance calculation;
- Part-O whole-dwelling overheating assessment;
- heat-pump/heating design;
- ventilation airflow design/commissioning;
- drainage/water sizing;
- foundations/geotechnics;
- product certifications.

The compiler must scope and invalidate those evidence items.

It does not need to reproduce every professional calculation in v0.

## 13. Remaining release-grade gaps

### Hard gate

**External competent structural / building-control review**

The prepared review pack has not yet been reviewed externally.

### Technical-family hardening

- wet-room waterproofing assembly;
- controlled envelope penetration family;
- eaves/gable roof-interface detail hardening;
- one actual entrance threshold/doorset implementation;
- one actual cMEV product/duct evidence family;
- one actual heat-pump/radiator evidence example;
- one actual wet-core drainage/water design example.

### Whole-house analytical evidence

- actual structural package;
- actual energy/SAP package;
- actual overheating assessment;
- actual fire/escape review;
- actual services commissioning/evidence.

## 14. Complexity audit after services

The services pass did **not** require:

- one generic MEP ontology supporting everything;
- native heat-pump sizing;
- native pipe sizing;
- native ventilation fan selection;
- native drainage engineering.

Instead H1 has a small set of meaningful systems:

~~~text
VENT-CMEV-01
HEAT-ASHP-RAD-01
WET-CORE-01
SR-ROOM-LOW-01
~~~

They share:

- plant/service geography;
- typed crossings;
- evidence architecture;
- maintenance rules.

That is a positive complexity result.

## 15. New complexity warning

The danger has shifted again.

It is now possible to create too many narrowly named families.

If every detail becomes:

- BF-...
- SR-...
- HEAT-...
- FIRE-...

without a stable compositional architecture, the repo can become a catalogue rather than a compiler model.

Course rule:

> **new families must remove a real unsupported building condition or isolate a genuinely different proof route.**

Do not create a family merely because a detail can be named.

## 16. Is S2 now justified?

### Before v0.2

No. S2 would mostly rediscover missing ordinary systems.

### Now

**YES — AS A RESEARCH FIXTURE**

Enough ordinary conditions are bounded that S2 can finally test what it was supposed to test:

- connected-room topology;
- principal versus secondary sequence;
- hall/stair/entrance relationships;
- G01-PILOT-P0 hierarchy;
- shared façade order;
- service-core placement;
- fire/escape contributions;
- circulation/access conflicts;
- selective invalidation across several rooms.

S2 must remain:

- paper research;
- non-release;
- explicitly subject to later competent review.

## 17. S2 entry condition

S2 may proceed if it obeys:

1. use only current supported/candidate H1 families;
2. do not invent product evidence;
3. treat FIRE-H1-2S-EGRESS-01 as a candidate route;
4. keep foundations external;
5. keep whole-dwelling L/O calculations external;
6. use G01-PILOT-P0 only as research grammar;
7. continue the complexity gate;
8. stop if new architecture is being shaped primarily to make the family catalogue convenient.

## 18. Gate-B verdict

**NOT PASSED.**

But the reason has changed.

H1 is no longer blocked because:

> we do not know how an ordinary house fits together.

It is blocked because:

> **the supported research world now needs competent external attack and real evidence packages before its proof claims can be trusted.**

That is a substantially healthier problem.

## 19. Immediate next move

Proceed to:

**S2 — connected room cluster**

while keeping the external-review gate open.

S2 should be designed to attack:

- spatial sequence;
- stair arrival;
- entrance;
- one principal room;
- one secondary room;
- service core;
- façade hierarchy;
- upper-room escape-window relationships.

Do not expand S2 into a whole-house release exercise.
