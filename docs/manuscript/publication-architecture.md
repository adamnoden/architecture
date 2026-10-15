# Ovid’s House — Publication Architecture v0.15

**Working form:** illustrated architectural design-research monograph + evidence-qualified pattern set with generative sequences + separate architect-facing implementation brief.  
**Status:** v0.15 — PR-01 adversarial corrections reconciled at manuscript-architecture level; R9 re-proof / revised-candidate freeze remains pending.

The pattern migration is complete at current internal scope. The active set contains 21 patterns, one retired identity, three canonical strategies and four explicitly held candidates. Pattern count is an outcome, not a target. The current system is **not** presented as one uniformly mature Alexander-style language: service topology has the strongest demonstrated generative sequence, while other fields remain less completely connected. Migration and crosswalk provenance are retained in [`../development/pattern-language-overhaul.md`](../development/pattern-language-overhaul.md).

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
   Long life without generic flexibility; introduce proportional serviceability and the bounded **permanence without stasis** / Ovidian frame. Establish **repose** as a domestic requirement: the house should minimise unnecessary vigilance through coherence, controllability, privacy/retreat, physical comfort and perceptual settlement without collapsing into sensory poverty.

4. **The architectural platform**  
   Permanent fabric, replaceable systems, designed interfaces, attachment discipline, assembly hierarchy and maintenance geography; introduce workmanship robustness as the requirement that ordinary construction variation be deliberately absorbed rather than exported into site improvisation.

5. **Governing constitution**  
   Retain the stable numbered provisions used across the repository, but distinguish **core doctrine** from **standing architectural disciplines**. The latter constrain the long-life proposition without being represented as Ovid’s House inventions. Principle 8, **Design for Repose**, is evidence-bounded explicitly: established environmental and housing evidence is separated from architectural hypotheses such as visual structural reading. The developed spread is [Principle 8 — Design for Repose](principle-08-repose.md).

## Part II — Architecture of the Platform

6. **The designed interface**  
   Tectonic honesty; deterministic load paths and bounded movement; separation of support, restraint, movement, sealing and finish; tolerance translation; workmanship robustness; mistake-proofing where consequential; fixing, access and replacement. Engineering legibility remains distinct from visual structural reading: concealment is legitimate, and conspicuous support/mass relationships may be reviewed architecturally without being promoted into a comfort metric.

7. **Failure architecture**  
   First defence / second consequence; water, overflow, drainage, drying, detection, isolation and recovery.

8. **Maintenance geography**  
   Spatial topology of approach, working space, disconnection and withdrawal; proportionality. Extend the same logic beyond the weather envelope: the façade, roof, ground plane, landscape, courtyard and route from the site entrance together determine whether external work can be carried out by ordinary safe means. Introduce the **external maintenance envelope** as the task-specific space/support condition required for access, work, handling and replacement. The developed insert is [Maintenance Geography — The Exterior](maintenance-geography-external.md), supported by [External Maintenance Access — Research Synthesis](../research/external-maintenance-access.md).

9. **Environmental resilience without dependence**  
   Passive-first design, source capture, measured ventilation, graceful degradation and future-climate robustness. A real project should test expensive-to-change geometry against a reasonable range of site-appropriate future conditions, recording scenario, uncertainty and architectural rewind triggers rather than treating one speculative weather file as doctrine.

10. **Boundaries**  
    Boundary debt created by access and disassembly: fire, smoke, acoustic, air, vapour, water, thermal, pests and security; preserve critical performance independently of routinely removable finish layers where practical.

11. **The Replaceable Interior**  
    Attachment hierarchy, controlled attachment planes, wall linings, floor layers, ceilings, kitchens, bathrooms, windows, doors, wet-trade discipline and selective adaptability. Distinguish canonical patterns from still-unproven implementation challengers such as replaceable lining and full-room removable floor platforms.

12. **Legibility and stewardship**  
    Physical recoverability first; building record, physical index, change control and maintainability commissioning second. Digital stewardship should improve future work without becoming the only thing that makes the building intelligible.

## Part III — Patterns and Generative Sequences

Part III is a browsable professional reference: **a bounded pattern set plus relationships and generative sequences where the project has actually demonstrated them**. It is not a second version of Part II and not a catalogue of every technical idea in the project.

The Working Edition opens Part III with a publication-native reader bridge (`publication/part-iii.md`). It explains the five editorial fields, evidence boundaries, sparse pattern relationships, the mature service-topology sequence, the three strategies and the held-candidate bench. It states plainly that the other fields are not yet one equally mature generative network. The canonical pattern records under `docs/patterns/` remain authoritative; repository authoring contracts, index-generation mechanics and migration records stay outside the primary book path.

### Reading structure

