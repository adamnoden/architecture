<!-- nav-exclude: redirect -->
# DRW-00A — authority recovery

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-00A  
**Status:** DONE pending branch CI confirmation  
**Issue:** #154  
**Branch:** `pub-nom`  
**Authority-reconciliation merge:** `ef45bc09d91f5171475182ce29caa6b0f0f4914b`

## 1. Packet outcome

DRW-00A recovers the current authority stack before any drawing work begins.

No architectural source fact, renderer capability, publication drawing or figure placement is changed by this packet. Its purpose is to establish which existing artefacts own truth, which merely render or simplify that truth, and which records are historical provenance.

The governing distinction is:

> **Architectural source authority → compiled/derived state → inspection rendering → publication selection/composition.**

A downstream layer may simplify or annotate an upstream layer. It may not manufacture architectural authority.

## 2. Branch reconciliation

The DRW execution-plan refactor was completed on `main` after the `pub-nom` branch had already diverged.

At packet start:

- completed PUB-NOM production-shaped head: `48142ee2953710d34fc1cabcb445894f1d6bf663`;
- current `main`: `a4827627501adb2480517de452786f9ac1920ab1`;
- `main` was three commits ahead of the PUB-NOM base and differed only in the DRW programme/execution-plan authority;
- the two histories were reconciled as a two-parent merge commit `ef45bc09d91f5171475182ce29caa6b0f0f4914b`.

The branch therefore now contains both:

1. the completed PUB-NOM nomenclature/exposure system; and
2. the latest DRW vertical-slice execution plan from `main`.

DRW work must continue from this reconciled state rather than from either pre-merge parent in isolation.

## 3. Publication authority

### 3.1 Publication structure

`publication/publication.ts` is the mechanical Working Edition / Primer manifest. It owns publication entry order and adapters. Editorial meaning remains owned by the manuscript publication architecture rather than by renderer code.

For DRW purposes, this means drawings must be integrated against the real publication sequence rather than assembled as an independent gallery.

### 3.2 Current figure placement registry

`publication/figures.ts` is the active publication figure-placement map.

It currently owns **11 placements**:

- 4 early-book architectural/argument figures in Parts I–II;
- 1 pattern-language / generative-sequence figure in Part III;
- 6 Reference House figures in Part IV.

Each placement currently records:

- publication entry;
- unique prose anchor;
- SVG asset path;
- alt text;
- authored caption.

The active registry deliberately has no reader-facing `D-F*` numbering. PUB-NOM retired that identity rather than replacing it prematurely.

### 3.3 Historical figure register

`publication/pr00d-figure-visual-argument-register.md` remains useful **provenance** for why the existing eleven figures were originally selected and what claim boundary each was intended to respect.

Its former `D-F01`–`D-F11` identifiers are no longer current public nomenclature. DRW must not revive them merely for continuity.

The record is therefore evidence about figure purpose, not authority for future figure identity or numbering.

## 4. Reference House architectural authority

### 4.1 Pre-compiler source baseline

`docs/reference-house/model-baseline-rhc0.md` is the canonical RH-C0 pre-compiler baseline. It explicitly separates:

- `CONTROLLED` facts;
- `PROVISIONAL` facts;
- deliberately `OPEN` facts;
- authored inputs from deterministic derived consequences;
- facts frozen for the executable slice from facts outside it.

The executable counterpart is `compiler/reference-house/fixture.ts` via `createReferenceHouseSource()`.

Publication drawing work must not copy geometry back from historical SVGs, prose summaries or screenshots when a controlled source/derived fact exists.

### 4.2 Current whole-system compiled state

`compiler/reference-house/system-compile.ts` is the current whole Reference House orchestration point. It compiles the shared Reference House source through:

- plan topology;
- Reference House architectural derivation;
- RH-C2 structural topology;
- RH-C3 service topology and hardening;
- RH-C4 boundary/envelope topology and coordination;
- RH-C5 private-stair numeric method correspondence.

The compiled system is therefore richer than the original RH-C1 plan/section renderer. DRW must use the strongest relevant owned source/derived state for each drawing rather than treating the oldest renderer as the model.

The existing proof boundaries remain intact. A machine-derived relationship is not automatically physical, engineering or regulatory proof.

## 5. Current renderer / generated-output authority

### 5.1 RH-C1 semantic drawing renderer

`compiler/reference-house/drawings.ts` is an existing deterministic SVG renderer for ground/first plans and a principal section.

It is explicitly an **inspection renderer**:

- it prints machine/workflow identity such as `RH-C1`;
- it exposes semantic entity IDs;
- it represents uncertainty directly;
- its own description states that wall faces are not represented;
- line widths and fills are renderer conventions rather than construction geometry;
- styles are hard-coded in the renderer rather than expressed as a publication drawing doctrine.

DRW must therefore reuse architectural mathematics and lineage where useful, not promote this graphic grammar wholesale into the monograph.

### 5.2 Current generated-output contract

`compiler/reference-house/output/contract.ts` owns the current generated-output identities and paths under schema `RH-OUTPUT-1`, renderer version `1.0.0`.

The current generated family includes:

- ground-floor plan SVG — `RH-PLAN-GROUND-1`;
- first-floor plan SVG — `RH-PLAN-FIRST-1`;
- principal-section SVG — `RH-SECTION-AA-1`;
- first-floor structural SVG — `RH-STRUCTURE-FIRST-1`;
- service register;
- boundary register;
- output manifest.

The SVG outputs are classified as `SPATIAL_INSPECTION` and `PUBLICATION_SOURCE_CANDIDATE`, not finished publication plates. Their authority note explicitly says they are downstream semantic inspection output and do not establish physical, regulatory or engineering adequacy.

That classification is retained as-is at DRW-00A.

## 6. Authority hierarchy frozen for DRW

For subsequent packets, use the following precedence unless a later packet deliberately changes an owning source:

1. **Architectural/source facts** — controlled Reference House source and explicitly owned later RH-C2/RH-C3/RH-C4 domain sources.
2. **Deterministic derived/compiled state** — `compileReferenceHouseSystem()` and its owned slice outputs.
3. **Generated inspection outputs** — useful evidence, diagnostics, lineage and projection behaviour; not publication truth by appearance.
4. **Publication figure registry** — owns selection, placement, alt/caption composition; does not own building geometry.
5. **Hand-authored publication SVGs** — current reader-facing before-state only; never feed geometry upstream.
6. **Historical PR-00D `D-F*` register** — provenance and claim-boundary history only.

If two layers conflict, the conflict is surfaced and resolved at the smallest owning upstream layer. A publication drawing is never manually massaged to conceal it.

## 7. What DRW-00A deliberately does not decide

This packet does **not**:

- judge whether any current figure should survive;
- choose final publication figure numbering;
- choose line weights, fonts, poche, hatch or symbols;
- choose drawing scales or page classes;
- harden wall thickness, internal-door, roof, facade or other source geometry;
- build a new renderer;
- redraw any SVG;
- change Reference House maturity.

Those decisions belong to DRW-00B onward under the execution plan.

## 8. Handoff

**Next packet: DRW-00B — freeze the current book figure inventory and before-state SVG/PDF evidence.**

DRW-00B should inventory the actual current public figure assets and capture the book/site before-state without yet classifying them as retain/replace/demote/remove. That judgement is DRW-00D.

The repository should remain green after this authority-only packet.