# G-01 Candidate Constraint Register — Seed v0.1

**Status:** provisional D7 seed; no G-01 v0.1 rules promoted  
**Purpose:** extract the smallest falsifiable candidate constraint set justified by D3–D6 so connected-room compiler research can proceed without waiting for a complete Georgian grammar.  
**Use:** S2 research only unless a constraint is later promoted through mutation and hold-out validation.

> **The grammar should become executable in the order the evidence becomes trustworthy, not in the order the code would be convenient to write.**

## 1. Maturity classes

### M0 — modelling correction

Strong enough to shape the formal representation.

Not itself a claim that Georgian architecture requires a particular design outcome.

### M1 — cross-case architectural hypothesis

Supported by multiple cases at a qualitative level.

May be used as a falsifiable candidate constraint in research fixtures.

Not yet a promoted G-01 rule.

### M2 — morphology-specific candidate

Plausible inside a named morphology profile.

Needs wider corpus / hold-out testing before promotion.

### M3 — dimensional candidate

Requires phase-checked measured evidence and quantitative range definition.

None is promoted at this stage.

## 2. Candidate C01 — explicit architectural hierarchy

**ID:** G01-CAND-01  
**Maturity:** M1  
**Class:** relational / hierarchy  
**Provisional strength:** HARD within the research profile once hierarchy is declared

### Proposition

A G-01 design should not leave all rooms, openings and routes architecturally unranked.

The selected morphology/profile should declare at least:

- principal spatial roles;
- subordinate spatial roles;
- principal circulation/arrival roles;
- any intentionally subordinate service/secondary movement role.

This does **not** say:

- biggest room = principal;
- centre room = principal;
- entrance floor = principal;
- one fixed hierarchy fits every morphology.

### Evidence

Across the three D3/D4 trials:

- Marble Hill expresses hierarchy through the central Great Room, Great Stairs and double-height section;
- Danson expresses hierarchy through principal rooms, central elliptical stair and principal-room sequence;
- 76 Dean Street expresses hierarchy vertically and through differentiated first-floor openings/stair arrival.

### Counterpressure

76 Dean Street demonstrates that hierarchy can be:

- off-centre;
- vertical;
- expressed by opening treatment rather than one central room.

Therefore C01 must remain relational.

### Mutation

Flatten every room/route/opening to the same rank.

Expected:

- hierarchy graph loses explanatory power;
- grammar deviation/failure if the selected profile requires a principal order.

### S2 use

S2 may declare:

- HALL = circulation-primary;
- PRINCIPAL ROOM = H1;
- SECONDARY ROOM = H2;
- service route = technical/service.

The compiler can then test whether later edits invert or erase that declared order.

## 3. Candidate C02 — topology distinguishes connectivity, route and sequence

**ID:** G01-CAND-02  
**Maturity:** M0 / M1  
**Class:** topology / sequence  
**Provisional strength:** HARD modelling rule; architectural sequence profile-specific

### Proposition

The grammar must represent separately:

- direct connectivity;
- route class;
- required/privileged sequence;
- visual/axial relation.

A new doorway can therefore:

- add connectivity;
- shorten a route;
- destroy a declared sequence;

without moving either room.

### Evidence

Danson's original principal floor is the clearest example.

The Saloon was reached through Dining Room or Library rather than by a later direct Hall shortcut.

The architectural sequence changed when the graph changed.

### Counterpressure

Not every Georgian house uses through-room ceremonial sequence.

76 Dean Street is an important warning against universalising the Danson graph.

### Mutation

Add a direct Hall → principal-room bypass where the research profile declares an intermediate sequence.

Expected:

- CONNECTIVITY may improve;
- declared SEQUENCE may fail;
- technical circulation efficiency and grammar can disagree.

### S2 use

S2 should be able to declare one principal arrival sequence and mutate it without relying on room coordinates.

## 4. Candidate C03 — principal and service/secondary routes are distinct roles

**ID:** G01-CAND-03  
**Maturity:** M1  
**Class:** circulation hierarchy  
**Provisional strength:** SOFT/HARD depending profile

### Proposition

Where a house contains both principal and service/secondary circulation, the grammar should distinguish their architectural roles even if they are physically adjacent.

A service route must not accidentally become the dominant principal arrival merely because it is shortest.

### Evidence

- Marble Hill: Great Stairs / Stone Stair distinction;
- Danson: central primary stair adjacent to service stair;
- 76 Dean Street: principal and service stairs coexist under tight urban compression.

### Historical warning

Do not encode servants or historical social segregation as a modern requirement.

