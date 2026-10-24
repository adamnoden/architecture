# TYP-06 drawing-interface specimen

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

The only admitted candidate changes are:

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

Those sizes are proof territory, not a TYP decision about final PLT v2 typography.

## Build

```sh
npx tsx publication/specimens/typ06/build.ts
```

Outputs:

```text
publication/.work/typ06b/a4/typ06b-drawing-interface-a4.pdf
publication/.work/typ06b/b5/typ06b-drawing-interface-b5.pdf
```

The candidate remains unfrozen until the B5 PDF is inspected at 100% / actual size.
