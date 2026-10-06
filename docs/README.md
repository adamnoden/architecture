# Documentation structure

This directory is the source-of-truth corpus for the Long-Life House. Its structure reflects the **role a document plays in the project**, not the navigation of any particular website or publication.

A future documentation site may present these files through a different, curated information architecture. It should not duplicate or fork the underlying content.

## Areas

| Area | Owns | Does not own |
|---|---|---|
| [`manuscript/`](manuscript/) | Publication-facing architectural argument, governing principles and monograph material | Working notes, evidence packs or implementation records |
| [`patterns/`](patterns/) | Reusable architectural responses, with forces, trade-offs, maturity and failure modes | Project-specific proof or untested universal rules |
| [`reference-house/`](reference-house/) | One coordinated worked interpretation used to expose conflicts and test the doctrine | Evidence that a principle is generally valid |
| [`research/`](research/) | Evidence synthesis, precedent, options appraisal and claim hardening | Final publication prose merely because it cites sources |
| [`development/`](development/) | Internal integration work: migration plans, coordination registers, manufacturing strategy and programme control | Prototype artefacts themselves or canonical public doctrine |
| [`prototypes/`](prototypes/) | Concrete test artefacts: build packs, drawings, test details and later test records/results | The programme that decides what should be prototyped |
| [`delivery/`](delivery/) | Translation into requirements, responsibilities and stage decisions for an appointed design team | Exploratory research or publication argument |
| [`computational/`](computational/) | The bounded executable-architecture research track, including its own programme control and provenance | The architectural doctrine itself |
| [`editorial/`](editorial/) | Writing modes, editorial controls and rewrite protocol | Architectural claims or project status |
| [`source/`](source/) | Frozen source material retained for provenance and traceability | Live doctrine |

## Canonicality

The repository contains both current material and useful provenance. A filename existing in `docs/` does not make it canonical.

- The **manuscript** contains the current public architectural argument.
- **Patterns** may be provisional or experimental; their maturity must be stated rather than inferred from location.
- The **reference house** is a worked interpretation and test vehicle, never proof of the doctrine.
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
3. a worked instance in `reference-house/`;
4. an integration or test programme in `development/`;
5. a build/test artefact in `prototypes/`;
6. a requirement in `delivery/`;
7. publication prose in `manuscript/`.

That separation is deliberate. Cross-link rather than duplicate.

## Figures and assets

Keep figures close to the material that owns them. SVG is preferred for technical diagrams where practical. A local `figures/` directory is appropriate when a document family accumulates several assets; otherwise a figure may sit beside its owning document.

## Website boundary

The repository filesystem and the public reading experience are separate concerns.

- Repository paths remain stable where practical and serve authorship, provenance and project maintenance.
- Website navigation, labels and URLs may be curated independently.
- The website should render these Markdown and asset files directly rather than introduce a second content store.
- Site-specific metadata should stay minimal and must not become required to understand the repository without the site.
