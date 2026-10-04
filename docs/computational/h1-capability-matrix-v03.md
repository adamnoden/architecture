# H1 Capability Matrix — Post-S2 / Environmental Correction v0.3

**Status:** current Gate-B audit  
**Date:** 2026-10-04  
**Supersedes for current planning:** [v0.2](h1-capability-matrix-v02.md)  
**Release status:** NOT release-ready  
**External competent review:** outstanding

> H1 remains coherent enough for whole-house research, but the environmental strategy has deliberately been reopened before H1-PAPER-01.

## 1. What changed since v0.2

v0.2 treated VENT-CMEV-01 as the selected H1 ventilation family.

S2 successfully used that family to test connected-cluster semantics. After S2, however, the family selection was re-examined against the architectural doctrine that passive architecture should do the first work.

Current position:

- CMEV remains a technically coherent fallback family;
- MVHR remains a higher-complexity alternate;
- **VENT-HYBRID-STACK-01** is now the preferred research candidate;
- the hybrid family must pass a real performance/evidence gate before it can be called supported.

This is a family-selection correction, not a failure of the compiler abstraction demonstrated by S2.

## 2. Capability states

- **NATIVE** — compiler can evaluate from internal semantics/rules.
- **SUPPORTED + EXTERNAL EVIDENCE** — bounded family exists; technical proof comes from scoped competent evidence.
- **CANDIDATE + EXTERNAL EVIDENCE** — family/topology exists but its supported proof envelope is not yet established.
- **EXTERNAL** — permitted but not a supported H1 family.
- **UNSUPPORTED** — deliberately outside H1.

## 3. Core compiler architecture

| Capability | State |
|---|---|
| semantic entities / source of truth | NATIVE concept |
| typed relationships / contextual roles | NATIVE concept |
| shared structural / boundary / service graphs | NATIVE concept |
| obligation/evaluation scope | NATIVE concept, paper-tested |
| evidence provenance / versioning | NATIVE concept |
| selective invalidation | NATIVE concept, tested S0/S1/S2 |
| target version / transition dependencies | NATIVE concept |
| architectural versus technical validity | NATIVE concept, tested S2 |
| route-role semantics | NATIVE concept, tested S2 |
| release manifest / as-built verification | CANDIDATE |
| RESOLVABLE-within-family hint | RESEARCH ONLY |

### Assessment

The formal compiler architecture is still not the dominant risk.

S2 strengthened it by demonstrating that identical physical connectivity can carry different architectural validity depending on route role, and that architectural and technical validity can diverge.

## 4. Structure

| Condition | State | Family / route |
|---|---|---|
| masonry walls | SUPPORTED + EXTERNAL | SAB-H1-01 |
| I-joist upper floor | SUPPORTED + EXTERNAL | SAB-H1-01 |
| window / door heads | SUPPORTED + EXTERNAL | opening topology + engineer evidence |
| private stair | SUPPORTED + EXTERNAL | ST-PRIVATE-01 |
| simple trussed roof | SUPPORTED + EXTERNAL | RF-TRUSS-DUO-01 |
| foundations / ground | EXTERNAL | deliberate H1-v0 boundary |
| arbitrary transfers | UNSUPPORTED | deliberate |

The main remaining structural issue is validation/evidence scope, not missing ordinary structural nouns.

## 5. Envelope

| Condition | State |
|---|---|
| masonry cavity-wall field | SUPPORTED |
| window / wall | SUPPORTED + EXTERNAL |
| external masonry corner | SUPPORTED + EXTERNAL |
| ground-floor / wall perimeter | SUPPORTED + EXTERNAL |
| principal external entrance | SUPPORTED + EXTERNAL |
| simple trussed roof | SUPPORTED + EXTERNAL |
| eaves / gable implementation | CANDIDATE within roof family |
| controlled service penetration | PARTIAL / OPEN FAMILY |
| basement / complex façade / flat roof | UNSUPPORTED |

### Immediate envelope gap

A controlled ordinary service-penetration family remains required before H1-PAPER-01.

That family is now especially relevant because hybrid ventilation introduces deliberate stack/terminal penetrations whose boundary consequences must be represented cleanly.

## 6. Environmental strategy

Current governing document:

[H1 Passive Environmental Strategy v0.1](h1-passive-environmental-strategy-v01.md)

Hierarchy:

**reduce load → passive response → bounded assistance → fully mechanical response where justified**

This hierarchy applies separately to:

- background ventilation / IAQ;
- moisture and pollutant source removal;
- purge and summer heat removal;
- heating-demand reduction.

Airtightness remains deliberate. Accidental infiltration is not a ventilation strategy.

## 7. Ventilation

### Preferred research family

**VENT-HYBRID-STACK-01**

State:

**CANDIDATE + EXTERNAL SPECIALIST PERFORMANCE EVIDENCE**

Candidate semantics support:

- purpose-provided habitable-room inlets;
- explicit transfer-air routes;
- near-vertical wet-room passive stacks;
- roof-terminal relationship;
- low-pressure mechanical assistance when natural driving force is insufficient;
- passive residual path on powered failure where product/system evidence supports it;
- separate purge/openable-window route;
- separate cooking source-capture obligation.

The family is **not yet trusted** because passive/hybrid airflow has not been demonstrated across a real H1 operating envelope.

### CMEV

**VENT-CMEV-01** remains:

**SUPPORTED FALLBACK + EXTERNAL airflow/product/commissioning evidence**

S2-RUN-01 remains frozen against this family.

### MVHR

State:

**HIGHER-COMPLEXITY ALTERNATE / EXTENSION CANDIDATE**

It may become preferable where:

- ventilation heat loss matters strongly;
- external noise or pollution makes distributed outdoor inlets poor;
- filtration is valuable;
- comfort/control benefits justify the extra ducts, filters, condensate and commissioning.

