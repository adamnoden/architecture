# Pattern Crosswalk — Strategies and Held Candidates Audit

**Status:** Phase-8 P8.4 complete  
**Scope:** three canonical strategies + four held candidates  
**Purpose:** determine whether non-pattern HSA knowledge exposes computational gaps without treating strategies/candidates as pattern nodes.

---

# 1. Result

**No fundamental semantic gap is exposed.**

All seven propositions can be represented using the existing semantic / obligation / evidence architecture. Their reasons for remaining strategies or held candidates are architectural, physical, evidential or taxonomic — not failures of computational representation.

This is an important separation:

> **The compiler being able to represent an idea does not make the idea a valid pattern, a good design or a proven building system.**

---

# 2. Canonical strategies

## Fail-Safe Water Distribution

**Computational coverage:** **NATIVE**  
**Implementation priority:** post-P0 water-failure/scenario fixtures; no strategy-specific subsystem.

### Representable consequences

Existing concepts cover:

- water service networks/routes;
- joints/components;
- isolation;
- maintenance/access;
- vulnerable fabric/boundaries;
- containment/drainage/failure paths;
- sensors/controls as equipment where selected;
- failure scenarios and evidence obligations.

The strategy is best represented as **project decision policy + selected route-specific measures**, not as one compiler family.

Different routes may legitimately select different responses:

- accessible joints;
- joint-minimised run;
- `P-017` Visible Leakage Path;
- local containment;
- granular/manual/automatic isolation;
- `P-018` Failure-Tolerant Wet Service Room.

### Technical authority

Actual plumbing integrity, drainage performance, valve/system performance and product applicability remain technical evidence.

### Human residue

Which failure scenarios justify permanent measures and whether redundancy is proportionate.

### Finding

Retiring old `P-006` was computationally correct as well as architecturally correct: one universal `WaterDamageSafeRoute` entity/rule would have collapsed materially different mechanisms into a false type.

---

## Decompose Structural Interface Functions

**Computational coverage:** **NATIVE — STRONGLY ALIGNED**  
**Implementation priority:** already central to structural/interface semantics; no separate strategy implementation.

### Representable consequences

The existing model explicitly separates:

- `supports` / `bears-on`;
- `restrains`;
- load transfer / diaphragm/stability relationships;
- movement allowance;
- fixing/attachment;
- boundary roles;
- inspection/replacement obligations.

This strategy is therefore almost a description of how the formal model should already behave.

### Technical authority

Structural adequacy remains calculation/supported-family/external-engineer evidence.

### Human residue

Choice between hanger, direct bearing, seat/shoe, bespoke interface and other implementation families.

### Finding

**No strategy-specific compiler representation is needed.** Its value is to prevent implementation families from hiding several independent functions inside one opaque connection.

---

## Separate Structural Floor from Changeable Layers Where Proportionate

**Computational coverage:** **NATIVE / ADVISORY HEAVY**  
**Implementation priority:** physical/prototype-linked floor fixture after P0.

### Representable consequences

Existing concepts cover:

- primary structural floor;
- finish/service/acoustic layers;
- permanence/service-life classes;
- replacement units;
- removal dependencies;
- accessible service zones;
- structural role/diaphragm obligations;
- acoustic/fire/thermal boundaries.

A project can therefore ask whether changing/removing a shorter-lived layer consumes the primary structure or a critical boundary.

### Technical authority

Structural/acoustic/fire performance and any platform family remain technical evidence.

### Human residue

Whether separation earns its depth/material/cost and whether the floor feels convincingly solid/domestic.

### Finding

The compiler can expose lifecycle coupling without choosing raised access flooring. This is exactly the intended strategy abstraction.

---

# 3. Held candidates

## Replaceable Architectural Lining

**Computational coverage:** **NATIVE + PHYSICAL VALIDATION HEAVY**  
**Admission blocker:** physical repose / solidity, not semantics.

### Representable consequences

- permanent wall / primary boundary;
- replaceable lining occurrence;
- attachment interface / `P-022` plane where selected;
- removal/reinstallation sequence;
- outlet/reveal/corner dependencies;
- boundary roles kept behind or intentionally carried by the lining;
- tolerance/adjustment;
- service access.

