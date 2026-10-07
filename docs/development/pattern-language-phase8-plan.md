# Pattern Language Overhaul — Phase 8 Computational Crosswalk Plan

**Status:** active — P8.0 model alignment complete; P8.1 service-topology pilot next  
**Starting point:** Phase 7 closed on `main@d48ef1eb5fc7507b68622bd9ea66277115e374ac`  
**Purpose:** connect the canonical architectural pattern language to the existing semantic / obligation / evidence model without turning patterns into compiler rules or creating a parallel ontology.

This is the durable Phase-8 control point. It is written so work can resume safely after loss of conversational context.

---

# 1. Phase-8 proposition

Phase 7 established the architectural language. Phase 8 asks a narrower question:

> **When a project selects and realises an HSA pattern, which consequences can legitimately be represented, derived, checked, evidenced or diagnosed by the computational model — and which must remain architectural judgement?**

The answer is **not** “encode every pattern as a rule”.

The existing computational architecture remains authoritative:

```text
SOURCE SEMANTIC MODEL
        ↓
SHARED DERIVED GRAPHS
        ↓
CANONICAL OBLIGATIONS
        ↓
EVIDENCE / DETERMINATION
        ↓
VALIDITY + DIAGNOSTICS
```

Patterns sit above this as an architectural authoring layer:

```text
SELECTED PATTERN / DESIGN INTENT
        ↓
semantic commitments proposed by the pattern
        ↓
ordinary source-model entities + relationships
        ↓
existing compiler machinery
```

A pattern label is never proof.

---

# 2. Non-negotiable boundaries

1. **Do not rebase the compiler around pattern objects.**
2. A selected pattern may retain stable provenance (`HSA-P-xxx`) but must resolve into ordinary semantic facts.
3. Pattern selection never discharges an obligation by itself.
4. Pattern identity, pattern evidence maturity and project technical validity remain separate.
5. Architecture that cannot be honestly reduced to a deterministic proposition remains architectural judgement.
6. Regulation, engineering, product evidence and HSA architectural intent retain distinct authorities.
7. A pattern must not duplicate source facts already owned elsewhere in the semantic model.
8. Crosswalk work must reuse existing graph/entity vocabulary before proposing new concepts.
9. New semantic primitives require a worked-case failure showing the existing model is insufficient.
10. Frozen paper-compilation runs remain history and are not rewritten to make Phase 8 neat.

---

# 3. Crosswalk record

Each canonical pattern receives a crosswalk record with the following fields.

## A. Architectural invariant

One sentence stating what the pattern is actually trying to preserve.

## B. Computational coverage state

One of:

- **NATIVE** — existing semantic model can represent the important formal consequences;
- **NATIVE + FIXTURE NEEDED** — representable, but not yet exercised in a worked compiler fixture;
- **SMALL REFINEMENT** — existing model is sound but needs one bounded semantic role/entity/relationship;
- **EXTERNAL / ADVISORY HEAVY** — most validity depends on external evidence or architectural judgement;
- **NO DIRECT CROSSWALK** — pattern is primarily architectural/stewardship intent and should not generate substantial compiler semantics.

This classification describes computational coverage, not pattern quality.

## C. Authoring / provenance

Record whether selecting the pattern should be retained as project intent/provenance. If so, selection creates a **claim of intended conformance**, not a pass result.

## D. Source-model commitments

The minimum ordinary semantic facts that would make a claimed occurrence meaningful: entities, typed relationships, route roles, maintenance volumes, boundary transitions, stable identities, etc.

Do not duplicate geometry or facts already canonical elsewhere.

## E. Derived obligations

Obligation families that should arise from the composed semantic state. State the authority where it matters:

- model integrity;
- physical / engineering;
- regulatory / standards;
- product evidence;
- HSA doctrine;
- architectural grammar;
- project requirement;
- process / evidence.

A selected pattern normally enters the normative system as **project architectural intent with provenance to the HSA pattern**, unless a consequence is independently created by another authority.

## F. Evidence / resolution methods

Use existing evidence classes where possible:

- semantic inference;
- geometric query;
- calculation;
- bounded design family/table;
- tested assembly;
- product evidence;
- survey/site evidence;
- inspection;
- commissioning;
- external professional determination.

## G. Diagnostics / optimisation

Useful non-blocking feedback that can be derived without pretending to prove architectural quality.

## H. Non-formalisable residue

State explicitly what the compiler should **not** claim: proportion, repose, visual integration, domestic character, architectural generosity, quality of spatial consequence, etc.

## I. Anti-formalisation warning

Record the tempting but invalid reduction to avoid — for example `has_service_hub = true` or “pattern selected therefore PASS”.

## J. Test fixture / mutation

Identify the smallest executable or paper fixture needed to demonstrate the crosswalk and at least one mutation that should invalidate or weaken it.

---

# 4. Pattern-selection semantics

The preferred relationship is:

```text
PATTERN SELECTION
    │
    ├── provenance: HSA-P-xxx
    ├── intended occurrence scope
    └── selected architectural commitments
                 ↓
      SOURCE SEMANTIC MODEL
                 ↓
      obligations / evidence
                 ↓
       conformance result
```

The system may therefore report:

