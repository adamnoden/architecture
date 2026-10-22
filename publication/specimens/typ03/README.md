# TYP-03 body-text specimen harness

This directory is the controlled comparison harness for **TYP-03 — body-text specimen and reading system**.

It deliberately contains **no proprietary font binaries** and does not download, activate, upload or accept a font licence on the operator's behalf.

## What it proves

The harness extracts real Ovid's House prose from canonical manuscript sources and renders it under a common page/composition envelope so shortlisted type systems can be compared without hand-tuning a flattering page for each candidate.

It records candidate identity, exact font-file SHA-256 fingerprints, declared font-rights mode, canonical source SHA-256, proof format, paragraph rhythm, alignment, and—when anonymous mode is enabled—the blind label used on the reviewer-facing proof.

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

- `preview-only` — local visual evaluation is permitted but PDF-embedding rights have not been established;
- `pdf-embed-ok` — embedding rights for the supplied files and this proof use have been established.

If a non-baseline candidate is declared `preview-only`, the Vivliostyle config refuses the `build` command.

## Candidate ids

- `baseline` — current Georgia / Arial working system; no font files required;
- `lyon-atlas` — Lyon Text + Atlas Grotesk;
- `tiempos-soehne` — Tiempos Text + Söhne;
- `scala` — Scala Pro + Scala Sans Pro;
- `source` — Source Serif 4 + Source Sans 3, open/free neutral control;
- `newsreader-source` — Newsreader + Source Sans 3, open/free aesthetic challenger.

Candidate ids are labels for the private local proof record. The supplied font-file fingerprints are the actual identity evidence.

## Affordability rule

Price and licence complexity must not contaminate the anonymous first reading pass. After identity reveal:

- if an open/free candidate is physically equivalent or only marginally weaker than a paid candidate, the open/free candidate wins;
- a paid candidate must show a clear, repeatable and materially valuable physical advantage to justify purchase;
- a modest one-off cost remains admissible if that advantage is obvious;
- recurring subscriptions, complex deployment rights and hosted-build uncertainty count against a candidate.

The durable authority is `docs/publication/publication-typography-typ03d-value-frontier.md`.

## Blind B5 review mode

TYP-03E adds a fail-closed anonymous build surface.

Set:

- `TYP03_ANONYMOUS=1`
- `TYP03_BLIND_LABEL=A|B|C|D|E|BASELINE`

The candidate name is then replaced by the blind label in printed specimen metadata, running furniture, PDF title, entry title, output filename and Vivliostyle workspace path. The ignored local `manifest.json` keeps the actual candidate↔label mapping for reveal after the verdicts are frozen.

The baseline must use `BASELINE`; non-baseline candidates must use A–E.

Example open-font proof:

```sh
TYP03_CANDIDATE=newsreader-source \
TYP03_ANONYMOUS=1 \
TYP03_BLIND_LABEL=C \
TYP03_FONT_RIGHTS=pdf-embed-ok \
TYP03_FORMAT=b5 \
TYP03_RHYTHM=indented \
TYP03_ALIGN=ragged \
TYP03_SERIF_REGULAR=/absolute/path/Newsreader.ttf \
TYP03_SERIF_ITALIC=/absolute/path/Newsreader-Italic.ttf \
TYP03_SERIF_BOLD=/absolute/path/Newsreader.ttf \
TYP03_SANS_REGULAR=/absolute/path/SourceSans3.ttf \
TYP03_SANS_BOLD=/absolute/path/SourceSans3.ttf \
npx tsx publication/specimens/typ03/prepare.ts

TYP03_CANDIDATE=newsreader-source \
TYP03_ANONYMOUS=1 \
TYP03_BLIND_LABEL=C \
TYP03_FONT_RIGHTS=pdf-embed-ok \
TYP03_FORMAT=b5 \
TYP03_RHYTHM=indented \
TYP03_ALIGN=ragged \
npx vivliostyle build -c publication/specimens/typ03/vivliostyle.config.js
```

Print at **100%**, not “fit to page”. Use the same printer, quality setting and paper batch for every set. Use `review-sheet.md` for the reading record. Keep the A–E mapping out of sight until all verdicts are written.

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

Defaults are `a4`, `spaced`, `ragged` so the ordinary non-anonymous run remains conservative.

## Baseline run

```sh
TYP03_CANDIDATE=baseline \
TYP03_FORMAT=a4 \
TYP03_RHYTHM=spaced \
TYP03_ALIGN=ragged \
npx tsx publication/specimens/typ03/prepare.ts

TYP03_CANDIDATE=baseline \
TYP03_FORMAT=a4 \
TYP03_RHYTHM=spaced \
TYP03_ALIGN=ragged \
npx vivliostyle build -c publication/specimens/typ03/vivliostyle.config.js
```

## Restricted evaluation-font run

When the evaluation licence permits local visual/print testing but PDF embedding has not been established, use `preview-only` and `vivliostyle preview`. Do **not** use the preview UI's PDF-save function unless the font licence also permits embedding.

## Foundry-specific evaluation notes

These notes are operational constraints, not substitutes for reading the licence actually accepted by the operator.

- Klim's published Test Font Licence allows internal test visualisations and presentation through print/web/mobile, but its licence summary marks test-font embedding as unavailable. Treat Klim test files as `preview-only` unless a different licence has been obtained.
- Commercial Type offers trial fonts for private evaluation. Keep trial files local and outside this AI/cloud workflow unless a licence expressly permits otherwise.
- Newsreader's upstream Production Type repository states SIL Open Font License 1.1 and Source Sans 3's Adobe repository is also open under OFL-1.1. Verify the exact downloaded files/licence before a run.
- Open-source candidates may use `pdf-embed-ok` only when the operator has verified the applicable licence for the exact files used.

## Review discipline

The first comparison round keeps geometry and settings common. It is allowed to expose that one face is naturally larger, darker or wider.

Only after that first pass may each surviving candidate receive a bounded second-pass adjustment to body size, leading and measure. This prevents both forcing every candidate into Georgia's exact metrics and independently art-directing every candidate until all of them look good.

No specimen becomes production typography merely by existing here.
