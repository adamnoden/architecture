<!-- nav-exclude: redirect -->
# PLT-01 — forensic precedent re-read + 17-view before-state audit

**Programme:** PLT — Architectural Plate Refinement  
**Parent:** #422  
**Packet:** #738  
**Baseline:** `6379e273cac21132b15b36621b9723434f59010c`  
**Protected comparison release:** `drawing-publication-v1`  
**Status:** candidate closeout

## 1. Purpose and boundary

PLT-01 establishes the durable before-state for plate refinement.

It does **not** change renderer tokens, drawing geometry, publication placement or released SVG bytes. It does not reopen the precedent search. It re-reads the same five frozen precedent families against the actual strengths and limitations of the 17 released `drawing-publication-v1` views.

This is a source/output audit, not a new physical-print verdict. DRW-12D remains the physical proof of the v1 release. PLT physical proof returns later under PLT-11.

The important distinction is:

> v1 is not visually weak because it is too honest. It is visually limited where the representation makes uncertainty, annotation or coarse abstraction carry work that architecture could carry if the source legitimately owns more.

PLT must therefore improve **architectural resolution and hierarchy**, not conceal uncertainty.

## 2. Material inspected

The audit uses the frozen DRW precedent doctrine and released representation contract:

- `docs/publication/architectural-drawing-drw01a-precedents.md`;
- `docs/publication/architectural-drawing-drw02d-view-register.md`;
- `docs/publication/architectural-drawing-drw12e-closeout.md`;
- `compiler/drw-freeze/drw12e-freeze.json`;
- `compiler/publication-drawing/tokens.ts`;
- `publication/plates.ts`;
- the 17 frozen production SVGs / their pinned view-source modules.

The audit also re-read the original precedent jobs rather than broadening the canon: Caruso St John domestic orthographics, Murcutt's drawing-monograph continuity, DETAIL technical editorial grammar, Atelier Bow-Wow sectional synthesis, and the Drawing Matter / Cedric Price projected-section and analytical-overlay lineage.

## 3. Forensic precedent re-read

### 3.1 Caruso St John — quiet orthographics

The useful lesson is not sparse graphics by themselves. It is that the **building remains the densest source of information**: wall, opening, threshold, depth and junction relationships do enough work that annotation can stay quiet.

The v1 plans broadly possess this architecture-first posture at the scale of room order, but the opening/stair vocabulary drops to a much lower representational resolution than the wall bodies. The elevations expose the gap more sharply: several are essentially controlled profile lines plus provisional opening envelopes, datums and explanatory text.

**PLT consequence:** where authority permits, spend new information on architecture before adding labels, hatch or graphic effect. Where authority does not permit it, keep the absence visible rather than cosmetically completing the façade.

### 3.2 Glenn Murcutt — physical-scale continuity

The transferable lesson is continuity from broad spatial order into smaller architectural facts without losing physical-scale legibility. Density is not a problem if hierarchy survives at book scale.

The v1 set has strong cross-view geometric continuity but uneven **representational resolution**. A wall may read as a decisive black body while its door is only a blank slot, its window a single centre line and its stair a provisional trace. In section, cut matter can be very heavy while the architecture beyond the cut is sparse.

**PLT consequence:** coherence of resolution matters as much as line weight. The drawing should not look certain in one adjacent element and schematic in the next unless that contrast is genuinely the authority statement.

### 3.3 DETAIL — density earned by technical information

DETAIL remains useful precisely because its density is information-bearing. Line, material distinction, dimensions and annotation cooperate rather than one compensating for the absence of the others.

Several v1 supporting views currently carry long note fields because exact technical geometry is intentionally absent. That is honest, but additional text cannot indefinitely substitute for architecture.

**PLT consequence:** PLT-02 must distinguish information that can become geometry from information that must remain a bounded note. If a technical fact is absent, subtraction is preferable to pseudo-detail.

### 3.4 Atelier Bow-Wow — synthesis through actual components

Bow-Wow's value is not illustrative busyness. Section, depth, occupation and building components can coexist because each contributes to spatial understanding.

The released sectional axonometric already has the right epistemic discipline and projection logic, but remains closer to a controlled spatial skeleton than a rich anatomy: shell, level order and service geography dominate while opening/component articulation is intentionally limited.

**PLT consequence:** the axonometric should become richer only after the orthographic source has earned that richness. No furniture, people, vegetation or invented assemblies are required to make it compelling.

