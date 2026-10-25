<!-- nav-exclude: redirect -->
# TYP-09C — production release candidate and PLT compatibility

Status: **RELEASE-CANDIDATE PROOF**  
Programme: TYP #425  
Parent: TYP-09 #702  
Packet: #705  
Depends on: TYP-09B #704 / PR #715 / merge `59622075cf67e0bd7592480864ad37b5ef177817`

## Decision

TYP-09C freezes **`publication-typography-v1-rc1`** as the exact production typography release candidate.

This is not a new design pass. RC1 is required to reproduce the already-proven TYP-09B production object byte-for-byte:

- A4: **278 pages / 139 duplex leaves**;
- B5: **335 pages / 168 duplex leaves**;
- B5 planning boundary: **21 × 16-page sections = 336 pages**, therefore **1 page of boundary padding**;
- no spine-width claim until the final paper caliper / manufacturing specification exists;
- finished-PDF font set: Source Serif 4 Regular / Italic / Bold + Source Sans 3 Regular / Bold only.

The machine-readable candidate contract is `publication/release-candidates/typ09c.json`. The dedicated release-candidate workflow rebuilds through the authoritative production path, repeats the TYP-09B production verification and pagination-ledger checks, then rejects any A4/B5 PDF hash drift.

## Exact frozen bytes

RC1 inherits the exact TYP-09B production bytes:

- A4 SHA-256: `4e9c10878cf5382ab303f310be1a3ab1d9ee2b14efb2376a2a0e6e9d4d9698d9`;
- B5 SHA-256: `fa186bf847d319b99d0af413742a77c932d24312cf35742f4ece87d5e2d4b255`.

A TYP-09C proof is green only when the newly built PDFs reproduce those identities exactly. This turns the final release candidate into an object identity, not merely a configuration claim.

## Cold PDF review

Before freezing RC1, the exact B5 production artifact from TYP-09B run `40199097721` / artifact `12600940982` was reviewed cold as a PDF object rather than inferred from CSS.

Sampled B5 pages:

`1, 2, 23, 59, 85, 103, 215, 216, 230, 231, 240, 273, 335`

The sample deliberately spans:

- principal title page;
- imprint / provenance;
- all five Part thresholds;
- an ordinary internal chapter opening;
- ordinary prose within the Reference House section;
- the Part IV transition;
- principal longitudinal-section plate title and drawing;
- Part V technical prose;
- dense source / reference material.

Result: **PASS — no new typography design question exposed.**

Observed publication-level behaviour remains coherent:

- title and provenance remain separated;
- Part openings retain the restrained TYP-04 threshold composition;
- ordinary chapter/prose hierarchy remains legible without becoming report-like;
- the Reference House transition reads as part of the same book;
- architectural plate typography remains subordinate to the drawing;
- dense source material remains readable within the frozen mixed-content system.

This is a screen/PDF cold review. It is **not** the final TYP-09D physical-owner verdict.

## PLT compatibility — exact boundary

TYP-09C does not pretend that `drawing-publication-v2` exists.

PLT is still before its v2 exemplar/token freeze. The current central drawing token therefore still contains the protected `drawing-publication-v1` working value `Arial, Helvetica, sans-serif`. TYP-06 explicitly classified that as a historical v1 value, not the final family contract.

The frozen TYP→PLT interface remains:

- family: **Source Sans 3**;
- admitted drawing-interface weights: **400 Regular + 700 Bold**;
- drawing sans italic: **not admitted**;
- tabular figures: available where numeric alignment earns them;
- exact font bytes: the pinned TYP Source Sans supply chain;
- finished-PDF proof: fail closed on fallback;
- semantic API: central `PUBLICATION_DRAWING_TOKENS` / renderer seam;
- drawing views may not fork a local family.

Therefore the present compatibility verdict is:

**`CONTRACT_COMPATIBLE_PRE_V2`**

Meaning:

1. TYP has frozen the exact family/resource contract PLT is required to consume;
2. no competing PLT v2 family or local fork exists;
3. TYP does not mutate the protected v1 drawing token merely to make a release checkbox pass;
4. before `drawing-publication-v2` release, PLT must migrate its central v2 token seam to Source Sans 3 and re-prove BOOK/WALL outputs under its own authority.

This is a deliberate dependency handoff, not an unresolved typography design question.

## Release boundary

After an exact green TYP-09C proof, the only TYP-owned evidence still missing is the final physical review of the exact B5 RC1 artifact.

TYP-09D must then:

- record the exact RC1 head/run/artifact/digest;
- obtain and record the owner physical verdict exactly as supplied;
- reject any post-proof polishing that is not an explicit freeze break;
- if accepted, release/tag `publication-typography-v1` from the exact validated integration state;
- preserve the 278/335 pagination ledger and the manufacturing-only spine-width unknown;
- hand the frozen typography contract to PR-02;
- retain the explicit PLT v2 join condition rather than blocking the typography release on a drawing object that does not yet exist.

No physical verdict is inferred in TYP-09C.