The groups below are editorial reading aids only. Pattern names are the primary reader-facing identity. Stable IDs preserve provenance and machine-readable references; they do not encode category, scale, maturity or publication order. A pattern may span several domains even if it appears once in the book.

### A. Service geography and distribution

1. [`HSA-P-001 — Controlled Utility Entry`](../patterns/controlled-utility-entry.md)
2. [`HSA-P-002 — Plant Room as Service Hub`](../patterns/plant-room-service-hub.md)
3. [`HSA-P-014 — Accessible Vertical Service Zone`](../patterns/accessible-vertical-service-zone.md)
4. [`HSA-P-003 — Coherent Horizontal Service Route`](../patterns/coherent-horizontal-service-route.md)
5. [`HSA-P-015 — Accessible Room Service Route`](../patterns/accessible-room-service-route.md)
6. [`HSA-P-004 — High-Service-Room Service Wall`](../patterns/high-service-room-service-wall.md)
7. [`HSA-P-005 — Designed Structural Penetration`](../patterns/designed-structural-penetration.md)
8. [`HSA-P-016 — Compartmented Service Void`](../patterns/compartmented-service-void.md)

The service-topology sequence supplies decision order and rewind logic while the pattern graph supplies reusable compositional relationships. `HSA-P-005` is retained narrowly as the physical relationship **route → controlled crossing interface → host / protected boundary**; ordinary engineered coordination can satisfy it completely.

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

### Strategies beside the pattern set

Strategies sit between doctrine and patterns but are not pattern nodes:

- [Fail-Safe Water Distribution](../patterns/strategies/fail-safe-water-distribution.md)
- [Decompose Structural Interface Functions](../patterns/strategies/decompose-structural-interface-functions.md)
- [Separate Structural Floor from Changeable Layers Where Proportionate](../patterns/strategies/separate-structural-floor-changeable-layers.md)

They appear after the 21 canonical patterns in the Working Edition and remain outside the pattern count.

### Held candidate bench

The publication makes unresolved propositions visible without laundering them into the canonical set:

- [Replaceable Architectural Lining](../patterns/candidates/replaceable-architectural-lining.md)
- [Individually Isolatable Manifold Distribution](../patterns/candidates/individually-isolatable-manifold-distribution.md)
- [Local Deep Service Zone](../patterns/candidates/local-deep-service-zone.md)
- [Selective Floor Access](../patterns/candidates/selective-floor-access.md)

Each candidate has an explicit admission question. The candidate bench is a research frontier, not an appendix of patterns waiting automatically for numbers.

### Pattern-page target

A mature pattern should contain, where applicable:

context / problem / invariant pattern / forces / relationships / diagram / variants or implementation families / proportionality / boundary debt / permanent-fabric impact / construction variability and workmanship / occupation and repose impact / architectural resolution / assembly and replacement sequence / failure modes / evidence / does-not-prove boundary / evidence + maturity / reference-house application / formalisation boundary.

Pattern relationships should remain sparse. Generative sequence order is a separate structure and should include explicit **rewind conditions** where downstream complexity is evidence that an earlier architectural decision should change.

### Migration provenance

The original Core 12 catalogue, service-topology pilot and reversible-assembly catalogue remain available as development history. With the canonical migration closed, they sit outside the primary Part-III reading path.

## Part IV — The Reference House

Part IV exists as a publication-native six-chapter synthesis in [Part IV — Reference House](part-iv.md). Canonical Reference House and G-01 records remain project authority; the manuscript owns the reader-facing account.

13. **Site and type**  
14. **Architectural order, repose and tectonic language**  
15. **Material, structural and assembly system**  
16. **Maintenance geography**  
17. **Water and environmental systems**  
18. **Future maintenance scenarios**

The Reference House is explicitly **one interpretation**, not proof of the doctrine or patterns. It is also a deliberately favourable integration fixture: detached perimeter, courtyard and concentrated service flank make some serviceability questions easier than they would be in compact attached housing.

Its function in the publication is to force the project’s layers to coexist in one building: doctrine, selected patterns, G-01, a courtyard morphology, one domestic programme and bounded technical choices. Project-specific decisions remain local even when they are repeated throughout the worked house. Transfer is tested by what survives when those devices disappear, not by replicating the Reference House elsewhere.

The canonical mapping of selected patterns and project occurrences remains the [Reference House Pattern Occurrence Register](../reference-house/pattern-occurrence-register.md). Control, review and development records remain online provenance rather than chapters in disguise.

## Part V — Making and Testing the Platform

