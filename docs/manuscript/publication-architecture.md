# House Systems Architecture — Publication Architecture v0.11

**Working form:** illustrated architectural design-research monograph + evidence-qualified pattern language + separate architect-facing implementation brief.  
**Status:** v0.11 — canonical Phase-7 pattern corpus established; Part III now organised around the actual language rather than the superseded 30-slot inventory.

The pattern-language migration is controlled by [`../development/pattern-language-overhaul.md`](../development/pattern-language-overhaul.md). The active language contains 21 patterns, one retired identity, three canonical strategies and four explicitly held candidates. Pattern count is an outcome, not a target.

## Front matter

- Title / subtitle
- **Preface — The Obvious, Eventually**  
  A first-person essay establishing the project's temperament: inherited arrangements, outsider perspective, respect for convention, scepticism toward novelty, tectonic beauty and the obligation to test every heresy.
- Abstract
- How to read the book
- Definitions
- Evidence and maturity legend
- Governing constraints

The preface carries the authorial voice and origin of the enquiry. A separate autobiographical author's note is not currently required; add one only if publication context later demands information that does not belong in the essay.

## Part I — The Proposition

1. **The house after completion**  
   Begin at practical completion and follow ordinary movement, failure, maintenance and change.

2. **Buildings change at different speeds**  
   Service-life planning, Habraken, Duffy/Brand, Gordon; introduce coupling between lifespan layers.

3. **Selective permanence**  
   Long life without generic flexibility; introduce proportional serviceability. Establish **repose** as a domestic requirement: the house should minimise unnecessary vigilance through coherence, controllability, privacy/retreat, physical comfort and perceptual settlement without collapsing into sensory poverty.

4. **The architectural platform**  
   Permanent fabric, replaceable systems, designed interfaces, attachment discipline, assembly hierarchy and maintenance geography; introduce workmanship robustness as the requirement that ordinary construction variation be deliberately absorbed rather than exported into site improvisation.

5. **Eleven principles**  
   Use the locked public principles; each principle receives a short spread and one primary figure. Principle 8, **Design for Repose**, is evidence-bounded explicitly: established environmental and housing evidence is separated from architectural hypotheses such as perceptual structural legibility. The developed spread is [Principle 8 — Design for Repose](principle-08-repose.md), with [Figure 8.1](figures/principle-08-repose.svg).

## Part II — Architecture of the Platform

6. **The designed interface**  
   Tectonic honesty; deterministic load paths and bounded movement; separation of support, restraint, movement, sealing and finish; tolerance translation; workmanship robustness; mistake-proofing where consequential; fixing, access and replacement. Distinguish engineering legibility from **perceptual structural legibility**: concealment is legitimate, but principal domestic spaces should not gratuitously depend on apparent instability.

7. **Failure architecture**  
   First defence / second consequence; water, overflow, drainage, drying, detection, isolation and recovery.

8. **Maintenance geography**  
   Spatial topology of approach, working space, disconnection and withdrawal; proportionality. Extend the same logic beyond the weather envelope: the façade, roof, ground plane, landscape, courtyard and route from the site entrance together determine whether external work can be carried out by ordinary safe means. Introduce the **external maintenance envelope** as the task-specific space/support condition required for access, work, handling and replacement. The developed insert is [Maintenance Geography — The Exterior](maintenance-geography-external.md), supported by [External Maintenance Access — Research Synthesis](../research/external-maintenance-access.md).

9. **Environmental resilience without dependence**  
   Future climate, passive-first design, source capture, measured ventilation and graceful degradation; treat intelligible local environmental control and manual fallback as forms of occupant agency, not merely controls engineering.

10. **Boundaries**  
    Boundary debt created by access and disassembly: fire, smoke, acoustic, air, vapour, water, thermal, pests and security; preserve critical performance independently of routinely removable finish layers where practical.

11. **The Replaceable Interior**  
    Attachment hierarchy, controlled attachment planes, wall linings, floor layers, ceilings, kitchens, bathrooms, windows, doors, wet-trade discipline and selective adaptability. Distinguish canonical patterns from still-unproven implementation challengers such as replaceable lining and full-room removable floor platforms.

12. **Legibility and stewardship**  
    Building record, physical index, change control and maintainability commissioning.

## Part III — Pattern Language

Part III is a browsable professional reference: **patterns plus the relationships and generative sequences that help designers combine them**. It is not a second version of Part II and not a catalogue of every technical idea in the project.

The method is defined by the [HSA Pattern Language — Model and Authoring Contract](../patterns/language-model.md). The canonical pattern index is [Patterns](../patterns/README.md). The first worked generative method is the [Service Topology Generative Sequence](../patterns/service-topology-sequence.md).

### Reading structure

The groups below are editorial reading aids only. IDs remain stable identity and do not encode category, scale or publication order. A pattern may span several domains even if it appears once in the book.

### A. Service geography and distribution

