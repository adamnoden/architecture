<!-- nav-exclude: redirect -->
# DRW-12E — drawing programme freeze and closeout

**Programme:** DRW  
**Packet:** DRW-12E  
**Parent:** #154  
**Status:** final validation pending

## Outcome

DRW has reached its intended release boundary. The Reference House is now represented by a controlled architectural drawing family rather than a small set of explanatory schematics; analytical readings reuse canonical architectural geometry; publication placement is explicit; physical-scale review is complete; the shared renderer has a non-Reference-House generality proof; and the released drawing contract is now machine-frozen by exact Git object identity.

No further drawing redesign is authorised by this packet.

## Released freeze

Machine-readable authority:

`compiler/drw-freeze/drw12e-freeze.json`

The normal repository-health gate now verifies it through:

`compiler/drw-freeze/drw12e-freeze.test.ts`

The release is **`drawing-publication-v1`**.

Three boundaries are pinned deliberately:

1. **Shared renderer / drawing engine** — `compiler/publication-drawing` tree `14662cd5e816e3e2f17b55a2b7db11632cbc67df`.
2. **Physical graphic style** — `compiler/publication-drawing/tokens.ts` blob `90f27c778c396cb49764f42a5a39e2f8d516b072`.
3. **Part IV plate/compositor register** — `publication/plates.ts` blob `76ab2d427278361876041fb446871b606d426ebe`.

The manifest additionally records 17 named RH01 view-spec versions and exact Git object IDs for every production scene/source module that defines those released views.

The whole Reference House compiler is **not** frozen. That would turn legitimate architectural/source development into an accidental publication-version break. The freeze protects the released representation contract; changes to frozen objects require an explicit version and re-freeze decision.

Existing deterministic artefact tests remain the output-byte authority for controlled SVGs.

## Before → after inventory

### Before DRW

At the frozen pre-integration state, Part IV used six inherited Reference House schematics:

1. `reference-house-type-orientation.svg`;
2. `reference-house-spatial-sectional-order.svg`;
3. `reference-house-structural-assembly-logic.svg`;
4. `reference-house-service-maintenance-geography.svg`;
5. `reference-house-external-maintenance-geography.svg`;
6. `reference-house-water-failure-geography.svg`.

They were useful explanatory figures, but as a family they left the house under-represented architecturally: plans, sections, elevations, roof geometry and analytical readings were too compressed into prose-led schematic graphics.

Parts I–III also contained five explanatory FLOW figures. Those remain intentionally separate from the architectural plate family; DRW-11 simplified and normalised them rather than pretending they were architectural drawings.

### After DRW

Part IV now contains **17 controlled plate events / 17 controlled publication SVGs**:

1. ground-floor plan;
2. first-floor plan;
3. synthetic setting/type plan;
4. external maintenance geography;
5. principal front elevation;
6. principal section — true spread;
7. courtyard elevation;
8. structural/span analytical overlay;
9. transverse service section;
10. ground-floor service + maintenance overlay;
11. first-floor service + maintenance overlay;
12. service-side elevation;
13. roof/drainage plan;
14. roof water/failure overlay;
15. garden elevation;
16. sectional axonometric — true spread;
17. future-adaptation overlay.

The six inherited Part IV schematics are no longer on the active publication path. The five Parts I–III FLOW figures remain a separate explanatory family.

The final book therefore distinguishes two visual languages deliberately:

- **FLOW** — compact editorial/generative explanation in Parts I–III;
- **PLATE** — architectural orthographic, analytical and synthesis representation in Part IV.

That distinction is architectural, not merely stylistic.

## Final publication proof

DRW-12D physically reviewed the complete publication before freeze:

- Working Edition: **243 A4 pages**;
- Primer: **16 A4 pages**;
- Part IV checked at **200 dpi / true A4 output size**;
- principal-section spread: PDF pages **168/169**;
- sectional-axonometric spread: PDF pages **194/195**.

The review found and corrected one genuine annotation collision on the reused first-floor substrate (`East gallery` / `Courtyard`). Exactly three dependent controlled SVGs regenerated from source and were re-proved. No architectural geometry or meaning changed.

Canonical physical-proof record:

`docs/publication/architectural-drawing-drw12d-physical-proof.md`

## Generality boundary

DRW does not claim that Reference House view construction itself is generic. Project-specific buildings are expected to have project-specific source/view composition.

The reusable boundary is lower and cleaner:

**building source → neutral compiler/derived geometry → physical-mm projection → `DrawingScene` → deterministic SVG renderer**.

DRW-12C proves that boundary using the independent CF-01 contrast house: asymmetric, one storey, no courtyard/void and not RH01. It compiles and renders through the same shared physical-mm publication drawing layer without rewriting that framework.

That is the programme's required anti-overfitting proof. A later project-specific building may need new view composition, but it must not need a new renderer merely because it is not Ovid's House.

## Limits retained

The release remains deliberately bounded:

- bounded planning geometry is not construction information;
- approximate and provisional geometry remains identified as such;
- the Reference House is a synthetic reference type, not a surveyed/site-specific commission;
- drawing consistency does not establish structural, hydraulic or building-services adequacy;
- the publication is not a contractor issue, fabrication set or statutory approval package;
- DRW-12D proved physical-size rendered A4 legibility, not the behaviour of a particular press, paper stock, ink gain, cloth binding or production batch;
- site-specific orientation, utilities, neighbouring conditions, ground, climate and statutory constraints remain real-project inputs;
- deliberate future changes to the released renderer/style/view specs are allowed, but must version and re-freeze the affected contract rather than silently drifting it.

These are limits of authority, not defects to conceal with additional drawing.

## Programme result

DRW started because the book knew materially more architecture than its publication drawings showed. Its result is not “more illustrations”. It is a controlled representation system with explicit authority, conventional architectural views, canonical geometry reuse, analytical overlays, deterministic vector output, physical page semantics, print-scale proof, generality evidence and a release freeze.

Once the final DRW-12E validation and merge are green:

- DRW is **85 / 85 complete**;
- issue #154 closes;
- PUB-01 #71 may mark the DRW pre-production gate complete;
- **PR-02 — private 12-copy object edition** becomes the authorised next publication stage.

PR-02 inherits the frozen content/drawing object. It may resolve trim, typography, paper, cloth, binding, cover/spine treatment and production proofing. A substantive argument, figure or evidence defect discovered in physical production is a freeze break, not licence for an unrecorded manuscript cycle.
