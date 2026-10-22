<!-- nav-exclude: redirect -->
# TYP-03F — Source selection and exact physical confirmation

Status: **selected direction; exact physical confirmation still required**  
Programme authority: GitHub issue **#425 — TYP — Publication Typography Programme**  
Packet: **#467 — TYP-03F — physical body-text reading and freeze**  
Depends on: TYP-03C physical review protocol + TYP-03D affordability/value frontier + TYP-03E pinned proof machinery

## 1. Decision

The project owner has selected the open typography direction:

- **body serif — Source Serif 4**;
- **publication sans — Source Sans 3**.

This is a deliberate project decision after physical comparison of the two open directions. The Source system was preferred to the Newsreader system, and the project owner chose not to spend further time or money acquiring the proprietary finalists.

This decision **does not claim** that the originally planned five-finalist anonymous physical comparison was completed.

The selection path changed explicitly: once the open Source direction proved convincing enough on paper, the TYP-03D value rule and the owner's zero/minimal-cost preference made continued proprietary acquisition unjustified absent a concrete defect in Source.

## 2. Candidate disposition

### Source Serif 4 + Source Sans 3

**SELECTED DIRECTION.**

The open-font shakedown established a physical preference for the Source direction. A later confirmation sheet using Source Serif 4 rather than the earlier Source Serif Pro proxy preserved that preference.

The repo-pinned Source inputs remain the identity authority. The temporary confirmation sheet used outside the repo is supporting evidence only and does not replace exact pinned proof.

### Newsreader + Source Sans 3

**REJECTED AS THE OPEN BODY CHALLENGER.**

The recorded physical result is intentionally narrow: the owner preferred the Source direction. No stronger invented claim about Newsreader's page colour, delicacy, manner, italic or reproduction quality is warranted from the evidence recorded so far.

### Lyon Text + Atlas Grotesk; Tiempos Text + Söhne; Scala Pro + Scala Sans Pro

**WITHDRAWN ON VALUE / PROCUREMENT GROUNDS, NOT DECLARED AESTHETIC LOSERS.**

The proprietary systems were not physically proved against Source in the full blind A–E pack. They therefore must not be described as having lost an aesthetic comparison.

They are removed from the active selection path because the project owner does not consider purchase/licence effort worthwhile now that an open system is already preferred. Reopening a paid candidate requires a specific physical or functional defect in Source that the existing open system cannot solve.

## 3. Exact identity boundary

Final TYP-03 proof must use the pins already frozen by TYP-03E:

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

`open-fonts.ts` remains responsible for retrieving those exact upstream files and failing closed if their Git blob identities do not match.

## 4. Selected-system proof mode

TYP-03F adds a narrow selected-system path to the existing proof harness:

```sh
npx tsx publication/specimens/typ03/proof-pack.ts --selected
```

This builds only the chosen Source Serif 4 + Source Sans 3 B5 specimen using the exact pinned open-font inputs.

The output is **admissible for selected-system physical confirmation and body-metric freeze**. It is explicitly **not** evidence of a completed five-finalist blind comparison.

Default confirmation geometry remains the existing common envelope:

- body size: `10.5pt`;
- leading: `1.5`;
- B5 practical measure: `112mm`;
- paragraph rhythm: `spaced`;
- alignment: `ragged`.

## 5. Bounded second-pass tuning

TYP-03C allows only surviving candidates to receive bounded tuning. Because Source is now the selected direction, the harness exposes exactly the three quantitative controls that remain legitimate to tune:

```sh
TYP03_BODY_SIZE_PT=10.5 \
TYP03_LEADING=1.5 \
TYP03_MEASURE_MM=112 \
npx tsx publication/specimens/typ03/proof-pack.ts --selected
```

These values are recorded in the specimen manifest. Existing defaults are unchanged when the variables are omitted.

Paragraph rhythm and composition remain the existing explicit controls:

```sh
TYP03_RHYTHM=spaced|indented
TYP03_ALIGN=ragged|justified
```

Do not turn this into a large factorial optimisation. Begin from the default Source confirmation. Alter a value only when the physical page identifies a specific reading problem worth correcting.

## 6. Physical confirmation gate

Print the selected pack at **100% / actual size** on the same printer and paper assumptions used for the previous physical judgement.

Read normally before inspecting glyphs.

Confirm or adjust only what the physical page earns:

- body size;
- leading;
- practical measure;
- spaced paragraphs versus first-line indentation;
- ragged-right versus justified composition;
- hyphenation consequence of that composition choice;
- widow/orphan posture;
- roman/italic relationship.

The exact pinned proof should also confirm that the earlier preference was not an artefact of the temporary proxy build.

## 7. Freeze boundary

TYP-03F may close only when the project owner has read the exact pinned Source specimen on paper and the final body reading system is recorded.

Until then:

- **face direction is selected**;
- **commercial acquisition is retired**;
- **production `publication/theme.css` is not yet changed**;
- TYP-04 must not silently substitute its own body metrics;
- TYP-03 must not be described as physically frozen.

Once that exact physical confirmation is complete, record the final metrics and composition policy here, close #467, and advance to TYP-04.
