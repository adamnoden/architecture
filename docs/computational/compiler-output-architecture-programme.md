# Compiler Output Architecture programme

**Programme:** COA — Compiler Output Architecture  
**Status:** COMPLETE — COA-00 through COA-06 PASS subject to final merge  
**Planning baseline:** `2bacd97889caa7da1fe83ad4cbd7a7cdfb7be22c`  
**Computational maturity:** M4 — unchanged, internally validated / controlled at bounded computational scope  
**Reference House maturity:** M3 — unchanged, coordinated at virtual-design scope  
**Relationship to prior work:** downstream presentation/projection work; **not CH-09 and not RH-C6**

## Purpose

COA was opened after direct inspection of the CH-frozen generated artefacts showed that the compiler was conflating three different jobs: machine proof, human semantic inspection and publication communication.

The programme establishes an explicit output architecture in which each kind of information is emitted in the medium appropriate to its semantics, and in which a competent human can inspect what the compiler knows, what it does not know and why.

It does **not** widen architectural or technical authority. It does not turn Metamorph Compiler into CAD/BIM, a regulations engine or evidence of physical adequacy.

## Governing distinction

### Machine / proof artefacts

Purpose: regression, provenance, exact identity and automated checking.

Typical forms: JSON manifests, hashes, diagnostics and machine-readable inventories.

### Semantic inspection outputs

Purpose: let an architect, reviewer or developer inspect compiled state quickly and catch contradictions, omissions and suspicious relationships.

- use generated Markdown/HTML for non-spatial registers;
- use SVG where metric position, orientation or topology materially carries meaning;
- make uncertainty and unresolved geometry explicit rather than drawing plausible answers.

These are the principal outputs of COA.

### Publication architectural figures

Purpose: explain architectural arguments in *Ovid’s House*.

Ownership remains **PR-00D — Figure and visual-argument completion**. Publication may derive from COA outputs, but publication-native composition, captions and editorial judgement remain downstream.

```text
AUTHORED ARCHITECTURAL SOURCE
        ↓
METAMORPH COMPILER
        ↓
COMPILED SEMANTIC STATE
        ├── machine / proof artefacts
        ├── semantic inspection outputs   ← COA
        └── publication source material   → PR-00D
```

## Preservation boundary

Six pre-COA SVGs were frozen by CH-00 / CH-08 as exact historical executable evidence and remain byte-identical:

- `docs/reference-house/rhc1-ground-floor.svg`
- `docs/reference-house/rhc1-first-floor.svg`
- `docs/reference-house/rhc1-principal-section.svg`
- `docs/reference-house/rhc2-structural-topology.svg`
- `docs/reference-house/rhc3-service-topology.svg`
- `docs/reference-house/rhc4-boundary-topology.svg`

COA never edits these for presentation improvement. It creates a successor family under `docs/reference-house/generated/`.

## Execution sequence

### COA-00 — baseline and output audit — PASS

Reproduced the inspection defects against current code, inventoried compiler-generated outputs, classified their purpose and froze the preservation boundary.

Execution record: `compiler/coa00/README.md`.

### COA-01 — output contract and dependency architecture — PASS

Established output schema `OH-RH-OUTPUT-1`, one canonical single-pass Reference House output context, fail-closed generation policy and the rule that output medium follows information character.

Execution record: `compiler/coa01/README.md`.

### COA-02 — non-spatial report extraction — PASS

Replaced the primary successor form of RH-C3/RH-C4 report-shaped SVG content with deterministic generated Markdown registers:

- `docs/reference-house/generated/service-register.md`
- `docs/reference-house/generated/boundary-register.md`

The historical SVGs remain evidence.

Execution record: `compiler/coa02/README.md`.

### COA-03 — shared drawing and uncertainty language — PASS

Established shared north-up plan projection, south-to-north section convention, cardinal orientation, section identity, deterministic annotation zones and explicit visual states for controlled, provisional, approximate, ranged and qualitative/unresolved information.

Span topology is represented as an undirected axis rather than a one-way vector.

