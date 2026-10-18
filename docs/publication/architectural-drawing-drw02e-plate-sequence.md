<!-- nav-exclude: redirect -->
# DRW-02E — Initial plate sequence and book rhythm

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-02E  
**Status:** DONE pending branch validation  
**Issue:** #154  
**Starting baseline:** `ce7f522e3b3bec286746fd093d21764670419e20`

## 1. Purpose

Freeze the **relative publication sequence** of the DRW-02D drawing register before source hardening or renderer implementation begins.

DRW-02D established what the book is trying to draw. DRW-02E now establishes where those drawings belong in the manuscript, which views must face one another, where prose must interrupt drawing density, when a blank page is legitimate, and which views currently earn a true spread or rotation.

The governing rule is:

> **The drawings belong to the argument of the book; they do not become a technical appendix merely because they are architectural.**

This packet does **not**:

- assign final printed page numbers;
- change the DRW-02D register, scale or page class;
- harden Reference House source geometry;
- implement a publication renderer or plate compositor;
- redraw or replace any active SVG;
- move the six inherited Reference House schematics yet;
- create reader-facing figure numbers;
- begin DRW-03.

## 2. Inputs and manuscript structure

The sequence is read against:

- the frozen page grammar in DRW-01D;
- the A4 / B5-territory doctrine proof in DRW-01E;
- the Part IV claim map in DRW-02A;
- the final view register in DRW-02D;
- the current Part IV manuscript in `docs/manuscript/part-iv.md`;
- the current figure-placement layer in `publication/figures.ts`.

Part IV already has the right narrative spine:

1. **13. Site and type** — establish the house and its contingent setting;
2. **14. Architectural order, repose and tectonic language** — establish architectural character, elevation and section;
3. **15. Material, structural and assembly system** — expose what carries and encloses the house without pretending to technical completion;
4. **16. Maintenance geography** — show the spatial consequences of services, access and replacement;
5. **17. Water and environmental systems** — show roof, water and environmental consequence;
6. **18. Future maintenance scenarios** — return the technical argument to future human use.

DRW-02E preserves that arc. It does not create a separate drawing chapter.

## 3. Rhythm rules

### 3.1 Architecture before analysis

Part IV must first let the reader inspect ordinary architecture. Analytical readings follow only after their substrate has been encountered.

The opening sequence therefore begins with the **paired floor plans**, not an exploded axonometric or service diagram.

### 3.2 One dedicated plate event, then prose

A `PLATE_PAIR` or `PLATE_SPREAD` counts as one deliberate plate event even though it consumes two pages.

Except where a section transition itself provides a substantial textual reset, two dedicated plate events should **not** run directly into one another. The manuscript should normally restore at least one meaningful prose page or prose-bearing interval between them.

This is not a quota measured by word count. It is a reading rule: the book must repeatedly move between **inspect → read → inspect**, rather than becoming an uninterrupted block of technical sheets.

### 3.3 Singles normally face prose

The retained `PLATE_SINGLE` views are not to be silently upgraded into semantic `PLATE_PAIR`s merely because two single plates happen to fall on facing pages.

The intended default is:

> **single architectural plate ↔ live prose**

The side of the spread is not frozen unless pagination later gives a compelling reason. What is frozen is that the single remains independently complete and should not depend on a neighbouring plate for meaning.

### 3.4 True pairs remain complete drawings

The four frozen `PLATE_PAIR` relationships are real comparisons/readings:

- ground-floor plan ↔ first-floor plan;
- synthetic setting/type plan ↔ external-maintenance/setting overlay;
- ground service/maintenance overlay ↔ first-floor service/maintenance overlay;
- roof/drainage plan ↔ roof-water/failure overlay.

Each left and right page remains semantically complete. None is a cropped half of one drawing.

### 3.5 Part IV remains the visual climax

Parts I–III retain the five abstract `FLOW` figures already justified by DRW-02B. They remain sparse explanatory instruments inside prose.

Part IV is where the publication changes visual register: ordinary plans, section, elevations and roof drawings become the dominant evidence, followed by analytical readings over the same geometry.

The escalation is intentional. The reader first learns the proposition, then encounters a house substantial enough to test it.

