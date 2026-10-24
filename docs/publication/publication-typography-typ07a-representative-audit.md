<!-- nav-exclude: redirect -->
# TYP-07A — representative corpus manifest and build-boundary audit

Status: **CANDIDATE COMPLETE — merge required**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Owning stage: **#541 — TYP-07 — representative-signature physical proof**  
Packet: **#542 — TYP-07A — representative corpus manifest and build-boundary audit**  
Inherited TYP-06 freeze: `docs/publication/publication-typography-typ06c-sans-drawing-interface-freeze.md`

## 1. Decision

TYP-07 will not prove the accepted typography by applying `publication/theme.css` to the current full book.

The production theme is still intentionally the historical Working Edition system. It remains useful as the controlled pre-TYP baseline, but it materially differs from the physically accepted TYP-03/04/05/06 contracts. Using it directly would produce a false representative proof.

TYP-07B will therefore use a **bounded representative specimen harness** built from real canonical Ovid’s House sources and real controlled figure/plate assets. It will reproduce the frozen typography contracts in proof space, transport the exact pinned Source font bytes, and leave production-wide integration to later TYP work.

This is the narrowest truthful seam because it proves the book system across real mixed page types without silently rewriting production before the whole-book red team has had a chance to expose integration conflicts.

Executable source-selection authority:

`publication/specimens/typ07/manifest.ts`

Executable audit:

`publication/specimens/typ07/audit.ts`

## 2. Current Working Edition composition path

The ordinary Working Edition path remains:

1. `publication/publication.ts` defines the canonical ordered manifest;
2. `publication/scripts/prepare.ts --full` copies canonical sources into `publication/.work/source`, applies publication adapters, injects controlled figures/plates and rewrites links without mutating source;
3. `publication/vivliostyle.config.js` points Vivliostyle at the prepared multi-entry publication;
4. `publication/theme.css` supplies the current working print theme;
5. the full output is built at A4.

That pipeline remains authoritative for the current Working Edition, but not yet for the accepted TYP visual system.

## 3. Production seams that remain deliberately unfrozen

### `publication/theme.css`

The working theme still contains pre-TYP assumptions including:

- Georgia/Cambria/Times as the serif stack;
- Arial/Helvetica as the sans stack;
- a system monospace stack;
- `hyphens: auto` rather than the frozen ragged/no-hyphen body posture;
- a sans 34 pt book title rather than the frozen Source Serif 4 31 pt title;
- a sans 28 pt Part opening rather than the frozen Source Serif 4 24 pt division opening;
- generic sans H1–H6 treatment rather than the frozen entry/section/minor role architecture;
- a 23 pt sans contents title and dot leaders rather than the frozen 20 pt serif title, two-level rows and separate page-number column;
- 7.5 pt direct-Arial running heads instead of the frozen Source Sans 3 7.2 pt running-context role;
- ordinary underlined links rather than quiet internal cross-references;
- generic 8.2 pt tables rather than the TYP-05 selective 8.5 pt compact-table role;
- generic mono `code`/`pre` styling although TYP-05 found no current reader-facing code class that earns a publication mono family;
- A4-only page geometry rather than conservative 176 × 250 mm B5 proof territory.

These are **integration debt, not newly discovered typography decisions**. TYP-07A does not authorise changing them globally.

### `publication/plates.ts`

The canonical plate placement/furniture registry already carries the accepted TYP-05 plate-furniture sizes:

- title 11 pt bold;
- scale 8.3 pt;
- caption 8.3 pt / 1.35.

But the implementation still hard-codes Arial/Helvetica because the released DRW v1 publication object predates the TYP freeze.

TYP-07B must reuse the real registry metadata while applying Source Sans only inside the bounded proof harness.

### DRW v1 drawing-internal typography

The real architectural SVG assets remain the protected `drawing-publication-v1` release. Their internal working-family declarations are still Arial/Helvetica.

TYP-06 physically proved that the same released drawing geometry can carry exact Source Sans 3 Regular/Bold with no fallback by changing only the typography seam in temporary specimen copies and proving reversibility byte-for-byte.

TYP-07B therefore **must use real plate assets but may only rebind their typography in temporary proof copies using the TYP-06 method**. It must not mutate canonical DRW v1 SVGs or pre-empt PLT's v2 drawing-size/placement decisions.

## 4. Frozen representative corpus

The representative proof is not a random sample. Each unit exists to cover a required page class with real reader-facing material.

| Proof obligation | Frozen source / identity | Why it is in the proof |
|---|---|---|
| Continuous prose spread | `docs/manuscript/part-i.md` — `# 1. The house after completion` | sustained body colour, references, block quotation, emphasis and ordinary prose rhythm |
| Division / entry opening | Part I + first chapter | real threshold between Part identity and chapter entry using TYP-04 opening roles |
| Contents / navigation | canonical `publicationEntries` plus real Part headings | proves the actual book hierarchy without invented titles or dot leaders |
| Compact table | Part V — `## Four burdens of provision` / B0–B3 table | accepted compact analytical-table treatment |
| Mixed technical page | Appendix C — `## Implementation schedule` | accepted labelled-record solution for long technical schedule prose |
| Inline FLOW figure | Part II — `figures/failure-architecture-sequence.svg` | real controlled FLOW asset adjacent to prose and real caption |
| Dedicated architectural plate | Principal front elevation | real DRW plate, scale/title/caption furniture and drawing adjacency |
| Paired plate spread | Ground-floor plan + First-floor plan | real facing architectural pair and gutter/spread rhythm |
| Caption-heavy page | Part III — pattern-language fields/sequence figure | longest current controlled inline-figure caption with real asset |
| Dense evidence/reference page | `docs/manuscript/sources-and-further-reading.md` | sustained bibliography, italics and long breakable URLs |

