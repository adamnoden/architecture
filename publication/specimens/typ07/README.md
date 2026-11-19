# TYP-07 representative-signature proof

This directory carries the bounded TYP-07 proof programme defined by issues #541–#544.

## TYP-07A authority

`manifest.ts` freezes ten real representative obligations and `audit.ts` proves their canonical source/registry identities.

The harness's accepted specimen contracts are its visual authority. The base `publication/theme.css` retains historical Working Edition styles; the current full-production build adds the released typography overlays. See the [production release](../../../docs/publication/publication-typography-v1-release.md) for that later authority.

## TYP-07B proof

`prepare.ts` composes the frozen representative corpus from real Ovid’s House content and controlled FLOW / DRW assets using the already accepted TYP contracts:

- Source Serif 4 body: 10.5 pt / 1.5, spaced paragraphs, ragged right, hyphenation off;
- TYP-04 opening / hierarchy / navigation metrics;
- TYP-05 compact-table, schedule-record, URL, caption and plate-furniture roles;
- Source Sans 3 Regular/Bold at the drawing interface.

Exact TYP-03 pinned font bytes are transported into proof CSS. Reader-facing SVGs that still carry the historical Arial working-family declaration are copied into proof space and receive only a reversible Source Sans rebinding. Canonical SVG bytes are never written.

The two outputs are:

```text
publication/.work/typ07b/a4/typ07b-representative-a4.pdf
publication/.work/typ07b/b5/typ07b-representative-b5.pdf
```

Build:

```sh
npx tsx publication/specimens/typ07/build.ts
```

Verify after `poppler-utils` is available:

```sh
npx tsx publication/specimens/typ07/verify.ts
```

The finished-PDF gate requires Source Serif 4 Regular/Italic/Bold and Source Sans 3 Regular/Bold, rejects common system-font fallback, checks A4 / 176 × 250 mm geometry, confirms all ten proof units and five reversible SVG transformations, and records exact representative page counts.

## Physical boundary

The exact B5 proof was reviewed at **100% / Actual Size** and accepted with `LGTM`, as recorded in the [TYP-07C physical freeze](../../../docs/publication/publication-typography-typ07c-representative-signature-freeze.md). Regenerated proofs do not automatically inherit that exact object's physical verdict.

Plate pages preserve controlled paper-space drawing size rather than shrinking 1:100 architectural drawings into the prose measure. Final drawing-specific typography and geometry remain PLT authority.

TYP-07B does not provide a false final spine estimate: the representative subset is not a defensible whole-book pagination proxy. TYP-08 owns the full candidate-book corpus and TYP-09 owns release.
