# External Competent Review Pack — S0 / S1 / H1 v0

**Status:** reviewer brief v0.1  
**Purpose:** give a structural engineer and building-control / building-regulations practitioner a compact adversarial brief for testing the computational project's proof boundary before any implementation work begins.  
**Review status:** **NOT YET PERFORMED**.

> **The reviewer is not being asked whether the idea is interesting. They are being asked where it is wrong, incomplete, overconfident or unsafe.**

## 1. What to review

The current computational proposition is:

> a deliberately bounded house compiler can own semantic building identity, geometry, relationship graphs, applicability, obligation generation, evidence provenance and selective invalidation, while allowing competent external evidence to discharge propositions such as member/connection adequacy.

The project explicitly does **not** claim that:

- a green model equals Building Regulations approval;
- the compiler can replace structural engineers/building control;
- Approved Documents are identical to law;
- every compliance route can be automated;
- physical construction is proven by design-stage geometry.

## 2. Core review files

Read in this order.

### Concept / proof model

1. [Executable Architecture](executable-architecture.md)
2. [Validity and Obligations](validity-and-obligations.md)
3. [Evidence and Provenance Architecture](evidence-and-provenance.md)
4. [Formal Architectural Model](formal-architectural-model.md)
5. [Supported Domain](supported-domain.md)

### Structural boundary

6. [Structural Semantics](structural-semantics.md)
7. [Structural Assurance Boundary — H1 v0](structural-assurance-boundary-h1-v01.md)

### Regulatory target

8. [Compiler Targets](compiler-targets.md)
9. [S0 Target v0.1](s0-target-snapshot.md) — historical Run-01 target
10. [S0 Target v0.2](s0-target-snapshot-v02.md)
11. [S0 Target v0.3](s0-target-snapshot-v03.md)
12. [S1 Target v0.1](s1-target-snapshot-v01.md)

### Paper compiles

13. [S0 Run 01](s0-paper-compile-run-01.md)
14. [S0 Red Team](s0-red-team-run-01.md)
15. [S0 Run 02](s0-paper-compile-run-02.md)
16. [S1 Run 01](s1-paper-compile-run-01.md)

### Supported-family examples

17. [Window / Masonry Boundary Family](boundary-family-window-masonry-v01.md)
18. [External Masonry Corner Family](boundary-family-external-masonry-corner-v01.md)
19. [Ground-Floor / Wall Perimeter Family](boundary-family-ground-floor-masonry-v01.md)
20. [Room Service Route](service-family-room-low-level-v01.md)
21. [Trussed Roof Family](roof-family-trussed-duopitch-v01.md)

### Whole-house audit

22. [H1 Capability Matrix — Post-S1](h1-capability-matrix-v01.md)

## 3. Structural-engineer review questions

### A. Proof boundary

1. Is the split between:
   - native structural topology/geometry/dependency reasoning;
   - external member/connection/stability/foundation adequacy
   technically meaningful?

2. Are there structural propositions currently treated as “topology” that in practice already require engineering judgement?

3. Are there cases where the compiler's semantic support graph could appear coherent but materially misrepresent the actual structural system?

4. What minimum structural facts must be in the source before an engineer can rely on the extracted model?

### B. Evidence scope

5. Is the proposed scoped-evidence model credible?

Example:

~~~text
evidence covers:
  member capacity
  connection capacity

only while:
  span <= X
  spacing = Y
  support family = Z
  penetrations inside envelope
~~~

6. Which engineering assumptions are most likely to remain implicit and therefore escape dependency invalidation?

7. Should reactions, load cases, load combinations and stability assumptions themselves be first-class evidence outputs even when the calculation engine is external?

8. When can multiple repeated occurrences legitimately share one calculation/evidence item?

9. Which changes should almost always invalidate broader structural evidence than our current local model suggests?

### C. S0 / S1

10. In S0/S1, are the represented floor/wall/opening support relationships structurally sensible as semantic abstractions?

11. Which missing structural relationships would you expect around:
    - a window in a loadbearing masonry wall;
    - an I-joist floor bearing on masonry;
    - a loadbearing internal wall interrupted by a door;
    - a masonry external corner;
    - the ground-floor/wall/substructure interface?

12. Does the “external proof allowed” strategy become too permissive anywhere?

### D. Roof

13. Is RF-TRUSS-DUO-01 a sensible first product boundary?

14. Is it legitimate for:
    - roof geometry;
    - supports;
    - truss occurrence/layout identity;
    - bracing roles;
    - evidence dependency
    to be compiler-native while truss structural design remains manufacturer/engineer evidence?

15. What information from a truss designer/manufacturer should the compiler treat as structured evidence rather than just a PDF attachment?

