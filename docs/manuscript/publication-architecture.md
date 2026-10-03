# House Design Doctrine — Publication Architecture v0.6

**Working form:** illustrated architectural design-research monograph + pattern catalogue + separate architect-facing implementation brief.  
**Status:** v0.6 — repose / low-vigilance integration working structure.

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
   Use the locked public principles; each principle receives a short spread and one primary figure. Principle 8, **Design for repose**, is evidence-bounded explicitly: established environmental and housing evidence is separated from architectural hypotheses such as perceptual structural legibility.

## Part II — Architecture of the Platform

6. **The designed interface**  
   Tectonic honesty; deterministic load paths and bounded movement; separation of support, restraint, movement, sealing and finish; tolerance translation; workmanship robustness; mistake-proofing where consequential; fixing, access and replacement. Distinguish engineering legibility from **perceptual structural legibility**: concealment is legitimate, but principal domestic spaces should not gratuitously depend on apparent instability.

7. **Failure architecture**  
   First defence / second consequence; water, overflow, drainage, drying, detection, isolation and recovery.

8. **Maintenance geography**  
   Spatial topology of approach, working space, disconnection and withdrawal; proportionality.

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
perimeter dry zone; rainwater route; kitchen source capture; bathroom extraction; roof-maintenance route.

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
16. Maintenance geography  
17. Water and environmental systems  
18. Future maintenance scenarios

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
24. Commission maintainability  
25. Design review through failure, change and occupation scenarios

## Back matter

A. Evidence and precedent notes  
B. 63-item doctrine register mapped to eleven principles  
C. Research agenda  
D. Reference-house implementation schedule  
E. Glossary  
F. Bibliography and standards

---

## Computational development track — recorded, not yet promoted to a manuscript part

The project now carries a further research proposition: the architectural doctrine may admit an **executable computational expression** in which a constrained semantic building model is compiled against explicit architectural, structural, construction and regulatory obligations.

The canonical concept is recorded in [Executable Architecture — Computational Expression of the Long-Life House](../computational/executable-architecture.md).

The computational direction should currently remain **parallel to the publication rather than being forced into Part I–V**. It is too consequential to be treated as a minor addendum, but insufficiently formalised to be presented as settled doctrine or as an implemented product.

The current editorial position is:

- it is **not a governing principle**;
- it does not replace the doctrine;
- the doctrine remains valid independently of software;
- the future software would be an executable expression of the doctrine's formal subset;
- a new intermediate layer — the **formal architectural model** — must be developed before language or compiler implementation;
- the eventual publication form remains open: a Part VI, companion research volume, software/product specification, or some combination should be selected only after prior-art research and formalisation.

The concept's provisional computational chain is:

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

The architectural manuscript should not become a software pitch. The computational track earns promotion only if it clarifies and strengthens the architecture.

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

This is the direct solution to the “transpilation” problem: the monograph explains the architectural position; the implementation brief tells the design team what this project actually requires.

---

# Structural decision

**Do not merge Part III pattern catalogue back into Part II.**

Part II should remain readable as architectural argument. The pattern catalogue should remain browsable as professional reference. Cross-references connect them.

Likewise, **do not make the Reference House the evidence for the doctrine.** It is a worked interpretation and research vehicle.