### Ventilation gate

Before H1-PAPER-01, the hybrid route must either:

1. demonstrate a credible specialist evidence/performance route and be promoted; or
2. be rejected explicitly in favour of CMEV/MVHR.

## 8. Heating / hot-water plant

Selected family:

**HEAT-ASHP-RAD-01**

State:

**SUPPORTED + EXTERNAL competent heating design**

H1 supports:

- air-to-water heat pump;
- accessible plant;
- low-temperature radiators;
- accessible hydronic routes;
- hot-water-cylinder relationship.

External evidence supplies heat loss, plant capacity, emitter sizing, hydraulics, controls and commissioning.

### Environmental correction

The heating family is downstream of demand reduction.

The full-house study must therefore account for envelope and ventilation heat loss before treating plant sizing as a separate solved problem.

## 9. Wet services / drainage

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

### Remaining wet-room gap

A first bonded waterproofing / wet-zone assembly family is still required before H1-PAPER-01.

## 10. Fire / escape

Candidate family:

**FIRE-H1-2S-EGRESS-01**

State:

**SUPPORTED RESEARCH CANDIDATE — EXTERNAL REVIEW REQUIRED**

It is sufficient for bounded H1 paper research, not trusted release.

## 11. Accessibility / circulation

| Capability | State |
|---|---|
| M4(1) entrance-storey room access | SUPPORTED target route |
| principal entrance / threshold | SUPPORTED candidate |
| private stair geometry | SUPPORTED candidate |
| M4(2)/M4(3) migration | TARGET MIGRATION / not baseline |
| whole-house Category-1 audit | PARTIAL |

## 12. Architectural grammar

Available for research:

**G01-PILOT-P0**

S2 demonstrated useful behaviour for:

- hierarchy;
- route-role distinction;
- sequence;
- scoped axis/order;
- opening rank;
- plan/section/elevation coupling.

It still cannot claim a validated Georgian grammar or universal proportional rules.

## 13. Services beyond selected families

| Service | State |
|---|---|
| room electrical/data geography | SUPPORTED semantic route |
| electrical design / Part P | EXTERNAL competent |
| low-temp radiator branch | SUPPORTED |
| potable hot/cold | SUPPORTED topology |
| sanitary drainage | SUPPORTED topology |
| hybrid stack ventilation | CANDIDATE + EXTERNAL performance evidence |
| CMEV extract | SUPPORTED fallback |
| kitchen enhanced source capture | CANDIDATE / not yet formalised |
| rainwater drainage | PARTIAL via roof/site route |
| PV / battery / EV | OUTSIDE current H1 research core |
| arbitrary MEP | UNSUPPORTED |

## 14. Regulatory / analytical evidence still external

H1 may remain credible while these are externally discharged:

- structural calculations;
- SAP / dwelling Part-L compliance calculation;
- Part-O whole-dwelling overheating assessment;
- ventilation specialist airflow/performance design;
- heat-pump/heating design;
- drainage/water sizing;
- foundations/geotechnics;
- product certifications;
- fire/building-control review.

The compiler owns scope, dependency and invalidation. It does not need to reproduce every professional calculation.

## 15. Remaining pre-H1-PAPER hardening

### A — environmental family decision

Exercise VENT-HYBRID-STACK-01 against a bounded real-house configuration and real technical/product evidence.

Outcome may be promotion or rejection.

### B — wet-room assembly

Define one ordinary bonded wet-zone / shower-bath waterproofing family.

### C — controlled envelope penetration

Define one ordinary penetration family covering relevant air/thermal/weather/moisture/reinstatement semantics.

### D — structured external-evidence trial

Use at least one real public technical/manufacturer source to test:

- evidence scope;
- applicability;
- dependency;
- substitution;
- invalidation.

The hybrid-ventilation work may supply part of this test, but it must not be stretched to claim evidence it does not actually provide.

### E — competent external review

The existing S0/S1/H1 review pack still needs actual review by competent structural/building-control practitioners.

## 16. Complexity warning

The environmental correction introduces a useful risk test.

The compiler must not respond by creating a bespoke object for every passive technique.

The stable abstraction is:

~~~text
ENVIRONMENTAL OBLIGATION
   ↓
CAPABILITIES / ROUTES
   ↓
SELECTED FAMILY
   ↓
EVIDENCE
~~~

not:

~~~text
one ontology branch per environmental gadget
~~~

VENT-HYBRID-STACK-01 earns a family because it has a materially different topology and proof route from CMEV/MVHR.

## 17. S2 verdict after the correction

S2 remains valid as a research run.

It proved:

- connected semantic composition;
- architectural/technical validity separation;
- route-role semantics;
- scoped order/hierarchy;
- service-family composition;
- selective invalidation;
- a provisional RESOLVABLE-within-family research state.

Its use of CMEV is historical source provenance, not a requirement that future H1 work keep CMEV.

Do not run S2 again merely to substitute the ventilation family.

## 18. Gate-B verdict

**NOT PASSED.**

The reason remains evidence/validation, with one newly reopened family-selection question.

H1 is sufficiently coherent to design the final bounded whole-house paper fixture, but **H1-PAPER-01 should not start yet**.

The immediate blockers are now explicit and small enough to finish rather than brainstorm around.

## 19. Immediate sequence

1. finish the VENT-HYBRID-STACK-01 evidence/performance trial and either promote or reject it;
2. harden one wet-zone waterproofing family;
3. harden one controlled envelope-penetration family;
4. exercise a real structured external-evidence package;
5. obtain actual competent external review when available;
6. then freeze the H1-PAPER-01 source and run the first complete bounded house compile;
7. final red-team / capability freeze;
8. stop adding paper architecture and decide between external prototyping/review and software implementation.
