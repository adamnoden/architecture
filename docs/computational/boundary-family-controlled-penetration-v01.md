# Boundary Family PEN-ENV-01 — Controlled Service Penetration Through External Envelope

**Status:** H1 paper-domain research family v0.1 — product/detail evidence required; not a native executable family  
**Purpose:** make ordinary pipe, cable and duct penetrations deliberate transitions through the building envelope rather than site-cut holes repaired with generic sealant.  
**Primary H1 construction:** masonry cavity walls + simple duo-pitched roof.  
**Date:** 2026-10-04

## 1. Principle

A service penetration does not create one hole.

It crosses several independent boundaries that must each be restored.

For a typical external wall:

~~~text
OUTSIDE
  ↓
WEATHER / RAIN-SHEDDING LAYER
  ↓
OUTER MASONRY LEAF
  ↓
DRAINED CAVITY + INSULATION
  ↓
INNER LEAF
  ↓
AIR BARRIER
  ↓
SERVICE / FINISH ZONE
  ↓
INSIDE
~~~

For a pitched roof:

~~~text
OUTSIDE
  ↓
ROOF COVERING / TERMINAL FLASHING
  ↓
DRAINAGE / UNDERLAY PLANE
  ↓
COLD OR WARM ROOF BUILD-UP
  ↓
THERMAL LAYER
  ↓
AIR / VAPOUR-CONTROL LAYER
  ↓
SERVICE ZONE
  ↓
INSIDE
~~~

The computational model therefore represents a penetration as:

> **service + host assembly + boundary transitions + reinstatement details + maintenance/replacement path**

not merely `hole diameter = x`.

## 2. Why this family exists

Penetrations are small geometrically and disproportionately important physically.

A poor penetration can create:

- rain tracking to the inner leaf;
- air leakage;
- convective moisture transport;
- local insulation voids / thermal bypass;
- condensation;
- pest entry;
- uncontrolled fire/smoke paths where a fire-resisting assembly is crossed;
- an unmaintainable service trapped in permanent fabric.

The family applies the wider HSA interface rule:

> **Component A + designed interface + Component B.**

The service is Component B. The envelope does not simply stop around it.

## 3. Supported subtypes

PEN-ENV-01 v0.1 supports two ordinary H1 geometries.

### PEN-WALL-CORE-01

A small/medium circular or rectangular service passing approximately perpendicular through a completed masonry cavity wall.

Typical uses:

- ventilation duct;
- waste/overflow pipe;
- water pipe to an external tap;
- cable/data sleeve;
- heat-pump service connection where technically appropriate.

### PEN-ROOF-TERM-01

A pipe/duct terminating through the simple pitched roof using a proprietary weathered roof terminal / vent-tile / flashing system.

Typical uses:

- passive/hybrid ventilation stack;
- soil vent pipe;
- mechanical extract duct.

Combustion flues, chimneys, large grouped service risers, structural steel penetrations and arbitrary roof plant are outside this first family unless separately supported.

## 4. First rule — minimise and group

The best penetration is usually the one that was not required.

H1 should:

- keep most internal services in accessible inboard service zones;
- group incoming services where technically sensible;
- reuse planned service-entry zones rather than pepper the envelope with individual holes;
- keep enough separation that each collar/seal can actually be installed and inspected;
- distinguish grouped route planning from stuffing incompatible services through one oversized unsealed opening.

Approved Document L's airtightness guidance explicitly encourages grouping incoming ducts/cables to reduce air-barrier penetrations and using proprietary grommets/flexible collars at those that remain.

## 5. Wall subtype — preferred geometry

For PEN-WALL-CORE-01, the preferred H1 route is a **planned core-drilled penetration through the completed wall** rather than a loose sleeve built into incomplete masonry without a controlled moisture detail.

Reasons:

- clean, bounded opening;
- less risk of mortar droppings collecting on a built-in duct and bridging the cavity;
- exact service location can be coordinated before drilling;
- workmanship is inspectable;
- the opening can be kept close to the service/sleeve size.

