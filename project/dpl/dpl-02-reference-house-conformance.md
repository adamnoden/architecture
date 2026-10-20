# DPL-02 — Reference House Conformance Contract

**Issue:** [#301 — DPL-02 — Reference House conformance contract](https://github.com/adamnoden/architecture/issues/301)  
**Parent programme:** [#299 — DPL — deployment, jurisdiction and real-site integration programme](https://github.com/adamnoden/architecture/issues/299)  
**Depends on:** [DPL-01](dpl-01-deployment-ontology.md)  
**Baseline `main`:** `fcbe462864c270ac7036aeb113be0f12951b1990`  
**Status:** conformance contract frozen for later DPL foundation work

## Question

> **What must remain true for a site-conditioned deployment candidate still to count as an instance of the controlled Ovid’s House Reference House?**

DPL-01 established two constraints that govern this packet:

1. **compatibility before adaptation**;
2. **the compiler evaluates architecture; it does not silently author it.**

DPL-02 therefore does not ask how much the house *could* be changed while retaining a family resemblance. It asks which transformations the existing Reference House authority has actually licensed for deployment and which changes require an explicit upstream architectural revision.

## Conclusion

The Reference House is **not** a parametric family with all dimensions implicitly negotiable.

It is a controlled authored house with a small number of explicitly permitted deployment freedoms.

The governing rule is:

> **Deployment freedoms are opt-in.**

A site condition, planning preference or technical convenience does not gain authority to mutate the Reference House merely because a plausible redesign exists.

At the same time:

> **Controlled source is not automatically identity.**

A coordinate, product family or technical assumption is not made invariant simply because it currently appears in a drawing or compiler fixture. Conformance authority comes from the architectural gate records and their stated decision status.

The resulting model has five principal classes:

```text
REFERENCE HOUSE AUTHORITY
        │
        ├── IDENTITY INVARIANTS
        │      categorical conditions that make this this house
        │
        ├── PROTECTED ARCHITECTURAL / TECHNICAL ORDER
        │      current earned design decisions; change requires explicit RH revision
        │
        ├── PERMITTED DISCRETE VARIANTS
        │      transformations already licensed by current authority
        │
        ├── SITE-INTERFACE FREEDOMS
        │      bounded land/building relationships whose exact solution belongs to the site
        │
        └── IMPLEMENTATION FREEDOMS / OPEN DETAIL
               product, engineering and detail choices that can vary without changing identity
```

Preferences, surrogate-site assumptions, superseded geometry and unresolved external evidence sit **outside** these five classes and must not be promoted into conformance requirements.

## Authority recovered

### RH-00 — brief and constraint ledger

`docs/reference-house/brief-and-constraint-ledger.md` is the primary source for distinguishing architectural authority from inherited fixture convenience.

It defines:

- `FIXED` — must be satisfied unless governing authority changes;
- `SELECTED` — part of current Reference House identity / brief; reopen only by explicit design decision;
- `PREFERRED` — normally preserve, but not absolute;
- `OPEN` — unresolved / no incumbency advantage;
- `SUPERSEDED` — history only.

It also explicitly warns that the earlier whole-house coordination fixture is **not** the design to preserve.

### RH-01 — gross morphology

RH-01 selected the compact central-court morphology and superseded the older F0 geometry. It then froze a controlled gross morphology while naming explicit rewind triggers.

### RH-02 — ground-floor order

RH-02 made one controlled dimensional rewind, taking the outer width to **12.0 m**, and selected the G1 ground-floor order. It explicitly states that the plan may be mirrored when a real site gives west/east different value.

### RH-03 / HFI-08B — stair and upper-floor order

RH-03 selected the three-flight stair and U-shaped upper circulation. HFI-08B later changed only the stair going to **300 mm**, leaving topology and RH-04 datums intact.

### RH-04 — plan / section / elevation coupling

RH-04 selected the current sectional hierarchy, front four-bay order, off-centre entrance, courtyard orders and nested architectural fields. It treats those relationships as architectural obligations rather than superficial styling.

### RH-05 through RH-08 / current technical coordination

Later gates selected a coherent structural, service, environmental, roof/water and maintenance geography without claiming specialist proof. These records distinguish architectural topology from member/product sizing.

Important examples include:

- loadbearing permanent masonry boundaries as the current structural concept;
- concentrated service geography and one principal wet/service stack;
- deletion of the remote principal en-suite when it failed service-topology proportionality;
- central MVHR as the Reference House ventilation baseline;
- outward-draining low-slope roof fields with no primary inner-court gutter or internal roof outlets;
- planned external maintenance access rather than a permanent roof hatch.

### G-01 conformance

`docs/reference-house/g01-v0.1-conformance-d12.md` establishes that the Reference House conforms to G-01 v0.1 as an architectural-language result. G-01 itself remains a separate authority from Reference House identity.

### Compiler fixture

`compiler/reference-house/fixture.ts` records controlled and provisional source facts for current computational purposes.

Its `FROZEN_FOR_RH_C1` / `PROVISIONAL_BUT_REPRESENTABLE` dispositions are **not** DPL conformance classes.

They say what the bounded compiler source treats as frozen/provisional for its own proof family. DPL-02 derives architectural identity from the Reference House gate authority, not from whichever facts happen to be easiest to represent computationally.

This distinction prevents two errors:

- making every compiler-controlled coordinate an eternal architectural invariant;
- treating every compiler-provisional coordinate as free to mutate during deployment.

## Conformance is revision-relative

A deployment candidate conforms **to a specific controlled Reference House revision**.

Conformance is not a timeless statement about “the general idea of the house”.

Conceptually:

```text
candidate
   conforms-to
Reference House revision @ source identity
   under
DPL-02 conformance contract revision
```

If an upstream Reference House decision is deliberately changed and revalidated, a new Reference House revision may have a different conformance contract without implying that the old one was wrong.

This matters because a deployment candidate must not use future architectural possibility as permission to depart from the current house.

## The five conformance classes

### 1. `IDENTITY_INVARIANT`

A categorical architectural condition whose loss means the candidate is not an instance of the current Reference House proposition.

An identity invariant is broader than an exact coordinate. It describes the house’s selected type, language or defining relation.

Changing one requires an explicit Reference House brief/identity revision before the candidate can be considered again.

### 2. `PROTECTED_ORDER`

An earned architectural or technical arrangement that belongs to the controlled current house.

Protected order can include exact planning coordinates, spatial adjacencies, section/elevation relationships and selected technical topology.

A protected item is not claimed to be universally optimal or eternally invariant. It is simply **not an authorised deployment parameter**.

If site or target conditions require it to change:

```text
candidate leaves current contract
    ↓
explicit Reference House rewind / revision
    ↓
revalidation at owning gates
    ↓
new controlled Reference House revision
```

The change may ultimately be good architecture. Until that upstream process occurs, it is non-conforming deployment adaptation.

### 3. `PERMITTED_DISCRETE_VARIANT`

A bounded alternative already licensed by existing Reference House authority.

The variant must be applied coherently. A whole-house mirror does not authorise selectively moving one service room while leaving the rest of the nested orders unchanged.

Permitted variants are enumerable rather than “anything that still looks roughly similar”.

### 4. `SITE_INTERFACE_FREEDOM`

A land/building relationship whose exact physical solution necessarily depends on the site and was intentionally left for real-site work.

Examples include foundation response, incoming utility connection outside the controlled service-entry geography, below-ground drainage after the building-side connection and external level/approach treatment.

DPL-08 will define this class in detail.

A site-interface freedom is not permission to alter protected interior architecture. If a site interface cannot be solved without crossing that boundary, the result is a compatibility problem or an explicit upstream rewind.

### 5. `IMPLEMENTATION_FREEDOM`

A product, engineering, fabrication or detail choice intentionally left unresolved or bounded by performance/architectural requirements rather than one exact solution.

Examples include structural member sizing, product-specific window details and equipment selection within already reserved plant geography.

Implementation freedom remains subject to:

- Ovid’s House doctrine;
- G-01 where relevant;
- protected Reference House architecture;
- external target requirements;
- specialist evidence.

It does not mean “arbitrary”.

## Things that are not conformance classes

### `PREFERRED`

A project preference is not automatically Reference House identity.

If a preference has since been selected and coordinated by a later gate, the later gate may have promoted the actual design decision into protected order. Otherwise the preference remains contextual design guidance rather than a DPL conformance clause.

### `OPEN`

An open question does not become a deployment parameter merely because it is unresolved.

It may require technical design, site evidence or another owning gate. DPL must not use “open” as shorthand for “software may choose freely”.

### `SUPERSEDED`

Superseded geometry is not an alternative deployment variant.

F0, rejected morphology options and early image-study material remain provenance only unless an explicit new architectural decision revives them.

### External facts and targets

Site facts, Building Regulations, planning policy and other external authorities can make a candidate impossible or require an upstream architectural change. They do not themselves define Reference House identity.

## Identity invariants

The following categorical conditions define the current Reference House strongly enough that their removal would create another architectural proposition.

### RH-I01 — G-01 architectural grammar

The Reference House uses **G-01 v0.1 / its controlled successor** as its selected Georgian-derived architectural grammar.

A candidate may not switch to another grammar merely because a site or planning context prefers another style.

This does not freeze every current opening dimension. G-01 conformance remains separately evaluated against its own rules.

### RH-I02 — genuine open-to-sky courtyard house

The house contains a real open courtyard that is an architectural centre, not a residual lightwell or technical yard.

The courtyard participates in spatial sequence, light, outlook, purge/orientation and domestic life.

Removing it, roofing it over as ordinary interior or reducing it to a token shaft is not a deployment adaptation.

### RH-I03 — compact detached contemporary family house

The Reference House remains a relatively compact **detached** contemporary family house developed for a London / Zone-4-type domestic context rather than an estate-scale mansion, terrace insertion, apartment block or museum reconstruction.

This invariant describes project type and scale posture, not a real-site claim or a statutory use classification.

### RH-I04 — courtyard-centred arrival / garden sequence

The architectural sequence remains:

> **public arrival → principal entrance / stair hall → courtyard address → garden-side room / garden**

The direct relation may be visual and spatial rather than a literal straight walking line. The separate all-weather secondary route remains subordinate to that principal sequence.

A candidate in which the courtyard ceases to organise arrival/garden order is not merely a site variant.

### RH-I05 — architecture remains room-based and hierarchically legible

The house retains distinct principal, family, service and private-room identities rather than dissolving into one undifferentiated open field or technical circulation machine.

This does not require every current internal partition coordinate to be immutable. It protects the selected spatial proposition.

### RH-I06 — concentrated technical geography remains subordinate to principal domestic rooms

High-consequence service geography remains concentrated and maintainable rather than colonising principal occupied rooms or using the courtyard as a generic utility route.

This is a Reference House identity condition derived from the selected spatial/technical integration; the underlying serviceability principle remains Ovid’s House doctrine rather than project-specific identity.

### RH-I07 — coupled architectural order rather than applied façade styling

Plan, section and elevation continue to act as one architecture. The selected front, courtyard and service orders may not be replaced by a cosmetic façade that masks a materially unrelated internal arrangement.

This invariant protects the method of the house; the precise current bay coordinates sit in protected order below.

## Protected architectural order

The following current design decisions are **not deployment parameters**.

They may be reopened by their owning Reference House gate if real-site evidence shows the current house is too brittle or defective. Until then, a candidate that alters them is outside the current conformance contract.

### RH-PROT-01 — principal gross geometry

Current architectural coordination values:

- outer principal mass: **12.0 m × 10.8 m**;
- centred open courtyard: **3.6 m × 4.0 m**;
- gross side wings: **4.2 m**;
- gross front/rear wings: **3.4 m**;
- two principal storeys.

These are design coordinates, not construction tolerances.

A site that is 300 mm too narrow does not authorise shrinking the house by 300 mm.

A materially different shell/court geometry requires RH-01/RH-02 architectural revision and downstream revalidation.

### RH-PROT-02 — ground-floor topology

Preserve the selected G1 relationships:

- principal drawing/sitting room on one principal flank toward the front;
- family room on the same principal flank toward the garden;
- principal entrance/stair hall addressing the courtyard;
- compact study at the front of the technical flank;
- all-weather inner gallery on the technical flank;
- dedicated service/plant geography outside that gallery;
- garden dining hall on the courtyard/garden axis;
- kitchen at the rear of the technical flank with direct garden relationship;
- family → garden dining → kitchen rear sequence.

Exact provisional partition splits remain subject to their current architectural source status, but deployment may not reorder the house into another plan topology merely to fit a plot.

### RH-PROT-03 — upper-floor topology

Preserve:

- **four-bedroom** active upper-floor programme;
- principal bedroom on the principal/rear flank;
- U-shaped courtyard circulation using south landing + technical-flank gallery + north cross-landing;
- **no west/principal-flank courtyard gallery**;
- family bathroom in the stacked technical/service geography;
- dry dressing/linen condition in place of the deleted remote principal en-suite.

The former five-bedroom ceiling is historical brief latitude, **not** permission to add a fifth bedroom during deployment.

Reintroducing the principal en-suite requires the explicit brief/route-proof process already demanded by RH-06.

### RH-PROT-04 — principal stair topology

Preserve the selected principal-stair proposition:

- three flights;
- full landings;
- no winder-led compression as the default;
- 18-riser topology at the controlled +3300 mm first-floor datum;
- **300 mm going** in the current controlled house;
- stair located within the principal south/front entrance-hall territory.

The 300 mm going is a Reference House project decision, not a universal human-factors or regulatory minimum.

A candidate may not shrink the stair simply to rescue a difficult site or another local design move.

Detailed strings, balustrades, exact finished clear width and technical headroom proof remain implementation work.

### RH-PROT-05 — sectional hierarchy

Preserve the H1 hierarchy and its architectural reading:

- ground floor has restrained primacy over the upper floor;
- ground FFL ±0;
- ground clear-ceiling datum approximately +2950 mm;
- first FFL +3300 mm;
- upper clear-ceiling datum +6000 mm;
- cornice/eaves control approximately +6250 mm.

Where a technical build-up changes a hidden thickness without materially changing the visible hierarchy, competent design may resolve it within implementation freedom.

A material change to visible storey hierarchy requires RH-04 revision.

### RH-PROT-06 — front architectural field

Preserve the selected **centred four-bay front field** and the principle that the principal entrance is a ranked off-centre exception within that ordered field.

Current controlled bay spacing is **2.70 m** across the 12.0 m front, with the canonical unmirrored entrance in bay 3.

A whole-house mirrored variant may mirror this order coherently, placing the corresponding entrance in the mirror-equivalent bay.

Moving only the entrance to the geometric centre, independently re-spacing bays or allowing every internal partition to dictate its own opening is not a deployment freedom.

### RH-PROT-07 — courtyard architectural orders

Preserve the differentiated courtyard relationships:

- south: stair/hall address to the court;
- north: garden-dining / cross-landing address;
- technical/gallery side: regular gallery-led order;
- principal occupied side: room-owned order;
- north/south court sequence re-centres on the court rather than inheriting the off-centre front entrance axis.

Exact still-provisional opening sizes/products remain implementation/detail work.

### RH-PROT-08 — primary structural concept

Preserve the architectural structural concept unless competent engineering earns an explicit Reference House technical rewind:

- permanent outer and courtyard masonry boundaries do useful loadbearing work;
- ordinary short floor spans occur between those permanent lines;
- the house avoids a whole-house independent frame, room-shaping columns and gratuitous long transfers;
- structural load paths remain legible and compatible with the room/order geometry.

Member sizes, bearings, connections, local trimming, robustness and foundation design remain external engineering / implementation work.

If engineering requires intrusive columns, materially deeper floors or a whole-house frame with architectural consequences, that is a Reference House revision question rather than an invisible implementation substitution.

### RH-PROT-09 — envelope / opening life-separation concept

Preserve the current architectural envelope logic:

- permanent weather/thermal/air boundary remains independent of removable trim;
- permanent masonry openings host replaceable window/door assemblies through designed tolerance/fixing interfaces;
- brittle finish does not become the primary moving-frame interface;
- the slow envelope remains complete when faster-changing trim is removed.

The current masonry/cavity family is the controlled technical baseline. Exact block density, insulation product, frame product, fixing and thermal/moisture detail remain technical work unless they materially change the visible/structural architecture.

### RH-PROT-10 — concentrated service topology

Preserve the current service architecture:

- dedicated plant/service suite on the technical flank;
- one bounded principal vertical service zone;
- one principal soil/vent stack;
- family bathroom stacked with the service suite;
- kitchen immediately adjacent to the service geography;
- principal rooms free of primary wet/soil/large-duct routes;
- courtyard kept free of principal utility routes beneath it except the deliberately bounded courtyard-water route selected by RH-08;
- remote principal en-suite remains deleted.

Exact supplier entry coordinates are not invariant; route geometry may be mirrored or connected through the site interface where the architecture remains intact.

### RH-PROT-11 — environmental hierarchy

Preserve the architectural environmental strategy:

- shallow occupied bands;
- outer-façade daylight responsibility for principal habitable rooms;
- courtyard treated as shaded light court / orientation device / sheltered purge reservoir / intimate outdoor room rather than primary sunny garden;
- disciplined room-specific glazing rather than a generic highly glazed rear wall;
- openable purge remains distinct from whole-dwelling ventilation;
- mechanical cooling is not the default architectural rescue strategy.

Exact shading design, glazing product and site-specific environmental model remain downstream evidence/implementation work.

### RH-PROT-12 — selected whole-house system geography

Current Reference House technical coordination selects central MVHR and an air-to-water heat-pump / low-temperature wet heat family as baselines integrated with the plant/service geography.

Changing exact equipment, output, controls, emitters within the protected geography is implementation work.

Changing the system family in a way that rewrites ducts, plant geography, roof/wall terminals, floor infrastructure or architectural interfaces requires an explicit Reference House technical revision rather than a deployment-side substitution.

This clause does not claim that the selected systems are externally proved or universally required.

### RH-PROT-13 — roof / water topology

Preserve the selected roof-water architecture:

- four very-low-slope roof fields;
- primary roof water falls **outward from the courtyard**;
- no primary inner courtyard gutter;
- no internal roof outlets as the baseline;
- inspectable/replaceable outer collection edges;
- principal rainwater pipes biased to side/rear return geography;
- courtyard manages principally its own catchment with an independent visible failure/overflow route;
- no routine rooftop plant;
- no permanent roof hatch in the current baseline.

Waterproofing product, final falls, gutter dimensions and hydraulic sizing remain technical design.

Adding an internal outlet, inner-court gutter, rooftop plant or permanent hatch is not a site variant merely because a particular plot makes it convenient.

### RH-PROT-14 — maintenance geography remains an architectural requirement

The deployed house must retain credible ordinary maintenance/replacement access for:

- plant and utility work;
- outer façades/windows;
- roof edges/rainwater goods;
- courtyard elevations and courtyard drainage;
- replacement materials and temporary-access equipment.

The exact site access method is not fixed, but a plot that destroys all credible access does not entitle the house to ignore the maintenance requirement.

This clause is deliberately a protected **requirement**, while the real-site access solution belongs to the site interface / compatibility evaluation.

### RH-PROT-15 — tectonic / visible-interface hierarchy

Preserve the Reference House’s selected tectonic posture:

- quiet permanent surfaces remain simple where technical burden is low;
- controlled architectural datums are introduced only where real duties justify them;
- replaceable linings remain selective challengers rather than house-wide visual grids;
- doors/windows/thresholds are resolved as genuine interfaces rather than cosmetic continuity;
- technical infrastructure remains subordinate to the room;
- visible metal/joinery is functional architecture, not an applied technology aesthetic.

Exact moulding profiles, metal alloy, joinery details and finish palette remain downstream design unless another controlled source freezes them.

## Explicit permitted discrete variants

Only the following deployment transformations are presently licensed without a Reference House revision.

### RH-V01 — coherent whole-house left/right mirror

The Reference House may be mirrored laterally as a **whole architectural system** when real site orientation, utility approach, neighbouring conditions or environmental performance justify the opposite handedness.

The mirror includes, coherently:

- principal and technical flanks;
- service suite/gallery;
- room order;
- stair/arrival handedness;
- front entrance’s position within the ordered field;
- courtyard opening/order relationships;
- service/roof terminal return geography;
- other handed technical conditions.

It is not permission to mirror one convenient subsystem while leaving contradictory dependencies in place.

The mirrored candidate still requires ordinary G-01, technical and target evaluation.

### RH-V02 — rigid site placement and cardinal orientation

The house may be translated and rotated as a rigid architectural object on a real site.

The surrogate `south = street/front`, `north = garden/rear`, `east = service` coordinate convention is not a compass commitment.

A real-site placement must preserve the relational roles of:

- principal/public arrival;
- garden/private side;
- courtyard-centred sequence;
- whichever flank is selected as the technical/service side after handing.

Rotation does not authorise internal deformation or a different façade hierarchy.

### No other deployment variant is currently licensed

In particular, current authority does **not** yet grant automatic deployment freedoms for:

- shell width/depth scaling;
- courtyard scaling or offsetting;
- adding/removing storeys;
- moving the stair;
- changing bedroom count;
- moving principal rooms;
- moving the service suite independently;
- re-spacing the principal front bay field;
- deleting side/rear openings for privacy;
- changing roof topology;
- introducing another wet core.

A future packet may discover a defensible bounded variant, but it must be added by explicit architectural authority rather than inferred opportunistically.

## Site-interface freedoms

DPL-02 freezes only the boundary. DPL-08 owns the detailed interface contract.

The following domains are intentionally site-conditioned **provided the protected house remains intact**.

### RH-SI01 — foundation / ground support

Foundation type, depth and ground treatment respond to actual soil, trees, groundwater, contamination, adjacent structures and engineering.

The site interface may vary from ordinary shallow foundation assumptions to another competent system if it preserves the protected load-path architecture and does not create architectural consequences above.

If the ground response requires raised floors, large transfer structures, intrusive retaining walls or another material architectural change, the candidate leaves this freedom and requires upstream review.

### RH-SI02 — absolute datum and external level transition

The Reference House’s internal relative levels remain protected; its absolute elevation on a site is not predetermined.

Real-site work owns:

- setting the building datum against street/garden/topography;
- accessible approach grades;
- external threshold drainage;
- local retaining / grading;
- the air/moisture/drainage relationship at the plinth.

The interface may not solve a difficult site by casually introducing a different internal split-level house.

### RH-SI03 — utility approach outside the protected internal geography

The real location of water, electricity, data and other utilities is a site fact.

External routes may approach the protected utility/service-entry geography from the site using a competent, maintainable path.

If the site requires crossing a principal room, protected structural node or courtyard merely to reach the current technical geography, that becomes a compatibility / Reference House revision question.

### RH-SI04 — foul and surface-water discharge beyond controlled building-side points

The real sewer, infiltration, watercourse, attenuation or other lawful discharge strategy is site-specific.

The protected house supplies controlled building-side collection/exit points. DPL-08 / later technical design owns the route from those points into the real site.

Changing the roof to internal drainage because the external site connection is inconvenient is outside this freedom.

### RH-SI05 — principal approach / external access / landscape integration

The site owns the exact path, planting, terrace, refuse/parking condition and temporary-access logistics outside the house.

Those works must preserve:

- principal entrance legibility;
- threshold accessibility and drainage;
- plant replacement access;
- credible façade/roof maintenance working positions;
- garden-to-courtyard logistics where the current maintenance strategy relies on it.

If the plot cannot support those requirements by a credible method, the answer may be incompatibility rather than architectural erosion.

### RH-SI06 — site-specific solar / privacy / noise mitigation outside protected order

Real orientation and neighbours may require shading, screening, acoustic treatment or landscape response.

Such measures may be authored within the site interface only where they preserve:

- G-01 conformance;
- protected opening/order relationships;
- daylight/purge duties;
- maintenance access;
- tectonic honesty.

Bricking up or arbitrarily relocating a protected opening because a neighbour makes it inconvenient is not automatically inside this freedom.

## Implementation freedoms

The following are intentionally not Reference House identity where they remain within the protected architecture and receive the required external proof.

### RH-IMP01 — foundation engineering details

Member sizes, reinforcement, bearings, ground improvement and construction method are engineering decisions within RH-SI01 unless they create architectural consequences.

### RH-IMP02 — structural sizing / connections / floor-edge resolution

The structural concept is protected; exact engineered timber sizes, local steelwork, bearings, restraints, connections, diaphragm details and floor-edge solution remain competent engineering / prototype work.

### RH-IMP03 — wall-build-up product/detail choices

The protected envelope logic remains; exact masonry unit, insulation product, cavity thickness inside the controlled geometric stress range, membranes, ties and thermal/moisture details remain technical design.

A build-up that materially steals room geometry, changes façade depth/order or abandons the protected envelope family requires architectural review.

### RH-IMP04 — window / door product within protected openings

Frame material/product, sash mechanism, glazing specification, ironmongery, fixing and replacement detail may vary while preserving:

- protected opening host/order;
- G-01 visible proportion/family;
- threshold duties;
- full envelope performance;
- replacement/interface logic.

The current project can therefore select a high-performance contemporary window without converting product choice into grammar.

### RH-IMP05 — exact plant / equipment products

MVHR, heat-pump, DHW, controls, electrical gear and other equipment may vary within the selected system families and reserved plant/replacement geography.

A product that no longer fits with working/replacement space is not rescued by calling product choice an implementation freedom.

### RH-IMP06 — exact service routing inside protected route classes

Pipe, cable and duct sizing/routing may be refined by competent design inside the protected service geography, structural crossing rules and access requirements.

Creating a new principal route through a quiet principal room or structural field is not an implementation detail.

### RH-IMP07 — roof build-up and hydraulic sizing

Final waterproofing, insulation falls, gutter profile, outlet/downpipe sizing and flashings remain technical design while preserving RH-PROT-13.

### RH-IMP08 — detailed finishes / joinery / metalwork where not separately frozen

The project’s tectonic language controls the relationship and duty. Exact finish colour, moulding profile, brass/bronze detail, tile selection and similar craft decisions remain detailed architectural design unless/until separately controlled.

The early red-brick, green-zellige, fountain and planting image-study material is not silently reinstated as DPL identity.

## Preferences and historical brief latitude that do not create deployment freedoms

Several RH-00 preferences require careful reading after later gates.

### Five-bedroom ceiling

The original brief allowed **up to five bedrooms**. RH-03 selected a four-bedroom upper floor and RH-06 coordinated that active house.

The ceiling prevents programme bloat; it does not create a `4 ↔ 5 bedrooms` deployment parameter.

### Two principal storeys

RH-00 called two storeys a preferred working configuration. RH-01 onward then designed and coupled a two-storey house around that choice.

It is now protected current architecture. Adding a roof storey or basement is an architectural revision, not an unused brief option.

### Front → courtyard → garden relationship

RH-00 called the relationship preferred and allowed the exact line to bend. Later gates selected the sequence as a central architectural order.

The exact geometric straightness is not invariant; the **architectural relation now is**.

### Red brick / warmer courtyard dialect

These remain material/dialect preferences unless a later detail gate freezes an exact palette. They are not deployment compatibility criteria today.

## Conformance evaluation rule

A deployment candidate should be assessed clause-by-clause, not by similarity score.

Conceptually:

```text
for each applicable conformance clause:
    identify source authority
    identify candidate disposition
    preserve evidence / uncertainty
    report clause result

never:
    calculate percentage similarity
    average failures into a score
    let a strong result on one axis erase failure on another
```

DPL-03 owns the exact result/status vocabulary. DPL-02 freezes only these semantic outcomes:

### Inside current contract

The candidate preserves all applicable identity invariants and protected order and uses only declared variants/interface/implementation freedoms.

This does **not** by itself mean the site is compatible, the target passes or the design is technically proved.

### Outside current contract

The candidate changes an identity invariant or protected-order clause without an upstream Reference House revision.

A target requirement can explain the need for the change; it does not make the candidate conforming.

### Requires explicit Reference House revision

The proposed change may be architecturally reasonable but is not licensed for deployment under the current revision.

The change must be routed to the owning gate(s), revalidated and adopted upstream before a deployment candidate can rely on it.

### Not yet classifiable

Current Reference House authority is genuinely insufficient to decide whether a proposed change is inside or outside identity.

This is not permission. It is an explicit unresolved conformance question to be owned and answered before a positive conformance claim.

## Rewind ownership map

When a protected condition must change, use the existing owning gate rather than creating a DPL-local architectural authority.

| Change | Primary Reference House owner to reopen |
|---|---|
| courtyard removed / gross morphology changes | RH-00 / RH-01, then downstream gates |
| shell width/depth changes | RH-01 / RH-02, then downstream gates |
| principal room order changes | RH-02 |
| bedroom / upper circulation changes | RH-03 |
| stair topology / location changes | RH-03 + HFI where relevant |
| visible storey hierarchy / front/court order changes | RH-04 + G-01 conformance |
| structural concept creates architectural consequence | RH-05 and affected upstream architectural gate |
| service core / wet geography / en-suite changes | RH-06 and affected plan gate |
| passive/MVHR environmental hierarchy changes | RH-07 / RH-06 addendum |
| roof water / maintenance topology changes | RH-08 |
| visible tectonic/interface language changes materially | RH-09 / tectonic architecture owner |
| integrated technical proposition changes across several systems | current technical coordination + every affected owning gate |

DPL may surface the conflict and evidence. It does not own the architectural correction.

## Representative deployment changes

### Example A — mirror the entire house because utilities and afternoon sun favour the opposite flank

**Disposition:** inside contract as `RH-V01`, subject to ordinary downstream checks.

Why: whole-house mirror is explicitly licensed by RH-02/RH-06 and preserves the nested architectural/technical relations.

### Example B — rotate the intact house 90° so the public front addresses a different compass direction

**Disposition:** inside contract as `RH-V02`, assuming public/garden roles and site obligations remain coherent.

Why: the south/north/east labels are surrogate coordinates, not compass identity.

### Example C — reduce outer width from 12.0 m to 11.7 m to fit a narrow plot

**Disposition:** outside current contract; requires Reference House revision.

Why: 12.0 m was explicitly re-earned after room-scale testing. Site scarcity is not a new RH-02 authority.

### Example D — offset or shrink the courtyard to create more side clearance

**Disposition:** outside current contract; requires RH-01/RH-02 revision and downstream revalidation.

Why: courtyard geometry and centred gross-morphology relation are controlled architecture, not site packaging.

### Example E — use piles because tree/ground evidence defeats shallow foundations

**Disposition:** site-interface / implementation freedom if the protected structural/architectural order is preserved.

Why: foundation design was always external engineering/site work.

### Example F — raise the whole building datum on the plot while retaining internal relative levels and accessible external approach

**Disposition:** potentially inside site-interface freedom.

Why: absolute site datum is not yet a Reference House fact. DPL-08 must define acceptable plinth/ground/interface consequences.

### Example G — utilities arrive from the opposite side

**Disposition:** first test whole-house mirror or an external route to the protected service-entry geography.

If either solves the site without protected architectural change, candidate can remain inside contract.

Routing principal utilities through the drawing/family room merely to preserve unmirrored coordinates is not required; moving the service suite independently to another part of the plan is not authorised either.

### Example H — centre the front door because a planning officer prefers symmetry

**Disposition:** outside current contract; RH-04 revision required.

Why: the off-centre ranked entrance is a deliberate plan/elevation negotiation, not an unresolved accident.

### Example I — delete a side window because of overlooking

**Disposition:** not an automatic site-interface freedom.

First test screening/glazing/landscape/target routes that preserve the protected architectural order. If the opening order must materially change, reopen the relevant architectural/G-01 gate.

### Example J — change the MVHR manufacturer

**Disposition:** implementation freedom if performance, working space, route geometry, acoustics and replacement remain adequate.

### Example K — remove MVHR and use an entirely different whole-dwelling ventilation family

**Disposition:** Reference House technical revision, not ordinary deployment implementation.

Why: MVHR is the selected current baseline and is integrated with plant/duct geography.

### Example L — reintroduce a principal en-suite because the buyer expects one

**Disposition:** outside current contract; explicit brief/RH-06 route-proof revision required.

Why: the en-suite was deliberately deleted after a failed topology test.

### Example M — reduce stair going from 300 mm to 250 mm to recover floor area

**Disposition:** outside current contract; RH-03/HFI revision required.

Why: 300 mm is an earned Reference House human-factors decision even though smaller values may be lawful.

### Example N — add a permanent roof hatch because a constrained site makes external temporary access harder

**Disposition:** RH-08 reopen required.

Why: no permanent hatch is a task-derived current roof/maintenance decision. Site difficulty may be strong evidence for a different decision, but does not automatically rewrite it.

### Example O — change surface-water destination from infiltration to sewer because site evidence requires it

**Disposition:** site-interface freedom if lawful and if building-side roof/courtyard water topology remains intact.

### Example P — change the roof to inward drainage with an internal outlet so the external elevations remain clean

**Disposition:** outside current contract; RH-08 revision required.

Why: outward visible failure/drainage topology is a selected architectural/maintenance decision.

### Example Q — substitute a whole-house steel frame that preserves room dimensions exactly

**Disposition:** not an implementation freedom under the current contract.

Why: current structural architecture deliberately makes permanent masonry boundaries do structural work and rejects whole-house frame dependence. A frame substitution requires explicit RH-05/tectonic review even if plan geometry survives.

### Example R — vary exact structural member sizes or floor-edge connection after competent engineering

**Disposition:** implementation freedom if the protected spatial/sectional architecture survives and all obligations are discharged.

### Example S — change red brick to another credible facing masonry while retaining G-01 order and the protected envelope/tectonic logic

**Disposition:** potentially implementation/detail freedom; exact visible palette is not yet frozen by DPL-02.

A rendered or otherwise materially different envelope family may require architectural/technical review depending on how much it changes the selected tectonic and weathering logic.

### Example T — add a fifth bedroom by subdividing a current bedroom

**Disposition:** outside current contract; RH-03 / brief revision required.

Why: five bedrooms was a ceiling in the pre-design brief, not a deployment variant of the four-bedroom active house.

## Adversarial checks

### Does this freeze the house too hard?

It intentionally freezes **deployment adaptation** more strongly than early Reference House design work.

That is correct.

The Reference House programme already used explicit rewinds to improve the house. DPL does not ban future rewinds; it prevents a real site from causing them invisibly.

If many plausible London plots require the same protected change, that is evidence to reopen the Reference House deliberately or narrow the deployment envelope.

### Does exact 12.0 × 10.8 m geometry become metaphysical identity?

No.

It is `PROTECTED_ORDER`, not `IDENTITY_INVARIANT`.

The dimensions can change through an explicit Reference House revision. They are simply not a deployment parameter under the current revision.

### Does mirroring contradict the front entrance being in bay 3?

No.

The authorised transformation mirrors the **whole ordered field and its architectural relationships**, not one coordinate. The mirror-equivalent off-centre entrance preserves the underlying selected condition.

### Does site rotation erase environmental design?

No.

RH-07 already stress-tested materially different orientations and explicitly refused to encode the surrogate compass as identity. A real rotated site still requires actual environmental evidence and may prove incompatible.

### Does a protected technical system turn product selection into architecture?

No.

DPL-02 protects system **topology/family where the current Reference House has selected and integrated it**, while leaving exact products and specialist sizing open.

This is the same distinction already used by the Reference House technical records.

### Could planning force a protected change?

Yes.

That would establish that the current deployment candidate cannot proceed unchanged under that target/site condition. It does **not** retroactively make the protected change a conformance-preserving variant.

The project must then choose explicitly:

- reject the site;
- find another compliant route;
- or reopen the owning Reference House decision.

### Can the site interface become a loophole?

Not under this contract.

Site-interface freedom ends where protected architectural order begins. DPL-08 must define the boundary in greater physical detail but cannot use “site interface” as a generic mutation bucket.

### Could compiler fixture flags override this contract?

No.

The fixture’s freeze/provisional states serve bounded computational proof. DPL conformance is architectural authority. Where the two need alignment later, DPL-12 may encode an explicit crosswalk rather than silently treating one as the other.

## No machine-readable schema yet

DPL-02 deliberately does **not** add a TypeScript conformance schema.

Reasons:

1. DPL-03 has not yet frozen assurance/result composition;
2. DPL-05/06 have not frozen target/site schemas;
3. DPL-08 has not defined the site-interface boundary in enough detail;
4. the existing Reference House source already has a computational disposition model with a different purpose;
5. prematurely encoding this contract would risk conflating architectural authority with RH-C1 source-freeze semantics.

DPL-12 is the appropriate integration point once the foundation contracts survive the programme coherence review.

The durable Markdown contract is sufficient authority for DPL-02.

## Frozen conformance rules

1. **Conformance is relative to an exact controlled Reference House revision.**
2. **Deployment freedoms are opt-in.** Site pressure does not create architectural authority.
3. **Controlled source is not automatically identity.** Architectural gate authority determines conformance class.
4. **Identity invariants protect the categorical house proposition.**
5. **Protected order records current earned architecture that is not a deployment parameter.**
6. **Protected order may be changed only through explicit owning-gate Reference House revision and revalidation.**
7. **The only currently licensed architectural deployment variants are coherent whole-house mirroring and rigid site placement/orientation.**
8. **Site-interface freedoms end where protected architectural order begins.**
9. **Implementation freedom covers unresolved product/engineering/detail choices only where protected architecture survives.**
10. **A preference, old brief latitude or open question is not automatically a variant.**
11. **Superseded Reference House geometry is provenance, not a deployment option.**
12. **Four bedrooms is the active Reference House; the five-bedroom ceiling does not license a fifth-bedroom deployment variant.**
13. **The deleted principal en-suite remains deleted unless the explicit upstream route-proof/brief process reopens it.**
14. **The 300 mm stair going is a Reference House decision, not a universal rule and not a deployment shrink parameter.**
15. **G-01 conformance, Ovid’s House doctrine consistency, Reference House conformance, target compliance and technical proof remain separate axes.**
16. **A target/site conflict can require Reference House revision without making the pre-revision candidate conforming.**
17. **No scalar architectural similarity or retention score is authorised.**
18. **The compiler may report conformance findings but does not acquire authority to author adaptation.**

## What DPL-02 changes

DPL-02 changes **deployment authority only**.

It does not:

- change Reference House geometry;
- alter the current four-bedroom programme;
- change the stair;
- change G-01;
- change structural/service/environmental/roof systems;
- define a real site;
- define the Reference Site;
- encode law or planning policy;
- implement software;
- alter compiler fixture freeze/provisional dispositions;
- raise project maturity or external validation claims.

It provides the contract later DPL packets need to distinguish a legitimate site-conditioned instance from a redesign wearing the Reference House name.

## Next authorised work

DPL-03 may now proceed laterally on assurance/result semantics using the existing computational evidence model.

DPL-08 will later refine the physical site-interface freedoms after DPL-06/07 provide site representations.

DPL-12 may eventually encode this contract only after DPL-03 through DPL-06 and the mandatory foundation coherence review establish a stable shared model.

Until then, the contract remains architectural/governance authority rather than executable code.