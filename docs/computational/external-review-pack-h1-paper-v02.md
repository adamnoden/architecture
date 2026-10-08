# External Competent Review Pack — H1-PAPER v0.2

**Status:** ready for external adversarial review  
**Date:** 2026-10-05  
**Purpose:** give competent practitioners a bounded, falsifiable package to attack after completion of the internal whole-house paper programme.  
**Current computational context:** the minimal P0 kernel and `PAT-XW-01` have since passed; this pack still governs external attack on the H1 technical assumptions, proof boundaries and family claims.  
**Important:** preparation of this pack is not validation.

## 1. What is being reviewed

The project is investigating whether a bounded house-authoring system can behave like a compiler:

- one semantic building source;
- explicit supported domain;
- derived obligations;
- versioned target/rule sources;
- scoped external evidence;
- selective invalidation after change;
- clear distinction between pass, fail, unresolved and unsupported.

The paper programme progressed through:

- S0 wall bay;
- S1 complete room;
- S2 connected two-storey cluster;
- H1-PAPER complete bounded house.

The paper claim is narrow:

> **the abstraction is coherent enough at bounded-house paper scale to justify external professional attack.**

Since this pack was first assembled, P0 and `PAT-XW-01` have also demonstrated a small executable subset of the semantic / obligation / evidence architecture. That result does not validate the H1 structural, fire, building-physics or building-services assumptions reviewed here.

No claim is made that the H1 house is buildable, compliant or release-ready.

## 2. Core documents

Review in this order.

1. [Executable Architecture](executable-architecture.md) — core proposition and proof boundary.
2. [H1-PAPER research brief](h1-paper-research-brief.md) — question and falsification criteria.
3. [Corrected H1-PAPER frozen source](h1-paper-source-package.md) — exact bounded house assumptions.
4. [H1-PAPER Run 01](h1-paper-compile-run-01.md) — baseline compile and twelve mutations.
5. [Final internal red team](h1-paper-final-red-team.md) — internal attack and stop decision.
6. [H1 Capability Matrix v0.5](h1-capability-matrix-v05.md) — frozen paper-domain capability/proof boundary.
7. [P0 + PAT-XW-01 — Executable Gate Result](p0-pat-xw-01-result.md) — what the later executable work actually demonstrated.
8. [Research Programme v0.6](research-programme-v06.md) — final pre-executable programme record, retained for provenance.

Specialist supporting documents are listed below.

## 3. Review method requested

Please do not review this as a design presentation.

Attack it as a proof/competence boundary.

For each material proposition, classify where possible:

- correct and appropriately scoped;
- directionally plausible but over-claimed;
- missing an important dependency;
- wrong applicability/technical assumption;
- professional judgement disguised as deterministic logic;
- safe to encode natively;
- should remain external evidence;
- outside the supported domain.

Particularly valuable feedback is a concrete counterexample that breaks the current abstraction.

## 4. Structural engineer review

Primary documents:

- [Structural Semantics](structural-semantics.md);
- [Structural Assurance Boundary H1](structural-assurance-boundary-h1-v01.md);
- [Private stair family](stair-family-private-v01.md);
- [Simple trussed-roof family](roof-family-trussed-duopitch-v01.md);
- H1 source/run.

### Questions

1. Is the separation among physical structure, support topology and analytical proof intellectually sound?
2. Can a compiler legitimately reason about support/load-path dependencies while accepting member/connection/stability adequacy as scoped external evidence?
3. Does SAB-H1-01 omit structural dependencies that would make selective invalidation unsafe?
4. Is the H1 central-spine/I-joist/trussed-roof topology a reasonable bounded research condition?
5. When a wall opening, floor opening or support line moves, what external structural evidence should become stale?
6. Which structural facts should be part of the shared architectural source and which should exist only in the engineer's analytical model?
7. Does the `OUTSIDE SUPPORTED DOMAIN` response for transfer structure make sense, or is the proposed family boundary naive?
8. What professional judgements should never be presented as deterministic compiler output?
9. What would you require before calling even a narrow structural family “trusted”?

### Requested red-team examples

Please propose at least three ordinary house changes that the current support/dependency semantics would mishandle.

## 5. Building-control / fire / regulatory review

Primary documents:

- [Compiler Targets](compiler-targets.md);
- target snapshots;
- [Validity and Obligations](validity-and-obligations.md);
- [Fire family](fire-family-two-storey-egress-v01.md);
- [Entrance family](entrance-family-principal-masonry-v01.md);
- H1 source/run.

### Questions

1. Is the distinction among legal requirement, Approved Document route, standard, product evidence and project/HSA requirement being preserved correctly?
2. Are target/version/transition semantics credible?
3. Does FIRE-H1-2S-EGRESS-01 misread, omit or oversimplify any ordinary two-storey dwelling condition?
4. Are escape-window roles, final-exit topology and alarm obligations represented at sensible scopes?
5. Does H1 incorrectly imply that an ordinary private stair can be analysed independently of other fire-resisting-construction conditions?
6. Is the Category-1/M4(1) source posture credible, or are ordinary access dependencies missing?
7. Which applicability decisions require explicit human confirmation rather than automatic inference?
8. Which regulatory checks are realistically deterministic from a sufficiently semantic model, and which are not?
9. Is `UNSUPPORTED/ALTERNATE STRATEGY REQUIRED` an acceptable compiler result for non-standard fire arrangements?
10. What would make an automated compliance explanation trustworthy to a building-control reviewer?