## 4. Frozen Part IV sequence map

Final folio numbers are deliberately **not** frozen. The sequence is relative to manuscript headings/subheadings so it can survive prose editing and later B5 trim without false precision.

### 4.1 Part IV opening

**Manuscript:** opening position before Section 13.  
**Surface:** prose only.  
**Rule:** retain the Part IV opening on a recto under the existing publication grammar.

Do not open Part IV with a hero image. The opening must first state the Reference House authority boundary: worked interpretation, virtual-design scope, deliberately favourable integration fixture, and not proof.

### 4.2 Section 13 — Site and type

#### Plate event A — paired floor plans

**Anchor territory:** after the house morphology and programme have been introduced under **A courtyard house, deliberately** / **Programme before symmetry**.  
**Left / verso:** ground-floor plan — `1:100`.  
**Right / recto:** first-floor plan — `1:100`.  
**Page class:** `PLATE_PAIR`.

Reader task:

- encounter the house as architecture before analytical overlays;
- compare the two storeys at the same scale;
- inspect court morphology, shallow bands, programme and stair/service relationships;
- establish the canonical plan substrate used later by structural, service and adaptation readings.

**Facing relationship is frozen:** ground left, first right.

A prose reset follows before the next dedicated plate event.

#### Plate event B — type and maintenance setting pair

**Anchor territory:** later in Section 13, around **The site is allowed to change the house**, after the reader already knows the plan.  
**Left / verso:** synthetic setting/type plan — `1:200`.  
**Right / recto:** external-maintenance/setting overlay — `1:200`.  
**Page class:** `PLATE_PAIR`.

Reader task:

- distinguish persistent type from contingent site coordinates;
- show why detached perimeter and service flank make this a favourable fixture;
- show working/support/withdrawal geography without pretending to own a real boundary, utility route or legal access right.

This is deliberately the first analytical reading in Part IV. It is admitted early because the manuscript itself makes site contingency and maintenance strips part of the definition of the type. The base setting remains on the left; the task-specific reading follows on the right.

**Facing relationship is frozen:** base setting left, maintenance reading right.

### 4.3 Section 14 — Architectural order, repose and tectonic language

#### Plate event C — principal front elevation

**Anchor territory:** **Order without false symmetry**.  
**View:** principal front elevation — `1:100`.  
**Page class:** `PLATE_SINGLE`.  
**Facing intent:** prose explaining the four-bay field, third-bay entrance and stair-window consequence.

This is the first elevation because it directly proves the most explicit compositional claim in the manuscript.

#### Plate event D — principal longitudinal section

**Anchor territory:** **Section as architecture**, carrying forward into **Arrival, compression and recentering**.  
**View:** principal longitudinal section — `1:100`.  
**Page class:** `PLATE_SPREAD`.

Reader task:

- inspect front → stair/arrival → court → garden sequence;
- read ground-floor primacy and vertical datums;
- understand the court as a sectional architectural event rather than a plan void.

This is a **true spread**, not two complete facing drawings. It uses one canonical composition and deterministic left/right crops. Unique levels, dimensions, labels and semantic events remain outside the DRW-01D 12 mm-per-side critical fold exclusion.

A prose interval must separate the front-elevation plate and the section spread even if pagination could otherwise place them back-to-back.

#### Plate event E — courtyard architectural elevation

**Anchor territory:** later in **Arrival, compression and recentering**, after the prose establishes the courtyard as a distinct local order/dialect.  
**View:** courtyard architectural elevation — `1:50`.  
**Page class:** `PLATE_SINGLE`.  
**Facing intent:** prose on court order, intimate scale and local material dialect.

It must not be paired semantically with the `1:100` front elevation. Their different scales are purposeful and should not be disguised as a direct comparative elevation set.

### 4.4 Section 15 — Material, structural and assembly system

#### Plate event F — structural / span overlay

**Anchor territory:** **Structure generated by the courtyard**.  
**View:** structural/span overlay — `1:100`.  
**Page class:** `PLATE_SINGLE`.  
**Facing intent:** prose explaining short spans, permanent support lines, courtyard-edge interruptions and pre-engineering authority.

