# RSI-00 — before-state freeze

> Historical RSI study. The programme was closed by owner scope decision on 2026-10-28; see [closure and current authority](README.md). Original handoffs and successor permissions below are retained as history, not an active work queue.

Issue: #894  
Programme: #891  
Baseline main: `8593bb43e4dfdadbca7c4923fa7e92e3b18c96b4`  
Baseline event: merge of PLT PR #893 / closure of #892

## Purpose

Freeze the exact house/site/drawing state that RSI is allowed to challenge. This record distinguishes controlled historical architecture from current provisional coordination and from site/drawing test fixtures.

RSI-00 does **not** promote any provisional PLT choice into the canonical Reference House and does not select the new modest Reference Site.

## Authority matrix

| Object | Identity / source | State at baseline | RSI role | Migration disposition |
| --- | --- | --- | --- | --- |
| Reference House controlled source | `RH-C1-REFERENCE-HOUSE`; `compiler/reference-house/fixture.ts` | controlled / mixed frozen + explicitly provisional facts | intrinsic historical/current controlled house | preserve and keep reproducible; never silently overwrite |
| Controlled shell | `RHCF-SHELL-X`, `RHCF-SHELL-Y` | 12,000 × 10,800 mm, frozen for RH-C1 | unchanged-house geometric control | challenge only through an explicit successor revision |
| Controlled courtyard | `RHCF-COURT-SIZE` | 3,600 × 4,000 mm, centred, frozen for RH-C1 | historical/current controlled court | preserve as control even if successor changes it |
| Controlled stair topology | RH-C1 fixture | 18 risers, 6/6/6 rise groups, 300 mm going, 5 goings/flight; 1,000 mm clear-width target provisional | historical source authority | preserve; current PLT coordination demonstrates that the old reservation/arrangement is not a resolved built stair |
| Current PLT plan coordination | `RH-GROUND-PLAN-RESOLUTION-02`; `compiler/reference-house/plan-resolution.ts` | **PROVISIONAL_COORDINATION** / B4 successor candidate | best current plan input for RSI collision testing | may be consumed as provisional; must not masquerade as RH-C1/M3 freeze |
| B4 courtyard | `RHPR-COURT-B4` | 3,600 × 3,300 mm; offset north by 350 mm; provisional | explicit PLT trade-off exposed by #892/#893 | owner/RSI review required before any successor freeze |
| B4 stair/circulation | B3-derived 9/9 dog-leg arrangement, B4 position/approach corrections | provisional coordination | best current circulation geometry | diagnostic input only until successor architecture is approved |
| DPL synthetic Reference Site | `DPL-RS-01`; `project/dpl/dpl-07-reference-site.md` | 17,400 × 30,000 mm = 522 m²; synthetic | generous/wide canonical-test predecessor | retain as historical/control site; no longer presumed final RSI site |
| DPL conditional case | `DPL-COND-01`; `project/dpl/exploration/conditional-case.json` | 17,400 × 30,000 mm; conditional assumptions; `referenceHouseMutation=false` | assumption-based ordinary-street deployment control | retain as historical conditional study |
| Historical DRW narrow-width setting | documented in `project/dpl/dpl-07-reference-site.md` | 15.5 m surrogate width, centred house, ~1.75 m gross side clearances; no full parcel depth | width-stress challenger | retain as counterfactual; never promote to legal/site authority |
| ADE | #812, closeout `docs/publication/architectural-drawing-engine-closeout.md` | internally complete | representation/compiler capability | reusable downstream; not a design authority |
| PLT | #422 / #746 / #759 | active; physical/token/drawing freeze not complete | drawing-language owner | downstream PLT should eventually consume the accepted RSI successor/deployment |
| PLT owner-feedback defect packet | #892 / PR #893 | closed / merged at this baseline | resolves specific B3 circulation/partition/window feedback | no longer blocks RSI-03; resulting B4 remains provisional |
| DPL | #299 | complete at conditional deployment/evidence scope | upstream deployment/evidence machinery | do not reopen merely to choose a different canonical synthetic morphology |
| TYP | TYP-06 seam accepted; TYP-09 release work separate | typography dependency available | drawing typography interface | final TYP-09 release is not an RSI blocker |

