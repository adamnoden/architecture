# TYP-05 mixed-content specimens

This directory contains the executable TYP-05 evidence harness.

## TYP-05A — inventory

`inventory.ts` scans the current Working Edition manifest after publication adapters and inventories reader-facing difficult content. It also accounts for controlled figures and architectural plates through their canonical registries.

It does not inspect repository implementation code as though that were book content.

## TYP-05B — first mixed-content candidate

`mixed-build.ts` generates A4 and conservative-B5 proofs for the first bounded technical typography candidate.

The candidate inherits TYP-03 and TYP-04 unchanged:

- Source Serif 4 + Source Sans 3 only;
- 10.5 pt / 1.5 body;
- 112 mm practical B5 body measure;
- spaced, ragged-right body composition;
- frozen hierarchy/opening roles.

It then tests the smallest role set earned by TYP-05A:

- compact analytical table;
- dense implementation schedule;
- architectural text/arrow sequences;
- long sources / URLs;
- figure captions;
- plate title / scale / caption furniture;
- an ordinary dense-list control.

### Deliberate candidate decisions

- **No mono family.** The present fenced material is architectural sequence text, and the existing inline-code spans are canonical pattern-name references rather than machine syntax.
- **No math family.** The current corpus has symbols but no display-math system.
- **Dense schedule ≠ compact table.** Appendix C is shown as labelled schedule records so long prose obligations are not miniaturised into a five-column report grid.
- **Plate furniture is book typography.** Drawing-internal annotation sizes remain PLT authority and are not frozen here.
- **Generated plate drawings are not TYP-05 inputs.** The plate-furniture specimens use canonical title/scale/caption metadata against a neutral drawing field. This prevents the typography harness from regenerating or fabricating Reference House geometry. Actual drawing adjacency is re-proved in the later representative-signature and PLT/TYP interface gates.

The candidate metrics recorded in each generated `manifest.json` were physically accepted at actual-size B5 on 24 October 2026 and are frozen by `docs/publication/publication-typography-typ05c-mixed-content-freeze.md`. They are specimen-contract values, not yet production theme tokens; production-wide integration remains later TYP work.

## Build

```sh
npx tsx publication/specimens/typ05/mixed-build.ts
```

Outputs:

```text
publication/.work/typ05b/a4/typ05b-mixed-content-a4.pdf
publication/.work/typ05b/b5/typ05b-mixed-content-b5.pdf
```

Each proof uses the TYP-03 pinned Source font identities. Verified font bytes are embedded into generated proof CSS as data URIs; font binaries remain ignored and are never committed.

The CI proof performs a second, finished-PDF check with `pdffonts`. A build is not admissible if the required Source faces are absent or common system-font fallbacks appear.

## Evidence boundary

A green build proves deterministic composition with the intended Source faces. It does not by itself prove that technical-role metrics are aesthetically or physically correct.

The exact B5 proof was reviewed at 100% / actual size and accepted with `LGTM` on 24 October 2026. Any later divergence from the frozen values is a TYP-05 freeze break unless downstream integration evidence demonstrates a concrete conflict that earns reopening the smallest affected role.