Transfer only:

> **different movement networks can carry different architectural rank.**

### Mutation

Make the technical/service route the only legible arrival to the principal room.

Expected:

- route hierarchy conflict;
- Long-Life service topology may remain technically valid;
- G-01 candidate order may fail.

### S2 use

Useful for keeping Long-Life technical circulation/service geography subordinate to principal spatial order.

## 5. Candidate C04 — symmetry and alignment are scoped relations

**ID:** G01-CAND-04  
**Maturity:** M0  
**Class:** ordering semantics  
**Provisional strength:** HARD modelling rule

### Proposition

Never encode:

> BUILDING.isSymmetric = true/false

as the sufficient representation.

Symmetry/alignment should identify:

- subject/domain;
- axis;
- phase/storey/elevation;
- degree/state.

Examples:

- façade symmetric about axis A;
- principal room/opening aligned to axis B;
- paired room fields;
- service system intentionally outside the symmetry domain.

### Evidence

- strong symmetry domains at Marble Hill;
- ordered but locally conflicting centring at Danson;
- coherent four-bay 76 Dean Street façade with off-centre entrance.

### Mutation

Move an entrance to the abstract building centre in 76 Dean Street.

Expected:

- does not automatically improve G-01;
- may damage plan/circulation despite increasing naïve symmetry.

### S2 use

S2 can declare a room/elevation axis without pretending the whole cluster must be bilateral.

## 6. Candidate C05 — opening hierarchy can express spatial hierarchy

**ID:** G01-CAND-05  
**Maturity:** M1  
**Class:** elevation / hierarchy  
**Provisional strength:** SOFT candidate

### Proposition

Where the selected profile uses elevation to express internal rank, opening treatment should be capable of reflecting:

- room rank;
- storey rank;
- principal versus secondary status.

This is **not** yet:

> principal room window must be X% larger.

Opening rank may be expressed through:

- size;
- height;
- surround/treatment;
- grouping;
- bay position;
- relation to storey datum.

### Evidence

- 76 Dean Street's first-floor hierarchy and one enlarged opening;
- Marble Hill's strong principal-centre façade order;
- Danson's principal-floor/elevation treatment and canted bays.

### Counterpressure

Danson's blind-window evidence shows exterior order may sometimes override ordinary spatial-opening logic.

### Mutation

Make all openings identical in rank/treatment where a principal-storey/room hierarchy is declared.

Expected:

- possible flattening of architectural hierarchy;
- should be tested, not assumed universally ugly.

### S2 use

S2 may tag one principal opening and one secondary opening and test whether the façade/order graph preserves that rank.

## 7. Candidate C06 — plan/section/elevation coupling is attribute-specific

**ID:** G01-CAND-06  
**Maturity:** M0  
**Class:** coupling semantics  
**Provisional strength:** HARD modelling rule

### Proposition

Do not attach one generic coupling state to an opening or room.

Where evidence/design requires it, attributes may have different authorities:

- existence;
- centreline;
- width;
- height;
- sill/head datum;
- vertical alignment.

Possible relation states include:

- MUTUAL;
- PLAN_LEADS;
- ELEVATION_LEADS;
- CONFLICT / COMPROMISE;
- UNKNOWN.

### Evidence

Danson's blind-window evidence is decisive:

- simulated-opening existence can be elevation-led;
- precise location can respond to internal geometry;
- final exterior order can contain compromise.

### S2 use

The connected-room fixture may use a declared axis/coupling relation for one principal opening while leaving another opening freer.

## 8. Candidate C07 — proportion is role/family-specific, not universal

**ID:** G01-CAND-07  
**Maturity:** M3 NOT READY FOR ENFORCEMENT  
**Class:** proportion guardrail

### Proposition

Do **not** create a universal “good Georgian room ratio”.

Current evidence already includes:

- Marble Hill Great Room: 1:1 plan / cubic volume;
- Danson Entrance Hall: approximately 4:3;
- Danson Library/Dining: 2:1;
- Danson Saloon: square principal axes with octagonal/canted geometry.

### Current executable consequence

Only a negative rule is justified:

> **G-01 v0 research must not reject a room merely for not matching one canonical ratio.**

### Future work

A real dimensional rule requires:

- larger measured corpus;
- role classification;
- absolute-size bands;
- height;
- morphology/profile;
- tolerance/range analysis;
- hold-out validation.

### S2 use

Record room dimensions and derived ratios.

No hard ratio rule.

## 9. Candidate C08 — section can carry hierarchy independently of plan