1. [`HSA-P-001 — Controlled Utility Entry`](../patterns/controlled-utility-entry.md)
2. [`HSA-P-002 — Plant Room as Service Hub`](../patterns/plant-room-service-hub.md)
3. [`HSA-P-014 — Accessible Vertical Service Zone`](../patterns/accessible-vertical-service-zone.md)
4. [`HSA-P-003 — Coherent Horizontal Service Route`](../patterns/coherent-horizontal-service-route.md)
5. [`HSA-P-015 — Accessible Room Service Route`](../patterns/accessible-room-service-route.md)
6. [`HSA-P-004 — High-Service-Room Service Wall`](../patterns/high-service-room-service-wall.md)
7. [`HSA-P-005 — Designed Structural Penetration`](../patterns/designed-structural-penetration.md)
8. [`HSA-P-016 — Compartmented Service Void`](../patterns/compartmented-service-void.md)

This section should be read alongside the service-topology sequence. The sequence supplies decision order and rewind conditions; the pattern graph supplies reusable compositional relationships. Do not collapse the two.

### B. Water, leakage and failure

9. [`HSA-P-017 — Visible Leakage Path`](../patterns/visible-leakage-path.md)
10. [`HSA-P-018 — Failure-Tolerant Wet Service Room`](../patterns/failure-tolerant-wet-service-room.md)
11. [`HSA-P-009 — Accessible Rainwater Route`](../patterns/accessible-rainwater-route.md)

The umbrella [Fail-Safe Water Distribution](../patterns/strategies/fail-safe-water-distribution.md) proposition is a **strategy**, not a pattern. It may invoke different patterns and implementation families for different route classes.

### C. Openings, movement and attachment

12. [`HSA-P-007 — Permanent Opening / Replaceable Window`](../patterns/permanent-opening-replaceable-window.md)
13. [`HSA-P-019 — Permanent Opening / Replaceable Door`](../patterns/permanent-opening-replaceable-door.md)
14. [`HSA-P-020 — Designed Threshold`](../patterns/designed-threshold.md)
15. [`HSA-P-008 — Movement / Slip Junction`](../patterns/movement-slip-junction.md)
16. [`HSA-P-022 — Controlled Attachment Plane`](../patterns/controlled-attachment-plane.md)

### D. Environmental and external maintenance geography

17. [`HSA-P-010 — Source-Capture Kitchen Extract`](../patterns/source-capture-kitchen-extract.md)
18. [`HSA-P-021 — Source-Capture Bathroom Extract`](../patterns/source-capture-bathroom-extract.md)
19. [`HSA-P-011 — Roof Maintenance Route`](../patterns/roof-maintenance-route.md)
20. [`HSA-P-013 — Ground-Supported Façade Access`](../patterns/ground-supported-facade-access.md)

### E. Stewardship

21. [`HSA-P-012 — Physical Service Index`](../patterns/physical-service-index.md)

### Retired identity

`HSA-P-006 — Water-Damage-Safe Service Route` remains visible as a [retired identity](../patterns/retired/hsa-p-006-water-damage-safe-service-route.md). Its ID is never reused. The useful umbrella proposition survives as Fail-Safe Water Distribution rather than being forced to remain one physical pattern.

### Strategies beside the language

Strategies sit between doctrine and patterns but are not pattern nodes:

- [Fail-Safe Water Distribution](../patterns/strategies/fail-safe-water-distribution.md)
- [Decompose Structural Interface Functions](../patterns/strategies/decompose-structural-interface-functions.md)
- [Separate Structural Floor from Changeable Layers Where Proportionate](../patterns/strategies/separate-structural-floor-changeable-layers.md)

They should appear in Part II/III where they clarify design reasoning, without being counted as patterns.

### Held candidate bench

The publication should make unresolved propositions visible without laundering them into the language:

- [Replaceable Architectural Lining](../patterns/candidates/replaceable-architectural-lining.md)
- [Individually Isolatable Manifold Distribution](../patterns/candidates/individually-isolatable-manifold-distribution.md)
- [Local Deep Service Zone](../patterns/candidates/local-deep-service-zone.md)
- [Selective Floor Access](../patterns/candidates/selective-floor-access.md)

Each candidate has an explicit admission gate. The candidate bench is a research frontier, not an appendix of patterns waiting automatically for numbers.

### Pattern-page target

A mature pattern should contain, where applicable:

context / problem / invariant pattern / forces / language relationships / diagram / variants or implementation families / proportionality / boundary debt / permanent-fabric impact / construction variability and workmanship / occupation and repose impact / architectural resolution / assembly and replacement sequence / failure modes / evidence / does-not-prove boundary / evidence + maturity / reference-house application / formalisation boundary.

Stable pattern IDs are identity only. They do not encode category, scale, evidence state or publication order.

Pattern relationships should remain sparse. Generative sequence order is a separate structure and should include explicit **rewind conditions** where downstream complexity is evidence that an earlier architectural decision should change.

### Migration provenance

The original Core 12 catalogue, service-topology pilot and reversible-assembly catalogue remain available as development history. They should not sit in the primary Part-III reading path once Phase 7 closes.

## Part IV — The Reference House

