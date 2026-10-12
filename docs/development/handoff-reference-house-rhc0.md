# Handoff Prompt — RH-C0 Reference House Hardening

Use the following prompt to resume the work in a fresh ChatGPT conversation.

---

You are continuing the **House Kernel** architecture project in GitHub repository `adamnoden/architecture`.

The repository is the canonical source of truth. Do not reconstruct project state from chat memory where the repo gives a later answer.

## Mission

Before any further Reference House compiler implementation, execute the full **RH-C0 — Reference House Model Freeze** programme and make the current M3 Reference House as internally precise, coherent and architecturally credible as it can be **without physical testing, real-site evidence or competent external professional validation**.

Canonical RH-C0 programme:

`docs/computational/reference-house-model-freeze-rhc0.md`

Downstream compiler plan:

`docs/computational/reference-house-executable-slice.md`

RH-C1 must remain blocked until RH-C0 explicitly passes.

## First reads

Read, in order:

1. `STATUS.md`
2. `docs/development/reference-house-design-programme.md`
3. `docs/reference-house/README.md`
4. `docs/reference-house/whole-house-coordination-audit.md`
5. `docs/computational/reference-house-model-freeze-rhc0.md`
6. `docs/computational/reference-house-executable-slice.md`
7. GitHub issue for RH-C0 and issue `#33` for RH-C1

Then fetch whichever RH-02→RH-11 authorities are required for the active RH-C0 stage.

## Core distinction

The goal is **not** to prove the house is construction-ready.

The goal is to prove that we know exactly which house we mean before encoding it.

The Reference House remains an M3 coordinated virtual design unless actual evidence justifies another maturity. RH-C0 must not turn provisional engineering assumptions into certainty simply because they become structured data.

Treat the future compiler fixture as a **controlled reference/regression fixture**, not a universal gold-standard house or a template that all House Kernel houses should copy.

## Working method

Execute RH-C0 **stage by stage**, in order. Do not collapse the stages into one giant prose review. After each stage:

- create/update the specified canonical repo output;
- resolve material contradictions through the RH gate that owns them rather than patching them only in RH-C0;
- identify downstream documents/drawings made stale by any correction;
- commit the work;
- update RH-C0 execution state so a new session can restart safely.

If a stage uncovers a real design defect, fix it. Do not protect earlier decisions merely because they are already documented.

If an issue cannot be resolved without physical testing, a real site, engineering, simulation or external review, mark it explicitly as provisional/outside RH-C1 rather than inventing confidence.

## Stages to execute

### RH-C0.1 — Authority consolidation

Build the canonical current fact/authority schedule in:

`docs/reference-house/model-baseline-rhc0.md`

For every compiler-bound fact record its subject, value/relationship, unit, owning authority, source, status, supersession and dependencies.

Cover at minimum shell, court, levels, room/circulation topology, wall planning assumptions, stair, axes/bays, major openings, gross roof geometry, structural support lines that constrain architecture, and major service/plant/riser reservations.

The purpose is to ensure every future RH-C1 source fact has one identifiable current authority.

### RH-C0.2 — Independent dimensional reconstruction

Reconstruct the house from current controlling dimensions/relationships **without using existing SVG geometry as source truth**.

Derive shell/court placement, wing depths, enclosed area, room fields, stair geometry, wall offsets, opening/bay centres and plan/section relationships.

Only afterwards compare the reconstruction with current SVGs and drawings.

Create a discrepancy register if needed:

`docs/reference-house/rhc0-discrepancy-register.md`

Never alter a reconstruction merely to match a drawing. Determine whether the drawing or controlling authority is stale/wrong.

### RH-C0.3 — Authored vs derived closure

Classify all RH-C1 facts as:

- `AUTHORED`
- `DERIVED`
- `EVIDENCE-BACKED`
- `PROVISIONAL ASSUMPTION`
- `OUTSIDE RH-C1`

Eliminate duplicated authorship. A value that is mathematically implied by canonical inputs should normally be derived rather than separately editable.

Examples: shell width authored; wing width derived; FFL authored; stair rise derived from FFL/riser count; opening centre derived from bay axis where that is the actual authority.

Record dependency paths in `model-baseline-rhc0.md`.

### RH-C0.4 — Mutation/dependency red-team

Create:

`docs/reference-house/rhc0-mutation-map.md`

At minimum reason through these mutations:

1. shell width −300 mm
2. courtyard width/depth +400 mm
3. wall planning thickness 450→500 mm
4. first-floor FFL +150 mm
5. stair risers 18→17
6. material change to front bay/axis spacing
7. service riser critical clear dimension −150 mm
8. representative major opening +250 mm width
9. roof fall reversed toward courtyard
10. plant/service room materially reduced

For each state expected derived changes, stale evidence/obligations, architectural conflicts, owning gates and facts that should remain unaffected.

This will later become the basis for compiler mutation tests.

### RH-C0.5 — Fresh domestic/architectural adversarial review

Create:

`docs/reference-house/rhc0-domesticity-audit.md`

Forget subsystem pride and read the house again as a house.

Test ordinary furniture, circulation, door swings, room proportions under conservative wall thickness, bedroom usefulness, kitchen/dining/family relationships, stair arrival, storage/mundane domestic functions, courtyard usefulness and cost, service-area proportionality, dead circulation, overall area/complexity, daylight dependence, technical systems bullying architecture, Georgian/G-01 taste leaking into House Kernel, and any House Kernel mechanism that has become theatrical rather than useful.

