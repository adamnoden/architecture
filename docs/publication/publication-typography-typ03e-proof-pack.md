<!-- nav-exclude: redirect -->
# TYP-03E — blind B5 proof pack and pinned open-font inputs

Status: **implemented proof-pack handoff; physical reading still required**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Packet: **#461 — TYP-03E — blind B5 proof pack and pinned open-font inputs**  
Depends on: TYP-03A specimen harness + TYP-03B licence boundary + TYP-03C physical review protocol + TYP-03D affordability/value frontier

## 1. Purpose

TYP-03E turns the review protocol into a reproducible local proof workflow.

It does **not** choose a typeface. It closes the machinery gap between “these are the five candidates” and a physical anonymous B5 reading session.

The governing boundary remains:

- open fonts may be fetched from exact pinned upstream commits, verified and embedded;
- proprietary evaluation fonts remain local;
- a proprietary candidate enters an automated PDF pack only when the operator has established `pdf-embed-ok` rights for the exact files supplied;
- preview-only trial fonts remain preview-only and are never converted into PDFs by this machinery.

No production typography changes here.

---

## 2. Open-font pins

The proof harness no longer depends on a live Google Fonts stylesheet or on an unpinned family name.

### Source Serif 4

Upstream: `adobe-fonts/source-serif`  
Pinned commit: `80d3f8894c09c937bebfa9011247d2e1c79fd6f4`

| role | path | Git blob |
|---|---|---|
| regular | `TTF/SourceSerif4-Regular.ttf` | `964a2bf8934182485cf4e2348c8443091739334f` |
| italic | `TTF/SourceSerif4-It.ttf` | `e818087d0c75997a38189f6cf578c468df175062` |
| bold | `TTF/SourceSerif4-Bold.ttf` | `c4159ff2a409d9224dfa97af4e5167817e91e833` |
| licence | `LICENSE.md` | `5871e1f3d1b3362453b3a1f6c493fbefdbd3dcf3` |

### Source Sans 3

Upstream: `adobe-fonts/source-sans`  
Pinned commit: `87b37a2daaed80fcb8e8ccb0085c4d72ddade12e`

| role | path | Git blob |
|---|---|---|
| regular | `TTF/SourceSans3-Regular.ttf` | `c5dd0b88cc8ff4edd7ebdcefee0290df15529657` |
| bold | `TTF/SourceSans3-Bold.ttf` | `85693ccc852fbd7fa4ae9d89d6ccbf6d38f8e0f0` |
| licence | `LICENSE.md` | `22c601b82f29fc6bb801445098c9f23ffdca4f94` |

### Newsreader

Upstream: `productiontype/Newsreader`  
Pinned commit: `cfcb4f7af0e52c25e8df2a2431814c8e5fe2e155`

| role | path | Git blob |
|---|---|---|
| roman variable | `fonts/variable/ttf/Newsreader[opsz,wght].ttf` | `ad4a9a8c44ec328c80b61c773f1ba02f6b5ed292` |
| italic variable | `fonts/variable/ttf/Newsreader-Italic[opsz,wght].ttf` | `d25879656a601d44c49836f9e773d100190c62e1` |
| licence | `OFL.txt` | `d2d4f407109e9c74b8ab502fc79b912408ab8e41` |

The Newsreader roman variable file supplies both the 400 and 700 proof slots. Its optical-size axis is allowed to operate through `font-optical-sizing: auto`.

`open-fonts.ts` verifies each downloaded byte sequence against Git’s blob hash before writing it to the ignored local work area. The ordinary specimen manifest then records SHA-256 fingerprints of the exact files actually rendered.

The network is therefore a **retrieval transport**, not an identity authority.

---

## 3. Blind identity boundary

`prepare.ts` now accepts:

```sh
TYP03_BLIND_LABEL=A
```

When present:

- the printed specimen says `Set A`, not the candidate name;
- the Vivliostyle document title says `Set A`;
- the PDF filename uses `set-a`;
- the true candidate remains only in the non-printed manifest/evidence record.

Valid labels are 1–32 uppercase letters, digits or hyphens.

This is sufficient for physical blindness. It is not intended to resist forensic inspection of the local work directory by the person who prepared the pack.

---

## 4. Open-only shakedown

Run:

```sh
npx tsx publication/specimens/typ03/proof-pack.ts --open-only
```

Optional composition controls remain:

```sh
TYP03_RHYTHM=indented \
TYP03_ALIGN=justified \
npx tsx publication/specimens/typ03/proof-pack.ts --open-only
```

This builds:

- `BASELINE` — Georgia / Arial before-state;
- `SHAKEDOWN-A` — Source Serif 4 + Source Sans 3;
- `SHAKEDOWN-B` — Newsreader + Source Sans 3.

All are conservative B5 PDFs.

**This pack is not admissible final TYP-03 decision evidence.** Three finalists are absent. It exists to prove scale, printer behaviour, open-font reproduction and proof machinery before any proprietary-font handling is needed.

---

## 5. Full anonymous pack

A full pack contains:

- BASELINE;
- five finalists randomly mapped to A / B / C / D / E.

Run:

```sh
npx tsx publication/specimens/typ03/proof-pack.ts --full
```

The open candidates are fetched and verified automatically.

The three proprietary candidates must be supplied locally through candidate-scoped environment variables.

### Lyon Text + Atlas Grotesk

```text
TYP03_LYON_ATLAS_SERIF_REGULAR
TYP03_LYON_ATLAS_SERIF_ITALIC
TYP03_LYON_ATLAS_SERIF_BOLD
TYP03_LYON_ATLAS_SANS_REGULAR
TYP03_LYON_ATLAS_SANS_BOLD
TYP03_LYON_ATLAS_FONT_RIGHTS
```

### Tiempos Text + Söhne

```text
TYP03_TIEMPOS_SOEHNE_SERIF_REGULAR
TYP03_TIEMPOS_SOEHNE_SERIF_ITALIC
TYP03_TIEMPOS_SOEHNE_SERIF_BOLD
TYP03_TIEMPOS_SOEHNE_SANS_REGULAR
TYP03_TIEMPOS_SOEHNE_SANS_BOLD
TYP03_TIEMPOS_SOEHNE_FONT_RIGHTS
```

### Scala Pro + Scala Sans Pro

```text
TYP03_SCALA_SERIF_REGULAR
TYP03_SCALA_SERIF_ITALIC
TYP03_SCALA_SERIF_BOLD
TYP03_SCALA_SANS_REGULAR
TYP03_SCALA_SANS_BOLD
TYP03_SCALA_FONT_RIGHTS
```

For automated PDF construction each rights variable must be exactly:

```text
pdf-embed-ok
```

If any proprietary candidate is only licensed for local preview, `--full` deliberately refuses to run. Use the existing `vivliostyle preview` route with a blind label and print only by a method permitted by the accepted licence. Do not use browser/PDF-save as a workaround.

---

## 6. Pack output

Generated files live under:

```text
publication/.work/typ03-proof-packs/<pack-id>/
```

The directory contains:

- blind PDFs;
- `PRINT-ME.txt`;
- `private/` containing the per-set manifests and `PRIVATE-MAPPING.json`.

`private/PRIVATE-MAPPING.json` is the reveal key. Put the whole `private/` directory out of sight before reading.

A deterministic human-readable pack id may be supplied with:

```sh
TYP03_PACK_ID=round1-spaced-ragged \
npx tsx publication/specimens/typ03/proof-pack.ts --full
```

Otherwise the script creates a timestamped id.

The work area is evidence, not tracked publication source.

---

## 7. Physical handoff

For the **full** pack:

1. print BASELINE and Sets A–E at **100% / actual size**;
2. use the same printer;
3. use the same print-quality setting;
4. use the same paper batch;
5. keep the physical sheets anonymous;
6. put the entire `private/` directory away;
7. conduct the TYP-03C reading procedure;
8. freeze written anonymous verdicts before revealing A–E;
9. reveal identities;
10. only then apply the TYP-03D affordability/value rule.

The first run should not become a giant factorial test. Use the protocol’s elimination logic across paragraph rhythm and alignment.

---

## 8. What this packet proves

TYP-03E proves that:

- the two free candidates have exact reproducible upstream identities;
- their licence texts are retrieved from the same pinned commits as their font files;
- open-font bytes fail closed on integrity mismatch;
- printed/PDF candidate identity can be blinded;
- a complete A–E PDF pack cannot silently include preview-only proprietary fonts;
- the private mapping and rendered manifests remain available for later evidence;
- conservative B5 is mechanically ready for the actual reading decision.

It does **not** prove that Source or Newsreader is beautiful enough.

That requires paper.

---

## 9. Close condition

TYP-03E may close when its scripts typecheck, repository validation is green, and the packet is merged.

TYP-03 itself remains open until the physical reading has frozen:

- body face;
- size;
- leading;
- measure;
- paragraph rhythm;
- alignment/hyphenation;
- explicit loser reasons;
- final value decision.

No later packet may infer a winner from the existence of this proof machinery.
