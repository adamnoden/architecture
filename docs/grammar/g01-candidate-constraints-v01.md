# G-01 Constraint Evidence Register

Before G-01 v0.1 was reduced to six normative relationships, the precedent evidence exposed several candidate relationships and modelling corrections. Their enduring value is not the order in which they were tested, but the distinctions they forced the final grammar to make.

This register records those distinctions and their present disposition. The current normative authority is [G-01 v0.1](g01-v0.1.md); nothing on this page creates an additional grammar rule.

## Reading the register

A relationship can end in one of four places:

- **normative grammar** — absorbed into a current G-01 rule;
- **framework semantics** — necessary to represent architectural evidence/design honestly, but not itself a Georgian rule;
- **bounded evidence conclusion** — a useful negative or scope limit rather than a positive rule;
- **rejected as universal** — present in some precedents but not defensible as a general contemporary G-01 invariant.

This separation is important. A modelling correction does not become Georgian merely because Georgian evidence exposed it.

## C01 — explicit architectural hierarchy

### Proposition

A G-01 design cannot be understood if rooms, openings and routes are treated as architecturally unranked. Hierarchy may be expressed by position, route, opening treatment, section, room role or several of these together.

### Evidence

- Marble Hill expresses hierarchy through the central Great Room, Great Stairs and double-height section;
- Danson expresses it through principal rooms, central elliptical stair and the principal-room circuit;
- 76 Dean Street shows that hierarchy can be off-centre, vertical and expressed through opening treatment rather than one central room.

### Current disposition

**Normative grammar.** The durable relationship survives principally in **G01-R05 — relational spatial + sectional hierarchy**, with opening rank also contributing to R02.

It does **not** imply that biggest room = principal, centre room = principal, entrance floor = principal or that one hierarchy fits every morphology.

## C02 — connectivity, route and sequence are different facts

### Proposition

Direct connectivity, route class, privileged/required sequence and visual/axial relation must remain distinct.

Adding a doorway can increase connectivity and shorten a route while weakening a selected architectural sequence without moving either room.

### Evidence

Danson’s original principal floor is the clearest case: the Saloon belonged to a principal-room circuit through Dining Room or Library before a later direct Hall shortcut altered the graph.

### Counterevidence

Not every Georgian house uses a through-room ceremonial sequence. 76 Dean Street is a strong warning against universalising the Danson topology.

### Current disposition

**Framework semantics / bounded evidence conclusion.** G-01 can represent sequence, but no fixed principal-room sequence is a v0.1 invariant.

## C03 — principal and secondary/service movement can carry different rank

### Proposition

Where several movement networks exist, their architectural roles may differ even when they are physically adjacent. The shortest route need not be the principal arrival.

### Evidence

- Marble Hill distinguishes Great Stairs and Stone Stair;
- Danson places a central primary stair beside a service stair;
- 76 Dean Street compresses principal and service stairs within an urban house.

### Historical limit

The transferable relationship is that **movement networks can carry different architectural rank**. Historical servant segregation is not a contemporary requirement.

### Current disposition

**Framework semantics / rejected as a universal historical rule.** Route role remains available to G-01 and project design, but historic service circulation is explicitly outside the current invariant set.

## C04 — symmetry and alignment are scoped relations

### Proposition

A building-level Boolean such as `isSymmetric = true` is too crude. Symmetry/alignment must identify subject, domain, axis, storey/elevation/phase and degree.

### Evidence

- Marble Hill has strong scoped symmetry domains;
- Danson combines order with locally conflicting centring;
- 76 Dean Street has a coherent four-bay façade with an off-centre entrance.

### Current disposition

**Framework semantics informing normative grammar.** G01-R01 requires coherent architectural fields/order, not whole-building bilateral symmetry. G01-R03 allows a principal entrance to be architecturally ranked without being geometrically centred.

## C05 — opening hierarchy can express spatial hierarchy

### Proposition

Where elevation participates in internal hierarchy, openings can express room/storey/principal rank through size, height, surround, grouping, bay position or relation to storey datum.