Use excellent ordinary domestic architecture as the comparator. House Kernel-specific complexity gets no credit merely for expressing the philosophy.

If a real architectural problem appears, reopen and repair its owning RH gate, then propagate the change.

### RH-C0.6 — Drawing parity / cross-view audit

Create:

`docs/reference-house/rhc0-drawing-parity-audit.md`

Check at minimum:

- plan↔plan
- plan↔section
- plan↔elevation
- section↔elevation
- opening↔host wall/room
- opening↔architectural axis
- wall↔structural support line
- stair↔storey datums
- courtyard↔section height
- roof↔cornice/parapet/elevation
- service zones↔room geometry

Classify every relevant current SVG/drawing as:

- `CURRENT GEOMETRIC AUTHORITY`
- `CURRENT DIAGRAM / NON-GEOMETRIC`
- `STALE — REPLACE/CORRECT`
- `HISTORICAL / PROVENANCE ONLY`

A useful diagram does not automatically have authority over coordinates.

### RH-C0.7 — Controlled fixture freeze

Complete `model-baseline-rhc0.md` with final classification of every relevant fact/object:

- `FROZEN_FOR_RH_C1`
- `PROVISIONAL_BUT_REPRESENTABLE`
- `OUTSIDE_RH_C1`

Expected `FROZEN_FOR_RH_C1` candidates include shell, court, storey datums, room/circulation topology, principal stair, major planning wall locations, axes and major opening positions—subject to the preceding audits.

Expected `OUTSIDE_RH_C1` material includes structural member sizing, foundations, final window products, final thermal construction/ψ-values, duct sizing, heat-emitter sizing, detailed drainage sizing and other facts that require specialist evidence.

Do not begin RH-C1 until all ten PASS conditions in the canonical RH-C0 programme are satisfied.

## Critical operating rules

- **Do not ask me for confirmation between stages.** Proceed autonomously unless a genuine safety/policy constraint prevents work.
- **Be willing to rewind.** Earlier RH decisions are not sacred.
- **Do not quietly lower ceilings, move rooms, enlarge the house or add technical voids to absorb a clash.** Surface the clash and return it to its owner.
- **Do not let Georgian taste become House Kernel doctrine.** Generalise reasons; localise taste.
- **Do not create compiler abstractions yet unless needed to support RH-C0 itself.** This phase is model hardening, not RH-C1 implementation.
- **Do not treat existing hand-authored SVGs as geometric truth.** They are evidence to compare after independent reconstruction.
- **Do not over-document.** Prefer compact canonical schedules/registers over duplicative narrative.
- **Keep restart state current after every stage.** The repo must survive loss of this conversation.

## Important current Reference House baseline to verify, not blindly trust

Current project records describe approximately:

- two-storey detached four-bedroom courtyard house;
- shell `12.0 × 10.8 m`;
- centred courtyard `3.6 × 4.0 m`;
- first FFL `+3300 mm`;
- ground clear ceiling `+2950 mm`;
- upper clear ceiling `+6000 mm`;
- cornice/eaves control approximately `+6250 mm`;
- front four-bay axes `1.95 / 4.65 / 7.35 / 10.05 m`;
- 18-riser, three-flight principal stair with 280 mm planning going;
- 400–425 mm normal masonry-envelope planning family, 450 mm whole-house geometry stress limit;
- open courtyard retained as shaded light court;
- G-01 Georgian-derived architectural grammar is project-specific, not doctrine;
- low-slope roof falls outward from the courtyard;
- central MVHR baseline with continuous-MEV fallback;
- east/service-side plant/service geography;
- ASHP/stored-DHW/low-temperature hydronic baseline;
- W0 direct-finished masonry as ordinary occupied-wall baseline, W1 selectively, W2 optional experimental challenger;
- continuous conventional principal-room floors;
- principal en-suite deleted in RH-06 and replaced by dressing/storage;
- Reference House maturity remains M3 pending actual validation.

These facts are supplied only as orientation. RH-C0 exists precisely to determine which are truly canonical, which are derived, and which need correction.

## Downstream compiler intent — preserve but do not execute early

After RH-C0 passes, RH-C1 should use the frozen Reference House as a canonical regression fixture and encode one machine-readable semantic source for shell, court, levels, rooms, stair, walls, openings and axes.

Derived calculations should be small pure functions over canonical source entities, not a disconnected calculator bag.

The first deterministic production outputs should be:

1. ground-floor SVG
2. first-floor SVG
3. principal-section SVG

Rendered elements should retain stable semantic identity where practical (`data-entity`, etc.). Drawings are projections from the semantic model, not a second source of truth.

Later growth should remain demand-led:

- RH-C2 structural view
- RH-C3 service view
- RH-C4 envelope/boundary view
- RH-C5 narrow versioned target calculations

Do not expand this into a general CAD UI, arbitrary BIM replacement, generative-design system, universal structural solver or complete Building Regulations engine merely because the architecture could support those directions.

## Definition of success for this handoff

Do not stop at explaining or planning RH-C0. **Execute it through all seven stages**, commit each stage, repair real contradictions through their owners, and close RH-C0 only if its canonical PASS gate is genuinely met.

The final result should leave issue #33/RH-C1 with a controlled, internally audited model baseline rather than the current mixture of coordinated prose and manually maintained geometric artefacts.

---
