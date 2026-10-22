# TYP-03 body-text specimen harness

This directory is the controlled comparison harness for **TYP-03 — body-text specimen and reading system**.

It deliberately contains **no proprietary font binaries** and does not download, activate or accept a font licence on the operator's behalf.

## What it proves

The harness extracts real Ovid's House prose from canonical manuscript sources and renders it under a common page/composition envelope so shortlisted type systems can be compared without hand-tuning a flattering page for each candidate.

It records:

- candidate identity;
- exact font-file SHA-256 fingerprints without storing the files;
- canonical source SHA-256;
- A4 or conservative B5 proof format;
- paragraph-rhythm mode;
- alignment mode.

The generated work and PDFs live under `publication/.work/typ03/`, which is already ignored by the repository.

## Font boundary

For a non-baseline candidate the operator must provide locally licensed/evaluation font files through environment variables:

- `TYP03_SERIF_REGULAR`
- `TYP03_SERIF_ITALIC`
- `TYP03_SERIF_BOLD`
- `TYP03_SANS_REGULAR`
- `TYP03_SANS_BOLD`

Variable fonts may be supplied to more than one slot when their licence and implementation allow it.

The harness copies those files only into the ignored work directory for the current run. It never copies them into tracked source and never writes their contents into the proof record.

## Candidate ids

- `baseline` — current Georgia / Arial working system; no font files required;
- `lyon-atlas`
- `tiempos-soehne`
- `scala`
- `source`

Candidate ids are labels for the proof record. The supplied font-file fingerprints are the actual identity evidence.

## Comparison axes

`TYP03_FORMAT`

- `a4` — current working-output regression territory;
- `b5` — conservative 176 × 250 mm proof territory.

`TYP03_RHYTHM`

- `spaced` — current-style paragraphs separated by space;
- `indented` — continuous-book rhythm with first-line indents after the opening paragraph.

`TYP03_ALIGN`

- `ragged` — ragged right;
- `justified` — justified with hyphenation.

Defaults are `a4`, `spaced`, `ragged` so the first run remains conservative.

## Run

Prepare:

```sh
TYP03_CANDIDATE=baseline \
TYP03_FORMAT=a4 \
TYP03_RHYTHM=spaced \
TYP03_ALIGN=ragged \
npx tsx publication/specimens/typ03/prepare.ts
```

Build:

```sh
TYP03_CANDIDATE=baseline \
TYP03_FORMAT=a4 \
TYP03_RHYTHM=spaced \
TYP03_ALIGN=ragged \
npx vivliostyle build -c publication/specimens/typ03/vivliostyle.config.js
```

For a shortlisted face, add the five font-path variables to the same environment. Do not put font files under a tracked repository path.

## Review discipline

The first comparison round keeps geometry and settings common. It is allowed to expose that one face is naturally larger, darker or wider.

Only after that first pass may each surviving candidate receive a bounded second-pass adjustment to body size, leading and measure. This prevents both errors:

1. forcing every candidate into Georgia's exact metrics;
2. independently art-directing every candidate until all of them look good.

No specimen becomes production typography merely by existing here.