NHBC's current technical guidance specifically accepts that a core-drilled extract duct/flue installed after wall completion need not necessarily have a cavity tray above, whereas a duct built into the wall as masonry is constructed should be protected by a cavity tray; NHBC still describes a tray over a planned core-drilled opening as good practice.

This does not mean cavity trays are prohibited or unnecessary in every wall/exposure/product condition. The selected detail owns that decision.

## 6. Sleeve and service independence

Where the service type/detail benefits from a sleeve, the sleeve is the stable interface with the building and the service passes through it.

Conceptually:

~~~text
BUILDING
  ↕
SLEEVE / CONTROLLED OPENING
  ↕
REPLACEABLE SERVICE
~~~

This is especially valuable where the service may be replaced before the masonry wall.

The sleeve should:

- be compatible with the service and sealants/collars;
- allow required thermal movement;
- not create an uncontrolled path through the cavity;
- not become a reservoir directing water inward;
- be independently fixed/supportive rather than relying on a membrane or sealant to carry service weight.

For services that require additional sleeving under their own technical standards, both annuli matter:

~~~text
STRUCTURE ↔ SLEEVE
SLEEVE ↔ SERVICE
~~~

Sealing one and forgetting the other is not an air-boundary pass.

## 7. Wall weather transition

The external face must shed rain away from the penetration.

For a through-wall ventilation duct / similar horizontal penetration, H1 prefers:

- slight fall toward the exterior where compatible with the service;
- exterior terminal / flange / grille shaped to shed water;
- weather seal at the outer-leaf interface;
- no detail that encourages water running along the duct toward the inner leaf;
- cavity tray / drip / product-specific protection where required by construction sequence, exposure or selected system.

NHBC guidance notes that circular ducts/flues core-drilled through completed masonry walls can use a slight fall to outside to direct moisture toward the outer leaf.

The outer weather seal is **not** the air seal.

They may be physically close in some constructions, but their functions and failure modes remain separately represented.

## 8. Cavity / moisture transition

The cavity remains a drainage and separation zone.

The penetration must not casually turn it into a bridge.

The family therefore generates checks for:

- mortar/debris bridging around the service;
- rainwater tracking along the penetrant;
- insulation continuity around the opening;
- cavity tray / DPC need for the selected construction method;
- compatibility with cavity barriers where one is present;
- pest path.

A contractor filling the entire cavity locally with a random mass of foam is not the generic PEN-ENV-01 solution.

A proprietary system may use foamed/sealed material where its technical detail justifies it; that becomes product evidence, not generic workmanship permission.

## 9. Air-barrier transition

The airtightness layer is sealed deliberately and visibly.

Current Approved Document L guidance for new dwellings calls for:

- small, preferably core-drilled service holes;
- proprietary grommets or collars around service penetrations;
- air-sealing tape or sealant to connect the collar/grommet to the air barrier;
- careful, durable detailing where a membrane is penetrated.

H1 therefore prefers:

~~~text
SERVICE / SLEEVE
   ↓
ELASTIC PROPRIETARY COLLAR / GROMMET
   ↓
TAPED / BONDED CONNECTION
   ↓
DECLARED AIR-BARRIER MATERIAL
~~~

rather than:

~~~text
SERVICE
   ↓
UNSPECIFIED GAP
   ↓
LARGE BEAD OF GENERIC MASTIC
~~~

The detail must accommodate expected differential movement between service and wall without pulling the air seal apart.

## 10. Thermal transition

The service opening should not unnecessarily break the insulation layer.

The model records:

- penetrant/sleeve geometry through insulation;
- local insulation closure/reinstatement;
- conductive service/sleeve material where relevant;
- whether the penetration is included in the whole-house thermal-bridge calculation or accepted junction/detail set.

H1 v0.1 does **not** invent a generic psi-value for service penetrations.

Thermal adequacy may be:

- negligible under an accepted assessment method;
- included in the dwelling energy calculation/detail set;
- externally calculated for significant penetrations.

The semantic obligation is continuity and evidence, not fake numerical precision.