### Requested red-team examples

Please identify ordinary dwelling arrangements that appear superficially inside H1 but should force another fire/access/compliance route.

## 6. Building-services / ventilation engineer review

Primary documents:

- [Passive Environmental Strategy](h1-passive-environmental-strategy-v01.md);
- [Ventilation Decision v0.2](h1-ventilation-strategy-decision-v02.md);
- [Hybrid-stack family](ventilation-family-hybrid-stack-v01.md);
- [Hybrid evidence trial](h1-hybrid-ventilation-evidence-trial-v01.md);
- [CMEV fallback](ventilation-family-cmev-v01.md);
- [Heating strategy](h1-heating-strategy-decision-v01.md);
- [ASHP/radiator family](heating-family-ashp-radiators-v01.md);
- [Wet core](wet-service-family-core-v01.md);
- H1 source/run.

### Questions

1. Is the hierarchy `load reduction → passive → bounded assist → full mechanical where justified` technically sensible, or does it bias system selection incorrectly?
2. Can the proposed hybrid-stack topology credibly support a low-rise airtight dwelling, subject to specialist design?
3. What design inputs are necessary to establish a real passive/hybrid operating envelope?
4. Under what UK site/energy/acoustic conditions should CMEV or MVHR clearly outrank the hybrid route?
5. Is stopped-fan/passive residual behaviour a useful design requirement or an unnecessary constraint?
6. Are normal ventilation, purge/overheating and cooking source capture separated correctly?
7. Does clustering ventilation/wet/heating services in the current geography create technical conflicts the paper model misses?
8. What service-network facts belong in the architectural semantic source, and what should remain in specialist calculation models?
9. Does the proposed evidence/commissioning lifecycle reflect how ventilation/heating systems are actually designed and handed over?
10. Which MEP conditions would cause uncontrolled family proliferation if we tried to encode them?

### Requested red-team examples

Please identify a credible weather/occupancy/site scenario in which VENT-HYBRID-STACK-01 would fail or effectively become continuous mechanical ventilation.

## 7. Envelope / building-physics review questions

These may be covered by one of the reviewers above or a separate building-physics specialist.

Primary documents:

- [Boundary Semantics](boundary-semantics.md);
- [window boundary family](boundary-family-window-masonry-v01.md);
- [ground-floor perimeter family](boundary-family-ground-floor-masonry-v01.md);
- [controlled penetration family](boundary-family-controlled-penetration-v01.md);
- [wet-zone family](wet-zone-family-bonded-sheet-v01.md).

Questions:

1. Is representing air, thermal, weather and moisture as overlapping independent graphs useful and technically defensible?
2. Are there important coupled phenomena that this decomposition risks hiding?
3. Does PEN-ENV-01 correctly separate weather, air, thermal and cavity/moisture reinstatement?
4. Are replacement/maintenance semantics compatible with durable envelope detailing?
5. Which junctions should never receive a generic family without project-specific hygrothermal analysis?

## 8. Evidence/provenance review

Primary documents:

- [Evidence and Provenance](evidence-and-provenance.md);
- [Mapeguard external-evidence trial](external-evidence-trial-mapeguard-wp-v01.md);
- H1 run mutation results.

Questions:

1. Is component/system/installed-instance evidence scope represented usefully?
2. Does the invalidation model reflect how professionals actually rely on calculations/certificates/specifications?
3. What evidence is occurrence-specific versus reusable across a family/project?
4. How should competence/authorship/sign-off be represented?
5. What changes should force calculation reissue rather than simple re-check?
6. What parts of an external professional report are realistically machine-addressable dependencies?

## 9. Explicit things reviewers should not assume

The project does not claim:

- Approved Documents are the law;
- professional responsibility disappears;
- one semantic model replaces specialist analytical models;
- all Building Regulations can be deterministically automated;
- hybrid ventilation is always preferable;
- the H1 house is compliant;
- the compiler proves construction quality;
- the current architectural grammar proves beauty or Georgian correctness;
- P0 validates the H1 technical families.

If the documents imply any of those despite these boundaries, that is a defect worth flagging.

## 10. Most useful output format

For each reviewer, ideal output is:

### A. Critical errors

Anything technically/regulatorily wrong enough to invalidate a current family or proof boundary.

### B. Missing dependencies

Important ordinary conditions absent from the graph.

### C. Boundary corrections

What should be native, externally evidenced or unsupported instead.

### D. Counterexample mutations

Concrete edits/building conditions that break the current model.

### E. Implementation warnings

Things that would become materially harder or unsafe if encoded in software.

### F. What survives

Which parts of the abstraction are genuinely useful.

## 11. Programme consequence

External review may reopen or correct paper documents, capability boundaries or technical-family assumptions.

P0 and `PAT-XW-01` do not change that requirement. Generic compiler growth remains frozen; a professional finding may instead justify a targeted correction or a narrowly scoped executable fixture if software can answer the question better than direct architectural/engineering work.

The objective is to determine whether the idea survives contact with professional reality before heavier compiler/CAD investment.