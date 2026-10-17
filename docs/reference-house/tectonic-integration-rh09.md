# Reference House — RH-09 Tectonic and Occupied-Surface Integration

**Status:** RH-09 design gate record / pre-prototype occupied-interface baseline  
**Date:** 2026-10-12  
**Question:** can the Reference House make its maintainable interfaces architecturally quiet, solid and ordinary in use without turning principal rooms into technical fit-out?  
**Architectural language:** [Tectonic Architectural Language](tectonic-architectural-language.md)  
**Prototype authority:** [Tectonic Prototype and Engineering Programme](../development/tectonic-prototype-programme.md)  
**Service authority:** [RH-06 Services and Failure Geography](service-topology-rh06.md) and [RH-07 MVHR Addendum](service-topology-rh07-mvhr-addendum.md)  
**Roof/access authority:** [RH-08 Roof, Drainage and External Maintenance](roof-drainage-access-rh08.md)  
**Diagram:** [RH-09 occupied-interface family](tectonic-interface-family-rh09.svg)  
**Prototype handoff:** [RH-09 Prototype Handoff Matrix](prototype-handoff-rh09.md)

RH-09 does not claim technical validation of non-standard wall, floor or movement assemblies. It fixes the **Reference House selection logic**: which interfaces are conventional, which use canonical House Kernel patterns, which remain experimental and which are rejected.

The result is intentionally conservative:

> **Keep quiet surfaces simple. Put serviceability at real interfaces and architectural datums. Do not make the room carry a visible technical grid merely because the building has a maintenance doctrine.**

The Reference House therefore does **not** adopt a house-wide removable lining or raised-access floor. Direct mineral plaster remains the baseline on low-service permanent masonry. Controlled attachment, removable skirting, replaceable opening trims and dry-side service access are used selectively where they buy real lifecycle value.

---

## 1. Occupied-surface hierarchy

The house uses three wall conditions rather than one universal technical wall.

### `W0` — quiet permanent wall — **baseline**

Use where the wall carries little service/change burden.

Working build-up at architectural level:

```text
permanent masonry / rigid background
→ continuous permanent boundary treatment where required
→ high-quality directly applied mineral/plaster finish
→ ordinary decoration
```

No service cavity, full-height backplane or removable panel is added merely because it could be useful one day.

This condition is preferred on substantial areas of principal drawing, family and bedroom wall where:

- there is no recurring service route;
- no major replaceable joinery is expected;
- ordinary hanging can be handled by a real picture rail or a small declared fixing zone;
- direct finish gives the strongest tactile/acoustic solidity for the least material and depth.

The wall remains repairable rather than demountable.

### `W1` — controlled architectural datum — **selected**

Use where repeated fixing, local services or architectural trim already justify an intermediate fixing layer.

The selected family uses **sparse dedicated grounds rather than a continuous technical rack**:

- skirting grounds;
- architrave / door-jamb grounds;
- picture-rail or other genuine hanging datum where composition justifies it;
- local heavy-load plate/ground for declared joinery or equipment;
- limited adjustable fixing geometry where permanent masonry tolerance needs to be reconciled with precise joinery.

Permanent masonry receives sparse documented anchors. Faster-changing fit-out attaches to the known grounds.

This is the Reference House occurrence of `PAT-022 — Controlled Attachment Plane`.

### `W2` — replaceable architectural lining — **experimental challenger only**

The P01-W2 full-height removable mineral-panel system remains under test.

RH-09 explicitly **does not make W2 the Reference House baseline before P01**. If P01 cannot match an excellent plaster control for solidity, acoustics, appearance, fixing, reinstatement and installer robustness, the house keeps W0/W1 and rejects W2 without architectural loss.

If P01 passes both its general evidence gate and its Reference House fit gate, selected high-change/service bays may adopt W2 later. A P01 pass does not justify covering every room in panels.

---

## 2. Dry-room edge infrastructure

### Skirting

Substantial timber skirting remains the preferred low-level architectural interface in dry rooms where a local route is useful.

Selected duties may include:

- protect wall/lining edge;
- cover the declared floor/wall tolerance zone;
- conceal a **bounded electrical/data route** where competent electrical design permits;
- expose that route by removal rather than chasing permanent masonry;
- cover the lower edge/release of a future W2 lining where one is actually selected.