**ID:** G01-CAND-08  
**Maturity:** M1  
**Class:** vertical / sectional hierarchy  
**Provisional strength:** SOFT candidate

### Proposition

The grammar must be capable of expressing hierarchy through:

- room height;
- double-height condition;
- stair volume;
- principal-storey position;
- common floor/ceiling datums.

Plan area/centrality alone is insufficient.

### Evidence

- Marble Hill's 24 ft cubic Great Room rises through the floor above;
- Danson uses a common 16 ft principal-floor height across rooms with different plan proportions;
- 76 Dean Street expresses principal rank vertically at first-floor level.

### S2 use

S2 does not need to enforce a special ceiling height.

It should preserve the possibility that room rank is sectional rather than only planimetric.

## 10. Candidate C09 — intentional absence is architectural data

**ID:** G01-CAND-09  
**Maturity:** M0/M1  
**Class:** façade/order semantics

### Proposition

The grammar must be able to distinguish:

- true opening;
- blind/simulated opening;
- prohibited opening;
- retained solid field;
- reserved clear field.

“Nothing here” can be a positive compositional state.

### Evidence

Danson blind/simulated windows.

### S2 use

Not required in the first S2 fixture.

Retain for later façade work.

## 11. What is mature enough for S2

S2 should use only a **pilot research profile**, not G-01 v0.1.

### G01-PILOT-P0

For S2 research, enable:

1. **P0-HIERARCHY**  
   principal room > secondary room as a declared project/grammar hierarchy;

2. **P0-ROUTE**  
   hall/principal arrival route is distinguished from technical/service route;

3. **P0-SEQUENCE**  
   one declared principal spatial sequence exists and can be deliberately bypassed in mutation tests;

4. **P0-SCOPED-AXIS**  
   one named room/opening/arrival axis is a scoped relationship, not whole-building symmetry;

5. **P0-OPENING-RANK**  
   principal versus secondary opening roles are represented relationally;

6. **P0-NO-UNIVERSAL-RATIO**  
   room dimensions are recorded/evaluated, but no universal ratio is enforced.

These are enough to pressure the compiler's grammar machinery.

They are **not** enough to claim the generated design is Georgian.

## 12. Candidate-rule record format going forward

Every future G-01 candidate should record:

- ID;
- maturity;
- morphology scope;
- authority/class;
- proposition;
- supporting cases;
- counterexamples/counterpressure;
- historical/social dependency;
- mutation test;
- hold-out test;
- promotion criteria;
- S2/H1 relevance.

This is more important than accumulating a long list of rules.

## 13. D8 mutation seed

The current candidate set already supports at least these deliberate near-misses.

### D8-M01 — bypass Danson sequence

Add direct Hall → Saloon shortcut.

Tests:

- C02 sequence;
- route efficiency versus architectural order.

### D8-M02 — flatten Marble Hill section

Reduce Great Room to ordinary single-storey height without changing plan position.

Tests:

- C01 hierarchy;
- C08 sectional hierarchy.

### D8-M03 — centre 76 Dean Street entrance

Force door to global façade centre.

Tests:

- C04 scoped symmetry;
- urban morphology.

### D8-M04 — flatten 76 Dean Street first-floor openings

Make opening hierarchy uniform.

Tests:

- C05.

### D8-M05 — force Danson principal rooms to one ratio

Normalize Entrance Hall, Library, Dining and Saloon to one chosen aspect ratio.

Tests:

- C07 negative guardrail;
- whether coherence worsens despite ratio consistency.

### D8-M06 — erase principal/service route distinction

Treat primary and secondary stairs as one undifferentiated circulation class.

Tests:

- C03;
- whether model loses meaningful architectural information.

These are not yet expert-reviewed mutation outcomes.

They are the first D8 test definitions.

## 14. What remains before any promotion

No candidate above becomes a G-01 v0.1 rule until:

1. D4 phase/topology evidence improves;
2. D5 expands beyond the current sparse metric sample;
3. D6 gains measured opening/room coordinate evidence;
4. mutations are actually evaluated, not merely described;
5. held-out cases are tested;
6. morphology-specific versus general rules are separated;
7. social/historical dependencies are reviewed.

## 15. Current judgement

The strongest material is not yet a table of Georgian proportions.

It is a grammar architecture built from:

- hierarchy;
- route;
- sequence;
- scoped order;
- opening rank;
- section;
- directional coupling;
- proportion families later.

This is enough to continue computational research without pretending the architectural research is finished.

> **S2 may test the grammar machinery. It may not use the result as evidence that G-01 itself is validated.**