## 11. Penetrating-service support

A seal is not a pipe bracket.

The service must be independently supported so that:

- its dead load;
- vibration;
- thermal movement;
- maintenance force

do not have to be resisted by the air/weather membrane connection.

Ducts connected to fans should similarly avoid imposing vibration or weight on roof/wall weathering details.

## 12. Interior service geography

The penetration should normally emerge into an accessible service zone, plant space or visible terminal condition.

H1 rejects the pattern:

> core drill wall → hide coupling immediately inside permanent plaster/build-up → forget it exists.

Where a connection is necessary near the penetration, the family generates an access/replacement obligation.

## 13. Roof subtype — multiple independent seals

PEN-ROOF-TERM-01 requires separate resolution at:

1. **roof covering / primary weather surface**;
2. **underlay / secondary drainage plane**;
3. **thermal layer**;
4. **air/vapour-control layer**;
5. **duct/pipe support and insulation**.

A weatherproof vent tile does not automatically seal the ceiling air barrier.

An airtight collar at ceiling level does not make the roof covering weatherproof.

## 14. Roof covering / terminal

The preferred H1 arrangement uses a proprietary terminal compatible with the selected roof covering and pitch.

The terminal/system evidence must establish relevant:

- permitted roof pitch;
- tile/slate compatibility;
- fixing;
- weather performance;
- free area / duct connection as applicable;
- resistance/pressure characteristics where ventilation performance depends on it;
- service type restrictions;
- maintenance/replacement method.

Current Marley ventilation terminals are one ordinary market precedent: proprietary roof-covering components are available for natural ventilation, mechanical extract and soil-pipe ventilation, with stated roof-covering/pitch compatibility.

This is precedent, not a locked H1 product choice.

## 15. Roof underlay transition

The underlay is not simply hacked around the pipe.

NHBC pitched-roof guidance requires underlay penetrations to be neatly cut and protected from water ingress with tapes/proprietary seals where no other detail is supplied, and directs proprietary ventilation units to be installed to manufacturer instructions.

H1 therefore records the underlay penetration separately from the roof terminal.

The detail should preserve the underlay's drainage path rather than forming a pocket that channels water into the roof space.

## 16. Roof air/vapour-control transition

Where the ceiling or roof build-up carries the air/vapour-control layer, the duct/pipe receives its own durable collar/grommet connection there.

The service should be fixed before finalising the collar where practical so the seal is not stretched off-centre by later positioning.

Passivhaus Trust guidance makes the same practical point: fit the gasket around the penetration, fix the service in its final position, then tape the gasket back to the air barrier to avoid distorted/leaky seals.

## 17. Cold-space ducts and condensation

A ventilation duct/stack passing through a cold roof space creates a separate condensation/thermal obligation.

The family therefore records:

- duct insulation requirement from the selected ventilation design;
- vapour-tightness of any insulation system where relevant;
- condensate drainage/fall where applicable;
- no low point that becomes an inaccessible condensate trap;
- roof-space ventilation/condensation strategy remains intact.

PEN-ENV-01 owns the boundary crossing; VENT-HYBRID-STACK-01 or the relevant service family owns airflow/duct performance.

## 18. Fire, smoke and acoustic branches

For an ordinary detached external wall/roof penetration, fire-stopping may not always be a separate compartmentation obligation.

But the computational model must ask rather than assume.

If the host assembly carries:

- fire resistance;
- cavity-barrier function;
- compartmentation;
- acoustic separation,

then the penetration generates the relevant additional obligation and requires a tested/assessed detail.

PEN-ENV-01 alone does not certify a firestop.

## 19. Pest and insect control

Open ducts/terminal cavities can become pest paths.

The terminal should provide appropriate insect/bird/vermin protection without invalidating required free area or pressure performance.

For ventilation systems, an arbitrary fine mesh may be a performance change and must not be added without considering airflow resistance and maintenance.

## 20. Lifecycle and replacement

The family is successful only if the service can plausibly be replaced without rebuilding the permanent envelope interface unnecessarily.