Construction direction:

- real timber;
- mechanically fixed to known grounds;
- ordinary concealed screws as the baseline release method;
- no adhesive-only installation where removal is intended;
- no proprietary clip system required for normal serviceability;
- local pieces sized so one service intervention does not require stripping an entire room.

The skirting must still read as joinery, not trunking.

### Socket and switch height

The old idea of putting ordinary socket outlets *in the skirting* is **not selected for the Reference House**.

Current Approved Document M guidance for new dwellings recommends switches and socket-outlets for lighting and other equipment between **450 mm and 1200 mm above finished floor level**. The architectural route therefore separates **distribution** from **accessory position**:

```text
removable skirting route
→ known vertical rise at door/architrave or local declared service datum
→ socket / switch / control at appropriate accessible height
```

The vertical rise must remain a declared service/no-fix zone. Power/data separation, cable protection and safe-zone compliance remain electrical-design obligations.

Canonical source: GOV.UK, *Approved Document M: access to and use of buildings, Volume 1 — Dwellings*.

### Door surround as infrastructure

Selected door surrounds may perform genuine local technical work where that work is already needed:

- vertical rise from low-level route;
- switch/control position near the room entrance;
- removable architrave exposing the declared fixing/service zone;
- protection of lining/frame edges.

Not every architrave becomes a cable chase. The route is used only where it shortens or clarifies real distribution.

Together, removable skirting plus selected door-surround rises create the first Reference House occurrence of `PAT-015 — Accessible Room Service Route`.

---

## 3. Fixing hierarchy

The house must be easy to live in without encouraging arbitrary drilling through services or permanent masonry.

Use three declared load classes at technical design:

### `F1` — ordinary domestic hanging

Examples: pictures, light mirrors and similar low-consequence items.

Preferred support:

- working picture rail where composition includes one;
- known timber/metal ground;
- suitable ordinary fixing into a documented safe wall field where no intermediate datum exists.

### `F2` — substantial fit-out

Examples: shelving systems, large mirrors, substantial wall furniture and selected radiators/emitters if wall-mounted.

Preferred support:

- declared attachment ground / plate;
- known anchor pattern back to permanent structure as required;
- recorded allowable load and no-fix/service zones.

### `F3` — exceptional / safety-critical load

Examples: very heavy joinery, exceptional sanitary/support loads or anything where failure is high consequence.

Treat as an engineered fixing directly related to permanent structure or a specifically designed load-transfer element. Do not pretend the ordinary attachment plane is universal structure.

The building record must preserve the safe fixing map and concealed service zones. The user should not need a digital model to hang an ordinary picture, but neither should heavy work depend on guesswork.

---

## 4. Window interface family — `OW-01`

RH-09 now creates one representative project occurrence of `PAT-007 — Permanent Opening / Replaceable Window` for the controlled G-01 window families.

The invariant is:

```text
permanent masonry opening
→ durable mounting / tolerance zone
→ replaceable window frame
→ removable internal reveal / architrave trim
```

### Selected project direction

- the masonry reveal and sill geometry belong to the long-lived building;
- window-frame fixings are mechanical and placed in declared accessible fixing zones rather than buried behind irreversible wet finish;
- internal architrave/reveal trim is removable and may conceal the tolerance/fixing interface;
- no brittle plaster bridges directly from permanent wall to moving frame;
- primary building-side air/water/thermal continuity must not depend on the decorative architrave;
- external weather seals remain maintainable from the RH-08 façade-access method;
- full-frame replacement is drawn as an actual sequence, not assumed from glazing-unit replaceability.

RH-08 already preserves ordinary external access, so RH-09 does **not** require every complete frame to be removable from inside. Internal removal of sash/glazing/ironmongery should be preferred where the selected product family permits it; full-frame replacement may legitimately use external scaffold/tower.

### Material status

A slim thermally broken aluminium family remains a credible Reference House comparator because it can support a restrained G-01 expression and avoids relying on exposed timber in the primary weathering position. RH-09 does **not** freeze a proprietary window or claim that aluminium is House Kernel doctrine.

### Prototype gate

