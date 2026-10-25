<!-- nav-exclude: redirect -->
# TYP-09D.1 — serif emphasis freeze break and RC2 proof

Status: **MECHANICALLY COMPLETE / OWNER PHYSICAL VERDICT PENDING**  
Programme: TYP #425  
Parent: TYP-09 #702  
Closeout parent: TYP-09D #706  
Packet: #758  
Implementation PR: #761

## Trigger

The exact `publication-typography-v1-rc1` B5 object reached owner review. The owner supplied the following bounded defect rather than acceptance:

> “Overall looks good. I guess one thing that pops out at this late stage is the bold seems too bold. It could come down a notch.”

RC1 therefore remains immutable historical evidence but is **not accepted** and cannot become `publication-typography-v1`.

## Freeze break

The correction is deliberately one family-weight step and no more:

- serif emphasis: **Source Serif 4 Bold / 700 → Source Serif 4 Semibold / 600**;
- exact Source Serif upstream commit remains `80d3f8894c09c937bebfa9011247d2e1c79fd6f4`;
- Semibold source path: `TTF/SourceSerif4-Semibold.ttf`;
- Semibold Git blob SHA: `151e9a9d5c08dfd4751650ab4bff92771a132888`;
- ordinary prose `strong` and the same serif-emphasis role used for schedule subjects consume 600;
- Source Serif Regular/400 and Italic/400 are unchanged;
- Source Sans 3 Regular/400 + Bold/700 are unchanged;
- drawing typography is unchanged;
- body size, leading, measure, rag, hierarchy geometry, manuscript content and plate geometry are unchanged.

The implementation declares the Semibold face honestly as weight `600`; it does not put Semibold outlines behind a synthetic `700` declaration.

## Finished font set

Both production formats contain exactly five embedded/subset/Unicode-mapped faces:

- `SourceSerif4-Regular`;
- `SourceSerif4-It`;
- `SourceSerif4-Semibold`;
- `SourceSans3-Regular`;
- `SourceSans3-Bold`.

## Book-block consequence

The lighter serif emphasis has a small but real B5 composition consequence and it is retained rather than compensated away.

| Format | RC1 | RC2 | RC2 duplex leaves | 16-page boundary | Padding to boundary |
| --- | ---: | ---: | ---: | ---: | ---: |
| A4 | 278 pages | **278 pages** | 139 | 288 | 10 |
| B5 | 335 pages | **333 pages** | 167 | 336 | 3 |

RC2 therefore removes two B5 pages and one duplex leaf relative to RC1. It remains within the same 21 × 16-page planning boundary. No spine-width claim is admissible until final paper stock/caliper and manufacturing specification exist.

## RC2 rebuild-equivalence freeze

Candidate: **`publication-typography-v1-rc2`**.

Calibration run `40232057590` at head `c6e123ce00429cd2ce6e40e1b6a514f2cec4cbf4` rebuilt the entire A4/B5 publication on two independent GitHub-hosted Ubuntu runners. The two generated calibration records matched exactly.

Page 2 remains the live imprint/provenance page and is structurally verified but excluded from cross-run reader-content fingerprints because its revision follows the checked-out commit.

Frozen reader-content fingerprints:

### A4 — 278 total / 277 fingerprinted pages

- layout text: `7e03d80ed78179f2d82673d46cec43e5299674c9a6f3609aaf275e7462cfb57a`;
- bbox layout: `1a4127477eed15f12d338c9c6d191020ef39915d53ed422b851a514dc6a08233`;
- 36 dpi grayscale complete-page set: `1e8a373bd2562b917451b635d8fda259bf4467670aeaeb91de1dfeffffcf6ab6`.

### B5 — 333 total / 332 fingerprinted pages

- layout text: `1ea17648270bef74c57784b9fac5d81d61929c18f4f513c5136b41d41d79355f`;
- bbox layout: `37f0f5ca7e455f40a9b0d28de09e83870a17f8a55c80a4378849da15cc2b8e41`;
- 36 dpi grayscale complete-page set: `e4e9483f64d4d530da6374a51f481e8f27018b4056793bc938ae1588e4d03f3e`.

Frozen verification then ran again at exact final proof head `448e23b3b27186ee61a4eb4dae85221ff3adf1cc`.

Exact gates:

- TYP-09D.1 RC2 two-replica proof run `40232600275` — **SUCCESS**;
- ordinary production typography proof run `40232600268` — **SUCCESS**;
- repository validation run `40232600290` — **SUCCESS**.

Both frozen RC2 replicas rebuilt A4/B5, passed the permanent typography verifier and pagination ledger, and reproduced the six frozen reader-content fingerprints exactly.

## Exact physical-review object

The exact replica-1 artifact from final frozen run `40232600275` is:

- artifact: `publication-typography-v1-rc2`;
- artifact id: `12613387661`;
- artifact digest: `sha256:aa5591c137b6899b4561136ec4be917aa08b9aa5a7128a7c575eb2eef29f938c`;
- B5 PDF SHA-256: `f4afc7f72cc6604023d937994f9fc561d1317db295cf0b9688aee384f40bd8d0`;
- A4 PDF SHA-256: `2bac3cb7164e68cb93bec00f4e50a2b7da74fa9c8499e584f4aea873f1fe4c2d`.

Evidence artifacts:

- replica 1: `12612769142`, digest `sha256:b89fa475490006bedabe6cb820d32e110376dd938f5d289e1f62979932760ee2`;
- replica 2: `12613638732`, digest `sha256:e0ceba50b9800ef25df4e4ebdd1f00f1680e51a2d0fdd1d3a9b2e61aeed31824`.

## Release boundary

TYP-09D.1 has no authority to infer physical acceptance from mechanical proof.

The next and only qualitative TYP action is owner review of the exact RC2 B5 PDF identified above. The owner verdict must be recorded exactly as supplied.

If RC2 is accepted:

1. TYP-09D may freeze `publication-typography-v1` at the exact validated release integration commit;
2. the 278 / 333 pagination ledger becomes the released typography book-block authority;
3. PR-02 receives the frozen typography contract;
4. final PR-02 drawing/content freeze still remains separately dependent on `drawing-publication-v2` from PLT.

If RC2 exposes another defect, it is another explicit freeze break. No post-hoc closeout polishing is authorised.