Execution record: `compiler/coa03/README.md`.

### COA-04 — Reference House plan and section successor set — PASS

Created successor semantic inspection drawings:

- `docs/reference-house/generated/ground-floor-plan.svg`
- `docs/reference-house/generated/first-floor-plan.svg`
- `docs/reference-house/generated/principal-section.svg`

The set uses human architectural labels first while retaining stable semantic IDs, adds north orientation and A–A cross-reference, exposes qualitative opening and adjacency obligations without inventing geometry, and gives the section enough annotation space to render the +6250 control datum completely.

Execution record: `compiler/coa04/README.md`.

### COA-05 — topology successor views — PASS

Created `docs/reference-house/generated/first-floor-structure.svg` using the same north-up projection as the architectural plans.

The view distinguishes bearing lines, edge beams and reaction nodes; renders span axes as explicitly undirected; and exposes stair/service interruption obligations at their owned precision without manufacturing plan locations.

No service or boundary SVG successor was created merely for symmetry. Their generated registers remain the clearer primary inspection form.

Execution record: `compiler/coa05/README.md`.

### COA-06 — integration, inspection surface and closeout — PASS subject to final merge

Unified the successor family behind one deterministic build and verification path:

- `compiler/reference-house/output/build.ts`
- `compiler/reference-house/output/generate.ts`
- `compiler/reference-house/output/verify.ts`
- `docs/reference-house/generated/output-manifest.json`

The manifest binds each successor output to the canonical `HK-RH-COMPILE-1` fingerprint, renderer version and SHA-256 content identity. `npm run outputs:check` rejects stale committed outputs without mutating them.

`docs/reference-house/generated/index.md` is the curated human inspection surface and is deliberately present in Reference House navigation.

Execution record: `compiler/coa06/README.md`.

## Defects resolved

COA resolves the concrete inspection problems that triggered the programme:

- RH-C3 and RH-C4 are no longer forced into fixed SVG as their primary successor form;
- structural topology now shares north-up orientation with the plans;
- span glyphs no longer imply a one-way direction absent from the semantic model;
- plan-like views show explicit north orientation;
- plans and section share the A–A cross-reference;
- section annotation no longer clips the +6250 datum;
- qualitative opening relationships remain visible when exact centres/widths are deliberately absent;
- required adjacency remains visible without invented internal doors;
- human architectural labels lead while machine IDs remain available for forensic inspection;
- structural interruptions remain visible without false precision;
- output medium is selected by information character rather than historical compiler-domain symmetry.

## Deliberate absences

COA does not manufacture:

- wall-face construction geometry;
- exact internal door positions or swings;
- finished stair strings, treads, guards, headroom or exact well geometry;
- structural member sizing, capacity or foundation design;
- exact MEP routing, sizing or performance;
- thermal, moisture, fire or regulatory adequacy;
- drainage capacity;
- product adequacy;
- architectural merit.

Where the compiler owns a relationship but not its location, the output shows unresolved topology. Where it owns neither, the output remains silent.

## Canonical successor output family

```text
docs/reference-house/generated/
  index.md
  ground-floor-plan.svg
  first-floor-plan.svg
  principal-section.svg
  first-floor-structure.svg
  service-register.md
  boundary-register.md
  output-manifest.json
```

Commands:

```text
npm run outputs:generate
npm run outputs:check
npm run check
```

The normal repository health contract remains the CH-07-owned `npm run check`; COA verification is included beneath the test stack rather than replacing that contract.

## Publication handoff

PR-00C may proceed independently of COA and was completed before COA closeout. PR-00D should use the COA successor family as trustworthy visual source material rather than composing final figures from the historical RH-C SVGs.

Publication is free to simplify, crop or recomposite the successor outputs, but must preserve their uncertainty and authority boundaries.

## Closeout

COA is complete when the final COA-06 branch passes repository health, exact-output verification, publication validation and docs build and is merged.

The programme does not promote computational or Reference House maturity. There is **no standing COA-07**. Future output work should be demand-led by a concrete inspection or publication need rather than by symmetry or feature accumulation.
