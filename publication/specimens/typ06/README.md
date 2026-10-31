# TYP-06 drawing-interface specimen

Status: **PHYSICALLY ACCEPTED / FROZEN** — owner verdict `LGTM`, 24 October 2026.  
Canonical closeout: `docs/publication/publication-typography-typ06c-sans-drawing-interface-freeze.md`.

This directory contains the bounded TYP-06B proof that the frozen publication sans can cross into the released architectural-drawing typography without silently falling back or redesigning PLT geometry.

## Boundary

The specimen uses two committed `drawing-publication-v1` substrates unchanged as source evidence:

- `docs/reference-house/publication-ground-floor-plan.svg` — 136 × 145 mm, 1:100;
- `docs/reference-house/publication-principal-section.svg` — 166 × 92 mm, 1:100.

The proof harness reads those exact SVG bytes and creates temporary specimen copies only. It does **not** modify:

- the canonical SVGs;
- `compiler/publication-drawing/tokens.ts`;
- drawing scene geometry, text positions, anchors, rotations or sizes;
- line/poche grammar;
- architectural content.

The only admitted proof changes are:

1. replace the released Arial/Helvetica working-family declaration with a specimen-only Source Sans alias;
2. embed the exact TYP-03 pinned Source Sans 3 Regular and Bold bytes as data URIs;
3. enable tabular numerals on the existing `note` role as the bounded numeral candidate authorised by TYP-06A.

`prepare.ts` proves that removing those three typography-only changes reproduces each canonical SVG byte-for-byte.

## Proof discipline

The generated PDF contains only the two inline architectural SVGs. There is no Source Sans specimen heading, caption or page furniture outside the drawings. Therefore the finished-PDF font gate cannot pass merely because surrounding proof text embedded Source Sans while the drawings themselves fell back.

The GitHub workflow fails unless both A4 and conservative-B5 PDFs:

- embed `SourceSans3-Regular`;
- embed `SourceSans3-Bold`;
- contain no Arial, Helvetica, Liberation, Times or Georgia fallback;
- contain exactly two proof pages.

B5 is the decisive physical territory. The released DRW v1 paper-space sizes remain unchanged during this test:

- `label`: 7.5 pt / regular;
- `note`: 6.5 pt / regular;
- `marker`: 6.5 pt / bold.

Those sizes are accepted **proof territory**, not a TYP decision about final PLT v2 typography.

## Accepted proof provenance

Final lease-clean proof:

- PR: **#529**;
- proof head: `c46a057b6d7f3386e712ea46306a8e52008dc05f`;
- merged harness: `44874830560c5398d7409a140ff3c68721e06cca`;
- TYP-06 workflow run: **40077256819 — SUCCESS**;
- artifact: **12553472380**;
- artifact digest: `sha256:3ba968bd0b2639f5e559adf1435606647f05be73c3c90a2efc50ce54684579dc`;
- conservative-B5 proof: **176 × 250 mm, two pages**;
- physical verdict at 100% / Actual Size: **`LGTM`**.

The frozen interface decision is recorded in TYP-06C. PLT owns final drawing-specific sizes, hierarchy, placement, collisions and BOOK/WALL tuning.

## Build

```sh
npx tsx publication/specimens/typ06/build.ts
```

Outputs:

```text
publication/.work/typ06b/a4/typ06b-drawing-interface-a4.pdf
publication/.work/typ06b/b5/typ06b-drawing-interface-b5.pdf
```
