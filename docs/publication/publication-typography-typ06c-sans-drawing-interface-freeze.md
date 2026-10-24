<!-- nav-exclude: redirect -->
# TYP-06C — publication-sans / drawing interface freeze

Status: **COMPLETE — Source Sans drawing interface physically accepted and frozen**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Owning stage: **#508 — TYP-06 — publication-sans / drawing interface contract**  
Audit packet: **#509 — TYP-06A — publication-sans boundary audit and specimen brief**  
Physical specimen packet: **#511 — TYP-06B — exact Source Sans drawing-interface specimen**  
Closeout packet: **#512 — TYP-06C — physical interface freeze closeout**  
PLT authority: **#422 — PLT — architectural plate refinement programme**  
Protected historical drawing baseline: **`drawing-publication-v1`** / DRW final merge `9865477c21164cb3478d75a679f37df7464115b8`

## 1. Decision

TYP-06 is complete.

The publication/drawing interface is frozen as follows:

- drawing typography consumes **Source Sans 3** as the publication sans family;
- admitted drawing-interface faces are **Regular / 400** and **Bold / 700** only;
- no drawing-specific sans italic role is admitted;
- Source Sans 3 tabular figures are proven usable on the existing `note` role and are available to PLT where numeric alignment earns them;
- exact font inputs must come from the existing TYP pinned Source Sans supply chain, not from whatever font happens to be installed on a renderer host;
- finished-PDF proof must continue to fail closed on system-font fallback;
- the existing semantic drawing roles `label`, `note` and `marker` remain sufficient at this interface;
- the existing central `PUBLICATION_DRAWING_TOKENS` / `renderDrawingSceneSvg()` seam remains the correct shared API boundary;
- individual drawing views must not choose or hard-code a local typeface;
- the physically accepted DRW v1 sizes — **7.5 pt label / 6.5 pt note / 6.5 pt bold marker** — establish proven small-annotation territory for Source Sans 3, but are **not** frozen by TYP as PLT v2 drawing sizes.

The TYP-03 body system, TYP-04 hierarchy system and TYP-05 mixed-content system are unchanged.

## 2. Evidence chain

### TYP-06A — boundary audit

TYP-06A merged through PR **#523** as:

`1544cd60775749fd0d7646ef23c55b2fd8900c4e`

Canonical audit:

`docs/publication/publication-typography-typ06a-sans-drawing-interface-audit.md`

The audit established that no new drawing-typography subsystem was required. The released publication-drawing stack already exposes the correct semantic boundary:

- `compiler/publication-drawing/model.ts` owns semantic drawing text roles;
- `compiler/publication-drawing/tokens.ts` centralises family, size and weight tokens;
- `compiler/publication-drawing/svg.ts` turns those semantic tokens into SVG text CSS;
- Reference House drawing scene builders remain ignorant of font-family identity.

The unresolved TYP question was therefore exact Source Sans identity / rendering proof, not semantic drawing architecture.

### TYP-06B — exact-font drawing proof

The lease-clean final proof harness merged through PR **#529** as:

`44874830560c5398d7409a140ff3c68721e06cca`

Validated proof head:

`c46a057b6d7f3386e712ea46306a8e52008dc05f`

Exact final proof evidence:

- workflow: **TYP-06 drawing-interface proof**;
- run: **40077256819 — SUCCESS**;
- whole-repository/publication validation: **40077256776 — SUCCESS**;
- artifact: **12553472380 — `typ06b-drawing-interface-proof`**;
- artifact digest: `sha256:3ba968bd0b2639f5e559adf1435606647f05be73c3c90a2efc50ce54684579dc`;
- A4 proof: two pages;
- conservative-B5 proof: **two pages, 176 × 250 mm**;
- finished B5 PDF embeds only `SourceSans3-Regular` and `SourceSans3-Bold` from the admitted family set;
- both faces are embedded/subset with Unicode mapping;
- common Arial / Helvetica / Liberation / Times / Georgia fallback is rejected by the workflow.

The proof PDF deliberately contains no Source Sans headings, captions or surrounding specimen furniture. Its only Source Sans text comes from the two inline architectural drawings, so finished-PDF font success cannot be produced by unrelated page furniture while drawing text silently falls back.

### Physical owner verdict

The exact B5 proof from run **40077256819** was handed off for review at **100% / Actual Size**.

On **24 October 2026** the project owner returned the verdict:

`LGTM`

No revision or metric retuning was requested.

This closeout does not manufacture additional qualitative observations from that terse acceptance. The evidenced physical result is that the exact Source Sans drawing-interface proof was accepted without requested change.

## 3. Exact font identity and licence provenance

TYP-06 inherits and freezes the existing TYP Source Sans supply chain rather than creating a second drawing-specific font source.

Authority:

`publication/specimens/typ03/open-fonts.ts`

Upstream pin:

- repository: `adobe-fonts/source-sans`;
- exact upstream commit: `87b37a2daaed80fcb8e8ccb0085c4d72ddade12e`.

Admitted files:

### Regular / 400

- file: `SourceSans3-Regular.ttf`;
- upstream Git blob: `c5dd0b88cc8ff4edd7ebdcefee0290df15529657`;
- proof-byte SHA-256: `4644c81b86ec9caaa76b634889968ed3c4f4f52f054855933acc7c2b21e53b0f`.

### Bold / 700

- file: `SourceSans3-Bold.ttf`;
- upstream Git blob: `85693ccc852fbd7fa4ae9d89d6ccbf6d38f8e0f0`;
- proof-byte SHA-256: `9214b9d95e4231c609802815c2646c98174e2102d0d37f88978a7f8e71006e6a`.

### Licence evidence

- upstream `LICENSE.md` Git blob: `22c601b82f29fc6bb801445098c9f23ffdca4f94`;
- the existing TYP open-font path records the Source Sans input as suitable for PDF embedding under the project proof discipline.

The required downstream rule is stronger than a CSS family string:

1. resolve the exact pinned file;
2. verify its upstream blob identity;
3. transport those verified bytes deterministically into the proof/build boundary;
4. inspect the finished PDF for Source Sans identity;
5. fail closed if a common system fallback appears.

A renderer merely requesting `font-family: Source Sans 3` is not sufficient evidence.

## 4. Proven architectural comparison scope

TYP-06B used real released architectural drawings rather than a synthetic glyph chart.

### Ground-floor plan

Source:

`docs/reference-house/publication-ground-floor-plan.svg`

- physical drawing geometry: **136 × 145 mm**;
- canonical SHA-256 at proof time: `91eec9c3dd32e3a2154cf42c9d8db8525efeb92677289ca78056e0b1aa9c25ba`.

The proof exercised:

- ordinary room/place labels;
- dimensions;
- courtyard multiplication sign;
- scale numerals / units;
- directional/context notes;
- leader-adjacent text;
- the bold `UP` marker.

### Principal longitudinal section

Source:

`docs/reference-house/publication-principal-section.svg`

- physical drawing geometry: **166 × 92 mm**;
- canonical SHA-256 at proof time: `8eac347f8a91faac459572ef46651427cde01fa08da71d55db575ac4aa8dba40`.

The proof exercised:

- multi-line space labels;
- signed level strings including `±0` and positive levels;
- datum-adjacent notes;
- scale numerals / units;
- ordinary section annotations.

### Typography-only transformation proof

The specimen harness changed only three authorised things in temporary proof copies:

1. the released Arial/Helvetica working-family declaration became a specimen-only Source Sans alias;
2. exact pinned Regular/Bold bytes were embedded into the proof SVG;
3. `tabular-nums` was enabled on the existing `note` role.

The harness then removed those changes and required the result to reproduce each protected canonical SVG **byte-for-byte**.

Therefore TYP-06B did not earn its verdict by silently moving labels, changing sizes, editing anchors, altering linework, changing poche, or mutating architectural content.

The committed `drawing-publication-v1` SVGs remained unchanged.

## 5. Frozen interface semantics

### Family

**Source Sans 3** is the drawing-interface family.

PLT may not choose a separate drawing typeface merely because it prefers another face for architectural notation. A different family would be a TYP interface break requiring explicit reopening.

### Weights

The interface admits only:

- **400** — `label`, `note`;
- **700** — `marker` where semantic emphasis requires it.

No intermediate drawing weight is pre-authorised by TYP-06. PLT may propose a new weight only if a concrete drawing task demonstrates that 400/700 cannot express the required hierarchy without another defect.

### Italic

**No Source Sans italic drawing role is admitted.**

Nothing in the released semantic drawing grammar earns it. Future need must be explicit rather than assumed from family completeness.

### Numerals

Source Sans 3 tabular numerals are **physically proven at the drawing interface**.

TYP-06B applied `tabular-nums` to the existing `note` role, which contains dimensions, levels, scale numerals and some prose-like technical notes. The accepted B5 proof exposed no reason to require another family or a dedicated numeric face.

This freezes capability and safety, not indiscriminate use:

- PLT may use tabular figures where alignment materially benefits the drawing;
- PLT owns final drawing-specific numeral application and hierarchy;
- if PLT finds role-wide tabular figures undesirable in a refined v2 note grammar, it may introduce the smallest semantic distinction required without changing family identity.

### Small annotation territory

Source Sans 3 is physically accepted in black-only BOOK territory at:

- `label`: **7.5 pt / 400**;
- `note`: **6.5 pt / 400**;
- `marker`: **6.5 pt / 700**.

