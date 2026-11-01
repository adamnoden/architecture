# TYP-04B hierarchy specimen

This directory is an isolated publication-typography proof harness for **TYP-04 — hierarchy, openings and navigation**.

It does not modify production `publication/theme.css` and it does not create a second manuscript authority.

## Candidate

The first controlled candidate is deliberately restrained:

- **serif-led openings** — book title, division openings, entry openings and contents title use Source Serif 4 regular;
- **sans-led navigation/furniture** — section/minor headings, TOC rows, edition/imprint labels, running context and folios use Source Sans 3;
- no separate pattern-title scale;
- two TOC levels only;
- no dot leaders;
- internal cross-references are visually quiet rather than web-underlined;
- major divisions start recto;
- entry opening pages suppress running context;
- parity blanks suppress all furniture.

This is a first candidate, not a frozen result.

## Frozen body input

The harness must preserve TYP-03:

- Source Serif 4 + Source Sans 3;
- 10.5 pt body;
- 1.5 leading;
- 112 mm conservative-B5 practical measure;
- spaced paragraphs;
- ragged-right;
- no hyphenation under ragged composition;
- widows/orphans 3 / 3 where supported;
- true Source Serif 4 italic.

The exact font files are fetched through `../typ03/open-fonts.ts`, which verifies the upstream Git blob identities already frozen by TYP-03E/F/G. The verified bytes are encoded directly into ignored generated proof CSS as data URIs so browser path resolution cannot silently substitute a system font. Font binaries and generated CSS remain under ignored `publication/.work/` and are never committed.

## Real-content coverage

`prepare.ts` reads and fingerprints canonical project sources and builds representative pages for:

- title + subordinate proof/imprint page;
- generated two-level contents using the real publication manifest and real composite-Part chapter headings;
- Part I division opening;
- numbered Part I entry plus continued body and section/minor hierarchy;
- `Controlled Utility Entry` pattern grammar;
- Appendix A evidence hierarchy;
- running division/entry context + folios;
- first-entry-page running-context suppression;
- internal cross-reference treatment;
- a later recto division start intended to expose parity-blank behaviour.

TOC page numerals are deterministic specimen placeholders. The specimen tests hierarchy and density, not final Working Edition pagination.

## Build

```sh
npx tsx publication/specimens/typ04/build.ts
```

Outputs:

```text
publication/.work/typ04/a4/typ04b-serif-led-a4.pdf
publication/.work/typ04/b5/typ04b-serif-led-b5.pdf
```

Each format also records a `manifest.json` with canonical source hashes, font SHA-256 fingerprints and the candidate role metrics.

## Proof boundary

A green GitHub proof requires both deterministic A4/B5 composition and finished-PDF font inspection. The authoritative proof workflow fails unless both PDFs report the intended Source Serif 4 / Source Sans 3 faces used by this candidate and report no common system fallback such as Liberation.

That proves the candidate was composed with the frozen Source inputs. It does **not** prove that the hierarchy is aesthetically correct.

TYP-04 may freeze visual metrics only after the representative B5 pages have been inspected physically. If the first candidate fails, alter the smallest role that explains the failure; do not reopen the frozen body system or proliferate variants without evidence.
