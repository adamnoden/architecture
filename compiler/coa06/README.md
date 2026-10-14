# COA-06 — integration, inspection surface and closeout

**Gate:** COA-06  
**Status:** PASS  
**Starting main:** `4692473229f7e32e50c6caeb2cdf62caa01e0c86`  
**Issue:** #95  
**Authority effect:** none

## Question

Can the successor outputs operate as one deterministic, inspectable system without disturbing the CH-frozen proof artefacts or widening what the compiler claims?

## Integrated successor family

The Reference House successor inspection family is built from one canonical single-pass output context and contains six human-facing outputs:

1. ground-floor semantic inspection plan;
2. first-floor semantic inspection plan;
3. principal section A–A;
4. first-floor structural-topology inspection;
5. service-topology semantic register;
6. envelope / boundary semantic register.

The first four are SVG because their meaning materially depends on metric position, orientation or topology. The service and boundary outputs are Markdown because their primary meaning is relational/register information rather than page geometry.

`compiler/reference-house/output/build.ts` is the common build surface. `generate.ts` writes the complete successor family and its machine-readable manifest. `verify.ts` regenerates the family in memory and rejects stale committed outputs. The operational build creates one `ReferenceHouseOutputContext`, and that exact compile identity feeds all six human outputs plus the manifest.

## Output identity

Every successor output carries or is bound to:

- stable artefact ID;
- output schema `OH-RH-OUTPUT-1`;
- renderer version;
- the canonical `HK-RH-COMPILE-1` compile fingerprint;
- deterministic SHA-256 content identity in `docs/reference-house/generated/output-manifest.json`.

This identity is downstream provenance. It does not make a drawing architectural authority.

## Human inspection surface

`docs/reference-house/generated/README.md` is the curated inspection hub. It presents the coordinated plans, section and structural view together and links the service/boundary registers. It also states the uncertainty language and proof boundary explicitly and is surfaced normally in Reference House navigation.

The output hierarchy is therefore:

```text
canonical authored source
  ↓
compileReferenceHouseSystem()
  ↓
compiled semantic state + diagnostics + lineage
  ├── CH-frozen historical proof artefacts       preserved exactly
  └── COA successor output family
        ├── spatial inspection SVGs
        ├── semantic Markdown reports
        └── machine output manifest
```

## What COA fixed

Across COA-00 → COA-06 the programme resolves the inspection defects that triggered it:

- service and boundary registers are no longer forced into SVG as their primary successor form;
- structural topology uses the same north-up projection as architectural plans;
- span notation is undirected rather than misleadingly one-way;
- plan-like outputs carry explicit north orientation;
- plans and section share the A–A cross-reference;
- the principal section has a dedicated annotation zone and no longer clips the +6250 datum annotation;
- known qualitative opening relationships remain visible without invented centres or widths;
- required adjacency is visible without invented internal doors;
- human architectural labels lead while stable semantic IDs remain inspectable;
- structural interruptions remain visible at owned precision without manufactured plan locations;
- output format is selected by information character rather than historical compiler-domain symmetry.

## Deliberate absences

COA still does not generate:

- wall-face construction geometry;
- exact internal door positions or swings;
- finished stair strings, treads, guards, headroom or exact well geometry;
- structural member sizing or capacity;
- foundation design;
- exact MEP routing, sizing or performance;
- thermal, moisture, fire or regulatory adequacy;
- drainage capacity;
- product adequacy;
- architectural merit.

Where the compiler owns a relationship but not its location, the output shows unresolved topology. Where it owns neither, the output remains silent.

## Preservation result

The six CH-frozen RH-C1–RH-C4 SVGs remain historical executable evidence and are not rewritten. COA creates a successor family under `docs/reference-house/generated/` rather than retroactively changing the hardening baseline.

Computational maturity remains M4 at the same bounded proof scope. Reference House maturity remains M3 at virtual-design scope. COA is a communication/inspection improvement, not a new capability or validation claim.

## Publication handoff

COA does not author final book figures. It supplies trustworthy, coordinated source material for **PR-00D — figure and visual-argument completion**. Publication may simplify, crop or recomposite these outputs, but must preserve their uncertainty and authority boundaries.

## Closeout result

PR #103 passed the canonical repository health check before merge, including the COA-00→COA-06 regression stack, exact successor-output verification, publication validation and VitePress build.

The six successor outputs regenerate exactly, all bind to one canonical compile identity, and the historical CH artefact baseline remains green.

There is no standing COA-07. Future output work should be demand-led by a concrete inspection or publication need rather than by symmetry or feature accumulation.