## Controlled Reference House baseline

The historical controlled fixture remains the non-destructive comparison object:

```text
fixture:       RH-C1-REFERENCE-HOUSE
shell:         12.000 × 10.800 m
courtyard:      3.600 × 4.000 m
court position: centred in shell
front:          model south
```

The fixture intentionally carries both frozen and provisional source facts. RSI must not flatten those authority distinctions merely to make successor generation easier.

## Current provisional architectural input — B4

PLT #892 / PR #893 fixed a genuine plan-coordination problem rather than merely changing graphics. At this baseline, `compiler/reference-house/plan-resolution.ts` deliberately describes itself as a **provisional architectural successor**.

The material B4 changes include:

- a provisional 3.6 × 3.3 m courtyard, offset north by 350 mm;
- a hall/drawing partition return that no longer terminates ambiguously;
- circulation/stair placement corrections inherited from the B3 9/9 dog-leg response;
- explicit study/service side-window additions;
- opening/approach corrections needed by the owner feedback packet.

This matters to RSI because the unchanged-house collision test should attack the **best current coordinated house**, not knowingly obsolete B3 geometry. It does **not** justify rewriting RH-C1/M3 history.

Therefore:

> **RSI-03 collision baseline = B4 provisional coordination projected onto the chosen RSI site, with RH-C1 retained as the protected historical/control source.**

If PLT makes a further material architectural correction before RSI-03 is executed, RSI-03 must rebind explicitly rather than silently drifting.

## Site baselines

### DPL-RS-01 — wide/shallow control

```text
width:  17.4 m
depth:  30.0 m
area:   522 m²
house:  12.0 × 10.8 m
front setback: 5.2 m
rear garden:  14.0 m
side fields:   3.0 m / 2.4 m
```

DPL explicitly states that this is a synthetic integration fixture, not a statistically typical London plot or a real measured parcel.

### DPL-COND-01 — conditional case

The later conditional case uses another 17.4 × 30.0 m authored rectangle, a 9 m front placement and explicit assumptions. Its own boundary states that no actual site is verified and that the Reference House is not mutated.

### DRW 15.5 m width stress test

DPL-07 records the prior DRW setting as a house-centred **width stress test**, not a full site: 15.5 m surrogate width and roughly 1.75 m gross side clearance each side, with plot depth, legal boundary, street, neighbours, topography and other site facts absent.

This remains valuable precisely because it is narrower than DPL-RS-01.

## RSI migration invariants at restart

1. Historical fixtures remain reconstructible.
2. `ReferenceHouse`, `ReferenceSite` and `ReferenceDeployment` remain distinct concepts.
3. No renderer-local site rectangle may become architectural authority.
4. No provisional PLT geometry is silently promoted to controlled/frozen house geometry.
5. A modest site may expose a house defect; the site must not automatically deform the house.
6. Any successor house is a new revision with a traceable delta.
7. Rough successor plans require OWNER GATE A.
8. Resolved final plans require OWNER GATE B before freeze.

## Dependency state at freeze

```text
DPL #299       COMPLETE upstream input
ADE #812       COMPLETE representation input
PLT #892       COMPLETE specific architectural defect packet
PLT #422       ACTIVE drawing-language / physical proof programme
TYP-09         NOT AN RSI BLOCKER

RSI-00         MAY COMPLETE
RSI-01         MAY PROCEED
RSI-02         MAY PROCEED after enough morphology evidence
RSI-03         MAY USE B4 AS PROVISIONAL CURRENT-HOUSE BASELINE
               but must preserve its provisional status
```

The earlier hard wait on #892 is therefore discharged at this baseline. Full PLT completion remains unnecessary before RSI architectural exploration.

## Close judgement

RSI now has a reconstructible before-state with four deliberately different things that must not be conflated:

1. **RH-C1/M3 controlled house history**;
2. **B4 current provisional coordination**;
3. **DPL synthetic/conditional deployment fixtures**;
4. **PLT/ADE representation machinery**.

That separation is the restart contract for the modest-site migration.
