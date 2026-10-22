<!-- nav-exclude: redirect -->
# TYP-03E — blind B5 physical proof kit

Status: **active TYP-03 execution packet**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Packet issue: **#464 — TYP-03E — blind B5 physical proof kit**  
Depends on: TYP-03A specimen harness + TYP-03B licence boundary + TYP-03C physical review protocol + TYP-03D value frontier

## 1. Purpose

TYP-03E turns the frozen body-text review method into an executable blind physical-proof kit.

It does not choose a typeface. It removes identity leakage, fixes the conservative-B5 review surface and makes the physical judgement restart-safe.

## 2. Blind-build contract

Anonymous proof runs use:

- `TYP03_ANONYMOUS=1`;
- `TYP03_BLIND_LABEL=A|B|C|D|E|BASELINE`;
- the existing `TYP03_CANDIDATE` to select the actual local font inputs.

In anonymous mode the candidate name must not appear in:

- printed specimen metadata;
- running furniture;
- PDF title;
- PDF entry title;
- output filename;
- Vivliostyle workspace path.

The ignored local manifest retains the candidate identity, blind label, exact source hash and font-file fingerprints so the mapping can be revealed later without contaminating the printed review surface.

The baseline remains explicitly labelled `BASELINE`, matching the frozen TYP-03C protocol. Only non-baseline candidates may use A–E.

## 3. Physical proof territory

Primary decision proof:

- ISO B5, 176 × 250 mm;
- black only;
- 100% print scale;
- same printer;
- same print-quality setting;
- same paper batch;
- same ambient reading conditions where practical.

A4 remains regression territory, not the main aesthetic decision surface.

Warm off-white uncoated stock remains the intended approximation for physical review where available.

## 4. Candidate field

Blind sets A–E map exactly once to:

- Lyon Text + Atlas Grotesk;
- Tiempos Text + Söhne;
- Scala Pro + Scala Sans Pro;
- Source Serif 4 + Source Sans 3;
- Newsreader + Source Sans 3.

Georgia + Arial remains the known `BASELINE` before-state.

The A–E mapping must stay outside the reviewer’s sight until all first-pass verdicts are frozen.

## 5. Licence boundary

TYP-03B remains authoritative.

- proprietary evaluation binaries stay local unless the accepted licence expressly permits otherwise;
- `preview-only` candidates must not be built to embedded-font PDF through this harness;
- `pdf-embed-ok` is a declaration by the operator after checking the applicable licence;
- no proprietary font binary enters the repository;
- open status does not replace exact-file licence verification.

## 6. Review record

Use `publication/specimens/typ03/review-sheet.md` once per blind set.

The reviewer records:

- sustained-reading effort;
- tracking, measure and leading;
- page colour;
- paragraph rhythm;
- italic and punctuation behaviour;
- hyphenation/composition quality;
- character against the frozen TYP tensions;
- observed defects;
- KEEP / DOUBT / REJECT before reveal.

Only after all blind verdicts are frozen may the candidate mapping and cost/licence class be revealed and the TYP-03D value rule applied.

## 7. Freeze

TYP-03E freezes:

1. anonymous A–E physical proof as the review surface for the five finalists;
2. the baseline as an explicitly labelled before-state;
3. candidate identity scrubbed from all ordinary PDF/reviewer-facing surfaces;
4. candidate identity retained only in ignored local evidence needed for later reveal;
5. conservative B5 at 100% as the primary reading proof;
6. a single review sheet structure with no weighted score;
7. the A–E mapping hidden until every blind verdict is written;
8. no production typography change;
9. no typeface winner without actual physical reading.

## 8. Close condition

TYP-03E closes when the harness change is green and the operator can generate correctly anonymous specimens under the existing font-rights boundary.

TYP-03 itself remains open until the five finalists and baseline have been physically read and the resulting body face, size, leading, measure, paragraph rhythm and alignment/hyphenation strategy are frozen.