### 3.5 Drawing Matter / Cedric Price — analysis attached to architecture

This is one of v1's strongest successes. Structural, service, maintenance and failure readings are attached to canonical architectural substrates rather than detached consultancy diagrams.

The remaining weakness is hierarchy: when the substrate itself is sparse or blunt, dashed zones, legends and notes can become more visually articulate than the building they explain.

**PLT consequence:** strengthen the architectural substrate first. Analytical overlays should inherit that gain and then become quieter, not louder.

## 4. Common matrix

The ordinal scores below are diagnostic shorthand only; they are not measurements and do not create an acceptance threshold.

- **3** — strong v1 condition; preserve unless later evidence earns change;
- **2** — adequate and coherent, but visibly limiting the PLT target;
- **1** — materially under-resolved for the PLT target;
- **—** — criterion is not materially applicable to that view.

For **WALL**, `3` means high autonomous-plate potential, `2` means conditional potential, and `1` means supporting/explanatory duty should remain primary.

Abbreviations: `AIR` architectural information richness; `LPH` line/poche hierarchy; `OA` opening articulation; `TY` typography; `DM` dimensions/markers; `CP` compositional poise; `AU` authority consistency; `XV` cross-view consistency; `BK` BOOK performance; `WL` WALL potential.

| View | AIR | LPH | OA | TY | DM | CP | AU | XV | BK | WL | Primary before-state finding |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Ground-floor plan | 2 | 1 | 1 | 2 | 2 | 2 | 3 | 3 | 3 | 3 | Excellent canonical room/court order; black wall bodies dominate while windows, doors and stair remain schematic. |
| First-floor plan | 2 | 1 | 1 | 2 | 2 | 2 | 3 | 3 | 3 | 3 | Same plan grammar; greater label density and multiple door apertures without leaves make the resolution discontinuity more obvious. |
| Synthetic setting / type plan | 2 | 2 | — | 2 | 2 | 2 | 3 | 3 | 3 | 1 | Honest surrogate-setting instrument; intentionally little architecture beyond shell/court and lateral-capacity facts. |
| External maintenance / setting overlay | 2 | 2 | — | 1 | 2 | 2 | 3 | 3 | 3 | 1 | Canonical substrate is retained, but capacity rectangles, rotated labels and legend notes carry more visual information than the building. |
| Principal front elevation | 1 | 1 | 1 | 2 | 2 | 2 | 3 | 3 | 2 | 3 | Evidence-honest but reads partly as an opening-authority diagram: dashed envelopes, range ticks, datums and notes dominate a very spare façade. |
| Principal longitudinal section | 2 | 1 | 1 | 2 | 2 | 2 | 3 | 3 | 3 | 3 | Strong spatial order and cut/beyond semantics; solid cut bodies are blunt, stair is symbolic and beyond-cut architecture is sparse. |
| Courtyard elevation | 1 | 2 | 1 | 1 | 1 | 1 | 3 | 2 | 2 | 2 | The clearest source-limited plate: opening occurrences are axes and text because aperture extents are absent. Not yet a wall-grade elevation. |
| Structural / span overlay | 2 | 1 | 1 | 1 | 2 | 2 | 3 | 3 | 3 | 1 | Correctly reuses the plan substrate; analytical structure inherits the plan's heavy poche / schematic-opening imbalance and adds another notation layer. |
| Service / transverse section | 2 | 2 | 1 | 1 | 2 | 2 | 3 | 3 | 3 | 1 | Useful stacked-service geography; large explanatory note field and capacity envelopes are more resolved than much of the surrounding architecture. |
| Ground service / maintenance overlay | 2 | 1 | 1 | 1 | 2 | 2 | 3 | 3 | 3 | 1 | Strong substrate reuse and bounded service geography; information hierarchy is crowded because analysis sits on an already label-heavy plan. |
| First-floor service / maintenance overlay | 2 | 1 | 1 | 1 | 2 | 2 | 3 | 3 | 3 | 1 | Same issue as ground overlay, amplified by denser upper-floor labels and aperture-only internal doors. |
| Service-side elevation | 1 | 2 | 1 | 1 | 1 | 1 | 3 | 3 | 2 | 1 | Mostly field-ownership and service-zone prose on a spare elevation; aperture and terminal coordinates are intentionally absent. |
| Roof / drainage plan | 2 | 2 | — | 1 | 2 | 2 | 3 | 3 | 3 | 3 | Strong Ovidian subject and clear geometry; arrows, rotated catchment text and off-drawing notes compete with a very simple roof substrate. |
| Roof water / failure overlay | 2 | 2 | — | 1 | 2 | 2 | 3 | 3 | 3 | 1 | Semantically excellent overlay; failure-zone frame/arrows plus inherited roof notes can make analysis visually stronger than architecture. |
| Garden elevation | 1 | 2 | 1 | 1 | 1 | 2 | 3 | 3 | 2 | 3 | Three-field order is clear, but several openings remain targets/axes or unresolved text; façade architecture is thinner than its annotations. |
| Sectional axonometric | 2 | 2 | 1 | 2 | 1 | 2 | 3 | 3 | 3 | 3 | Correct and promising synthesis; currently a controlled wireframe/spatial skeleton rather than a fully rewarding anatomy. |
| Entrance-storey future-adaptation overlay | 2 | 1 | 1 | 1 | 2 | 2 | 3 | 3 | 3 | 1 | Appropriate bounded comparator, but the analytical reading inherits the heavy plan substrate and depends on text because no speculative bed/fixture/clearance geometry is admitted. |

