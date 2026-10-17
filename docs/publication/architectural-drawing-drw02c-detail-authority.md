<!-- nav-exclude: redirect -->
# DRW-02C — Detail authority audit

**Programme:** DRW — Architectural Drawing Programme  
**Packet:** DRW-02C  
**Status:** DONE pending branch validation  
**Issue:** #154  
**Starting baseline:** `fe3453e1a91443164b18921b2ba62b66dd6002c3`

## 1. Purpose

Audit every detail family passed forward by DRW-02A / DRW-02B against the **current geometry, prototype state and evidence actually owned by the project**, then freeze the authority boundary before DRW-02D builds the final view register.

DRW-02B deliberately produced a candidate queue rather than a promised detail set. DRW-02C now asks a harder question:

> **If this linework appeared in an architectural publication today, what would a competent reader reasonably infer had been resolved — and does the project actually own that authority?**

The packet is intentionally allowed to conclude that no construction-style detail is presently publishable as resolved architecture.

This packet does **not**:

- design missing junctions;
- complete prototype programmes;
- select products;
- perform structural, fire, acoustic, hygrothermal or other specialist design;
- harden Reference House source geometry;
- implement renderer capability;
- draw publication figures;
- assign final `ESSENTIAL / SUPPORTING / OPTIONAL / DELETE` register classes;
- assign final scale or page class;
- sequence plates.

Those boundaries prevent the drawing programme from becoming a back door through which unresolved technical design enters the project.

## 2. Governing distinction

A pattern may be mature enough to state a useful recurring relationship while the project-specific construction that instantiates it remains unresolved.

Likewise, a prototype brief may be unusually detailed while still representing only a **question prepared for testing**.

The controlling rules are therefore:

> **A supported pattern can earn a reader question without earning a construction detail.**

and:

> **Where authority exists only at relationship or zone scale, draw the relationship or zone. Do not spend detail scale to purchase certainty.**

A construction-style drawing is especially authority-heavy because ordinary architectural convention makes dimensions, layers, fixings, interfaces and closures look selected even when the caption says “indicative”. A disclaimer does not neutralise linework that has already made unowned decisions.

## 3. Authority ladder

DRW-02C distinguishes five levels of authority. They are not publication maturity grades and are not new public identifiers.

### Relationship authority

The project owns the invariant or design question: for example, a long-lived opening should not be unnecessarily consumed when a shorter-lived frame is replaced.

This can support prose or an abstract relational diagram.

### Spatial authority

The project owns where a zone, room, opening, route or interface occurs and how it relates to other controlled architectural geometry.

This can support plans, sections and analytical overlays at the scale actually owned.

### Assembly-selection authority

The project has selected the physical assembly family sufficiently to state its layers, controlling geometry, fixing/release logic and relevant tolerances without inventing them for the drawing.

This is the minimum threshold for an architectural assembly detail to look selected rather than hypothetical.

### Performance authority

The applicable structural, fire, acoustic, moisture, air, thermal, drainage, security or other boundary duties have enough scoped evidence that the drawing will not visually imply they have disappeared.

Not every publication detail needs to prove every performance numerically, but it must not depict technical closure where the project knows the closure is unresolved.

### Tested authority

Where the project makes a non-standard physical-quality, movement, removability or workmanship claim, the relevant prototype or test has actually occurred and produced a bounded result.

A test protocol, build pack or designed specimen is not tested authority.

## 4. Repository evidence boundary

The audit uses the current repository rather than the ambition of the programme.

### Prototype authority

`docs/prototypes/README.md` is explicit:

- current prototype questions remain **pre-test** unless a measured result is stated;
- designing a prototype does not earn a house-wide technical conclusion;
- physical success, general architectural usefulness and selection for the Reference House are separate verdicts;
- before the physical event, the honest output is a bounded proof question.

That rule is decisive for movement-junction, replaceable-lining and attachment-plane candidates.

### Reference House authority

`docs/reference-house/README.md`, `vertical-bay-coordination.md` and `structural-coordination.md` provide coordinated architectural geometry and bounded pre-engineering relationships.

They support statements about:

- room and service-zone adjacency;
- vertical alignment;
- route concentration;
- working / replacement geography where explicitly recorded;
- controlled openings and principal structure at architectural coordination level.

They do **not** by themselves support:

- final member sizing or connections;
- detailed fire/acoustic closures;
- window jamb/head/sill construction;
- waterproofing systems;
- selected proprietary interfaces;
- validated workmanship tolerances;
- product-specific replacement geometry.

### Compiler authority

The executable source and service semantics can prove controlled identities, locations, zones and relationships that the compiler actually models.

Compiler existence does not upgrade an architectural relationship into building-physics or construction-detail authority. A formally represented opening, route or penetration remains only as technically adequate as the evidence attached to it.

## 5. Candidate matrix

| Candidate family | Authority currently owned | Missing authority that a construction detail would imply | Honest current representation | DRW-02C decision |
|---|---|---|---|---|
| Permanent opening / replaceable frame | Strong relationship authority; controlled Reference House openings; explicit replacement objective | Selected jamb/head/sill assembly, fixing/release geometry, drainage, air/water/thermal continuity, movement/tolerance, product applicability, prototype result | Prose + designed-interface abstraction now; later bounded detail only after authority improves | **DEFER DETAIL** |
| Service wall / riser / dry-side access | Strong relationship + spatial authority; coordinated service geography and vertical zone | Exact pipe/duct/component layout, enclosure build-up, access-panel construction, fire/acoustic/water closure, product clearances | Reference House plan/section/analytical occurrence at controlled zone scale | **SPATIAL OCCURRENCE — SURVIVES** |
| Movement / tolerance interface | Strong general pattern; prototype question and alternative families defined | Project movement envelope, selected junction family, tested cycling/redecoration/reinstatement result, applicable boundary closure | Prose + abstract interface logic; later tested detail if earned | **REFUSE RESOLVED DETAIL NOW** |
| Controlled attachment plane | Supported pattern; prototype/test assembly concepts | Selected house-wide/local implementation, load classes/anchors, physical quality, acoustic/fire effects, tolerance and reinstatement result | Prose/pattern; local later occurrence only if selected and evidenced | **REFUSE RESOLVED DETAIL NOW** |
| Designed structural penetration / boundary transition | Strong conventional relationship; controlled locations can be coordinated | Specific host/opening engineering, service class/fill, fire/acoustic/environmental closure, tolerance/remediation, competent design sign-off | Location/crossing notation on later coordinated drawings; technical detail remains downstream | **REFUSE PROJECT-SPECIFIC DETAIL NOW** |
| Threshold / wet-failure condition | General failure/threshold principles; some room-scale failure relationships | Selected threshold/waterproofing/drainage assembly, falls, terminations, adjoining boundaries, non-duplicative publication need | Failure logic in prose/abstract figure; project occurrence only when selected | **DROP FROM CURRENT DETAIL QUEUE** |

## 6. Permanent opening / replaceable frame

This remains the **highest-value deferred detail**.

The reader question is excellent: how can the architectural opening remain while the shorter-lived frame, glazing, seals and hardware are renewed?

The pattern `Permanent Opening / Replaceable Window` already owns the invariant and explicitly requires the interface to manage fixing, drainage, thermal continuity, airtightness and movement. It is equally explicit that the particular Ovid’s House interface remains subject to building-physics and prototype testing.

Current Reference House geometry owns openings and facade order. It does not own a selected jamb/head/sill construction with enough technical closure to be drawn at 1:10 or 1:5 as though it were the house detail.

A generic “possible subframe” detail would not solve the problem. It would add decisions about:

- subframe material and continuity;
- frame fixing and release direction;
- air and water layers;
- sill drainage and outward falls;
- insulation continuity and thermal bridging;
- reveal/removable trim sequence;
- movement/tolerance zones;
- future frame dimensional compatibility.

Those decisions are exactly what the future technical/prototype work is meant to resolve.

### Decision

**Do not admit a permanent-opening construction detail into the current register as resolved work.**

Keep the reader question and pattern. Re-enter the detail at DRW-11 only if the source/evidence state has advanced enough to support the actual assembly drawn.