This is the only dedicated Section 15 plate currently justified. DRW-02C deliberately refused construction-style details whose apparent precision would outrun the project’s technical authority.

The absence of detail plates is therefore part of the sequence, not a hole to fill with generic wall sections.

### 4.5 Section 16 — Maintenance geography

#### Plate event G — service / transverse section

**Anchor territory:** the opening maintenance-geography argument and the ground-service-suite / vertical-distribution material.  
**View:** service/transverse section — `1:100`.  
**Page class:** `PLATE_SINGLE`.  
**Facing intent:** prose explaining plant/service suite, bounded riser, upper bathroom and dry-side access.

This section appears before service overlays because it establishes the vertical architectural relationship that plans alone cannot prove.

#### Plate event H — service-side elevation

**Anchor territory:** after the service-side technical expression has been described, before the manuscript moves fully into general external-maintenance access.  
**View:** service-side elevation — `1:100`.  
**Page class:** `PLATE_SINGLE`.  
**Priority:** `SUPPORTING`.  
**Facing intent:** prose on plant replacement opening, utility/terminal concentration and controlled asymmetry.

Its placement here, rather than beside the principal front in Section 14, is deliberate. The view earns its page through the architectural consequences of service and replacement geography, not through a desire to publish a complete four-elevation set.

A prose reset separates it from the service/transverse section.

#### Plate event I — paired service / maintenance overlays

**Anchor territory:** after **Vertical distribution** and **Horizontal routes**, when the base plans have long since been established.  
**Left / verso:** ground-floor service/maintenance overlay — `1:100`.  
**Right / recto:** first-floor service/maintenance overlay — `1:100`.  
**Page class:** `PLATE_PAIR`.

Reader task:

- compare wet/high-consequence concentration across storeys;
- see plant, utility, riser, bathroom and dry-gallery relationships;
- make the absence of primary routes through principal rooms inspectable;
- show the rejected remote en-suite as a consequence of geography without drawing a speculative rejected scheme.

**Facing relationship is frozen:** ground left, first right.

The overlays may simplify their plan substrate but may not own another plan geometry.

### 4.6 Section 17 — Water and environmental systems

#### Plate event J — roof and water/failure pair

**Anchor territory:** **Roof water moves outward** / **The courtyard manages only itself**.  
**Left / verso:** roof/drainage plan — `1:100`.  
**Right / recto:** roof-water/failure overlay — `1:100`.  
**Page class:** `PLATE_PAIR`.

Reader task:

- inspect the four outward-falling roof fields and external collection geometry;
- then read overflow, visible failure, courtyard consequence and inspection geography over the same controlled substrate.

**Facing relationship is frozen:** ordinary roof architecture left, analytical failure reading right.

This pair is the strongest expression of the programme rule **architecture first; analysis second** on one opening.

#### Plate event K — garden elevation

**Anchor territory:** **Passive environmental hierarchy**, after the text rejects the undifferentiated glazed garden wall.  
**View:** garden elevation — `1:100`.  
**Page class:** `PLATE_SINGLE`.  
**Priority:** `SUPPORTING`.  
**Facing intent:** prose on the three-field garden order, retained masonry piers, principal garden threshold and disciplined glazing.

Its late placement is deliberate. The garden elevation does more work for the environmental and domestic argument here than it would as one member of a ceremonial elevation set in Section 14.

### 4.7 Transition from Section 17 to Section 18 — optional synthesis slot

The sectional axonometric is **not placed in the frozen core sequence** because DRW-02D classified it `OPTIONAL`.

If DRW-09 later proves that one source-controlled sectional axonometric materially improves comprehension, its provisional admission slot is:

> **after the Section 17 core orthographic/analytical evidence and before Section 18 future scenarios**.

If admitted:

- page class: `PLATE_SPREAD`;
- scale: explicitly NTS synthesis projection;
- one canonical source-controlled geometry;
- no new claim may depend on the axonometric alone;
- no pages or blank are reserved for it now.

If it does not earn admission, the manuscript closes the technical evidence and proceeds directly to Section 18 with no gap.

### 4.8 Section 18 — Future maintenance scenarios

