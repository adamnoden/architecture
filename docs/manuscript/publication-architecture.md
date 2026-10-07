# House Systems Architecture — Publication Architecture v0.8

**Working form:** illustrated architectural design-research monograph + pattern catalogue + separate architect-facing implementation brief.  
**Status:** v0.8 — editorial and computational-state sync after external-maintenance integration.

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
   Use the locked public principles; each principle receives a short spread and one primary figure. Principle 8, **Design for repose**, is evidence-bounded explicitly: established environmental and housing evidence is separated from architectural hypotheses such as perceptual structural legibility. The developed spread is [Principle 8 — Design for Repose](principle-08-repose.md), with [Figure 8.1](figures/principle-08-repose.svg).

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
    Attachment hierarchy, architectural backplanes, wall linings, floor platforms, ceilings, kitchens, bathrooms, windows, doors, fixing infrastructure, wet-trade discipline and selective adaptability.

12. **Legibility and stewardship**  
    Building record, physical index, change control and maintainability commissioning.

## Part III — Pattern Catalogue

30 controlled patterns grouped as:

### A. Service topology
utility entry; plant hub; riser; horizontal spine; high-service wall; local deep zone; undercroft option.

### B. Distribution and access
service skirting; vertical joinery route; controlled penetration; compartmented void; floor access.

### C. Water and failure
manifold; withdrawable pipe; water-damage-safe route; leak detection path; wet-service room.

### D. Openings and interfaces
window; door; threshold; slip/movement joint; experimental functional cornice.

### E. Envelope and environment
perimeter dry zone; rainwater route; kitchen source capture; bathroom extraction; roof-maintenance route; [ground-supported façade access](../patterns/ground-supported-facade-access.md).

### F. Occupation and stewardship
fixing infrastructure; physical service index.

Every pattern uses:
problem / forces / principle / diagram / variants / proportionality / boundary debt / permanent-fabric impact / construction variability and workmanship / occupation and repose impact where relevant / architectural resolution / assembly and replacement sequence / failure modes / evidence / maturity / reference-house choice.

### Candidate development track

The following systems are deliberately held outside the established core catalogue until engineering and prototype work is sufficient:

- Seated Floor Structure;
- Architectural Backplane;
- Replaceable Wall Lining;
- Finish-Agnostic Floor Platform.

## Part IV — The Reference House

13. Site and type  
14. Architectural order, repose and tectonic language  
15. Material, structural and assembly system  
16. Maintenance geography — internal service topology plus a coordinated [External Access & Maintenance Plan](../reference-house/external-access-maintenance-plan.md) covering façade, roof, courtyard, ground/support conditions, landscape and logistics from the site entrance  
17. Water and environmental systems  
18. Future maintenance scenarios — include upper masonry repair, gutter/eaves renewal, chimney/roof repair, window cleaning versus full-frame replacement, courtyard access and mature-landscape replay

The reference house is explicitly **one interpretation**, not proof of the doctrine.

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
25. Design review through failure, change and occupation scenarios — include task-specific external access scenarios rather than a generic assertion of façade accessibility

## Back matter

A. Evidence and precedent notes  
B. 63-item doctrine register mapped to eleven principles  
C. Research agenda  
D. Reference-house implementation schedule  
E. Glossary  
F. Bibliography and standards

---

## Computational development track — recorded, not yet promoted to a manuscript part

The project carries a parallel computational proposition: a constrained semantic building model may be compiled against explicit architectural, structural, construction, regulatory and evidence obligations.

The canonical concept is [Executable Architecture — Computational Expression of House Systems Architecture](../computational/executable-architecture.md); the current state and control documents are indexed in the [Computational Track](../computational/README.md).

The computational direction should remain **parallel to the publication rather than being forced into Part I–V**. It is consequential enough to deserve its own research track, but the publication should not present a paper-validated computational architecture as a finished software product.

The current position is:

- it is **not a governing principle** and does not replace the doctrine;
- the doctrine remains meaningful independently of software;
- the formal architectural model, obligation/evidence architecture and bounded H1 paper tests now exist;
- the internal paper sequence is complete through H1-PAPER-01 and the capability freeze;
- external competent review remains open;
- a minimal executable semantic/compiler kernel is authorised as the next falsification step;
- heavy CAD/compiler/product implementation remains gated;
- the eventual publication form remains open: later monograph material, companion research volume, software/product specification or some combination should be chosen only after external and executable validation.

The computational chain remains:

```text
Doctrine
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

The architectural manuscript should not become a software pitch. The computational track earns publication space only where it clarifies or strengthens the architecture.

**Integration boundary:** external maintenance geography has now received an explicit post-freeze computational coverage audit. Its semantics are representable, but whole-house external access/logistics have not yet been demonstrated in H1. The authorised executable extension fixture `EXT-MAINT-01` comes only after the minimal kernel succeeds.

# Separate implementation brief

A concise project document for the appointed architect, mapped to the RIBA Plan of Work.

For each requirement:
- governing principle;
- project requirement / target;
- selected pattern or allowed alternatives;
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

**Do not merge Part III pattern catalogue back into Part II.**

Part II should remain readable as architectural argument. The pattern catalogue should remain browsable as professional reference. Cross-references connect them.

Likewise, **do not make the Reference House the evidence for the doctrine.** It is a worked interpretation and research vehicle.