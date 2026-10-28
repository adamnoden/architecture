# Manuscript

The manuscript develops the architectural argument for **Ovid’s House**. It begins with the problem of designing a house for its life after completion, establishes the governing principles, develops their architectural consequences, then passes into reusable patterns/sequences, one worked Reference House, the methods by which propositions are tested and carried into practice, and—after the authorised next refactor—a concise resolved-house conclusion.

## Current canonical reading sequence

Until [BSR — Book Structure Refactor](../../project/bsr/book-structure-refactor-programme.md) closes, the canonical reading sequence remains:

1. [Preface](preface.md)
2. [Part I — The Proposition](part-i.md), including the [Governing Principles](governing-principles.md) and [Principle 8 — Design for Repose](principle-08-repose.md)
3. [Part II — Architecture of the Platform](part-ii.md), including [Maintenance Geography — The Exterior](maintenance-geography-external.md)
4. [Part III — Pattern Language](../patterns/README.md)
5. [Part IV — Reference House](../reference-house/README.md)
6. [Part V — Making and Testing the Platform](part-v.md)
7. [Evidence and precedent notes](evidence-and-precedent-notes.md)
8. [Research agenda](research-agenda.md)
9. [Reference House implementation schedule](reference-house-implementation-schedule.md)
10. [Glossary](glossary.md)
11. [Sources and further reading](sources-and-further-reading.md)

Do not infer from the authorised target below that files have already moved or that chapter numbers have already changed.

## Authorised target structure

The next major book-development programme is recorded in [`project/book-resolution-programme.md`](../../project/book-resolution-programme.md). BSR will migrate the reader-facing book to:

1. **Part I — The Proposition**
2. **Part II — Architecture of the Platform**
3. **Part III — Patterns and Generative Sequences**
4. **Part IV — The Reference House: Design Proposition**
5. **Part V — Making and Proving the Platform**
6. **Part VI — The House**

The refactor is deliberately more than renaming. Part IV will own one specific designed house and its selected architectural systems; Part V will own the ordeal—proportionality, scenarios, prototyping, technical closure, delivery and commissioning; Part VI will be a short resolved architectural monograph/plates section rather than a second explanatory case study.

The new substantive work is split into first-class workstreams so the book structure does not become the owner of design decisions:

- `IAS` — Interior Architecture System;
- `OAS` — Opening Assembly System;
- `HAD` — House Architectural Design;
- `BCR` — Buildability & Construction Resolution;
- `HRS` — House Resolution & Synthesis.

BSR owns only the structural migration and chapter/authority interfaces.

## Architectural specificity

Concrete architectural and construction examples are used where they make the argument clearer. Masonry, plaster, cornices, architraves, thresholds, timber, metalwork and the Reference House may therefore appear in general chapters without becoming Ovid’s House requirements.

Authority belongs to the claim, not to the example. A general proposition should survive a materially different architectural language and construction family. Where a particular form, material or system is itself required, the text identifies the narrower owner: a pattern context, technical domain, selected grammar, the Reference House or a particular implementation family.

The Preface may state architectural preferences, and the Reference House may be strongly specific. Neither promotes those preferences into doctrine.