```text
Pattern intent: HSA-P-002 Plant Room as Service Hub
Occurrence: RH-P002-01
Semantic commitments: PRESENT
Working clearance: PASS
Replacement path: PASS
Acoustic evidence: UNRESOLVED
Plant sizing: EXTERNAL EVIDENCE REQUIRED
Architectural proportionality: HUMAN JUDGEMENT

Pattern conformance: PARTIALLY RESOLVED
```

This is preferable to storing `pattern_conforms = true`.

---

# 5. Phase sequence

## P8.0 — model alignment — **COMPLETE**

Reviewed the current computational architecture against the Phase-7 language.

Finding: **no fundamental new compiler abstraction is required merely because patterns now exist.** The existing multi-view semantic graph, obligation, evidence, target and supported-domain architecture is the correct substrate.

Key existing mechanisms to reuse:

- stable entity identity;
- spatial / structural / boundary / service / interface / maintenance / lifecycle graphs;
- interface obligation bundles;
- source facts vs derived analytical views;
- obligation authority and scope;
- evidence classes, lifecycle and selective invalidation;
- supported-domain reporting;
- diagnostics that distinguish `FAIL`, `UNRESOLVED`, `UNSUPPORTED`, warnings and external evidence.

## P8.1 — worked service-topology crosswalk — **NEXT**

Crosswalk only the seven patterns with current Reference House occurrences:

- `HSA-P-001` Controlled Utility Entry;
- `HSA-P-002` Plant Room as Service Hub;
- `HSA-P-003` Coherent Horizontal Service Route;
- `HSA-P-004` High-Service-Room Service Wall;
- `HSA-P-005` Designed Structural Penetration;
- `HSA-P-012` Physical Service Index;
- `HSA-P-014` Accessible Vertical Service Zone.

Use the current Reference House Pattern Occurrence Register as the worked context.

### P8.1 pass gate

Proceed only if the pilot:

1. adds useful formal consequences beyond restating pattern prose;
2. maps mostly onto existing semantic vocabulary;
3. keeps architectural judgement visibly outside machine proof;
4. does not need pattern-specific compiler subsystems;
5. exposes at least one useful mutation/invalidation test;
6. clarifies rather than duplicates the Reference House occurrence model.

If the pilot mostly creates metadata bureaucracy, stop and simplify.

## P8.2 — crosswalk schema review

Red-team P8.1 for:

- duplicate source facts;
- authority leakage;
- hidden architectural judgement;
- obligations that should instead derive from shared graphs;
- evidence that is too broad for its scope;
- pattern-selection magic;
- new semantic vocabulary without necessity.

Freeze the crosswalk schema only after this review.

## P8.3 — remaining active patterns

Crosswalk `HSA-P-007..011`, `P-013`, `P-015..022` in coherent thematic groups.

Do not force equal computational density. Some patterns may legitimately be mostly human judgement with only a few machine-checkable consequences.

## P8.4 — strategies and candidates audit

Audit the three canonical strategies and four held candidates only to determine:

- whether the existing compiler can represent their relevant consequences;
- whether a future fixture is useful;
- whether any semantic gap exists.

Do **not** treat them as pattern nodes or assign stable pattern IDs.

## P8.5 — implementation handoff

Produce a bounded implementation brief for the minimal executable kernel / post-kernel fixtures:

- semantic facts actually required;
- obligation families;
- mutation cases;
- external evidence boundaries;
- new refinements, if any, justified by worked failures.

This phase does not itself implement a heavy compiler.

---

# 6. Initial expectation for the pilot

The seven-pattern service-topology set should primarily exercise existing concepts:

- `System`, `Network`, `RouteSegment`, `Node`, `Equipment`, `Isolator`, `DistributionPoint`;
- `Space`, `MaintenanceZone`, `WorkingVolume`, `WithdrawalVolume`, `AccessPath`;
- `Opening`, `Penetration`, `Boundary`, `BoundaryTransition`;
- `routes-through`, `serves`, `isolated-by`, `requires-access-to`, `accessible-from`, `withdrawn-via`;
- shared boundary and structural obligations;
- stable identity / physical-record correspondence.

Likely refinements must be justified by the pilot rather than pre-authorised.

---

# 7. Stop rules

Stop or revise the crosswalk if:

- each pattern starts acquiring its own special compiler schema;
- pattern metadata begins duplicating the source building model;
- selecting a pattern creates a pass without geometric/semantic/evidence resolution;
- architectural judgements are converted into arbitrary thresholds solely to make them machine-checkable;
- obligations are generated from pattern pages when they should derive from the composed structural/boundary/service graphs;
- the same technical obligation appears once per pattern rather than once per actual subject/proposition;
- Phase 8 starts rewriting frozen computational research rather than referencing it;
- implementation work expands beyond what the current minimal-kernel programme authorises.

---

# 8. Resume protocol

Read in order:

1. root `README.md`;
2. `STATUS.md`;
3. [`pattern-language-phase7-review.md`](pattern-language-phase7-review.md);
4. this file;
5. [`../patterns/language-model.md`](../patterns/language-model.md);
6. [`../reference-house/pattern-occurrence-register.md`](../reference-house/pattern-occurrence-register.md);
7. [`../computational/formal-architectural-model.md`](../computational/formal-architectural-model.md);
8. [`../computational/validity-and-obligations.md`](../computational/validity-and-obligations.md);
9. [`../computational/evidence-and-provenance.md`](../computational/evidence-and-provenance.md).

Then continue **P8.1**. Do not restart the Phase-7 taxonomy migration absent genuinely new evidence.