DRW-02D may record this as a deferred detail obligation / later re-entry condition, but not as a current publication plate that merely awaits rendering.

## 7. Service wall / riser / dry-side access

This candidate survives the audit, but **changes representational class**.

The project genuinely owns significant spatial information:

- high-service rooms are clustered;
- a bounded vertical service zone is coordinated with the service-intensive programme;
- dry-side access is a deliberate architectural relationship where geometry permits;
- service concentration, approach, working and withdrawal geography are part of the Reference House coordination;
- the formal service model can encode zones and access relationships without pretending to know final products.

That is enough to draw the **architectural geography**.

It is not enough to draw a construction-complete service-wall detail. The project does not yet own one exact family of studs/linings/panels, penetrations, fire/acoustic closure, waterproofing interface, cistern/valve/fan arrangement or product withdrawal clearance that can stand as the selected assembly.

### Decision

**Reclassify from early-book detail candidate to Reference House spatial/analytical occurrence.**

The appropriate future instruments are:

- coordinated plan overlay;
- vertical/service section where the final register earns it;
- bounded working/withdrawal geometry where source-controlled;
- labels distinguishing controlled zones from unresolved technical systems.

Do not show pseudo-pipes, pseudo-ducts or construction layers merely to make the service zone look technical.

This is a positive result: the reader gets more truthful architectural information by drawing at the scale the project actually owns.

## 8. Movement / tolerance interface

The Movement / Slip Junction pattern is well-founded as a general principle. That does not select the Reference House junction.

The P04 wall/ceiling work is explicitly a prototype programme comparing alternative families, including excellent conventional construction. Its purpose is to discover which, if any, survive movement, redecoration, removal/reinstatement and architectural-quality testing.

The project also does not yet own the real movement envelope needed to convert an exploratory imposed test into a prediction of building behaviour.

A polished cornice/slip/brass detail today would therefore collapse an unresolved comparison into a selected answer.

### Decision

**Refuse a resolved publication detail now.**

The existing designed-interface abstraction and prose carry the principle honestly. A physical detail may re-enter only after the project has selected an actual family on evidence appropriate to the claim being made.

Brass/bronze remains a possible functional material, not a pre-authorised graphic signature.

## 9. Controlled attachment plane / replaceable lining

The Controlled Attachment Plane pattern owns a useful relationship: repeated fit-out can terminate at a deliberately designed intermediate attachment condition rather than repeatedly consume permanent masonry.

The physical implementation is not yet settled.

The wall-bay / replaceable-lining prototype work exists specifically because the project has not established whether the extra depth, joints, fixing logic, solidity, acoustics, tolerance recovery and reinstatement are better than first-rate conventional construction.

`docs/prototypes/README.md` states the correct fallback explicitly: if the lining cannot match ordinary wall quality, retain direct finish and use local controlled attachment/service datums only where a real task earns them.

### Decision

**Refuse a resolved attachment-plane / replaceable-lining detail now.**

Do not turn test-assembly geometry into house geometry. Local attachment occurrences may later be drawn if actually selected and source-controlled; the held replaceable-lining proposition remains held.

## 10. Designed structural penetration / boundary transition

This pattern has strong professional precedent and may require no Ovid’s House-specific invention at all.

The project can coordinate where a route meets permanent/protected construction. That supports:

- crossing identity;
- host identity;
- location;
- a statement of applicable boundary duties;
- no-drill / no-notch or reserved-zone information where formally owned.

It does not establish that a particular opening, sleeve, collar or closure is structurally, acoustically, fire-, moisture- or otherwise adequate.

A dedicated early-book construction detail would therefore produce little unique reader value while carrying a large false-authority risk.

### Decision

**Refuse a project-specific construction detail now.**

Show crossings on the later coordinated architectural / structural / service substrate where useful. Let the eventual competent technical design select and evidence the ordinary engineered detail unless a genuinely non-standard condition later earns separate treatment.

## 11. Threshold / wet-failure condition

The doctrine around thresholds, credible water failure, containment, observation, isolation, drainage and drying is strong.

