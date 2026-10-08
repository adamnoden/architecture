# Documentation structure

This directory is the source-of-truth corpus for **House Systems Architecture**. Its structure reflects the **role a document plays in the project**, not the navigation of any particular website or publication.

The documentation site presents these files through a curated information architecture. It must not duplicate or fork the underlying content.

## Areas

| Area | Owns | Does not own |
|---|---|---|
| [`manuscript/`](manuscript/) | Publication-facing architectural argument, governing principles and monograph material | Working notes, evidence packs or implementation records |
| [`patterns/`](patterns/) | Reusable architectural responses, the canonical pattern language, strategies, candidates, relationships and generative sequences | Project-specific proof, implementation-family evidence or compiler rules merely because they derive from a pattern |
| [`reference-house/`](reference-house/) | One coordinated worked interpretation used to expose conflicts and force doctrine/patterns into an actual house | Evidence that a principle or pattern is generally valid |
| [`research/`](research/) | Evidence synthesis, precedent, options appraisal and claim hardening | Final publication prose merely because it cites sources |
| [`development/`](development/) | Internal integration and programme control, including completed migration/audit records and live validation programmes | Prototype artefacts themselves or canonical public doctrine |
| [`prototypes/`](prototypes/) | Concrete test artefacts: build packs, drawings, protocols and later measured results | The programme that decides what should be prototyped |
| [`delivery/`](delivery/) | Translation into requirements, responsibilities and stage decisions for an appointed design team | Exploratory research or publication argument |
| [`computational/`](computational/) | The bounded executable-architecture research track, including paper models, gate results and compiler provenance | The architectural doctrine or pattern language itself |
| [`editorial/`](editorial/) | Writing modes, editorial controls and rewrite protocol | Architectural claims or project status |
| [`source/`](source/) | Frozen source material retained for provenance and traceability | Live doctrine |

## Canonicality

A filename existing in `docs/` does not make it current or canonical.

- The **manuscript** contains the current public architectural argument.
- The **pattern language migration is complete at current internal scope**: 21 active canonical patterns, three strategies and four held candidates. Historical Core-12 and pilot material remains provenance.
- The **reference house** is a worked interpretation and test vehicle, never proof of the doctrine or pattern language.
- **Research** supports, qualifies or kills claims; it is not silently promoted into doctrine.
- **Development** contains both live programme controls and closed historical controls. A completed phase document may accurately describe an earlier next step without describing the project’s current next step.
- **Prototype** records are evidence about specific propositions, including negative evidence. No physical prototype result should be inferred merely from the existence of a build pack or protocol.
- The **computational paper programme, P0 kernel and PAT-XW-01 gate are complete at their stated scopes**. Generic compiler growth is frozen; later fixtures are evidence-selected rather than a standing roadmap.
- [`source/house-design-doctrine-v7.md`](source/house-design-doctrine-v7.md) is preserved source material, not the live book.
- [`../STATUS.md`](../STATUS.md) is the canonical answer to “where are we now?”. When older control documents contain superseded sequencing, the later explicit gate/result record and `STATUS.md` control.

## Placement rule

When adding a document, place it according to what it **does**, not merely what subject it mentions.

A structural idea supported by research may therefore have:

1. evidence in `research/`;
2. a reusable response in `patterns/`;
3. a worked occurrence in `reference-house/`;
4. an integration or test programme in `development/`;
5. a build/test artefact in `prototypes/`;
6. a requirement in `delivery/`;
7. publication prose in `manuscript/`;
8. separately, formal semantic consequences in `computational/` where they can legitimately be expressed.

Cross-link rather than duplicate.

## Architectural specificity boundary

Architectural specificity should enter at the narrowest layer that actually owns it.

- **Doctrine** should survive a change of architectural style.
- **Strategies and patterns** should remain reusable unless their scope explicitly names a grammar, typology or construction family.
- **Supported-domain restrictions** describe technical competence, not architectural virtue.
- **Architectural grammars** may be strongly opinionated about hierarchy, topology, proportion, composition, element families and historical lineage.
- **Project and Reference House choices** may be more specific still.

The current Reference House may therefore select a Georgian-derived grammar without making Georgian architecture part of HSA itself. The same rule applies to less obvious assumptions such as symmetry, courtyard planning, cavity masonry, two storeys or a pitched roof.

A downstream preference may move upstream only after the underlying reason has been generalised and independently justified. Preserve the general principle upstream; keep the stylistic or project-specific implementation downstream.

The completed repo-wide audit and continuing promotion test are recorded in [`development/architectural-specificity-boundary.md`](development/architectural-specificity-boundary.md), [`development/architectural-specificity-audit.md`](development/architectural-specificity-audit.md) and the associated ledger/adversarial test.

## Figures and assets

Keep figures close to the material that owns them. SVG is preferred for technical diagrams where practical. A local `figures/` directory is appropriate when a document family accumulates several assets; otherwise a figure may sit beside its owning document.

## Website boundary

The repository filesystem and the public reading experience are separate concerns.

- Repository paths remain stable where practical and serve authorship, provenance and project maintenance.
- Website navigation, labels and URLs may be curated independently.
- The website renders the repository Markdown/assets directly rather than introducing a second content store.
- Site-specific metadata should stay minimal and must not become required to understand the repository without the site.
