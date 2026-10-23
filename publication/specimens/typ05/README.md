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

Candidate metrics are recorded in each generated `manifest.json`. They are not production tokens and remain unfrozen until physical B5 review.

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

A green build proves deterministic composition with the intended Source faces. It does not prove that the new technical-role metrics are aesthetically or physically correct.

The B5 proof must be inspected at 100% / actual size before any TYP-05 role is frozen. If one case fails, revise the smallest role that explains the failure rather than reopening the body or hierarchy system.
