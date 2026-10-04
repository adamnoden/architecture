# Executable Architecture — Research Programme v0.2

**Status:** current control layer for the computational research programme  
**Date:** 2026-10-04  
**Inherits:** [Research Programme v0.1](research-programme.md)  
**Implementation:** explicitly deferred

## 1. Purpose of this revision

v0.1 remains the complete original workstream map and grand-TODO register.

This v0.2 document exists so that later course corrections do not require rewriting the historical programme or losing unresolved work.

Unless a TODO is explicitly superseded below, every open or active item in v0.1 remains inherited.

The current rule remains:

> architecture drives the compiler; compiler convenience does not drive the architecture.

## 2. Programme state after S2

The paper-compilation sequence has now reached:

- S0 wall-bay scale — complete research run;
- S0 repeated/composition scale — complete research run;
- S1 complete-room scale — complete research run;
- S2 connected two-storey cluster — complete research run;
- H1 complete bounded house — not yet started.

S2 should remain frozen.

Do not create S2 Run 02 merely to incorporate later family decisions. Historical source packages and runs retain the families they actually used.

The next major integration fixture remains:

**H1-PAPER-01 — first complete bounded house compile.**

## 3. Post-S2 course correction — environment

The original H1 ventilation selection, VENT-CMEV-01, was chosen partly because it bounded the compiler problem cleanly.

That selection is no longer the current architectural baseline.

Current governing documents:

- [H1 Passive Environmental Strategy v0.1](h1-passive-environmental-strategy-v01.md);
- [H1 Ventilation Strategy Decision v0.2](h1-ventilation-strategy-decision-v02.md);
- [VENT-HYBRID-STACK-01](ventilation-family-hybrid-stack-v01.md);
- [H1 Capability Matrix v0.3](h1-capability-matrix-v03.md).

The hierarchy is now:

**reduce environmental load → exploit passive capability → add bounded mechanical assistance → select fully mechanical response where evidence justifies it.**

Important consequences:

- airtightness remains deliberate;
- accidental leakage is not ventilation;
- pure passive stack is not assumed to guarantee performance;
- hybrid passive stack is the preferred research candidate, not yet a trusted family;
- CMEV remains a supported fallback;
- MVHR remains a legitimate higher-complexity alternative and may win on energy, filtration, noise/pollution or comfort;
- overheating/purge, background IAQ and cooking source capture remain distinct obligations.

## 4. Grand TODO inheritance and supersessions

The full v0.1 table remains authoritative for items not mentioned here.

The following rows are superseded or added.

| ID | TODO | Depends on | Current state |
|---|---|---|---|
| C-014I | Select first whole-house ventilation family | C-014,C-020 | **reopened after S2; original CMEV default superseded for current planning** |
| C-014I1 | Define passive-first environmental hierarchy | C-014I,C-020 | **complete v0.1** |
| C-014I2 | Define hybrid passive-stack candidate family | C-014I1,C-020 | **VENT-HYBRID-STACK-01 v0.1 complete as research candidate** |
| C-014I3 | Prove or reject hybrid-stack H1 performance envelope | C-014I2,C-008,C-011 | **OPEN — immediate technical gate** |
| C-014I4 | Compare accepted hybrid route against CMEV/MVHR whole-house consequences | C-014I3 | **OPEN — energy/comfort/site comparison** |
| C-014K | Re-audit H1 after services convergence | C-014H,C-014I,C-020B,C-020C,C-014J | **v0.2 historical; v0.3 current after S2/environment correction** |
| C-019B | Define first supported service-penetration boundary family | C-019 | **OPEN — pre-H1-PAPER hardening** |
| C-020E | Define first wet-zone waterproofing assembly family | C-020C,C-019 | **OPEN — pre-H1-PAPER hardening** |
| C-032E | Define S2 connected-room-cluster fixture | C-032B,C-019C,C-019D,C-020A,C-016C | **S2 Run 01 complete and frozen** |
| C-032F | Prepare external competent S0/S1/H1 review pack | C-032 | **pack complete; actual competent review still OPEN** |
| C-032G | Test provisional RESOLVABLE-within-family state | C-032E,C-003 | **seeded by S2-M08; remains research-only** |
| C-032H | Design first complete H1 paper-house compile | C-032E,C-032G | **BLOCKED on C-014I3, C-019B, C-020E and structured real-evidence trial** |
| C-032I | Run one structured real external-evidence package | C-008,C-032H | **OPEN — may overlap hybrid ventilation but must use genuine scoped evidence** |
| C-032J | Freeze pre-implementation paper research after H1-PAPER-01 + final red-team | C-032H,C-032F | **future stop gate** |

No earlier grand TODO is deleted by omission from this table.

## 5. Immediate next research sequence

The current non-implementation sequence is:

1. **VENT-HYBRID-STACK-01 performance/evidence trial.** Use a bounded two-storey H1 configuration and real technical/product inputs. Attempt to establish the passive/assisted operating envelope. Promotion and rejection are both valid outcomes.
2. **Wet-zone family.** Harden one ordinary bonded shower/bath waterproofing assembly so WET-CORE-01 is not only pipe/drainage topology.
3. **Controlled envelope-penetration family.** Cover ordinary duct/pipe/cable crossings through wall/roof boundaries, including air/weather/thermal/moisture/reinstatement obligations.
4. **Structured external-evidence test.** Exercise scope, applicability, substitution and invalidation against at least one real public evidence source. Hybrid ventilation may contribute, but a manufacturer page is not automatically competent whole-house evidence.
5. **External competent review.** Use the prepared review pack when appropriate; preparation is not validation.
6. **Freeze H1-PAPER-01 source.** Do not keep adding families once the bounded-house entry conditions are met.
7. **Run H1-PAPER-01.** Test the entire abstraction on one complete two-storey house.
8. **Deliberate mutations.** Attack structure, architecture, environment, routes, evidence scope and family re-solving.
9. **Final red-team / capability freeze.** Distinguish demonstrated capability, external proof, candidate capability and unresolved work.
10. **Stop paper expansion.** The next information should come from actual external review, physical/product prototyping, or implementation—not another round of speculative ontology growth.

## 6. H1-PAPER-01 entry conditions

Do not start the full-house source package until all of the following are true:

- S2 remains frozen and its findings are incorporated;
- hybrid ventilation has been either promoted to a credible H1 research family or explicitly rejected in favour of CMEV/MVHR;
- one wet-zone waterproofing family exists;
- one controlled envelope-penetration family exists;
- one real structured external-evidence exercise has been completed;
- the selected fire, structure, entrance, stair, roof, heating and wet-service families remain bounded enough for research;
- unresolved external competent review is clearly declared rather than silently treated as passed.

The full-house compile itself may still fail release. That is expected.

## 7. What H1-PAPER-01 must test

It is not merely a larger S2.

The final paper fixture must test whether one source can compose, at whole-house scale:

- architectural hierarchy and sequence;
- plan/section/elevation coupling;
- structural topology and external structural proof scopes;
- stair and fire route;
- principal entrance/accessibility;
- full envelope continuity;
- roof and penetrations;
- environmental strategy;
- heating;
- potable water / hot water / drainage;
- wet-zone moisture containment;
- room services;
- maintenance geography;
- regulatory-target applicability;
- evidence provenance;
- selective invalidation;
- family re-solving without converting probable solvability into false validity.

It must still pass the complexity gate: authoring burden should remain architectural rather than checklist-driven.

## 8. Environmental trial falsification conditions

The hybrid route should be rejected or demoted if competent analysis shows any of the following for the bounded H1 house:

- adequate airflow cannot be maintained in credible low-driving-force conditions without effectively continuous fan operation;
- background inlets create unacceptable cold-air, noise or pollution consequences that a balanced system would solve materially better;
- passive-stack geometry compromises the architecture or service geography enough to erase its maintenance advantage;
- high-wind or reverse-flow control becomes disproportionately complex;
- ventilation heat loss materially defeats the whole-house energy strategy relative to MVHR;
- product/control evidence cannot support a maintainable stopped-fan passive route;
- the compliance/evidence route becomes too bespoke to remain a useful supported family.

The research goal is not to make hybrid ventilation win.

It is to force the selected system to earn its place.

## 9. Complexity alarm conditions

Pause and reconsider the compiler approach if the final pre-H1 work begins to show any of these patterns:

- a new named family is added for every small detail;
- environment becomes a bespoke simulation ontology rather than an obligation/evidence boundary;
- the source model starts asking a normal author to encode engineering-analysis inputs directly;
- family selection is being driven by which system is easiest to compile;
- external professional judgement is being translated into unsupported deterministic rules;
- the complete-house fixture requires duplicate discipline models rather than one semantic source;
- RESOLVABLE-within-family starts being presented as current validity;
- evidence dependencies become so opaque that the result is less legible than conventional professional coordination.

These are stop signals, not merely implementation inconveniences.

## 10. Logical stopping point

If H1-PAPER-01 and its final red-team show that the abstraction remains coherent, the internal paper phase is complete enough.

At that point do **not** continue indefinitely adding paper families.

The next meaningful evidence must come from at least one of:

- competent external structural/building-control/building-services attack;
- real product/system evidence and physical mock-up/prototyping;
- implementation of the smallest semantic/compiler prototype.

If H1-PAPER-01 instead reveals that the abstraction collapses into an unmanageable family catalogue, untraceable external judgement or duplicate BIM-like models, weaken or abandon the compiler framing.

The idea continues only by surviving harder tests.