Preferred hierarchy:

1. stable building-side sleeve / terminal frame remains;
2. replaceable service connects/disconnects from accessible side;
3. replaceable collar/seal can be renewed if disturbed;
4. permanent masonry/roof structure remains intact.

Where a roof terminal itself is life-limited, its roof-covering detail should be designed as a replaceable roofing component rather than a cast-in permanent object.

This is an HSA lifecycle objective, not evidence that every service penetration must use the same physical solution.

## 21. Inspection hold points

### PEN-HP01 — opening / sleeve

Before concealment:

- location matches coordinated source model;
- hole/sleeve size and geometry match detail;
- no unintended structural damage;
- cavity is clean around opening;
- outward fall / weather geometry where applicable;
- independent service support prepared.

### PEN-HP02 — boundary reinstatement

Before internal finishes / inaccessible closure:

- air collar/grommet complete;
- weather detail complete;
- cavity/moisture detail complete;
- insulation reinstated;
- underlay detail complete for roof penetrations;
- photographs captured.

### PEN-HP03 — service/terminal

- terminal/product identity verified;
- service connection accessible where required;
- pest guard / grille correct;
- no seal damaged by final positioning;
- relevant commissioning/performance test completed.

A preliminary airtightness test before finishes is strongly compatible with this strategy even where the selected regulatory route does not require that exact sequencing.

## 22. Evidence boundary

### Semantic / modelled

The conceptual model can represent:

- penetrant identity and role;
- host assembly;
- position and route;
- opening/sleeve geometry;
- which boundary graphs are crossed;
- collar/grommet occurrence;
- weather-detail occurrence;
- insulation-reinstatement occurrence;
- roof-underlay occurrence;
- support/access relationship;
- dependent service/product evidence.

P0 has not implemented this complete penetration family.

### External product/detail evidence

Must establish as relevant:

- collar/grommet compatibility with service and air-barrier material;
- sealant/tape compatibility and movement range;
- sleeve/terminal suitability;
- cavity tray / DPC detail where used;
- roof terminal weather/pitch/covering compatibility;
- underlay proprietary seal/detail;
- thermal/fire/acoustic performance where the particular penetration requires it.

### Physical/as-built evidence

May include:

- photographs before concealment;
- air-pressure/leakage test;
- terminal/duct commissioning;
- rain/weather inspection where appropriate;
- product/batch/installation record.

## 23. Supported-domain rules

PEN-ENV-01 v0.1 supports ordinary H1 paper-research penetrations where:

- host wall is the supported masonry cavity-wall family, or host roof is RF-TRUSS-DUO-01;
- penetration is planned and bounded;
- structural drilling/cutting is permitted by the relevant structural route;
- boundary layers can be individually reinstated;
- penetrant remains maintainable;
- applicable proprietary detail evidence exists.

It does not support by default:

- chimneys / combustion flues;
- large plant openings;
- multiple unseparated services through one construction void;
- below-ground waterproof structures;
- party/separating-wall penetrations;
- façade systems outside the H1 envelope family;
- penetrations through primary structural members without explicit structural resolution.

## 24. Mutations

### PEN-M01 — remove air collar

Keep exterior terminal/weather seal intact.

Expected:

- weather boundary may remain valid;
- air boundary fails;
- service function may remain valid;
- whole-envelope airtightness evidence stales.

### PEN-M02 — remove outer weather seal

Keep inner air collar intact.

Expected:

- airtightness may remain locally valid;
- weather/moisture boundary fails;
- demonstrates why “sealed penetration” cannot be one boolean.

### PEN-M03 — horizontal duct falls inward

Expected:

- service topology remains geometrically connected;
- wall moisture/weather detail fails or requires a different evidenced route;
- no effect on unrelated penetrations.

### PEN-M04 — change 110 mm duct to 160 mm

Expected:

- opening/sleeve geometry stale;
- air collar/product stale;
- insulation/thermal evidence stale;
- terminal evidence stale;
- wall family itself remains.