#### Plate event L — entrance-storey future-adaptation overlay

**Anchor territory:** **Loss of stair use**.  
**View:** entrance-storey future-adaptation overlay — `1:100`.  
**Page class:** `PLATE_SINGLE`.  
**Priority:** `SUPPORTING`.  
**Facing intent:** prose explaining the family-room sleeping option, substantially step-free ground-floor route and potential sanitary/shower adaptation.

This is intentionally the last currently admitted dedicated plate in Part IV.

The book therefore does **not** finish its visual argument on plant, drainage or structural abstraction. It returns to occupation: an enduring house accommodating a foreseeable change in human circumstance without pretending to universal flexibility.

The final prose scenarios then close Part IV without another guaranteed plate.

## 5. Sequence summary

| Order | Manuscript territory | Plate event | Page class | Facing / spread rule |
|---:|---|---|---|---|
| A | §13 type/programme | ground plan + first plan | `PLATE_PAIR` | ground left / first right |
| B | §13 site contingency | setting + external-maintenance reading | `PLATE_PAIR` | base left / analysis right |
| C | §14 façade order | principal front elevation | `PLATE_SINGLE` | face prose |
| D | §14 section/arrival | principal longitudinal section | `PLATE_SPREAD` | one composition across fold |
| E | §14 court order | courtyard elevation | `PLATE_SINGLE` | face prose |
| F | §15 structure | structural/span overlay | `PLATE_SINGLE` | face prose |
| G | §16 service geography | service/transverse section | `PLATE_SINGLE` | face prose |
| H | §16 service expression | service-side elevation | `PLATE_SINGLE` | face prose |
| I | §16 vertical/horizontal routes | ground + first service overlays | `PLATE_PAIR` | ground left / first right |
| J | §17 roof/water | roof plan + water/failure reading | `PLATE_PAIR` | base left / analysis right |
| K | §17 environmental hierarchy | garden elevation | `PLATE_SINGLE` | face prose |
| reserve | §17→§18 transition | sectional axonometric if admitted | `PLATE_SPREAD` | no pages reserved now |
| L | §18 loss of stair use | future-adaptation overlay | `PLATE_SINGLE` | face prose |

This sequence accounts for every current DRW-02D Part IV target:

- 7 essential conventional views;
- 5 essential analytical readings;
- 4 supporting views/readings;
- 1 optional synthesis view held outside the core sequence.

The dedicated west elevation and all six currently under-authorised construction details remain absent by design.

## 6. Parts I–III sequence

No change is made to the five retained abstract figures:

- Part I — selective permanence / platform;
- Part II — designed interface functions;
- Part II — failure architecture sequence;
- Part II — maintenance geography route;
- Part III — pattern fields + generative sequence.

They remain `FLOW` figures at their present conceptual locations unless later manuscript editing gives a concrete reason to move them.

They should **not** be promoted to dedicated plates merely to make the early book visually resemble Part IV. Their relative scarcity is part of the publication’s escalation toward the worked house.

## 7. Deliberate blanks and parity

### 7.1 No decorative blanks

DRW-02E authorises **zero aesthetic / ceremonial blank pages**.

A blank exists only when physical facing-page logic requires it.

### 7.2 Parity rule for pairs and spreads

Every `PLATE_PAIR` and `PLATE_SPREAD` begins on a **verso / left page** and completes on the facing **recto / right page**.

If preceding prose leaves the next page on a recto, insert one deliberately blank recto so the following plate event begins on the next verso.

If preceding prose already leaves a verso next, insert no blank.

Any parity blank:

- contains no running head;
- contains no folio;
- contains no decorative quotation or compensating graphic;
- is a layout consequence, not reader-facing content.

### 7.3 Final blank count is intentionally unfrozen

The exact number of parity blanks cannot be truthfully frozen before final prose pagination and trim are known. A4 and B5 can change prose page count and therefore parity without changing the plate sequence.

DRW-02E freezes the **rule**, not a fake absolute count.

## 8. Spread and rotation register

### Confirmed true spread

1. **Principal longitudinal section** — `1:100 / PLATE_SPREAD`.