## 5. System-level findings

### F1 — authority honesty is the principal asset

Across the set, unresolved information is unusually well bounded. Provisional geometry is marked, absent geometry stays absent, and analytical views identify when they express zones/capacity rather than exact routes or products.

**Do not spend this asset to buy prettiness.** PLT's semantic-diff gate exists to protect it.

### F2 — v1 poche is robust but too blunt to be aesthetically final

The four-step `0.50 / 0.35 / 0.25 / 0.18 mm` line family and solid-black cut bodies reproduced reliably. The problem is not simply that the black is “too dark”; it is that substantial wall and floor bodies can become the strongest marks on the sheet while adjacent openings and architectural components remain schematic.

PLT-03 should test the balance only after PLT-02 establishes what additional architecture is admissible. A thinner line family alone would not solve the resolution mismatch.

### F3 — openings are the largest recurring resolution discontinuity

Plans commonly represent windows as a wall cut plus a single frame line. Internal doors can be aperture-only. Elevations may use dashed envelopes, range ticks, occurrence axes or prose when extents are unresolved. Sections likewise cut openings without much jamb/frame/reveal expression.

This is the single highest-value PLT-02 audit target.

### F4 — doors and thresholds are conspicuously absent as architecture

The plan set often knows that a passage or door aperture exists without owning leaf/swing/handing/threshold geometry. That is the correct v1 boundary, but it prevents the plan from achieving the architectural richness of a mature monograph drawing.

PLT-02 must determine whether any of that information is already controlled or deterministically derivable. If not, it remains absent; PLT must not draw generic door swings merely because architectural plans usually have them.

### F5 — the stair is a major architectural object represented as a symbol

In plan, the stair is a provisional reservation plus a U-shaped trace and `UP`/`DN`. In section, it is a small set of diagonal flight lines with one cut/beyond distinction. This is semantically honest but architecturally thin for an object central to arrival, vertical order and human factors.

PLT-02 must inspect current stair authority before any richer treads, landings, cut conventions or handrail/edge information is admitted.

### F6 — elevations contain the largest gap between architectural ambition and current source resolution

The front elevation is stronger than the other façades but still relies heavily on provisional envelopes and datums. The garden elevation contains unresolved opening targets/axes. The courtyard and service-side elevations are substantially notational because aperture extents or coordinates are absent.

This is not primarily a line-style defect. Some elevation improvement is blocked on architectural/source authority and belongs upstream if PLT-02 classifies the missing facts as important enough.

### F7 — sections have strong order but insufficient depth hierarchy

The principal section successfully separates cut and beyond, but cut walls/floors are heavy black bodies and the beyond-cut world is sparse. The service section similarly uses capacity fields and note stacks to carry information.

PLT should seek a more graduated section hierarchy through controlled architecture, not gradients, shadows or decorative hatch.

### F8 — typography is consistent but too often carries architectural burden

The v1 `7.5 pt / 6.5 pt` roles are physically proven and internally consistent. The weakness is not simply the Arial face. Numerous labels, authority notes, zone descriptions and legends become necessary because geometry is deliberately sparse.

TYP has now supplied the Source Sans 3 interface for later PLT use, but PLT-03 still owns actual drawing sizes and hierarchy. Font replacement without reducing typographic burden would be superficial.

### F9 — dimensions and markers are safe but under-curated

