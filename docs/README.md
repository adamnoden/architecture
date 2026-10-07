# Documentation structure

This directory is the source-of-truth corpus for **House Systems Architecture**. Its structure reflects the **role a document plays in the project**, not the navigation of any particular website or publication.

A future documentation site may present these files through a different, curated information architecture. It should not duplicate or fork the underlying content.

## Areas

| Area | Owns | Does not own |
|---|---|---|
| [`manuscript/`](manuscript/) | Publication-facing architectural argument, governing principles and monograph material | Working notes, evidence packs or implementation records |
| [`patterns/`](patterns/) | Reusable architectural responses and the emerging connected pattern language: forces, trade-offs, maturity, failure modes, stable identities, relationships and generative sequences | Project-specific proof, implementation-family evidence or compiler rules merely because they derive from a pattern |
| [`reference-house/`](reference-house/) | One coordinated worked interpretation used to expose conflicts, test doctrine and test whether selected patterns can coexist | Evidence that a principle or pattern is generally valid |
| [`research/`](research/) | Evidence synthesis, precedent, options appraisal and claim hardening | Final publication prose merely because it cites sources |
| [`development/`](development/) | Internal integration work: migration plans, coordination registers, manufacturing strategy and programme control | Prototype artefacts themselves or canonical public doctrine |
| [`prototypes/`](prototypes/) | Concrete test artefacts: build packs, drawings, test details and later test records/results | The programme that decides what should be prototyped |
| [`delivery/`](delivery/) | Translation into requirements, responsibilities and stage decisions for an appointed design team | Exploratory research or publication argument |
| [`computational/`](computational/) | The bounded executable-architecture research track, including its own programme control and provenance | The architectural doctrine or pattern language itself |
| [`editorial/`](editorial/) | Writing modes, editorial controls and rewrite protocol | Architectural claims or project status |
| [`source/`](source/) | Frozen source material retained for provenance and traceability | Live doctrine |

## Canonicality

The repository contains both current material and useful provenance. A filename existing in `docs/` does not make it canonical.

- The **manuscript** contains the current public architectural argument.
- **Patterns** may be provisional or experimental; their evidence and maturity must be stated rather than inferred from location.
- During the current pattern-language pilot, `patterns/core-12.md` remains the developed prose while thin pilot records test stable IDs, relationships and sequences. Full prose migration is explicitly gated in `development/pattern-language-overhaul.md`.
- The **reference house** is a worked interpretation and test vehicle, never proof of the doctrine or pattern language.
- **Research** supports, qualifies or kills claims; it is not silently promoted into doctrine.
- **Development** documents control integration and migration. They may become historical once their work is absorbed elsewhere.
- **Prototype** records are evidence about specific propositions, including negative evidence.
- The **computational track** maintains its own explicit canonical/current pointers in [`computational/README.md`](computational/README.md); versioned predecessors remain provenance.
- [`source/house-design-doctrine-v7.md`](source/house-design-doctrine-v7.md) is preserved source material, not the live book.
- [`../STATUS.md`](../STATUS.md) remains the canonical answer to “where are we now?”

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

That separation is deliberate. Cross-link rather than duplicate.

## Architectural specificity boundary

Architectural specificity should enter at the narrowest layer that actually owns it.

- **Doctrine** should survive a change of architectural style.
- **Strategies and patterns** should remain reusable unless their scope explicitly names a grammar, typology or construction family.
- **Supported-domain restrictions** describe technical competence, not architectural virtue.
- **Architectural grammars** may be strongly opinionated about hierarchy, topology, proportion, composition, element families and historical lineage.
- **Project and Reference House choices** may be more specific still.

The current Reference House may therefore select a Georgian-derived grammar without making Georgian architecture part of House Systems Architecture itself. The same rule applies to less obvious assumptions such as symmetry, courtyard planning, cavity masonry, two storeys or a pitched roof: each must retain the scope that justifies it.

A downstream preference may move upstream only after the underlying reason has been generalised and independently justified. Preserve the general principle upstream; keep the stylistic or project-specific implementation downstream.

The active audit and promotion test are recorded in [`development/architectural-specificity-boundary.md`](development/architectural-specificity-boundary.md).

## Figures and assets

Keep figures close to the material that owns them. SVG is preferred for technical diagrams where practical. A local `figures/` directory is appropriate when a document family accumulates several assets; otherwise a figure may sit beside its owning document.

## Website boundary

The repository filesystem and the public reading experience are separate concerns.

- Repository paths remain stable where practical and serve authorship, provenance and project maintenance.
- Website navigation, labels and URLs may be curated independently.
- The website should render these Markdown and asset files directly rather than introduce a second content store.
- Site-specific metadata should stay minimal and must not become required to understand the repository without the site.
