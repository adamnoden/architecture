# PR-00D — Figure and Visual-Argument Register

**Status:** COMPLETE — PR-00D PASS  
**Date:** 2026-10-14  
**PR-00 baseline:** `3dae9bb1ea7010da94529cb8a48f2f9970be4cdd`  
**Parent programme:** [`PR-00 — Candidate-Book Freeze Execution Programme`](../docs/manuscript/pr00-candidate-book-freeze-programme.md)  
**Umbrella issue:** #71 — `PUB-01 — publication credibility and release programme`  
**Closeout:** [`PR-00D — Figure and Visual-Argument Completion — Closeout`](pr00d-closeout.md)

PR-00D completes the principal visual reasoning of *Ovid’s House*. Its figures explain architectural propositions; they are not decoration and they do not earn stronger technical authority by looking precise.

> **A publication figure is an argument, not proof by appearance.**

## Figure constitution

Every retained principal figure has:

1. a named publication purpose;
2. a classification: `ESSENTIAL ARGUMENT`, `ESSENTIAL ORIENTATION`, `USEFUL ORIENTATION` or `REFERENCE`;
3. recoverable source authority;
4. an explicit claim boundary;
5. only the geometry and annotation required for its argument;
6. an authored caption;
7. monochrome-first publication form.

The graphic language favours simple analytical linework over pseudo-construction drawing. Unresolved wall-face geometry, internal doors, stair construction, structural capacity, exact MEP routes, technical performance, product adequacy and uncompleted P03/P04 or professional-review outcomes are not invented for visual completeness.

## Retained principal figures

| ID | Figure | Class | Primary role | Source authority | Publication asset |
|---|---|---|---|---|---|
| **D-F01** | Selective permanence / architectural platform | **ESSENTIAL ARGUMENT** | Separate slower architectural commitments from faster-changing systems without turning the house into a generic kit. | Parts I §§2–4; governing principles. | `docs/manuscript/figures/selective-permanence-platform.svg` |
| **D-F02** | Designed interface | **ESSENTIAL ARGUMENT** | Separate support, restraint, movement, boundaries, tolerance and removal as duties to assign deliberately. | Part II ch. 6; PAT-008; PAT-022. | `docs/manuscript/figures/designed-interface-functions.svg` |
| **D-F03** | Failure architecture | **ESSENTIAL ARGUMENT** | Show first defence, second consequence, detection/isolation and recovery as one review logic. | Part II ch. 7; PAT-017; PAT-018; Fail-Safe Water Distribution. | `docs/manuscript/figures/failure-architecture-sequence.svg` |
| **D-F04** | Maintenance geography | **ESSENTIAL ARGUMENT** | Show approach, working space, disconnection and withdrawal as one continuous geography. | Part II ch. 8; exterior maintenance synthesis. | `docs/manuscript/figures/maintenance-geography-route.svg` |
| **D-F05** | Pattern fields + generative sequence | **REFERENCE** | Distinguish the 21-pattern language from one bounded service-topology sequence and its rewind logic. | Publication Part III; canonical pattern language. | `docs/manuscript/figures/pattern-language-fields-sequence.svg` |
| **D-F06** | Reference House type and orientation | **ESSENTIAL ORIENTATION** | Establish the compact courtyard type and front–court–garden ordering without pretending a real site exists. | Part IV ch. 13; COA plans/section; RH morphology. | `docs/manuscript/figures/reference-house-type-orientation.svg` |
| **D-F07** | Reference House spatial / sectional order | **ESSENTIAL ARGUMENT** | Show relational hierarchy and modest ground-storey primacy without turning the house into a universal G-01 plan. | Part IV ch. 14; COA plans/section; G-01 v0.1. | `docs/manuscript/figures/reference-house-spatial-sectional-order.svg` |
| **D-F08** | Reference House structural / assembly logic | **USEFUL ORIENTATION** | Explain the courtyard-generated short-span concept and permanent/changeable hierarchy at pre-engineering scope. | Part IV ch. 15; COA structural view; RH structural coordination. | `docs/manuscript/figures/reference-house-structural-assembly-logic.svg` |
| **D-F09** | Reference House service / maintenance geography | **ESSENTIAL ARGUMENT** | Show concentration of plant, wet services and vertical distribution without inventing exact MEP routes. | Part IV ch. 16; COA service register/plans; RH service topology. | `docs/manuscript/figures/reference-house-service-maintenance-geography.svg` |
| **D-F10** | Reference House water / failure geography | **ESSENTIAL ARGUMENT** | Explain outward roof drainage, courtyard primary/emergency routes and visible failure without claiming hydraulic capacity. | Part IV ch. 17; RH08; COA boundary register. | `docs/manuscript/figures/reference-house-water-failure-geography.svg` |
| **D-F11** | Reference House external maintenance geography | **ESSENTIAL ARGUMENT** | Show one project occurrence of external work positions, replacement route and courtyard logistics. | Part IV ch. 16; RH08; COA plan geometry. | `docs/manuscript/figures/reference-house-external-maintenance-geography.svg` |

## Deliberately omitted

**D-F12 — future intervention scenarios:** no standalone figure. Plant replacement, window replacement, leak isolation, bathroom intervention, new dry service, roof/gutter work and household change do not share one truthful geometry. Chapter 18 is clearer as short scenario prose. A later print proof may justify a local callout, but visual symmetry is not a reason to invent one.

**D-F13 — evidence / maturity model:** removed as decorative administration. The Reader’s Guide and maturity table already communicate the distinction more directly.

## Source hierarchy

The COA successor family under `docs/reference-house/generated/` remains the preferred Reference House semantic-inspection source. The historical RH-C1–RH-C4 SVGs remain frozen executable evidence and are not final publication plates.

COA owns inspection. PR-00D owns simplification, hierarchy, typography, captions and publication argument.

Project-occurrence drawings such as roof drainage, external maintenance, elevations, tectonic families and service-riser studies remain useful provenance, but enter the book only through deliberate analytical derivatives where their information is required.

## Deterministic Working Edition composition

`publication/figures.ts` is the publication placement map for D-F01→D-F11. It records entry identity, a unique textual anchor, asset path, alt text and caption.

The full Working Edition applies those placements after publication adapters during preparation. Canonical manuscript prose is not rewritten merely to place figures.

Publication validation fails closed if:

- an anchor disappears or becomes ambiguous;
- a figure duplicates;
- a referenced asset is missing;
- any retained D-F01→D-F11 placement disappears;
- D-F12 or D-F13 is reintroduced without an explicit decision.

## Execution record

- **D0 — inventory + constitution:** PR #104 — PASS
- **D1 — core architectural figures:** PR #105 — PASS
- **D2 — pattern-language figure:** PR #106 — PASS
- **D3 — Reference House orientation + architectural argument:** PR #107 — PASS
- **D4 — Reference House systems + maintenance:** PR #108 — PASS
- **D5 — whole-book visual integration + QA:** PR #109 — PASS subject to final merge

The detailed D1–D5 records remain under `publication/`.

## Gate

**PR-00D — PASS.**

The candidate book now has a bounded visual argument. Every retained principal figure has purpose, source and claim boundary; current trustworthy Reference House material replaces obsolete compiler presentation as the publication substrate; and redundant/decorative candidates have been rejected.

Final paginated PDF proof, page-turn rhythm, precise scale and print defects belong to **PR-00G — candidate print proof** rather than being falsely claimed by this source-level figure gate.

The next publication gate is **PR-00E — whole-book editorial hardening**.