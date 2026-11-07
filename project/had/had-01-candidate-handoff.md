# HAD-01 — candidate handoff and validation record

## Scope and outputs

This handoff covers candidate exploration only:

- [HAD-01E exterior/court](had-01e-exterior-candidates.md).
- [HAD-01P principal interiors](had-01p-principal-interior-candidates.md).
- [HAD-01S private/service interiors](had-01s-private-service-candidates.md).
- [Front comparison](studies/exterior-candidates.svg).
- [Court comparison](studies/courtyard-candidates.svg).
- [Shared rear-wall comparison](studies/principal-wall-candidates.svg).

The starting design is `RH-LAYOUT-REVISION-02` /
`RH-LAYOUT-FAMILY-02`. The completed [shared interface
contract](../triad-interface-contract.md) governs dimensional meanings and
ownership. No source geometry, product, technical family or final selection is
changed. The studies are candidate appearance comparisons, not PLT plates,
construction drawings or source authority for room/opening geometry.

## Candidate dispositions

| Field | Leading direction | Retained challenger | Rejected default |
|---|---|---|---|
| Exterior | E-A masonry body / quiet light court | E-B coherent mineral body | E-C ornamental villa/arcade/fountain treatment |
| Principal interiors | P-A mineral field / useful true joinery | P-B one selective real panelling field | P-C universal panel/ceiling/service grid |
| Private/service | S-A quiet fixed fit-out / independent access | S-B task-specific dry-side joinery front | S-C inaccessible fitted spectacle |

“Leading” means the next comparison starts there. It does not commit every
room to the same finish or override IAS/OAS evidence. Simpler conventional work
remains a successful selection where it performs the declared task better.

## Study authority and visual QA

The front uses source shell 12000 mm, five axes
1800/3900/6000/8100/10200, four ground windows, five upper windows, 1800 mm
ground entrance, 0/3450 mm levels, 750/2850 mm window datums, 6800 mm eaves and
the current 2125 mm ridge inset with 25° slopes. Material fields are proposals.
The approximately 7791 mm ridge is a geometric depiction, not structural design.

The court west wall uses the 3500 mm source width and two windows per occupied
floor at local 900/2600 mm, with the same nominal sill/head relationship.
The optional 450 mm-high ceramic fields below the ground windows are a local
appearance trial; backing, base, weathering and moisture behaviour are not
selected. This view does not depict or change the north/south court doors.

The principal-wall sheet represents the **whole shared rear north wall,
including the kitchen side**, not an invented separate drawing room. It uses
the source inner-side end coordinates 417.5/11582.5 mm and the actual four
windows/central 2400 mm door. Candidate skirting is 150 mm high; P-B proposes
a 650 mm lower-field top. Heights are design trials without selected depth,
fixing, removal or movement allowance. Real products and junctions can defeat
them. P-A and P-B keep the same apertures.

All three SVGs were rendered to PNG with Inkscape and visually inspected.
The principal-sheet heading overlap found during inspection was corrected
and re-rendered. No clipping/overlap remains in the inspected sheets.
The vectors are retained as bounded design evidence; temporary render images
and one-shot generation commands do not become a new permanent drawing engine.

## Adversarial outcome

The candidates were reviewed against current room roles, source geometry,
G-01's limited authority, repose, ordinary furnishing, release/handling,
fully allocated layer budgets and MRA's moisture questions.

The principal risks remain visible:

- 250 mm nominal room-side strip above opening heads restricts cornice/trim;
- 1015 mm west-gallery width is not spare joinery space;
- U-ENS3 has 1075 mm nominal clear depth before local service/finish demands;
- I00-C1 remains an unresolved service-panel/partition overlap;
- inner-eaves collection/overflow/access are real roof obligations;
- plant carrying, entrance-void/guard/fire strategy, stair headroom and actual
  sanitary fit are not discharged by these images.

No new product or expert/physical evidence is invented. A design that cannot
fit must simplify or explicitly rewind its owning source.

## Remaining hard dependencies

HAD's next substantial work is **IAS-HAD-JUNCTION** and **OAS-HAD-JUNCTION**.
The first needs IAS-01V/01H; the second needs OAS-01E/01I as well as these HAD
candidates. HAD-02M and HAD-03 follow those reconciliations. The shared
TRIAD-GATE, MRA/BCR/HRS and final PLT/EDA/PUB gates remain intact.

No independent HAD node remains runnable once these three candidate packets
are merged, unless concurrent IAS/OAS work supplies the missing candidates.
Do not advance material synthesis merely because a palette can be written.

## Repository verification and closeout

Canonical repository health, PCO validation and publication checks run on the
exact PR head. The PR/issue closeout records the observed result, merge identity
and lease release. Candidate completion changes execution state only; HAD #943
stays open and final architectural selection remains unearned.