### Mutation value

A computational/physical fixture can detect that removing one lining panel destroys a primary air/fire/acoustic boundary or requires wet destruction of adjacent panels.

### Human/physical residue

Rattle, hollow response, impact feel, joint character, visual solidity, decoration and comparison with first-rate plaster.

### Finding

No semantic promotion follows. The candidate remains held until physical evidence answers the admission gate.

---

## Individually Isolatable Manifold Distribution

**Computational coverage:** **NATIVE**  
**Admission blocker:** whether the topology is architectural-language knowledge rather than merely a strong services implementation family.

### Representable consequences

- manifold/distribution node;
- home-run/branch network topology;
- branch identities;
- `isolated-by` relationships;
- served fixtures/zones;
- route lengths;
- access/maintenance;
- labelling/commissioning;
- water/heat-loss/dead-leg evidence where relevant.

### Useful comparative diagnostics

Against tee/branch topology:

- concealed joint count;
- branch length/material quantity;
- number of independently isolatable sinks/zones;
- maintenance access;
- distribution-space cost.

### Human/technical residue

Whether the lifecycle/isolation benefit outweighs material, heat-loss/dead-leg, space and cost consequences.

### Finding

Representability is easy; **architectural admission remains correctly unresolved**.

---

## Local Deep Service Zone

**Computational coverage:** **NATIVE**  
**Admission blocker:** insufficient recurring architectural invariant beyond good coordination.

### Representable consequences

- local spatial/service zone with depth envelope;
- route/duct/drain requirement occupying it;
- adjacent structure/ceiling/floor boundaries;
- alternative whole-zone depth;
- crossings and boundary transitions;
- local soffit/room geometry.

### Useful diagnostics

- local versus whole-storey depth/material/volume;
- number of additional boundary interfaces;
- effect on room clear height;
- whether upstream rerouting eliminates the zone.

### Human residue

Whether local depth is architecturally acceptable or merely conceals a bad upstream decision.

### Finding

The compiler does not need a `LocalDeepZone` pattern type. Ordinary geometry and route semantics already express it.

---

## Selective Floor Access

**Computational coverage:** **NATIVE + PHYSICAL VALIDATION HEAVY**  
**Admission blocker:** repeatable domestic geometry + tactile/acoustic quality.

### Representable consequences

- bounded access-zone geometry;
- underlying service routes/components;
- removable floor unit/layer;
- structural floor kept independent;
- removal dependencies;
- furniture/threshold constraints;
- acoustic/fire layers and crossings;
- access task / working geometry.

### Useful computational/physical mutations

- fixed furniture blocks the sole access strip;
- threshold traps removable unit;
- service moves outside the access geography;
- removal breaks acoustic/fire layer;
- full-room platform comparator adds unnecessary accessible area.

### Human/physical residue

Footfall solidity, rattle/rocking, visual seams, floor character and whole-life value.

### Finding

Again, semantics are not the gate. The candidate should remain held until prototype/worked-design evidence earns promotion.

---

# 4. Cross-cutting conclusion

Phase 8 now has a strong negative result:

**No new fundamental compiler abstraction emerged from any active pattern, canonical strategy or held candidate.**

The current formal model is broad enough to express the architectural consequences discovered during the pattern-language overhaul.

The only bounded refinements in view remain:

1. `AccessMethod` + external-maintenance path/zone roles — already authorised independently by Research Programme v0.5;
2. possible generic physical-information `identifies` / `refers-to` relation exposed by `P-012`, not yet proven necessary.

This means the next computational uncertainty is implementation, not more ontology design.

---

# 5. P8.4 gate

| Question | Result |
|---|---|
| Do strategies require a second compiler layer? | **No** |
| Do held candidates expose missing fundamental semantics? | **No** |
| Does computational representability imply architectural promotion? | **No** |
| Are physical/professional evidence gates still visible? | **Yes** |
| Is the minimal P0 kernel scope unchanged? | **Yes** |

## Decision

**P8.4 PASS. Proceed to P8.5 implementation handoff.**