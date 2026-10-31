# TYP-03 body-text specimen harness

This directory is the controlled comparison harness for **TYP-03 — body-text specimen and reading system**.

It deliberately contains **no proprietary font binaries** and does not download, activate, upload or accept a font licence on the operator's behalf.

## What it proves

The harness extracts real Ovid's House prose from canonical manuscript sources and renders it under a common page/composition envelope so shortlisted type systems can be compared without hand-tuning a flattering page for each candidate.

It records:

- candidate identity;
- exact font-file SHA-256 fingerprints without storing the files in tracked source;
- declared font-rights mode for the run;
- canonical source SHA-256;
- A4 or conservative B5 proof format;
- paragraph-rhythm mode;
- alignment mode.

Generated work lives under `publication/.work/typ03/`, which is ignored by the repository.

## Font custody boundary

For a non-baseline candidate the operator must provide **locally held** licensed/evaluation font files through environment variables:

- `TYP03_SERIF_REGULAR`
- `TYP03_SERIF_ITALIC`
- `TYP03_SERIF_BOLD`
- `TYP03_SANS_REGULAR`
- `TYP03_SANS_BOLD`

Variable fonts may be supplied to more than one slot when their licence and implementation allow it.

The harness copies those files only into the ignored work directory for the current local run. It never copies them into tracked source and never writes their contents into the proof record.

**Do not upload proprietary evaluation/test font files to GitHub, CI, ChatGPT or another cloud service unless the licence explicitly permits that distribution/use.** Run restricted-font comparisons on the licensed operator's own machine.

## Font-rights mode

Every non-baseline run must set `TYP03_FONT_RIGHTS` explicitly:

- `preview-only` — the operator has permission to use the font for local visual evaluation, but has **not** established PDF-embedding rights;
- `pdf-embed-ok` — the operator has established that the supplied font files may be embedded in the generated proof PDF for this use.

This is a fail-closed declaration, not a licence engine. The operator remains responsible for using the mode their actual licence permits.

If a non-baseline candidate is declared `preview-only`, the Vivliostyle config refuses the `build` command. This prevents the harness from silently embedding a test font into a PDF.

## Candidate ids

- `baseline` — current Georgia / Arial working system; no font files required;
- `lyon-atlas` — Lyon Text + Atlas Grotesk;
- `tiempos-soehne` — Tiempos Text + Söhne;
- `scala` — Scala Pro + Scala Sans Pro;
- `source` — Source Serif 4 + Source Sans 3, open/free neutral control;
- `newsreader-source` — Newsreader + Source Sans 3, open/free aesthetic challenger.

Candidate ids are labels for the proof record. The supplied font-file fingerprints are the actual identity evidence.

TYP-03D adds the `newsreader-source` candidate because affordability is now an explicit selection constraint. This does **not** reopen the candidate search generally. Source remains the open neutral control; Newsreader/Source asks whether a zero-cost system can also carry enough character to beat the commercial benchmarks outright.

### Affordability rule

Price and licence complexity must not contaminate the anonymous first reading pass. After identity reveal:

- if an open/free candidate is physically equivalent or only marginally weaker than a paid candidate, the open/free candidate wins;
- a paid candidate must show a clear, repeatable and materially valuable physical advantage to justify purchase;
- a modest one-off cost remains admissible if that advantage is obvious;
- recurring subscriptions, complex deployment rights and hosted-build uncertainty count against a candidate.

The durable authority is `docs/publication/publication-typography-typ03d-value-frontier.md`.

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

## Baseline run

Prepare:

```sh
TYP03_CANDIDATE=baseline \
TYP03_FORMAT=a4 \
TYP03_RHYTHM=spaced \
TYP03_ALIGN=ragged \
npx tsx publication/specimens/typ03/prepare.ts
```

Build the ordinary baseline PDF:

```sh
TYP03_CANDIDATE=baseline \
TYP03_FORMAT=a4 \
TYP03_RHYTHM=spaced \
TYP03_ALIGN=ragged \
npx vivliostyle build -c publication/specimens/typ03/vivliostyle.config.js
```

## Restricted evaluation-font run

When the evaluation licence permits local visual/print testing but PDF embedding has not been established, use `preview-only`.

Prepare with the five local font-path variables plus:

```sh
TYP03_CANDIDATE=tiempos-soehne \
TYP03_FONT_RIGHTS=preview-only \
TYP03_FORMAT=b5 \
TYP03_RHYTHM=indented \
TYP03_ALIGN=ragged \
# ...five TYP03_* font path variables... \
npx tsx publication/specimens/typ03/prepare.ts
```

Then open the local paginated preview:

```sh
TYP03_CANDIDATE=tiempos-soehne \
TYP03_FONT_RIGHTS=preview-only \
TYP03_FORMAT=b5 \
TYP03_RHYTHM=indented \
TYP03_ALIGN=ragged \
npx vivliostyle preview -c publication/specimens/typ03/vivliostyle.config.js
```

Do **not** use the preview UI's PDF-save function unless the font licence also permits embedding. If the accepted evaluation licence permits printed internal visualisations, print locally by a method consistent with that licence.

## PDF-licensed candidate run

Only when embedding rights are established:

```sh
TYP03_CANDIDATE=newsreader-source \
TYP03_FONT_RIGHTS=pdf-embed-ok \
TYP03_FORMAT=b5 \
TYP03_RHYTHM=indented \
TYP03_ALIGN=ragged \
# ...five TYP03_* font path variables... \
npx tsx publication/specimens/typ03/prepare.ts

TYP03_CANDIDATE=newsreader-source \
TYP03_FONT_RIGHTS=pdf-embed-ok \
TYP03_FORMAT=b5 \
TYP03_RHYTHM=indented \
TYP03_ALIGN=ragged \
npx vivliostyle build -c publication/specimens/typ03/vivliostyle.config.js
```

For open-source candidates, verify the licence for the exact files supplied before declaring `pdf-embed-ok`; do not infer rights merely from the candidate label.

## Foundry-specific evaluation notes

These notes are **operational constraints, not substitutes for reading the licence actually accepted by the operator**.

- Klim's published Test Font Licence allows internal test visualisations and presentation through print/web/mobile, but its licence summary marks test-font embedding as unavailable. Treat Klim test files as `preview-only` unless a different licence has been obtained.
- Commercial Type offers trial fonts for private evaluation. Its current general EULA also contains restrictions around external distribution and generative-AI use. Keep Commercial Type trial files local and outside this AI/cloud workflow unless a licence expressly permits otherwise.
- Newsreader's upstream Production Type repository states SIL Open Font License 1.1 and ships variable fonts. Source Sans 3's Adobe repository is also open under OFL-1.1. Verify the exact downloaded files/licence before a run.
- Open-source candidates such as Source may use `pdf-embed-ok` when the operator has verified the applicable open-font licence for the exact files used.

## Review discipline

The first comparison round keeps geometry and settings common. It is allowed to expose that one face is naturally larger, darker or wider.

Only after that first pass may each surviving candidate receive a bounded second-pass adjustment to body size, leading and measure. This prevents both errors:

1. forcing every candidate into Georgia's exact metrics;
2. independently art-directing every candidate until all of them look good.

No specimen becomes production typography merely by existing here.