It earns width because the architectural sequence, external context and annotations would be materially degraded by shrinking into the conservative B5 single-page frame.

### Conditional spread

2. **Sectional axonometric** — `NTS / PLATE_SPREAD` only if DRW-09 admits it.

No page allocation is reserved.

### Rotated plates

**None currently earned.**

No 02D view should rotate merely because its aspect ratio is inconvenient. If a real drawing later proves that portrait single/pair/spread treatment is materially inferior, the owning packet must reopen the page-class decision explicitly.

### Foldouts

**None.** Foldout remains outside the executable DRW page classes unless a later frozen view proves the ordinary hierarchy inadequate and PR-02 manufacturing work independently justifies it.

## 9. A4 and B5-territory rhythm check

DRW-01E already proved the frozen graphic/page doctrine at both current A4 proof size and conservative ISO-B5 territory. DRW-02E therefore checks the **sequence invariant**, not a second synthetic graphics specimen.

The sequence survives trim reduction because:

- all pair relationships are semantic and do not depend on absolute folio numbers;
- all singles remain complete and can move between verso/recto while facing prose;
- the principal section remains a spread at both proof territories rather than being shrunk to preserve pagination;
- B5 may create additional prose pages and therefore different parity blanks, but it does not split or reorder a pair/spread;
- no new B5-specific scale, font or line-weight reduction is authorised;
- no view relies on screen zoom to repair a print-density problem.

A real full-manuscript placeholder build would currently add reader-facing development residue or require plate-compositor implementation before the drawings exist. DRW-02E deliberately does not do that. The first production-shaped pagination proof belongs with the first implemented plates and later DRW-12 whole-book freeze, where actual geometry and captions exist to test.

## 10. Relationship to the six inherited Part IV schematics

The current six Reference House schematics stay live until their controlled successors satisfy the DRW-00D atomic-replacement rule.

DRW-02E does **not** preserve their current anchors as final plate positions. The successor sequence is claim-led:

- current type/orientation task disperses into the paired plans and the later setting/maintenance pair in Section 13;
- current spatial/sectional task becomes ordinary plan/elevation/section evidence in Sections 13–14;
- current structural task becomes the principal section plus Section 15 structural overlay;
- current service task becomes the Section 16 service section and paired overlays;
- current external-maintenance task is absorbed by the Section 13 setting/maintenance pair and later service/elevation evidence;
- current water/failure task becomes the Section 17 roof/water pair.

This means replacement is **not** six old boxes exchanged for six prettier boxes at the same sentences. The manuscript is being re-authored around architectural evidence.

Actual anchor changes occur only when each successor plate is generated, placed, captioned and validated in its owning DRW-03+ packet.

## 11. Fail-closed sequence rules

The frozen sequence fails if later implementation:

- moves all architectural plates into a separate appendix or uninterrupted technical-sheet block;
- encounters Part IV first through an analytical overlay or optional hero axon before the ordinary plans;
- splits a `PLATE_PAIR` across non-facing pages;
- treats a semantic pair as one cropped drawing;
- shrinks a frozen view merely to avoid a parity blank;
- places unique section information in the binding-loss zone;
- turns two `PLATE_SINGLE`s into an undeclared pair whose meaning depends on comparison;
- reserves decorative blanks or blank spreads for prestige;
- admits a rotated plate automatically from aspect ratio;
- reserves pages for the optional axon before DRW-09 proves it;
- resurrects a deleted west elevation or detail merely to complete a conventional drawing-set checklist;
- exposes implementation IDs or a new public figure-number family without PUB-NOM review.

## 12. Handoff

DRW-02 now has a frozen answer to four questions:

- **what claims require drawings** — DRW-02A;
- **what the rest of the book requires** — DRW-02B;
- **what detail authority presently permits** — DRW-02C;
- **what views exist, at what scale/page class, and in what reading sequence** — DRW-02D + DRW-02E.

The next authorised packet is:

> **DRW-03 — ground-floor plan: source hardening → view spec → renderer capability → controlled SVG → publication plate → print proof.**

DRW-03 must begin from the current live `main`, not from this prose record in isolation. It may not broaden the Reference House merely to make the first plate attractive.
