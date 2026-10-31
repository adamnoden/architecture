<!-- nav-exclude: redirect -->
# publication-typography-v1 — final release record

Status: **ACCEPTED / RELEASE CLOSEOUT**  
Programme: TYP #425  
Parent: TYP-09 #702  
Closeout: TYP-09D #706  
Freeze break: TYP-09D.1 #758 / PR #761 / merge `07677ec78d087ec7e7104470c40b793cf7042e38`

## Owner verdict

The owner reviewed the exact RC2 B5 physical-review object and supplied the verdict:

> “Ok good. Bring this to the end”

This is recorded as **ACCEPT** of RC2. No additional qualitative observations are inferred.

## Accepted physical-review object

Candidate: `publication-typography-v1-rc2`

- proof run: `40232600275`
- validated candidate head: `448e23b3b27186ee61a4eb4dae85221ff3adf1cc`
- artifact: `publication-typography-v1-rc2`
- artifact id: `12613387661`
- artifact digest: `sha256:aa5591c137b6899b4561136ec4be917aa08b9aa5a7128a7c575eb2eef29f938c`
- accepted B5 PDF SHA-256: `f4afc7f72cc6604023d937994f9fc561d1317db295cf0b9688aee384f40bd8d0`
- paired A4 PDF SHA-256: `2bac3cb7164e68cb93bec00f4e50a2b7da74fa9c8499e584f4aea873f1fe4c2d`

RC1 remains immutable rejected evidence. The accepted RC2 freeze break replaced only Source Serif 4 Bold / 700 with Source Serif 4 Semibold / 600 for serif emphasis.

## Frozen production object

### A4 regression form

- 278 pages
- 139 duplex leaves
- 18 × 16-page planning sections to a 288-page boundary
- 10 pages padding to that boundary

### Conservative B5 release form

- 333 pages
- 167 duplex leaves
- 21 × 16-page planning sections to a 336-page boundary
- 3 pages padding to that boundary

Final imposition remains a printer/binder decision. Spine width remains inadmissible until actual paper caliper, binding construction and production specification are known.

## Frozen finished font set

Exactly:

- Source Serif 4 Regular / 400
- Source Serif 4 Italic / 400
- Source Serif 4 Semibold / 600
- Source Sans 3 Regular / 400
- Source Sans 3 Bold / 700

No finished-PDF fallback face is admitted.

## Mechanical proof

The RC2 correction was independently rebuilt and verified before acceptance.

- calibration run `40232057590`: two independent replicas produced identical reader/layout fingerprint records;
- frozen proof run `40232600275`: both independent replicas passed the frozen RC2 identities;
- ordinary production proof `40232600268`: PASS;
- repository validation `40232600290`: PASS;
- closeout-head RC2 proof `40233015355`: PASS on both replicas;
- closeout-head production proof `40233015383`: PASS;
- closeout-head repository validation `40233015356`: PASS.

The release contract remains bounded reader/layout equivalence rather than a false claim that separate Vivliostyle builds always yield identical raw PDF bytes.

## Drawing / PLT boundary

TYP freezes the publication/drawing sans interface as Source Sans 3 Regular / 400 and Bold / 700, no drawing italic, with tabular figures where earned and one central semantic token seam. PLT remains authoritative for drawing sizes, hierarchy, placement and its own eventual `drawing-publication-v2` release.

The typography release therefore does not claim that PLT v2 already exists. It supplies the frozen typography contract that PLT and PR-02 may consume.

## PR-02 handoff

PUB-01 #71 / PR-02 may now consume `publication-typography-v1` without reopening typography for ordinary production work:

- final private-object trim and manufacturing work;
- paper and book-block specification;
- printer/binder proofing;
- cloth, boards, sewing and exterior production;
- final 12-copy object production once the independent PLT drawing freeze is also satisfied.

A substantive typography defect discovered in production is a TYP freeze break, not routine polish.

## Release identity

Required tag: `publication-typography-v1`.

The final closeout PR carries a fail-closed GitHub Actions workflow which creates this lightweight tag at the exact merge commit only if it does not already exist. If the tag already exists at any other commit, the workflow fails rather than moving it.

TYP #425, TYP-09 #702 and TYP-09D #706 may close only after that tag is fetched and verified.
