# HFI-09B — DRW Reconciliation

**Packet:** HFI-09B  
**Programme:** `docs/development/human-factors-low-friction-inhabitation-programme.md`  
**Execution plan:** `docs/development/human-factors-low-friction-inhabitation-execution-plan.md`  
**Owning issue:** #195  
**Baseline `main`:** `8f90c1fd796d0025b4f4287116a05661ec1378c5`  
**Related drawing programme:** issue #154 / DRW

## Question

Does the current controlled DRW family contain any plate or proof that is stale because of an accepted HFI architectural/publication change, and does HFI create any remaining block on DRW-12 / PR-02 physical-object freeze?

## Result

**No HFI-specific stale DRW plate remains at this baseline. No HFI-driven redraw is required by HFI-09B.**

The one HFI change that materially altered controlled drawing geometry—the principal-stair going from 280 to 300 mm—was already corrected at source and propagated through the drawing system during HFI-08B. The affected principal-section path was regenerated and physically re-proved at A4 and conservative B5.

Subsequent HFI packets altered delivery/review obligations, not drawing geometry.

## Reconciliation by accepted HFI change

### Principal stair

Current controlled source owns:

- 18 risers;
- three flights of six rises;
- five goings per flight;
- **300 mm going**;
- 1500 mm run per flight;
- full landings;
- no winders.

The deterministic computational/drawing chain carries that source value. Current successor-output tests also assert reader-facing `Going 300 mm`, which prevents a current plan/section successor from quietly rendering the superseded 280 mm geometry.

The HFI-08B source change already triggered regeneration/re-proof of the affected principal section. HFI therefore has no outstanding principal-stair drawing correction.

### Principles 1 / 8

The HFI-08A constitutional changes are textual/architectural-interpretive. They do not impose a new plan, section or elevation geometry beyond the stair change already resolved.

**DRW effect:** none outstanding.

### N17 Human-Factors Verification

N17 governs how later finished/net interfaces and complete actions are proved during real-project delivery. It does not claim that today's architectural drawing set contains product-level handrails, guards, door hardware, sanitaryware or real-site approach geometry.

**DRW effect:** do not invent technical detail merely to make the current book look more resolved. No redraw required.

### External-review handoff

HFI-08D prepares specialist challenge of the current house. It creates no accepted geometry change.

**DRW effect:** none unless a future competent review produces an accepted architectural rewind.

### Laundry / lift / `NOT-MODELLED` matters

The laundry trade-off remains unresolved; through-floor lift provision has no adopted target; many finished interfaces remain intentionally not modelled.

**DRW effect:** no drawing should fabricate a selected answer. Their open state is not a reason to hand-patch or withhold otherwise honest current drawings.

## Current DRW programme compatibility

At this baseline DRW has completed the courtyard-elevation proof through DRW-08D and has an active/draft DRW-08E synthetic setting/type-plan packet.

That setting-plan scope is compatible with HFI's evidence boundary because it explicitly refuses to invent:

- real plot depth;
- legal boundary;
- highway/kerb relationship;
- neighbours;
- geographic north;
- real-site approach gradient or set-down geometry.

This matters: HFI keeps real-site approach/visitability facts site-specific, so a synthetic setting drawing must not become a surrogate accessibility/site proof.

The draft DRW-08E scope currently respects that boundary.

## Freeze condition

HFI-09A established that no accepted HFI publication change remains unpropagated. HFI-09B now establishes the same for DRW geometry/proofs.

Therefore:

> **HFI imposes no current additional hold on DRW progression or eventual DRW-12 / PR-02 freeze.**

The normal concurrency contract remains active: if later HFI/external-review evidence is accepted as an architectural change before physical freeze, the owning source must reopen and affected drawings must regenerate/re-proof. The existence of an unresolved question alone does not create stale geometry.

## Rejected actions

HFI-09B rejects:

- re-proving every DRW plate merely because the HFI programme exists;
- drawing unmodelled door/sanitary/control details to obtain cosmetic completeness;
- showing a future lift or stairlift without an adopted architectural proposition;
- relocating laundry in a drawing before the trade-off is resolved;
- hand-patching a drawing if source authority later changes;
- treating the synthetic setting plan as evidence of a real-site accessible approach.

## Authority / maturity consequences

No drawing source, renderer, publication plate, architectural geometry or maturity level changes in this packet.

The packet only closes the HFI→DRW reconciliation obligation at the audited baseline.

`HFI-09B → baseline 8f90c1fd796d0025b4f4287116a05661ec1378c5 → reconcile accepted HFI changes against current DRW family → 300 mm stair already source-propagated/re-proved; no other accepted HFI geometry delta; synthetic setting scope remains honest about real-site unknowns → no HFI-specific stale plate / redraw / freeze hold → exact next packet HFI-09C — computational admission`

**Exact next packet:** **HFI-09C — computational admission.**
