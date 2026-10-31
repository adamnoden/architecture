# Ovid’s House — Primer publication contract

The Primer is the compact companion to the Ovid’s House Working Edition. Its job is to give a technically literate reader the **complete mental model of the project in one sitting**. It is not an abridged copy of the long-form book and it is not a promotional summary.

## Editorial target

Aim for roughly **14–18 A4 pages**, with about 16 pages as a useful design target rather than a build invariant. Page count may move as the doctrine and pattern language develop. Compression must never be achieved by silently dropping a governing principle or pretending that selected examples are the whole project.

The Primer should answer five questions in order:

1. **What is the proposition?** — why different building layers should be allowed to change at different rates, and what is meant by selective permanence, proportional serviceability, the architectural platform, maintenance geography, workmanship robustness and repose.
2. **What governs the project?** — all eleven governing principles, in canonical order, each with its canonical rule and enough explanation to preserve its intended meaning.
3. **How does doctrine become architecture?** — the doctrine → strategy → pattern → reference-implementation hierarchy; the complete current active pattern language; and a small set of representative patterns expanded far enough to demonstrate consequences.
4. **What does an integrated house look like?** — the Reference House as one coordinated interpretation and integration test, explicitly not as proof or as a style doctrine.
5. **How is the work tested and extended?** — physical testing, implementation discipline and the parallel computational track, while keeping software subordinate to the architectural argument.

## Source ownership

The Primer deliberately has very little prose of its own.

| Primer material | Authority |
| --- | --- |
| Opening proposition and connective compression | `publication/primer/proposition.md` |
| Section framing and composition slots | `publication/primer/constitution.md`, `publication/primer/patterns.md`, `publication/primer/reference-house.md` |
| Eleven governing principles | `docs/manuscript/governing-principles.md` |
| Active pattern identities and representative pattern statements | canonical files under `docs/patterns/` |
| Reference House claims and composition | `docs/reference-house/README.md` |
| Testing, computational boundary and closing orientation | `publication/primer/outlook.md` |

Canonical doctrine, pattern definitions and Reference House claims are transformed by deterministic print adapters. They are **not copied into a second maintained manuscript**. If the canonical structure changes enough that the adapter can no longer extract the intended material safely, the Primer build should fail and require a deliberate editorial update.

## Current representative patterns

Six patterns are expanded in the compact edition:

- `PAT-001` — Controlled Utility Entry;
- `PAT-005` — Designed Structural Penetration;
- `PAT-018` — Failure-Tolerant Wet Service Room;
- `PAT-007` — Permanent Opening / Replaceable Window;
- `PAT-013` — Ground-Supported Façade Access;
- `PAT-012` — Physical Service Index.

They are chosen for breadth: service topology, permanent-fabric protection, failure tolerance, replaceable architectural assemblies, external maintenance geography and stewardship. They are not a privileged inner canon. The Primer must continue to list the full active language even when only this smaller set is expanded.

## Deliberate omissions

The Primer does not carry the full evidence apparatus, complete pattern pages, detailed strategy records, held-candidate records, provenance, research ledger, full Reference House development record, procurement detail or the wider development history. Those belong in the Working Edition, the live documentation or project records.

The Primer may state evidence boundaries that are necessary to prevent a false impression of certainty. It should not reproduce the long-form evidence argument merely to prove that the compact edition is serious.

## Publication rules

- The Primer and Working Edition share preparation/rendering infrastructure and are built from the same repository commit. The full Working Edition additionally uses the released production typography overlays defined in `publication/vivliostyle.config.js`.
- The stable public path is `/architecture/ovids-house-primer.pdf`.
- The title is **Ovid’s House — Primer**, derived from `project/identity.ts`.
- The website should present the Primer as the compact entry point and the Working Edition as the complete publication.
- All eleven governing principles must remain present.
- All active canonical patterns must remain represented by identity in the pattern map.
- The Reference House must remain explicitly an integration test, not proof of doctrine.
- The computational track must remain parallel and subordinate, not become a governing principle or a software pitch.
- Page count is an editorial signal, not a hard build constraint.
