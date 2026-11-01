# Documentation structure

`docs/` contains the architectural and project-facing document corpus for **Ovid’s House**. This README owns one thing: **where documents inside `docs/` belong according to the role they play**.

It is not the authority for the whole repository. Executable implementation lives in `compiler/`, publication build machinery in `publication/`, project-wide state in `STATUS.md`, contributor rules in `AGENTS.md`, and durable programme/audit records in `project/`.

## Four structures, four jobs

| Structure | Question it answers | Governing source |
|---|---|---|
| **Documentation ownership** | Where does a document under `docs/` belong according to what it does? | this README and the local area READMEs |
| **Publication structure** | In what order is the architectural argument made? | [`manuscript/publication-architecture.md`](manuscript/publication-architecture.md) |
| **Website navigation** | How should a reader find and move through the corpus? | `../.vitepress/navigation.ts` |
| **Project state** | What is current, provisional, complete or historical? | [`../STATUS.md`](../STATUS.md) plus the latest owning result/gate |

These structures should agree about meaning without being forced into the same tree.

## Areas

| Area | Owns | Does not own |
|---|---|---|
| [`manuscript/`](manuscript/) | Publication-facing architectural argument, governing principles and monograph material | Working notes, evidence packs or implementation records |
| [`patterns/`](patterns/) | Reusable architectural responses, strategies, candidates, relationships and generative sequences | Project-specific proof or compiler rules merely because they derive from a pattern |
| [`grammar/`](grammar/) | Architectural-grammar framework and selectable grammar instances | Ovid’s House doctrine, computational ontology or Reference House choices |
| [`reference-house/`](reference-house/) | One coordinated worked interpretation used to force the project layers into an actual house | General proof of doctrine, patterns or grammar |
| [`research/`](research/) | Evidence synthesis, precedent, options appraisal and claim hardening | Final architectural doctrine merely because it cites sources |
| [`development/`](development/) | Internal integration, programme control and retained execution/provenance records | Canonical public doctrine or prototype artefacts themselves |
| [`prototypes/`](prototypes/) | Concrete test artefacts, protocols and recorded physical evidence | The programme authority that decides what should be prototyped |
| [`delivery/`](delivery/) | Requirements, responsibilities and stage decisions for an appointed design team | Exploratory research, site/jurisdiction authority or publication argument |
| [`computational/`](computational/) | Executable-architecture research scope, proof boundaries and computational provenance | Architectural doctrine, grammar or Reference House choices merely because they are represented |
| [`publication/`](publication/) | Architectural-drawing and publication authority/proof records | Top-level publication build machinery or canonical architectural source merely because it is drawn |
| [`editorial/`](editorial/) | Writing modes, editorial controls and rewrite protocol | Architectural claims or project status |

## Canonicality

A file existing in `docs/` does not make it current or canonical.

- The **manuscript** owns the public architectural argument.
- **Patterns** own reusable responses at their stated scope; pattern selection is not proof.
- **Architectural grammar** is a selectable architectural layer independent of doctrine and computation.
- The **Reference House** is a worked interpretation and integration test, not a universal solution.
- **Research** supports, qualifies or falsifies claims; it is not silently promoted into doctrine.
- **Development** contains both programme controls and retained historical records. Old “next” statements are historical unless current authority confirms them.
- **Prototype** records distinguish a proposed test from an actual result.
- **Computational** documents describe bounded executable capability and proof limits; representability is not adequacy.
- **Publication records** document drawing/publication authority, production decisions and proofs; the executable build system lives at top-level `publication/`.
- [`../STATUS.md`](../STATUS.md) is the canonical project-wide answer to “where are we now?”.

## Placement rule

Place a document according to what it **does**, not merely what subject it mentions.

A single architectural question may legitimately produce different records in different areas: evidence in `research/`, a reusable response in `patterns/`, a Reference House occurrence in `reference-house/`, programme control in `development/`, a physical result in `prototypes/`, a requirement in `delivery/`, publication prose in `manuscript/`, drawing/publication proof in `publication/`, and executable consequences in `computational/` where deterministic representation is justified.

Cross-link rather than duplicate.

## Architectural specificity boundary

Architectural specificity should enter at the narrowest layer that owns it.

- **Doctrine** should survive a change of architectural style.
- **Patterns and strategies** remain reusable unless their scope explicitly narrows them.
- **Supported-domain restrictions** describe technical competence, not architectural virtue.
- **Architectural grammars** may be strongly opinionated about hierarchy, topology, proportion and composition.
- **Reference House and project choices** may be more specific still.

A downstream preference moves upstream only when its underlying reason has been independently generalised and justified. The continuing boundary is recorded in [`development/architectural-specificity-boundary.md`](development/architectural-specificity-boundary.md).

## Publication and navigation

Publication order is editorial structure, not filesystem ownership. The canonical publication architecture is [`manuscript/publication-architecture.md`](manuscript/publication-architecture.md).

Website navigation is a reading interface, not a second content store or authority graph. It may cross ownership boundaries when that helps comprehension, but it must not fork the underlying content. Historical or compatibility material can remain discoverable without receiving the same visual rank as current material.

## Figures and assets

Keep figures close to the material that owns them.

- Use Mermaid for semantic/topological diagrams whose source should remain inspectable in Markdown.
- Use SVG for technical and architectural drawings where geometry, linework or print control matters.
- A publication rendering of a semantic diagram is downstream of its canonical source unless the owning record explicitly says otherwise.
- Do not assume an SVG is hand-authored or generated from its extension alone; follow the local authority/edit boundary.

## Current state

This README deliberately does not carry packet counts, active work, maturity summaries or “next” statements. Use [`../STATUS.md`](../STATUS.md) for project-wide state and the local owning gate/result for workstream-specific history.

See the root [`README.md`](../README.md) for the repository-wide map and [`AGENTS.md`](../AGENTS.md) for contributor operating rules.
