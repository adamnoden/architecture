# Documentation structure

This directory is the source-of-truth corpus for **House Systems Architecture**. Its filesystem is organised by the **role a document plays in the project**. The publication and documentation site are allowed to present the same source material through different structures where that produces a clearer argument or reading experience.

## Four structures, four jobs

House Systems Architecture has four related but distinct structures.

| Structure | Question it answers | Governing source |
|---|---|---|
| **Repository ownership** | Where does this document belong according to what it does? | this document and the area indexes below |
| **Publication structure** | In what order is the architectural argument made? | [`manuscript/publication-architecture.md`](manuscript/publication-architecture.md) |
| **Website navigation** | How should a reader find and move through the corpus? | `.vitepress/navigation.ts` |
| **Project state** | What is current, provisional, complete or historical? | [`../STATUS.md`](../STATUS.md) plus the latest local gate/result record |

These structures should agree about meaning without being forced into the same tree.

A manuscript chapter may link directly to material owned by `patterns/` or `reference-house/` without copying it into `manuscript/`. A research record may support several publication chapters without moving into the book directory. A historical file may remain in the repository and be reachable through a local provenance group without occupying a primary slot in the website contents.

The repository remains the source of truth. The website renders the repository Markdown and assets directly; it is a curated reading interface, not a second content store.

## Areas

| Area | Owns | Does not own |
|---|---|---|
| [`manuscript/`](manuscript/) | Publication-facing architectural argument, governing principles and monograph material | Working notes, evidence packs or implementation records |
| [`patterns/`](patterns/) | Reusable architectural responses, the canonical pattern language, strategies, candidates, relationships and generative sequences | Project-specific proof, implementation-family evidence or compiler rules merely because they derive from a pattern |
| [`grammar/`](grammar/) | Architectural-grammar framework and selectable grammar instances such as G-01 | HSA doctrine, the computational ontology or Reference House project choices merely because a grammar constrains them |
| [`reference-house/`](reference-house/) | One coordinated worked interpretation used to expose conflicts and force doctrine/patterns/grammar into an actual house | Evidence that a principle, pattern or grammar proposition is generally valid |
| [`research/`](research/) | Evidence synthesis, precedent, options appraisal and claim hardening | Final publication prose merely because it cites sources |
| [`development/`](development/) | Internal integration and programme control, including completed migration/audit records and live validation programmes | Prototype artefacts themselves or canonical public doctrine |
| [`prototypes/`](prototypes/) | Concrete test artefacts: build packs, drawings, protocols and later measured results | The programme that decides what should be prototyped |
| [`delivery/`](delivery/) | Translation into requirements, responsibilities and stage decisions for an appointed design team | Exploratory research or publication argument |
| [`computational/`](computational/) | The bounded executable-architecture research track, including paper models, gate results and compiler provenance | The architectural doctrine, pattern language or architectural grammar themselves |
| [`editorial/`](editorial/) | Writing modes, editorial controls and rewrite protocol | Architectural claims or project status |

## Canonicality

A filename existing in `docs/` does not make it current or canonical.

- The **manuscript** contains the current public architectural argument.
- The **pattern language migration is complete at current internal scope**: 21 active canonical patterns, three strategies and four held candidates. Historical Core-12 and pilot material remains provenance.
- **Architectural grammar** is a selectable architectural layer independent of HSA doctrine and the computational supported domain. G-01 is the current grammar research instance used by the Reference House.
- The **reference house** is a worked interpretation and test vehicle, never proof of the doctrine, pattern language or grammar.
- **Research** supports, qualifies or kills claims; it is not silently promoted into doctrine.
- **Development** contains both live programme controls and closed historical controls. A completed phase document may accurately describe an earlier next step without describing the project’s current next step.
- **Prototype** records are evidence about specific propositions, including negative evidence. No physical prototype result should be inferred merely from the existence of a build pack or protocol.
- The **computational paper programme, P0 kernel and PAT-XW-01 gate are complete at their stated scopes**. Generic compiler growth is frozen; later fixtures are evidence-selected rather than a standing roadmap.
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

A selected architectural language follows the same rule. Its grammar belongs in `grammar/`; computational work may represent consequences of that grammar without becoming its owner, while the Reference House records the particular project choices made under it.

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

## Publication rule

Publication order is editorial structure, not filesystem ownership.

The monograph may therefore move from manuscript chapters into the canonical Pattern Language and Reference House sections without duplicating either area under `manuscript/`. Developed inserts such as Principle 8 — Repose or Exterior Maintenance Geography should appear in the publication hierarchy beneath the Part that owns them even when they are separate Markdown files.

The canonical publication architecture is [`manuscript/publication-architecture.md`](manuscript/publication-architecture.md). Changes to the website must not accidentally redefine the book.

## Navigation rule

The website should optimise for comprehension, not expose the repository as a flat file browser.

- Use **route-specific sidebars** for major areas rather than one global sidebar containing the entire corpus.
- Primary navigation should privilege current and canonical material.
- Historical plans, superseded versions and migration records remain discoverable through local **history / provenance** groups or owner indexes rather than receiving equal visual rank to live material.
- Every published Markdown page must still be deliberately placed somewhere in the curated navigation. The build should fail when a new page has not been classified.
- Navigation definitions should be declarative and inspectable in one place rather than assembled through hidden mutation at runtime.

The navigation may cross repository ownership boundaries when that is the clearest reading route. It must not duplicate or fork the underlying content.

## Figures and assets

Keep figures close to the material that owns them.

- **Mermaid is preferred for system maps, relationships, sequences and other diagrams whose truth is primarily topological.** Keep the Mermaid source in the Markdown fenced block so GitHub and the VitePress site render the same underlying definition.
- **SVG is preferred for technical and architectural drawings** where geometry, linework, annotation placement or print control matters.
- Do not export a Mermaid diagram to a hand-maintained SVG merely for presentation. If publication later requires frozen artwork, retain the Mermaid source as the canonical semantic diagram and treat the publication asset as a derived figure.
- A local `figures/` directory is appropriate when a document family accumulates several owned assets; otherwise a figure may sit beside its owning document.

## Website boundary

The repository filesystem and the public reading experience are separate concerns.

- Repository paths remain stable where practical and serve authorship, provenance and project maintenance.
- Website navigation, labels and URLs may be curated independently.
- The website renders the repository Markdown/assets directly rather than introducing a second content store.
- Site-specific metadata should stay minimal and must not become required to understand the repository without the site.

The information-architecture migration that established this model is recorded in [`development/information-architecture-migration.md`](development/information-architecture-migration.md).