19. Whole-life value and proportionality — excellent conventional baseline; B0→B3 burden; co-renewal; fail-closed decisions; payer/beneficiary horizon; symmetrical permanence test  
20. Design governance and interface ownership — distinguish architectural robustness, minimum consequential-interface controls and enhanced stewardship  
21. Standardisation, manufacture and reliable assembly — activate special installer/manufacturing controls only where non-standard repeated work earns them  
22. Prototype and disassemble before repetition  
23. Procurement without dilution — explicit architectural-equivalence and specialist technical-adequacy authority  
24. Commission maintainability — verify selected consequential tasks, including that final landscape, levels, drainage, external plant and access gates have not consumed intended maintenance geography  
25. Design review through failure, change, occupation, life-course and climate scenarios — include task-specific external access scenarios; permit accepted future destruction where pre-provision would be disproportionate; rewind architecture where technical difficulty exposes an upstream decision problem

## Back matter

A. [Evidence and precedent notes](evidence-and-precedent-notes.md)  
B. [Legacy doctrine register crosswalk](doctrine-register-crosswalk.md) — preserves the historical 63-item House Design Doctrine v7 register while mapping each statement into the current governing constitution / downstream authority structure  
C. [Research agenda](research-agenda.md)  
D. [Reference House implementation schedule](reference-house-implementation-schedule.md)  
E. [Glossary](glossary.md)  
F. [Sources and further reading](sources-and-further-reading.md)

The previously proposed separate pattern-map / generative-sequence appendix is removed. Its distinct reader function is now performed by the publication-native Part III opening; retaining a second appendix would duplicate rather than deepen the book.

---

## Computational development track — recorded, not promoted to a manuscript part

The project carries a parallel computational proposition: selected architectural and technical relationships may be represented semantically and checked through explicit obligations and scoped evidence.

**House Kernel** is the formal architectural/computational system within Ovid’s House; its executable proposition is described in [Executable Architecture](../computational/executable-architecture.md), with current authority and provenance indexed in the [Computational Track](../computational/README.md). **Metamorph Compiler** is the human-facing name of the software that compiles and checks those bounded representations.

The computational work remains **parallel to the publication rather than being forced into Part I–V**. It is consequential enough to deserve a research track, but the monograph should not present a bounded semantic prototype as a finished building compiler.

Current position:

- executable architecture is **not a governing provision** and does not replace Ovid’s House or its architectural doctrine;
- the architectural doctrine remains meaningful independently of software;
- the pattern set is an authoring/provenance layer, not the compiler ontology;
- the internal paper sequence is complete through H1-PAPER-01 and the capability freeze;
- Phase-8 architectural→computational crosswalk is complete at internal mapping scope;
- the minimal P0 semantic/compiler kernel has passed its bounded executable tests;
- `PAT-XW-01` has passed its bounded executable crosswalk tests on top of P0;
- generic compiler/crosswalk growth is therefore **frozen**;
- external competent structural, fire/building-control and building-services review remains open;
- further executable fixtures are selected only when architectural, physical or professional-review work exposes a concrete question worth formalising;
- heavy CAD, general solver, regulations-engine and product implementation remain unauthorised;
- the eventual publication form remains open: later monograph material, companion research volume, software/product specification or some combination should be chosen only after stronger external and physical evidence exists.

The computational chain is:

```text
Selected architectural / project intent
   ↓
Formal architectural model
   ↓
Semantic relationships + invariants
   ↓
Derived obligations
   ↓
Evidence / determination
   ↓
Validity + diagnostics
```

Patterns may explain why project requirements exist and group a report over relevant facts. They do not emit technical truth or become compiler primitives merely by being selected.

The architectural manuscript should not become a software pitch. The computational track earns publication space only where it clarifies or strengthens the architecture.

**Integration boundary:** external maintenance geography has received a post-H1 computational coverage audit. Its semantics are representable, but the exterior case has not been demonstrated in software. `EXT-MAINT-01` remains an evidence-selected candidate fixture, not the automatic next step after P0.

# Separate implementation brief

A concise project document for the appointed architect, mapped to the RIBA Plan of Work.

For each requirement:
- governing provision;
- project requirement / target;
- selected pattern or allowed alternatives where relevant;
- selected implementation family where the project has one;
- performance evidence required;
- owner;
- decision deadline / RIBA stage;
- prototype requirement where earned;
- whole-life cost/carbon check where non-standard;
- commissioning test;
- deviation record.

For external maintenance, the brief should specifically require the access strategy early enough that façade, roof, landscape, courtyard and site geometry can still change; a generic Stage 4 note saying “provide safe access” is too late.

The monograph explains the architectural position; the implementation brief tells the design team what this project actually requires.

---

# Structural decision

**Do not merge Part III back into Part II.**

Part II remains the architectural argument. Part III is the bounded reusable pattern set plus demonstrated generative sequences. Cross-references connect argument, pattern and worked house without making any one of them evidence for the others.

Likewise, **do not make the Reference House the evidence for the doctrine or patterns.** It is a worked interpretation, integration test and research vehicle.