These values establish that the family survives this demanding small-size territory.

They do **not** mean TYP has decided that PLT v2 must retain those exact sizes.

## 6. Shared token / API boundary

No new typography API is introduced because the correct seam already exists.

The frozen architecture is:

### Semantic model

`compiler/publication-drawing/model.ts`

Drawing views express only semantic roles such as:

- `label`;
- `note`;
- `marker`.

They do not name typefaces.

### Central drawing tokens

`compiler/publication-drawing/tokens.ts`

`PUBLICATION_DRAWING_TOKENS` remains the single drawing-side point for:

- paper-space text size;
- semantic text weight;
- family request.

The historical v1 value:

`Arial, Helvetica, sans-serif`

is a **protected working value inside `drawing-publication-v1`**, not the frozen TYP family contract.

For v2, PLT must make this seam consume the frozen Source Sans 3 publication identity rather than inventing a local family in individual drawing views.

### SVG renderer

`compiler/publication-drawing/svg.ts`

The renderer continues to derive `.text-label`, `.text-note` and `.text-marker` from the central semantic token set.

### Exact font-resource authority

The font-family token alone does not own font bytes.

Exact Source Sans resource identity comes from the TYP pinned font authority in:

`publication/specimens/typ03/open-fonts.ts`

Any PLT proof that claims to use the frozen interface must either consume that exact resource path directly or consume a later shared production typography integration that preserves the same verified identity.

### No view-local family forks

Reference House plan, section, elevation and analytical scene builders must remain ignorant of `Source Sans 3` as a literal family name.

If a drawing view starts declaring its own family, TYP-06 has been bypassed.

## 7. What remains PLT authority

TYP-06 deliberately does **not** freeze:

- whether 7.5 pt remains the final room/place label size;
- whether 6.5 pt remains the final note / dimension / level size;
- whether 6.5 pt / 700 remains the best final marker treatment;
- final label hierarchy;
- anchor and collision behaviour;
- leader spacing;
- dimension hierarchy;
- text movement required by Source Sans metrics in the refined v2 architecture;
- BOOK versus WALL paper-space size and placement;
- line weights, poche, architectural articulation or drawing composition.

Those are the substance of PLT-03 and later PLT packets.

TYP freezes the substrate. PLT designs the architectural drawing with that real substrate.

## 8. What remains later TYP authority

TYP-06 freezes the interface contract, not production-wide typography integration.

It does not by itself replace every remaining working Arial declaration in:

- `publication/theme.css`;
- `publication/plates.ts`;
- historical `drawing-publication-v1` output.

Those reader-facing working mappings are downstream integration debt for the remaining TYP programme. TYP-07, TYP-08 and TYP-09 must prove representative signatures, the whole book and final production integration before release of `publication-typography-v1`.

TYP-06 is therefore a real hard dependency release for PLT without pretending that the entire publication has already been migrated to final production font plumbing.

## 9. PLT handoff

The hard cross-programme gate is now open:

`TYP-06 → PLT-03 final typography/token freeze`

PLT-03 may now freeze its v2 exemplar typography against the real publication sans rather than temporary Arial/Helvetica metrics.

The PLT handoff contract is:

1. family identity: **Source Sans 3**;
2. admitted faces: **400 + 700**;
3. italic: **not admitted**;
4. tabular figures: **proven and available where alignment earns them**;
5. exact font bytes: use the TYP pinned Source Sans supply chain;
6. finished-PDF proof: fail closed on fallback;
7. drawing semantic roles: retain the central role/token/renderer architecture;
8. v1 7.5 / 6.5 / 6.5 pt sizes: accepted proof territory, **not mandatory v2 tokens**.

PLT remains responsible for proving the final BOOK and WALL drawing embodiments.

## 10. Negative decisions are part of the freeze

TYP-06 does **not** admit:

- a separate architectural/drafting typeface;
- a drawing-local font supply chain;
- Source Sans italic merely for completeness;
- a dedicated numeric face;
- a monospace drawing face;
- arbitrary new font weights;
- view-local family declarations;
- a TYP decision on final PLT annotation geometry;
- a new WALL typography system merely because the sheet is larger.

Any later request for one of these must be earned by a concrete failure against the frozen interface.

## 11. Closeout

TYP-06 is complete and the publication-sans / drawing interface is physically proven.

PLT no longer needs to tune drawing typography against provisional Arial metrics or invent assumptions about the final publication sans.

The durable result is deliberately small:

> **Source Sans 3 Regular + Bold, exact pinned bytes, no italic, tabular figures available where earned, one central semantic drawing-token seam, and physical proof that the family survives the released small architectural annotation territory.**

That is enough to release PLT-03 without stealing PLT's job.

Next TYP stage: **TYP-07 — representative-signature physical proof**.