### PEN-M05 — move roof terminal across a truss

Expected:

- roof weather family may remain conceptually available;
- structural route conflicts;
- location fails until moved or externally engineered;
- demonstrates composition with structure rather than penetration family owning structure.

### PEN-M06 — replace terminal product

Expected:

- weather/pitch/roof-covering evidence stale;
- ventilation pressure/free-area evidence stale where relevant;
- duct route may remain current.

### PEN-M07 — service replaced inside retained sleeve

Expected:

- permanent wall opening remains current;
- service-to-sleeve seal/accessory may stale;
- successful replacement should not require masonry reconstruction.

### PEN-M08 — later trades drill adjacent cable hole

Expected:

- new penetration occurrence generated;
- existing penetration evidence unaffected;
- envelope release fails if new occurrence has no boundary-reinstatement evidence.

## 25. Complexity result

This family deliberately avoids creating separate ontology types for:

- pipe hole;
- cable hole;
- duct hole;
- wall hole;
- roof hole.

The stable concept is:

~~~text
PENETRATION
  ↓
HOST BOUNDARIES CROSSED
  ↓
REINSTATEMENT CONTRIBUTIONS
  ↓
CANONICAL BOUNDARY OBLIGATIONS
~~~

Specific products/details enter as evidence-backed subtypes.

This is consistent with the earlier interface-obligation-bundle result: interfaces contribute facts to shared graphs before canonical obligations are derived.

## 26. H1 paper result

~~~text
penetration occurrence              H1 PAPER SEMANTICS
boundary layers crossed             H1 PAPER SEMANTICS
wall core-drilled subtype           RESEARCH FAMILY
roof terminal subtype               RESEARCH FAMILY
weather detail                      PRODUCT / DETAIL EVIDENCE
air-barrier collar                  PRODUCT / DETAIL EVIDENCE
thermal consequence                 TARGET / EXTERNAL ANALYSIS AS NEEDED
structural opening adequacy         SAB-H1-01 / EXTERNAL AS NEEDED
fire/acoustic branch                TARGET + EXTERNAL EVIDENCE IF APPLICABLE
as-built seal continuity            PHYSICAL EVIDENCE
~~~

The family closed the historical `C-019B` paper-research item. It does not make arbitrary service crossings release-valid and does not imply that P0 contains a native penetration engine.

## 27. Current boundary

A real project still needs an actual host assembly, service type, penetration detail, product compatibility and applicable structural/fire/acoustic/environmental evidence. Further executable work is warranted only if project coordination or professional review exposes a concrete question that benefits from formalisation.

## 28. Source anchors

- Approved Document L Volume 1, 2026 edition, airtightness guidance (paragraph 3.22): https://www.gov.uk/government/publications/approved-document-l-2026
- Approved Document L Volume 1, 2021 edition incorporating 2023 amendments, equivalent airtightness principles for earlier targets: https://www.gov.uk/government/publications/conservation-of-fuel-and-power-approved-document-l
- NHBC Technical Guidance 6.1/19, *Ducts and flues through core drilled holes in external masonry walls*: https://www.nhbc.co.uk/binaries/content/assets/nhbc/tech-guidance/6.1_19-tgn-ducts_flues-through-core-drilled-holes-2024.pdf
- NHBC Standards, pitched roofs — underlay penetration guidance: https://nhbc-standards.co.uk/downloads/2025/NHBC-Standards-2025-Chapter-7-2.pdf
- NHBC Foundation, *A practical guide to building airtight dwellings*: https://www.nhbc.co.uk/binaries/content/assets/nhbc/foundation/a-practical-guide-to-building-airtight-dwellings.pdf
- Passivhaus Trust, *Good Practice Guide to Airtightness*: https://www.passivhaustrust.org.uk/UserFiles/File/Technical%20Papers/Good%20Practice%20Guide%20to%20Airtightness%20v10.6-compressed(1).pdf
- Marley current roof ventilation-terminal range — product precedent only: https://www.marley.co.uk/accessories/tile-ventilation-terminals