Before repeating a non-standard interface throughout the house, build one jamb/head/sill mock-up. Test:

- water shedding and sill geometry;
- airtight/thermal continuity;
- frame fixing and adjustment;
- removable internal trim;
- full-frame withdrawal sequence;
- replacement without masonry-edge destruction;
- appearance at normal room distance.

The occurrence is selected at coordination level; the interface detail remains technically unvalidated.

---

## 5. Door and threshold families

### Doors in permanent openings — `OD-01`

Where a doorset sits within permanent masonry or another genuinely long-lived opening, select:

```text
permanent opening
→ declared fixing / adjustment zone
→ replaceable doorset
→ removable architrave
```

This creates `RH-P019-01 — Permanent Opening / Replaceable Door`.

Architrave performs real work:

- covers the adjustment/fixing zone;
- protects finish edges;
- can be removed without cutting back plaster;
- belongs to the G-01 interior hierarchy.

Lightweight partitions do not need elaborate demountable opening infrastructure merely to imitate this condition.

### Internal thresholds

Where the same floor build-up genuinely continues through an internal doorway, **use no decorative threshold strip**.

A threshold appears only where construction, wear, movement or environmental duty actually changes.

### External courtyard/garden thresholds — `TH-01`

At the courtyard and garden openings, treat the threshold as a real interface between:

- internal floor datum;
- replaceable doorset;
- external paving/drainage;
- movement;
- weathering;
- accessibility.

Use a durable stone/timber/metal wear element only where it performs those duties. The preferred architectural expression is quiet and substantially flush; detailed level-access, drainage and weathering geometry remains technical-design work.

This creates `RH-P020-01 — Designed Threshold` for the principal external garden/courtyard opening family.

Brass/bronze is **not** required. Use it only if it genuinely protects a wearing edge, forms a replaceable interface or performs another real function better than stone/timber/aluminium.

---

## 6. Wall / ceiling movement junction — `WCJ-01`

The principal-room cornice is allowed to become a real tectonic interface, but only through P04 validation.

Selected hypothesis:

- wall/lining and ceiling terminate independently;
- provide a bounded movement gap rather than rigid filler bridging both assemblies;
- mechanically fix the cornice / cover to **one controlling assembly**;
- let the other assembly move behind the overlap;
- preserve air/fire/acoustic duties independently of the decorative cover;
- ensure decoration cannot accidentally glue the movement joint shut.

This creates `RH-P008-01 — Movement / Slip Junction` at the representative wall/ceiling condition.

### Visible metal decision

A visible brass/bronze slip line is **not the baseline**. P04 compares:

1. conventional quiet movement junction;
2. mechanically fixed cornice with concealed slip geometry;
3. restrained brass/bronze line only where the metal actually protects, locates or slips.

The simplest version that works architecturally and technically should win.

---

## 7. Floor access — no current Reference House occurrence

RH-09 finds no present reason to make principal room floors removable.

The current service strategy deliberately avoids active components in inaccessible floor zones. MVHR floor branches, where used, are long-life ducts with terminal/manifold access; dry room services prefer wall/joinery routes. Therefore a removable full-room floor would add:

- joints;
- potential squeak/rattle;
- acoustic risk;
- depth;
- cost and material;
- a visible or tactile access logic

without a demonstrated maintenance task.

**Reference House decision:** conventional continuous principal-room floors remain the baseline.

P02 selective-floor-access research remains worthwhile as a generic/contingency prototype, but it is **not currently selected by the Reference House**. If later coordination places a genuinely maintainable service beneath `G-GAL-01`, `U-GAL-02` or another bounded circulation strip, reopen the question locally rather than panelising entire rooms.

This is a deliberate rejection of infrastructure without a task.

---

## 8. Service access panels and indexing

### Plant and service spaces

Inside `G-PLANT-01`, `G-SVC-02` and other explicitly technical service-side spaces, access should be obvious, robust and large enough to work through. There is no architectural value in disguising a plant access door as fake panelling.

### Bathroom dry-side access

`U-BATH-01` already places maintainable components on a dry-side service wall adjoining `U-GAL-02`.

The preferred occupied-side expression is:

- ordinary waterproofed bathroom finish remains uninterrupted where practical;
- access occurs from the dry gallery side;
- the access panel aligns with a real joinery/panel field rather than becoming a small tile hatch;
- opening the panel does not disturb the waterproofing layer.

### Physical service index

`RH-P012-02` remains at the internal approach to `G-PLANT-01`.

This is one of the few places where restrained engraved brass/bronze has an obvious tectonic justification: the plate can be durable, touched, read, updated/replaced and visibly signal building stewardship. The index remains small; it is not an O&M manual on the wall.

---

## 9. Metal vocabulary after RH-09

RH-09 narrows the earlier tectonic language.

Preferred visible brass/bronze uses are now limited to cases such as:

- touch hardware;
- durable service index / labels;
- sacrificial or wearing threshold edge where justified;
- genuine removable trim or movement protector if P04 proves it;
- selected grilles/covers where metal is technically appropriate.

Rejected as default:

- continuous brass panel grids;
- decorative slip lines with no movement duty;
- metal seams merely announcing panelisation;
- brass around every access point;
- bespoke metal mechanisms where ordinary concealed hardware is more replaceable.

**Brass marks where the building comes apart** survives as a useful project intuition, not a rule that every joint must be brass.

---

## 10. Prototype / engineering boundaries

RH-09 deliberately leaves several matters unresolved because drawings cannot prove them.

### P01 — W2 wall bay

Must decide whether replaceable lining belongs in the Reference House at all.

Until P01 passes:

- W0/W1 remain the house baseline;
- no room depends on W2 for architectural completion;
- no whole-house quantity/cost assumption treats W2 as selected.

### P02 — selective floor access

Reference House status: **not selected**.

Continue generic prototype research only if it remains useful to House Kernel. Re-open for the house only when a real bounded service task earns it.

### P04 — wall/ceiling tectonic joint

Must compare the selected cornice/slip hypothesis against an excellent conventional junction. RH-09 selects the **problem and architectural location**, not the final mechanism.

### Engineering / specialist review

Still required for:

- attachment-plane anchor/load classes;
- exceptional fixings;
- fire/acoustic effects of cavities and removable trim;
- electrical safe zones / cable protection and separation;
- window thermal/weather/air interface;
- external threshold weathering and accessibility;
- any fire-resisting doorset interface;
- movement allowance at `WCJ-01`.

---

## 11. RH-09 pattern-occurrence changes

RH-09 creates these current coordination occurrences:

- `RH-P007-01` — representative permanent-opening / replaceable-window family `OW-01`;
- `RH-P008-01` — representative wall/ceiling movement junction `WCJ-01`;
- `RH-P015-01` — dry-room edge service route: removable skirting + selected door/architrave rises;
- `RH-P019-01` — replaceable doorset family in permanent openings `OD-01`;
- `RH-P020-01` — designed external courtyard/garden threshold family `TH-01`;
- `RH-P022-01` — sparse controlled attachment datum family `W1`.

It creates **no** project occurrence for the held Replaceable Architectural Lining candidate or Selective Floor Access candidate.

---

## 12. Gate result

### PASS — at architectural / pre-prototype coordination level

RH-09 passes because every consequential non-conventional occupied interface now falls into one of four explicit states:

1. **selected conventional baseline** — e.g. direct plaster and continuous principal-room floors;
2. **selected canonical-pattern occurrence with bounded technical proof still due** — e.g. opening interfaces, thresholds, attachment datums and room-edge routes;
3. **routed to physical validation** — P01 and P04;
4. **not selected / rejected unless a real future task reopens it** — house-wide removable lining and accessible flooring.

The house no longer depends on rhetorical serviceability. It also does not depend on every experimental idea succeeding.

No RH-02 through RH-08 architectural rewind is required.

---

## 13. Next gate

`RH-10 — Whole-house coordination audit` should now attack the complete virtual building across:

- programme and ordinary life;
- G-01 composition;
- structure;
- services / MVHR;
- environment and overheating assumptions;
- roof / drainage / moisture;
- occupied interfaces;
- fire/acoustic assumptions that affect geometry;
- maintenance/replacement;
- area/cost/complexity proportionality;
- pattern occurrence accuracy;
- authority drift.

RH-10 is where remaining cross-system contradictions must be surfaced before any Reference House maturity promotion is considered.