### E. Stop conditions

16. Under what conditions would you say:

> this system is giving dangerously strong structural feedback without doing enough structural engineering?

Please give concrete examples.

## 4. Building-control / regulatory review questions

### A. Target architecture

1. Is the distinction between:
   - legislation;
   - Approved Document guidance;
   - technical standards;
   - product evidence;
   - project requirements;
   - Long-Life House doctrine
   correctly maintained?

2. Does the target-version model reflect how transitional provisions actually affect real projects?

3. Is it useful/correct to model target applicability as dependent on future events such as commencement?

4. What common England-new-dwelling requirements are still conspicuously absent from the target coverage?

### B. Applicability

5. Is the project too confident that applicability can be inferred mechanically from semantic roles?

6. Which requirements/alternative routes generally demand explicit professional judgement or confirmation rather than automatic inference?

7. Review the S0 red-team additions:
   - K low-sill/fall/glazing;
   - Q window security;
   - B1 escape-window role;
   - B4 relevant-boundary contribution;
   - F purge/transfer;
   - Regulation 7.
   Are these framed correctly?

8. Review S1's addition of M4(1) room access/control semantics.
   Are we drawing a defensible line between room-scale contribution and whole-dwelling Part-M conformance?

### C. “Pass” vocabulary

9. Is the distinction between:
   - semantic PASS;
   - route/applicability PASS;
   - external evidence required;
   - unresolved;
   - unsupported;
   - release FAIL
   sufficiently clear?

10. Which words should the product avoid entirely because users/building-control bodies could misread them as statutory approval?

### D. Evidence

11. Would a traceable obligation/evidence graph materially help a building-control review?

12. What forms of design information/evidence are actually useful to a reviewer versus bureaucratic noise?

13. Which evidence must be whole-building rather than attached to a local component/interface?

14. Where does “one shared evidence item supports many occurrences” become dangerous?

### E. Target completeness

15. What would you require before saying:

> this compiler target is complete enough for a bounded new detached dwelling route?

Not “all UK building law”—just the declared H1 domain.

## 5. Joint review questions

These are the most important.

### J1 — false confidence

Where does the current model appear more certain than a competent designer would be?

### J2 — missing interaction

Name at least five interactions that the current S0/S1 graphs likely miss.

### J3 — unsupported versus external

Are we using EXTERNAL where we should instead say UNSUPPORTED?

### J4 — external evidence dependency

What external evidence is hardest to scope tightly enough for safe automatic invalidation?

### J5 — complexity

Would the proposed obligation/evidence structure actually make professional review easier?

If not, where does it become bureaucracy?

### J6 — source model sufficiency

What minimum information would you insist the author/model contain before you would accept its downstream:
- structural extraction;
- regulatory applicability;
- quantities;
- evidence dependencies?

### J7 — mutation tests

Do the S0/S1 mutations resemble real design-change risks?

What mutations would you add?

### J8 — release

What conditions should always prevent a release-grade compile even where every currently generated obligation says PASS?

## 6. Requested reviewer output

Please return findings in this structure.

### CRITICAL

A flaw that could make the compiler give unsafe/misleading assurance or model the wrong legal/technical proposition.

### MAJOR

A material gap that must be corrected before H1 implementation.

### MODERATE

A limitation acceptable in H1 if made explicit.

### MINOR

Terminology, organisation or usability issue.

For each finding:

~~~text
ID:
severity:
source document / section:
problem:
why it matters:
recommended correction:
example / counterexample:
does it block implementation? yes/no
~~~

## 7. Specific adversarial request

Please do not limit the review to the questions above.

Try to construct cases where:

- all represented relationships look valid but the building is structurally unsafe;
- the wrong regulatory route appears applicable;
- one evidence item is reused beyond its legitimate scope;
- a local change should invalidate a distant dependency but does not;
- two individually valid supported families become invalid when composed;
- a whole-building obligation disappears because every component thinks another scope owns it;
- the compiler says UNSUPPORTED when a normal professional route should be available;
- the compiler says EXTERNAL so often that it adds little value.

## 8. What would count as a successful review

A successful review is **not**:

> looks sensible.

A useful review should produce:

- missed obligations;
- boundary corrections;
- terminology corrections;
- cases where evidence invalidation is too narrow;
- cases where target inference is too strong;
- explicit support for the parts that actually withstand attack.

If the review materially weakens the compiler proposition, update the proposition.

Do not defend the architecture merely because the repo is now large.

## 9. Programme rule

No future response should state that an external competent review has occurred until an actual qualified external reviewer has reviewed the material.

This document is only the review pack.