13. Site and type  
14. Architectural order, repose and tectonic language  
15. Material, structural and assembly system  
16. Maintenance geography — internal service topology plus a coordinated [External Access & Maintenance Plan](../reference-house/external-access-maintenance-plan.md) covering façade, roof, courtyard, ground/support conditions, landscape and logistics from the site entrance  
17. Water and environmental systems  
18. Future maintenance scenarios — include upper masonry repair, gutter/eaves renewal, chimney/roof repair, window cleaning versus full-frame replacement, courtyard access and mature-landscape replay

The Reference House is explicitly **one interpretation**, not proof of the doctrine or pattern language.

During the pattern-language work it acts as an integration test. The first whole-house trial consists of the [Whole-House Coordination Fixture 01](../reference-house/whole-house-coordination-fixture.md) and historical [Service Topology Run 01](../reference-house/service-topology-run-01.md). The current canonical mapping is the [Reference House Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md).

As the house develops, continue recording:

- selected pattern IDs;
- actual project occurrences rather than mere intentions;
- selected implementation families;
- outstanding evidence obligations;
- conflicts between patterns;
- rejected patterns/locations;
- rewind events where later constraints force earlier architectural change;
- missing reusable patterns exposed by the worked house.

Each major non-standard decision shows:
- option set;
- chosen option;
- reason;
- cost/carbon implication;
- uncertainty;
- test required.

## Part V — Making and Testing the Platform

19. Whole-life value and proportionality  
20. Design governance and interface ownership  
21. Standardisation, manufacture and reliable assembly  
22. Prototype and disassemble before repetition  
23. Procurement without dilution  
24. Commission maintainability — include verification that final landscape, levels, drainage, external plant and access gates have not consumed the intended external maintenance geography  
25. Design review through failure, change and occupation scenarios — include task-specific external access scenarios rather than a generic assertion of façade accessibility; where useful, review whether technical difficulty is exposing a reason to rewind an earlier architectural decision

## Back matter

A. Evidence and precedent notes  
B. 63-item doctrine register mapped to eleven principles  
C. Research agenda  
D. Reference-house implementation schedule  
E. Pattern-language map and generative-sequence notes  
F. Glossary  
G. Bibliography and standards

---

## Computational development track — recorded, not yet promoted to a manuscript part

The project carries a parallel computational proposition: a constrained semantic building model may be compiled against explicit architectural, structural, construction, regulatory and evidence obligations.

The canonical concept is [Executable Architecture — Computational Expression of House Systems Architecture](../computational/executable-architecture.md); the current state and control documents are indexed in the [Computational Track](../computational/README.md).

The computational direction should remain **parallel to the publication rather than being forced into Part I–V**. It is consequential enough to deserve its own research track, but the publication should not present a paper-validated computational architecture as a finished software product.

The current position is:

- it is **not a governing principle** and does not replace the doctrine;
- the doctrine remains meaningful independently of software;
- the pattern language is also not the compiler ontology;
- the formal architectural model, obligation/evidence architecture and bounded H1 paper tests now exist;
- the internal paper sequence is complete through H1-PAPER-01 and the capability freeze;
- external competent review remains open;
- a minimal executable semantic/compiler kernel is authorised as the next falsification step;
- heavy CAD/compiler/product implementation remains gated;
- the eventual publication form remains open: later monograph material, companion research volume, software/product specification or some combination should be chosen only after external and executable validation.

The computational chain remains:

```text
Doctrine / selected architectural intent
   ↓
Formal architectural model
   ↓
Semantic primitives + invariants + rules
   ↓
Compiler target
   ↓
Resolved building model
   ↓
Production outputs + evidence
```

Patterns may expose formal consequences that enter this chain, but do not become compiler rules by default.

The architectural manuscript should not become a software pitch. The computational track earns publication space only where it clarifies or strengthens the architecture.

**Integration boundary:** external maintenance geography has now received an explicit post-freeze computational coverage audit. Its semantics are representable, but whole-house external access/logistics have not yet been demonstrated in H1. The authorised executable extension fixture `EXT-MAINT-01` comes only after the minimal kernel succeeds.

# Separate implementation brief

A concise project document for the appointed architect, mapped to the RIBA Plan of Work.

For each requirement:
- governing principle;
- project requirement / target;
- selected mature pattern or allowed alternatives where relevant;
- selected implementation family where the project has one;
- performance evidence required;
- owner;
- decision deadline / RIBA stage;
- prototype requirement;
- whole-life cost/carbon check where non-standard;
- commissioning test;
- deviation record.

For external maintenance, the brief should specifically require the access strategy early enough that façade, roof, landscape, courtyard and site geometry can still change; a generic Stage 4 note saying “provide safe access” is too late.

This is the direct solution to the “transpilation” problem: the monograph explains the architectural position; the implementation brief tells the design team what this project actually requires.

---

# Structural decision

**Do not merge Part III pattern language back into Part II.**

Part II remains the architectural argument. Part III is the reusable language and generative method. The corpus is now sufficiently stable that the publication should use the canonical 21-pattern language rather than the superseded 30-slot inventory. Cross-references connect argument, pattern and worked house without making any one of them evidence for the others.

Likewise, **do not make the Reference House the evidence for the doctrine or patterns.** It is a worked interpretation, integration test and research vehicle.