v1 intentionally avoids construction-document dimension density. That restraint should remain. However, overall dimensions, level strings, scale bars, north/orientation markers and uncertainty notes are sometimes positioned as generic furniture rather than composed with each drawing's strongest reading.

PLT should add only dimensions that materially help cross-registration or scale comprehension.

### F10 — the compositor is stable but not yet a plate-composition system

`publication/plates.ts` reliably places drawings on fixed A4 pages, with common header/caption furniture and centred native-size SVGs. This is excellent for deterministic publication assembly, but it leaves much of sheet occupation to a generic template.

In particular, `PLATE_SPREAD` currently allocates one page to furniture and a following page to the drawing rather than composing one architectural field across the pair. PLT should re-test the physical relation between drawing, white space and fold rather than assuming the current A4 placement is aesthetically final.

BOOK and WALL must remain two embodiments of one drawing; WALL must not become a hand-tuned poster system.

### F11 — analytical substrate reuse is a success; analytical hierarchy is not yet final

The overlays prove the DRW doctrine that analysis stays attached to architecture. Keep that architecture.

The refinement task is to ensure dashed zones, failure arrows, labels and legends do not receive more visual authority than the substrate merely because they are the topic of the plate.

### F12 — semantic cross-view consistency exceeds representational consistency

The 17 views generally describe one controlled object and reuse shared tokens/source. But they inhabit noticeably different representational resolutions:

- plans: heavy black wall-body diagrams;
- elevations: dashed evidence envelopes / occurrence notation;
- sections: black cut bodies with sparse beyond geometry;
- axonometric: controlled wireframe synthesis;
- overlays: architecture plus dense analytical notation.

PLT should make these feel like one epistemic world without flattening legitimate differences in authority.

## 6. Highest-value improvement order

PLT should not attack all visible weaknesses at once. The audit ranks the opportunities:

1. **Opening / jamb / reveal / frame authority** — the biggest recurring gap across plan, section and elevation.
2. **Door / threshold authority** — especially internal plan architecture and principal entrance/garden thresholds.
3. **Stair authority** — because it is architecturally central yet currently symbolic.
4. **Poche / cut hierarchy** — after 1–3 determine the neighbouring resolution.
5. **Elevation source completeness** — courtyard, garden and service-side are source-limited, not merely graphically weak.
6. **Section beyond-cut articulation** — improve depth and spatial reading without construction overclaim.
7. **Typography / note subtraction** — reduce burden after geometry can carry more meaning.
8. **Sheet occupation / BOOK–WALL composition** — compose the earned architecture, not the other way round.
9. **Analytical overlay quieting** — inherit stronger substrates and then subtract analytical noise.
10. **Axonometric richness** — last among the main architectural views because it should synthesize settled orthographic authority rather than create it.

## 7. PLT-02 admission questions

PLT-02 should classify each candidate fact as **A — already controlled**, **B — deterministically derivable**, or **C — absent / unresolved**. The audit does not prejudge the answers.

The first admission queue is:

- exterior and courtyard window jamb/reveal/frame relationships;
- internal opening leaves, swings, handing and threshold conditions;
- principal entrance and garden-threshold geometry;
- stair treads, landings, cut convention and any controlled edge/rail facts;
- façade aperture extents currently represented only as envelopes, targets or occurrence axes;
- roof edge / eaves / parapet / collection geometry where current source owns more than v1 shows;
- section-visible wall/floor/opening relationships beyond simple cut bodies;
- fixed architectural elements or principal fixtures already controlled but omitted;
- selective dimensions that can be derived without promoting planning geometry to construction certainty;
- analytical geometry currently expressed in prose but already controlled strongly enough to draw.

Anything classified C remains absent from v2 unless a bounded upstream architecture/source decision explicitly changes that authority.

## 8. Packet decision

PLT-01 finds **no reason to change the five-family precedent constitution** and no reason to retreat from `drawing-publication-v1` as the protected baseline.

The v1 set is already strong in the things that are hardest to recover once lost:

- deterministic source relationship;
- semantic consistency;
- explicit uncertainty;
- conventional architectural view families;
- canonical substrate reuse;
- physical-scale discipline.

Its main limitation is now precise enough to state:

> **The drawings know more architecture than they currently articulate, but not every visually desirable fact is yet owned by the source.**

That is exactly the problem PLT-02 must resolve.

**Next authorised packet after clean merge: PLT-02 — architectural-information admission audit.**