The candidate is weak as a current standalone detail because the project has not selected one non-duplicative physical threshold/wet-failure assembly whose exact geometry carries an important argument unavailable elsewhere.

A generic upstand, drain, tray or tanking section would silently universalise one implementation despite the pattern text repeatedly refusing that move.

### Decision

**Drop this family from the current detail queue.**

Failure architecture remains supported by the existing abstract figure and later Reference House roof/water/service occurrences. A real technical detail can still emerge downstream if one specific house condition eventually demands it.

## 12. Held candidates remain graphically held

DRW-02C confirms the DRW-02B prohibition on using architectural detail to promote held ideas prematurely.

In particular, the drawing programme must not make these look selected merely because their geometry would be visually compelling:

- Replaceable Architectural Lining;
- Individually Isolatable Manifold Distribution;
- Local Deep Service Zone;
- Selective Floor Access.

A detail is not a neutral illustration when its normal architectural grammar communicates selection and buildability.

## 13. What “deferred” means

`DEFER DETAIL` does not mean “draw it later regardless”.

A deferred family must re-enter against its then-current authority. Before a construction-style detail is admitted, the later packet should be able to answer, at minimum:

1. what exact reader question the detail answers;
2. which geometry is controlled source rather than illustrator completion;
3. which assembly family has actually been selected;
4. which applicable boundary duties are resolved, and which remain explicitly outside the claim;
5. whether a non-standard physical claim depends on prototype/testing and, if so, what result exists;
6. whether the detail adds information that is not already clearer in plan, section, overlay or prose.

If those questions still fail, deletion remains the correct result.

## 14. Representation ceiling

The audit establishes a representation ceiling for the current project state.

### Currently authorised

- abstract diagrams for doctrine/pattern relationships already retained by DRW-00D;
- whole-building architectural geometry and analytical overlays supported by the Reference House source;
- service-wall/riser/dry-side-access **spatial relationships** on that controlled substrate;
- crossing/opening/interface locations and authority notes where source-owned.

### Not currently authorised as resolved publication detail

- window jamb/head/sill construction;
- wall/ceiling movement construction;
- replaceable-lining / attachment-plane construction;
- project-specific structural penetration closure;
- generic threshold/wet-room construction;
- any held-candidate construction detail;
- any detail that visually completes unresolved structural, fire, acoustic, air, water, thermal, drainage or workmanship obligations.

This ceiling is evidence-sensitive. It can rise when the project genuinely acquires new authority; DRW must not raise it graphically first.

## 15. Consequence for DRW-02D

DRW-02D can now build the final view register without treating the 02B queue as six latent plates.

The 02C handoff is:

- **current construction-style details authorised for Parts I–III: 0**;
- **service-wall/riser/dry-side-access: survives as Reference House spatial/analytical occurrence, not detail**;
- **permanent opening / replaceable frame: valuable but deferred; re-enter only if later technical/prototype authority earns it**;
- **movement/tolerance: refused as resolved detail at current pre-test state**;
- **controlled attachment / replaceable lining: refused as resolved detail at current pre-test/selection state**;
- **structural penetration/boundary: no project-specific detail at current authority; show coordinated occurrence only where useful**;
- **threshold/wet-failure: removed from current detail queue**.

DRW-02D should therefore classify the view set around the architectural object and its analytical readings rather than reserve pages for speculative technical detail.

Any later DRW-11 detail re-entry must cite the authority that changed this decision.

## 16. Conclusion

The packet's strongest result is a refusal to confuse **well-developed intent** with **resolved construction**.

The project has enough authority to draw a serious architectural house and several rigorous analytical readings. It does not yet have enough authority to make unresolved interfaces look like a technical-detail catalogue.

That is not a deficit to conceal. It is the correct evidence boundary at the present maturity.

> **Draw at the scale of the authority actually owned.**

DRW-02C is complete when this record is merged on a green current-main baseline.

**Next authorised packet: DRW-02D — freeze the final `ESSENTIAL / SUPPORTING / OPTIONAL / DELETE` view register, with source authority, scale band and page class.**