The machine manifest is the precise authority if this prose summary and executable selection ever diverge.

## 5. Font-face coverage

The selected corpus collectively exercises every currently admitted publication face:

- Source Serif 4 Regular;
- Source Serif 4 Italic;
- Source Serif 4 Bold;
- Source Sans 3 Regular;
- Source Sans 3 Bold.

No Source Sans italic, mono or display-math face is introduced.

TYP-07B must fail if the finished PDF does not contain the Source faces actually required by the selected pages or if Arial, Helvetica, Liberation, Times, Georgia or another common system fallback is embedded as a substitute for the frozen publication typography.

## 6. TYP-07B build boundary

TYP-07B should create `publication/specimens/typ07/` proof machinery with the following constraints.

### Canonical-content rule

- read the exact source paths frozen by `manifest.ts`;
- verify the frozen headings/registry identities before extraction;
- use publication adapters where a selected reader-facing passage depends on them;
- use the canonical figure and plate registries rather than retyping captions, titles or scales by hand;
- use real FLOW SVGs and architectural plate SVGs, not neutral placeholders.

### Typography rule

- reuse the TYP-03 pinned Source font supply chain;
- transport verified bytes deterministically into proof CSS;
- implement the accepted TYP-03 body, TYP-04 hierarchy/navigation and TYP-05 mixed-content metrics exactly;
- do not use production `theme.css` as visual authority;
- do not shrink or fit-scale type to solve a local page problem.

### Drawing rule

For selected DRW v1 SVGs:

- copy the canonical bytes into temporary proof space;
- apply only the reversible TYP-06 Source Sans family/feature rebinding;
- preserve scene geometry, text positions, rotations, line/poche grammar and paper-space text sizes;
- prove that removing the injected font/feature rules and restoring the working-family declaration reproduces canonical bytes exactly;
- treat any width/collision problem exposed by real Source Sans as evidence, not as permission for TYP to move labels.

PLT remains the owner of final drawing-specific typography.

## 7. Physical formats

### A4 regression proof

- A4;
- 23 mm top / 24 mm bottom;
- 30 mm inner / 22 mm outer;
- 125 mm body measure;
- frozen type metrics unchanged.

### Conservative B5 proof

- 176 × 250 mm;
- 20 mm top / bottom;
- 23 mm inner / 18 mm outer;
- 112 mm body measure;
- frozen type metrics unchanged.

No fit-scaling of the page or typography is permitted between the two outputs.

B5 is the decisive physical review territory.

## 8. Required TYP-07B gates

The next packet must fail closed unless all of the following hold:

1. every manifest proof class resolves to its exact canonical source/registry identity;
2. all real figure/plate assets exist;
3. exact pinned Source font inputs are verified before use;
4. the finished PDF embeds only the required Source publication faces for book typography and temporary drawing proof typography;
5. common system-font fallback is absent;
6. A4 and B5 page geometry matches the frozen proof territory;
7. no typography metric is fit-scaled between formats;
8. no selected drawing's canonical bytes are mutated;
9. proof page ordering is deterministic;
10. the B5 artifact is handed off for actual-size physical review.

## 9. Page-count and book-block implication

A representative signature is not the whole book, so its raw page count must not be multiplied naively into a final spine estimate.

TYP-07B should record two distinct values:

- **representative proof extent** — exact A4/B5 pages in the specimen;
- **bounded whole-book implication** — a deterministic estimate based on applying the accepted body/hierarchy/mixed-content metrics to the current canonical entry corpus or another explicitly stated counting method.

If a trustworthy whole-book count cannot be obtained without effectively performing TYP-08 integration, TYP-07B should say so and record only directional implications. It must not manufacture precision.

TYP-08 remains the first stage authorised to judge the full candidate book as a typographic corpus.

## 10. What TYP-07A does not authorise

This packet does not authorise:

- global migration of `publication/theme.css`;
- production plate-font migration;
- mutation of `drawing-publication-v1`;
- final PLT drawing sizes, anchors or collisions;
- a new typeface search;
- a mono/math family;
- manuscript rewriting to make a proof fit;
- a full-book typography verdict.

## 11. Result

TYP-07 now has a bounded, executable representative corpus and a clear build boundary.

The important conclusion is that the representative proof must combine **real canonical book content** with **specimen-only frozen typography integration**. Building the present Working Edition unchanged would test the wrong type system; globally migrating production first would collapse TYP-07 into TYP-08/09.

Next authorised packet after a clean TYP-07A merge: **#543 — TYP-07B — exact-font representative signature proof**.