No single percentage difference or one sash formula is implied.

### Evidence

- 76 Dean Street’s first-floor hierarchy and enlarged opening;
- Marble Hill’s principal-centre façade order;
- Danson’s principal-floor/elevation treatment and canted bays.

Danson’s blind windows also show that exterior order can sometimes override ordinary physical-opening logic.

### Current disposition

**Normative grammar.** This relationship survives in **G01-R02 — related and ranked opening family**.

## C06 — plan/section/elevation coupling is attribute-specific

### Proposition

One generic coupling state on an opening or room is insufficient. Existence, centreline, width, height, sill/head datum and vertical alignment may have different authorities.

Useful coupling states include mutual, plan leads, elevation leads, conflict/compromise and unknown.

### Evidence

Danson’s blind-window evidence is decisive: simulated-opening existence can be elevation-led while precise location responds to internal geometry, producing a controlled exterior compromise.

### Current disposition

**Framework semantics.** The distinction allows G-01 to state coupled relationships without pretending every attribute has one author. It is not itself a Georgian invariant.

## C07 — proportion is role/family-specific, not universal

### Proposition

No universal “good Georgian room ratio” is supported by the corpus.

Current measured examples already include:

- Marble Hill Great Room: 1:1 plan / cubic volume;
- Danson Entrance Hall: approximately 4:3;
- Danson Library/Dining: 2:1;
- Danson Saloon: square principal axes with canted/octagonal geometry.

### Current disposition

**Bounded evidence conclusion.** G-01 v0.1 deliberately contains no universal room-ratio rule. Dimensions and proportional families remain relevant where scoped by role, morphology and evidence, but numerical consistency is not treated as architectural validity by itself.

## C08 — section can carry hierarchy independently of plan

### Proposition

Room height, double-height condition, stair volume, principal-storey position and common floor/ceiling datums can all carry hierarchy that plan area or centrality alone cannot express.

### Evidence

- Marble Hill’s 24 ft cubic Great Room rises through the floor above;
- Danson uses a common 16 ft principal-floor height across rooms with different plan proportions;
- 76 Dean Street expresses principal rank vertically at first-floor level.

### Current disposition

**Normative grammar.** This evidence is absorbed into **G01-R05 — relational spatial + sectional hierarchy**.

## C09 — intentional absence is architectural data

### Proposition

The model must distinguish true openings, blind/simulated openings, prohibited openings, retained solid fields and protected clear fields. “Nothing here” may be a positive compositional state.

### Evidence

Danson’s blind/simulated windows are the clearest case: compositional aperture and physical aperture are not identical facts.

### Current disposition

**Framework semantics / evidence capability.** It supports accurate reading of R01/R02 conditions but is not a separate v0.1 invariant.

## What survived into G-01 v0.1

The seed evidence did not mature into a long checklist. It helped produce a smaller grammar centred on relationships that survived broader comparison and adversarial testing:

1. coherent classical architectural fields;
2. a related and ranked opening family;
3. an architecturally ranked principal entrance;
4. an integrated upper termination / roof order;
5. relational spatial + sectional hierarchy;
6. concentrated classical articulation.

Some of the strongest research results are therefore **absences** from the normative grammar: no universal room ratio, no centred-entry rule, no whole-building symmetry requirement, no fixed principal-room sequence, no inherited servant-circulation rule and no generic `opening.aligned` Boolean.

## Current methodological consequence

The grammar framework retains explicit hierarchy, typed routes/sequences, scoped order, attribute-level coupling, intentional absence and sectional relationships because those distinctions are useful for representing architecture honestly.

G-01 uses only the subset for which the Georgian-derived evidence justifies normative authority.

That is the intended hierarchy:

```text
EVIDENCE
  ↓
REPRESENTATIONAL DISTINCTIONS
  ↓
CANDIDATE ARCHITECTURAL RELATIONSHIPS
  ↓
COUNTEREXAMPLES / VALIDATION
  ↓
CURRENT G-01 RULES
```

The register records the evidential bridge; [G-01 v0.1](g01-v0.1.md) remains the specification.