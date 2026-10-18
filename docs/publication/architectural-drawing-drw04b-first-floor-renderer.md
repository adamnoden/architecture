<!-- nav-exclude: redirect -->
# DRW-04B — First-floor publication-plan rendering capability

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-04B  
**Status:** DONE pending branch validation  
**Issue:** #154  
**Starting baseline:** `19170e6cac52a54e751ade0ccd0899cc6ee13ec4`

## 1. Outcome

DRW-04B adds the minimum renderer capability required to turn the DRW-04A first-floor authority layer into the same native publication drawing scene already proven by the ground plan.

The packet deliberately does **not** generate or commit the controlled first-floor SVG. That remains DRW-04C. This packet stops at a deterministic `DrawingScene` and its renderer-level proof.

New implementation:

- `compiler/reference-house/publication-first-floor-plan.ts`
- `compiler/reference-house/publication-first-floor-plan.test.ts`

No canonical Reference House geometry is changed.

## 2. Why this is a sibling renderer rather than a framework refactor

The first-floor plan does not expose a new projection system. It uses the exact same:

- `1:100` scale;
- `136 × 145 mm` drawing scene;
- plan-paper projection;
- cut-wall body convention;
- paper-white opening cuts;
- minimal window frame line;
- sparse overall/courtyard dimensions;
- physical graphic scale;
- paper-space text grammar.

DRW-04B therefore does not stop the vertical slice to generalise the already-green ground renderer into a speculative plan framework.

Instead it builds one bounded sibling scene and uses tests to prove that shared architectural controls remain physically registered across the two floors. A later refactor is justified only if another retained plan view creates real duplication pressure.

## 3. Shared source reuse

The upper renderer takes the DRW-04A first-floor source plus an explicit shared plan representation source containing only:

- `wallRepresentation`;
- `stair`.

Those are taken from the existing DRW-03B ground-plan companion source. The first-floor source does not re-author them.

This preserves the authority decision made in DRW-04A: one wall-body representation contract and one stair reservation/topology serve both plans.

## 4. New renderer behaviours

### 4.1 Upper private-room apertures

The seven DRW-04A `door-aperture-no-leaf` occurrences are rendered only as cuts through their host planning wall bodies.

They do not produce:

- leaves;
- swing arcs;
- hinges;
- handing;
- technical clear-opening values.

Their scene metadata retains `treatment: door-aperture-no-leaf` so later validation can distinguish them from windows and major openings without reader-visible process notation.

### 4.2 Upper stair view

The upper scene reuses the same provisional stair reservation used by the ground plan.

The topological trace is viewed from above and reversed:

- upper arrival → east turn → west turn → lower end;
- restrained `DN` marker;
- provisional reservation remains dashed/secondary.

The scene still does not draw treads, nosings, strings, guards, balustrades, handrails or a technical stair well.

This communicates arrival and direction without promoting RH-03 planning topology into construction geometry.

### 4.3 First-floor opening field

The renderer consumes:

- the four canonical upper front windows from the compiled house;
- six DRW-04A courtyard openings;
- three DRW-04A garden openings.

Only occurrences whose source role is `window` receive the minimal frame line. The north/south courtyard major openings remain plain wall cuts.

### 4.4 First-floor labels

The scene uses human architectural names only:

- Bedroom 2;
- Principal bedroom;
- South landing;
- Bedroom 3;
- East gallery;
- Family bathroom;
- Bedroom 4;
- North landing;
- Dressing / storage;
- Linen;
- Courtyard.

The narrow east gallery uses the same established collision response as the ground gallery: move the label outside the narrow strip and use one quiet secondary leader. No architectural geometry is moved to accommodate text.

## 5. Cross-floor parity proof

Renderer tests explicitly compare the ground and first-floor scenes rather than merely asserting each in isolation.

They prove that all eight permanent outer/courtyard wall bodies occupy identical paper coordinates at `1:100` and that the upper stair reservation occupies the same physical rectangle as the ground stair reservation.

They also prove the upper stair trace is the reversed reading of the existing three-flight topological trace.

This is intentionally an early registration check. DRW-04D remains responsible for full paired-page composition and print proof.

## 6. Counts and semantic checks

At this packet boundary the first-floor scene contains:

- 18 cut-wall bodies: 8 permanent outer/court boundaries + 10 upper internal planning boundaries;
- 20 opening cuts: 4 canonical front windows + 7 private-room apertures + 6 court openings + 3 garden openings;
- 11 minimal window frame lines: 4 front + 4 east/west court + 3 garden;
- one provisional stair reservation with three reversed topological trace segments;
- sparse shell/courtyard dimensions and the same 3 m physical scale bar as the ground plan.

Tests also reject reader-visible machine IDs, door-swing invention, technical stair component IDs, north arrows and section markers.

## 7. Deliberate non-work

DRW-04B does not:

- mutate `fixture.ts` or any canonical house fact;
- add a new wall-body family;
- add a new stair source;
- generate the controlled SVG;
- author door leaves or final opening schedules;
- add true north or site context;
- add section cuts before DRW-05;
- add service overlays or bathroom fixture layouts;
- prove collision freedom at final SVG/plate level;
- compose the paired ground/first plate.

Those boundaries preserve the execution-plan split between renderer capability, controlled generation and plate proof.

## 8. Validation target

`publication-first-floor-plan.test.ts` proves:

- identical physical scene/scale grammar to the ground plan;
- cross-floor registration of outer/courtyard cut-wall bodies;
- all authorised upper opening cuts are rendered;
- the seven private-room apertures remain leafless/swingless;
- only sourced windows receive frame lines;
- the stair reservation is shared and the upper trace reverses to `DN`;
- first-floor labels are human-readable and machine IDs remain metadata only;
- the narrow-gallery leader is stable;
- dimensions remain sparse and the graphic scale remains physical;
- no north/section/technical claims leak in;
- SVG serialization is deterministic and free of packet/workflow history.

## 9. Handoff to DRW-04C

DRW-04C may now:

1. compile the canonical Reference House;
2. create the DRW-04A first-floor publication source;
3. reuse DRW-03B wall/stair source;
4. create the DRW-04B first-floor scene;
5. serialize it through the existing publication SVG serializer;
6. commit the controlled first-floor publication SVG with lineage/determinism checks.

DRW-04C should not expand renderer capability unless controlled generation reveals an actual rendering defect. Plate-level collision, facing-page registration and print readability remain DRW-04D.