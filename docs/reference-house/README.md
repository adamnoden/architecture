# Reference House

The **Reference House** is one deliberately specific integration test for Ovid’s House. It forces doctrine, selected patterns, a selected architectural grammar, programme, structure, envelope, services, environmental strategy and maintenance geography into one building so conflicts cannot remain abstract.

It is **not proof of Ovid’s House** and it is not a universal house type.

## Authority stack

```text
Ovid’s House proposition
+ selected patterns
+ selected architectural grammar
+ project programme and morphology
+ selected technical families
+ project tectonic decisions
= Reference House
```

## Maturity

The Reference House should be read as a coordinated architectural proposition with explicit proof boundaries. Drawings, deterministic checks and internal coordination make relationships more inspectable; they do not convert untested assumptions into technical adequacy.

For the current maturity assessment and active work, use `STATUS.md`. Structural capacity, detailed building physics, regulatory acceptance, plant sizing, product selection, physical interface performance and real-site compatibility remain external or later-stage questions unless an owning evidence record explicitly resolves them.

## Authorised resolution programme

The next major Reference House development is coordinated internally by `project/book-resolution-programme.md`. It does not invalidate the present coordinated virtual-design house or silently replace its controlled geometry. It adds first-class downstream design/resolution work that the current virtual-design scope deliberately does not complete:

- `BSR` refactors the book structure and ownership boundaries;
- `IAS` develops the selected interior architecture system;
- `OAS` develops the selected opening/door/window/threshold assembly family;
- `HAD` resolves the exterior and interior architectural design;
- `BCR` coordinates construction-resolution obligations and routes evidence to the correct existing owners;
- `HRS` absorbs those findings into one final resolved-house architectural configuration.

After BSR, IAS/OAS/HAD are intentionally parallel and must work against the controlled current Reference House/PLT source. They may raise explicit rewind requests; they may not silently fork the plan, section, opening geometry or architectural authority.

Existing owners remain intact: PLT owns publication drawings, PHY owns physical validation, EPR owns competent external/professional review, DEL owns delivery requirements, and a real site/commission remains outside Reference House authority unless separately established.

## What this area owns

`docs/reference-house/` owns the authored architectural record of this worked instance: its constraints, coordination decisions, unresolved obligations, review handoffs, controlled drawings and the provenance needed to understand why the house is the way it is.

The Reference House may be highly specific. That specificity does not move upstream automatically. The controlling rule is: **generalise the reason; localise the taste.**

A real site, planning context, jurisdiction, utility condition or client brief is a further layer. Site/deployment work does not become Reference House authority merely because it may later constrain a deployed instance.

## What this area does not own

The Reference House does not own:

- the general architectural proposition — see [`../manuscript/`](../manuscript/);
- reusable pattern validity — see [`../patterns/`](../patterns/);
- the architectural grammar framework — see [`../grammar/`](../grammar/);
- external evidence merely because it supports a project decision — see [`../research/`](../research/);
- compiler semantics or proof scope — see [`../computational/`](../computational/) and the internal `compiler/` tree;
- publication build machinery — see the internal `publication/` tree;
- current project-wide status — that lives in `STATUS.md`.

Occurrence is not proof. A pattern, grammar relation or technical idea does not become generally valid because this house uses it.

## Start here

Use the following records according to the question:

- `docs/reference-house/brief-and-constraint-ledger.md` — project brief, constraints and controlled design obligations;
- [Current Technical Coordination](structural-coordination.md) — whole-house architectural/technical coordination and its proof limits;
- `docs/reference-house/plan-section-elevation-gate.md` — cross-view architectural consistency gate;
- [Pattern Occurrence Register](pattern-occurrence-register.md) — which reusable patterns are actually selected here;
- [G-01 conformance](g01-v0.1-conformance-d12.md) — bounded conformance to the selected G-01 grammar;
- [Independent Review Questions](external-review-brief.md) — questions that require competent professional review rather than internal assertion.

This README intentionally does not duplicate live dimensions, packet state or model values that have their own owners.

## Source, drawings and generated inspection

Different visual and computational surfaces in this directory have different authority.

### Authored architectural records

Most coordination Markdown and controlled architectural drawing/source records are authored project material. Their owning gate or record defines what they prove.

### Generated semantic inspection

[`generated/`](generated/) is downstream of the canonical Metamorph Compiler source/compile. It contains human-readable semantic inspection views and reports.

**Do not hand-edit generated inspection artefacts.** Change the owning source or renderer and regenerate them. The local [`generated/README.md`](generated/) explains the uncertainty language, manifest and verification command.

A generated `PASS` does not prove engineering adequacy, building physics, regulatory compliance or construction readiness.

### Publication drawings

Publication-facing architectural drawings and their proof/authority records are distinct from generated semantic inspection. Their internal authority trail is under `docs/publication/`, while build/layout machinery lives at top-level `publication/`.

Do not infer editability from file type alone. Follow the owning record before changing a controlled drawing.

## Verification and proof boundary

Use the narrow workflow that matches the thing changed. Repository-wide health begins with:

```sh
npm run check
```

Generated Reference House inspection outputs can be verified with:

```sh
npm run outputs:check
```

Those checks establish only their encoded invariants. Structural capacity, fire strategy, building physics, MEP sizing, product suitability, physical interface performance, planning and real-site compatibility remain external or later-stage questions unless an owning evidence record explicitly resolves them.

## Deployment boundary

The Reference House remains a controlled architectural proposition independently of any one real site. The conditional DPL design-study programme is complete at its recorded bounded scope, and RSI is closed by owner scope decision; neither establishes real-site compatibility.

A selected real plot, commission or explicit evidence-backed request would trigger a separate site-specific verification/deployment exercise using the recorded DPL evidence requirements. Until then, the theoretical plot remains sufficient for the current Reference House and book-resolution programme. No current record implies planning approval, utility/ground adequacy, whole-site suitability or a generally deployable site compiler.