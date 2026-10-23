<!-- nav-exclude: redirect -->
# TYP-03F — Source selection and exact physical confirmation

Status: **COMPLETE — corrected exact-font body reading system physically re-confirmed and frozen**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Packet: **#467 — TYP-03F — physical body-text reading and freeze**  
Depends on: TYP-03C physical review protocol + TYP-03D affordability/value frontier + TYP-03E pinned proof machinery + TYP-03G rendered-font identity correction

## 1. Decision

The project owner has selected and physically accepted the open typography direction:

- **body serif — Source Serif 4**;
- **publication sans — Source Sans 3**.

This is a deliberate project decision after physical comparison of the two open directions. The Source system was preferred to the Newsreader system, and the project owner chose not to spend further time or money acquiring the proprietary finalists.

This decision **does not claim** that the originally planned five-finalist anonymous physical comparison was completed.

The selection path changed explicitly: once the open Source direction proved convincing enough on paper, the TYP-03D value rule and the owner's zero/minimal-cost preference made continued proprietary acquisition unjustified absent a concrete defect in Source.

## 2. Candidate disposition

### Source Serif 4 + Source Sans 3

**SELECTED AND FROZEN.**

The open-font shakedown established a physical preference for the Source direction. A later confirmation sheet using Source Serif 4 rather than the earlier Source Serif Pro proxy preserved that preference. The final corrected exact-pinned B5 proof then passed physical owner review without earning any metric or composition change.

### Newsreader + Source Sans 3

**REJECTED AS THE OPEN BODY CHALLENGER.**

The recorded physical result is intentionally narrow: the owner preferred the Source direction. No stronger invented claim about Newsreader's page colour, delicacy, manner, italic or reproduction quality is warranted from the evidence recorded.

### Lyon Text + Atlas Grotesk; Tiempos Text + Söhne; Scala Pro + Scala Sans Pro

**WITHDRAWN ON VALUE / PROCUREMENT GROUNDS, NOT DECLARED AESTHETIC LOSERS.**

The proprietary systems were not physically proved against Source in the full blind A–E pack. They therefore must not be described as having lost an aesthetic comparison.

They are removed from the active selection path because the project owner does not consider purchase/licence effort worthwhile now that an open system is physically accepted. Reopening a paid candidate requires a specific physical or functional defect in Source that the frozen open system cannot solve.

## 3. Exact identity boundary

The frozen TYP-03 system uses the pins already established by TYP-03E:

### Source Serif 4

- upstream: `adobe-fonts/source-serif`
- commit: `80d3f8894c09c937bebfa9011247d2e1c79fd6f4`
- regular blob: `964a2bf8934182485cf4e2348c8443091739334f`
- italic blob: `e818087d0c75997a38189f6cf578c468df175062`
- bold blob: `c4159ff2a409d9224dfa97af4e5167817e91e833`

### Source Sans 3

- upstream: `adobe-fonts/source-sans`
- commit: `87b37a2daaed80fcb8e8ccb0085c4d72ddade12e`
- regular blob: `c5dd0b88cc8ff4edd7ebdcefee0290df15529657`
- bold blob: `85693ccc852fbd7fa4ae9d89d6ccbf6d38f8e0f0`

`open-fonts.ts` retrieves those exact upstream files and fails closed if their Git blob identities do not match. TYP-03G additionally proves the finished PDF's rendered font identity with `pdffonts`; verified inputs alone are not sufficient evidence.

## 4. Corrected exact selected-system proof

The selected-system proof path is:

```sh
npx tsx publication/specimens/typ03/proof-pack.ts --selected
```

The first formal selected proof, workflow run `39817623755`, is **superseded and inadmissible as exact-font evidence**. TYP-04B inspection showed that its verified Source inputs were not actually loaded by Vivliostyle and the PDF embedded Liberation fallbacks. See `docs/publication/publication-typography-typ03g-font-identity-correction.md`.

The accepted proof is the corrected build generated after deterministic data-URI font transport and fail-closed rendered-font inspection were added.

Corrected evidence:

- correction implementation: PR **#482**, merged as `912dbf14bb7733e4ca84e2d8a7754e7254360ef2`;
- ordinary validation run: **39859180904 — SUCCESS**;
- corrected selected-proof run: **39859180939 — SUCCESS**;
- artifact: **12461610257 — `typ03f-source-confirmation`**;
- artifact digest: `sha256:d6fb39aecd082e294943280e6a7e416bd225e62d9354a101849f668c8f8cef66`;
- proof PDF: `typ03-set-selected-b5-spaced-ragged.pdf`;
- rendered-font identity gate: **PASS** before artifact upload;
- independently observed embedded/subset faces: `SourceSerif4-Regular`, `SourceSerif4-It`, `SourceSerif4-Bold`, `SourceSans3-Regular`, `SourceSans3-Bold`;
- common system fallback check: **no Liberation fallback observed**.

The project owner physically re-confirmed the corrected exact-font B5 sheet on **23 October 2026** and reported it looked good. No metric or composition change was earned.

This evidence is admissible for the selected-system physical confirmation and body-metric freeze. It remains explicitly **not** evidence of a completed five-finalist blind comparison.

## 5. Frozen body reading system

The corrected exact-pinned B5 proof was physically reviewed by the project owner and accepted as-is. No bounded second-pass adjustment was earned.

TYP-03 therefore freezes:

- body serif: **Source Serif 4**;
- companion publication sans: **Source Sans 3**;
- body size: **10.5 pt**;
- leading: **1.5**;
- conservative-B5 practical measure: **112 mm**;
- paragraph rhythm: **spaced paragraphs**;
- composition: **ragged-right**;
- hyphenation under the frozen ragged composition: **off**;
- widow/orphan posture: **3 / 3** where supported by the composition engine;
- emphasis: **true Source Serif 4 italic**, not synthetic oblique;
- ordinary roman: **Source Serif 4 regular**;
- bold emphasis where semantically required: **Source Serif 4 bold**.

These values are a coherent reading system, not independent knobs. Later packets must not retune them merely to make a local page easier to style.

A change to any of these requires a concrete freeze-break reason and renewed physical proof.

## 6. Value / licence freeze

- Source Serif 4 + Source Sans 3 wins the active selection path.
- The system is zero-cost/open and has deterministic pinned upstream identities.
- Newsreader is the rejected open challenger.
- Commercial candidates are retired on value/procurement grounds rather than falsely described as aesthetic losers.
- No proprietary acquisition is authorised unless a concrete defect in the frozen Source system appears later and cannot be solved within the open system.

## 7. Production boundary

TYP-03 freezes the **body reading contract**. It does not by itself perform the final production-wide typography integration.

Therefore:

- the frozen Source identities and body metrics are now mandatory inputs to TYP-04 and later TYP packets;
- TYP-04 may design hierarchy/openings/navigation around this body system but may not reopen it silently;
- TYP-05 may test difficult technical material without fragmenting the body voice;
- TYP-06 remains the explicit publication-sans / drawing interface gate for PLT;
- final production token integration and release remain under the later TYP programme gates.

## 8. Closeout

TYP-03F is complete after one explicit freeze break and correction.

The original closeout was withdrawn when rendered-font inspection falsified its exact-font claim. The corrected proof chain now establishes both exact upstream font identity and exact rendered PDF font identity, followed by renewed physical owner acceptance.

The body-reading question is therefore no longer open-ended. The book has a physically accepted text system with exact upstream identity, rendered-font verification, reproducible proof machinery, frozen composition metrics and a clear value/licensing posture.

Next authorised packet: **#478 — TYP-04 — hierarchy, openings and navigation**.
