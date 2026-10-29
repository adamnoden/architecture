# RWT — Rainwater Systems Architecture

**Issue:** #992  
**State:** authorised programme; execution not yet started

## Purpose

Design the building-side rainwater system of Ovid’s House as one explicit gravity network from catchment to site handoff, with visible failure paths, maintainable components and bounded consequences under blockage or exceedance.

RWT asks:

> **How can rainfall travel from every catchment to the site handoff through the shortest, simplest, visible and maintainable gravity path, while remaining safe under blockage, ageing and exceptional rainfall?**

## Naming and authority

The project/publication is **Ovid’s House**. The **Reference House** is the controlled exemplar within it. The former HSA name is historical only.

Current PLT roof-water and courtyard-drainage lines are provisional representation, not rainwater-system design authority.

## Ownership boundary

RWT owns building-intrinsic rainwater collection and conveyance:

- roof catchment interfaces supplied by ROF;
- open-to-sky courtyard surface collection because the courtyard is intrinsic Reference House architecture;
- eaves gutters, valley/box gutters where selected, outlets, hoppers, scuppers and overflows;
- downpipes, offsets, branches, bends, junctions, supports and accessible demounting logic;
- visible emergency/exceedance routes;
- building-side gullies/inspection transitions only as needed to define the site boundary;
- rainwater-system materials, joints/movement and compatibility with roof materials;
- cleaning, rodding, replacement and access;
- Reference House network selection jointly reconciled with ROF and HAD.

RWT ends at a stable **`SITE-WATER-HANDOFF`**. It does not select a real sewer, soakaway, infiltration rate, attenuation volume, SuDS arrangement, groundwater response or drainage-authority route. Those are DPL/real-project matters.

RWT also does not own roof covering/weathering, opening/threshold assembly design, foul drainage, whole-house moisture assurance, architecture independent of system constraints, delivery acceptance or drawing invention.

## Governing model

Represent rainwater as a directed gravity network:

`catchment → collection → outlet → conveyance → inspection/transition → SITE-WATER-HANDOFF`

and separately:

`blocked/failed primary path → visible safe exceedance path → consequence`.

The system should prefer gravity, access, visible overflow and local replaceability over hidden complexity or sensor dependence.

Do not minimise pipe/outlet count mechanically. Fewer components can increase coupling and consequence. More outlets can increase maintenance and interfaces. Preserve the trade-off explicitly.

## Programme

### RWT-00 — constitution, baseline and interfaces

Freeze the current provisional water representation and authority boundary.

Required output:

- current PLT roof-water/courtyard baseline and limitations;
- inventory of existing rainwater/moisture patterns, DPL interface authority and unresolved obligations;
- `ROF→RWT` collection-interface contract;
- `RWT→DPL` `SITE-WATER-HANDOFF` contract;
- RWT↔OAS threshold/courtyard interface rules;
- Reference House assumptions versus real-site dependencies;
- shared material-compatibility record requirement with ROF.

### RWT-01 — rainfall and hydraulic basis

Establish bounded generic architecture-level reasoning for:

- catchment/effective area;
- rainfall intensity/design-event assumptions;
- gravity flow/fall/capacity relationships;
- outlet/downpipe sizing logic at selection scope;
- exceedance and blockage design principles;
- site/jurisdiction/project-specific inputs that cannot be fixed generically.

Use relevant standards/guidance as baselines without turning the Reference House into a site drainage design or hydraulic certification exercise.

### RWT-02 — collection architecture

Compare and classify:

- conventional eaves gutters;
- valleys and valley outlets where geometry creates them;
- box/parapet/internal gutters;
- hoppers/scuppers;
- roof outlets;
- courtyard drains/channels where required by the architecture.

Judge by:

- accessibility;
- blockage consequence;
- overflow behaviour;
- joint criticality;
- cleaning burden;
- architectural integration;
- replacement extent.

A trapped catchment with one invisible critical outlet carries a higher burden than an exposed eaves condition even if both satisfy nominal capacity.

### RWT-03 — conveyance topology

Compare:

- independent vertical routes versus convergence;
- bends, offsets and horizontal runs;
- branches/junctions;
- visible versus concealed routing;
- demountable support and replacement extents;
- relationship to facade, courtyard, service zones and ground transitions.

Do not trade fault containment/access away merely to reduce downpipe count.

### RWT-04 — materials, joints and compatibility

Compare realistic material families such as cast iron, copper, zinc, aluminium, stainless steel and suitable polymeric systems at project-relevant scope.

Record:

- corrosion/galvanic compatibility;
- movement;
- joint type and renewal;
- support requirements;
- local repair/replacement;
- UV/impact/temperature exposure where relevant;
- compatibility with ROF roof materials/runoff;
- appearance/patina questions for HAD.

ROF and RWT must share one compatibility record rather than maintain contradictory material answers.

### RWT-05 — blockage, failure and exceedance

Attack at minimum:

- blocked gutter/channel;
- blocked primary outlet;
- blocked downpipe;
- failed/displaced joint;
- undersized/overwhelmed primary route;
- debris accumulation;
- frozen/obstructed conditions where relevant;
- one ordinary maintenance degradation coinciding with heavy rain.

For every case record:

- next water path;
- visibility;
- first vulnerable fabric;
- passive secondary routing where justified;
- access and repair consequences.

RWT designs the physical route. MRA later tests whether the whole-house consequence is acceptable.

### RWT-06 — access, courtyard/ground transition and site handoff

Resolve:

- cleaning/rodding access;
- outlet/downpipe removal and replacement;
- visible gullies/inspection transitions where useful;
- courtyard collection and safe relationship to doors/thresholds;
- wall-base/splash interfaces;
- one explicit `SITE-WATER-HANDOFF` containing only facts the downstream site problem legitimately needs.

Do not cross the handoff by inventing real-site drainage facts.

### RWT-07 — network synthesis and Reference House candidates

Combine:

`collection × conveyance × materials/joints × failure routes × access`.

Produce a deliberately small candidate set. Selection remains provisional until the shared ROF-RWT-GATE reconciles it against actual roof topology and HAD architecture.

### ROF-RWT-GATE — Reference House roof/water reconciliation

Shared ROF/RWT/HAD gate after ROF-07, RWT-07 and current HAD-03 convergence.

RWT must prove:

- every roof/courtyard catchment has an explicit primary path;
- every trapped/high-consequence catchment has an explicit safe visible exceedance strategy where justified;
- outlet/downpipe locations agree with architecture;
- courtyard/threshold consequences are reconciled with OAS without taking OAS authority;
- material compatibility and movement are explicit;
- cleaning, rodding and replacement are plausible;
- downstream site dependency is a handoff, not a guessed solution.

Only then may the roof/water architecture enter TRIAD-GATE as part of the coordinated house.

### RWT-08 — formalisation / regression admission

After selection is stable, decide whether the catchment/network graph and explicit failure paths deserve deterministic representation or regression checks.

Do not create a generic hydraulic solver, false precision or pseudo-certification merely because the graph is representable.

## Parallel topology

```text
BSR-ROOT
   │
   └──────────────► RWT-00
                      │
                   RWT-01
             ┌────────┼────────┐
             ▼        ▼        ▼
          RWT-02   RWT-03   RWT-04
             └────────┼────────┘
                      ▼
                   RWT-05
                      ▼
                   RWT-06
                      ▼
                   RWT-07
                      │
         ROF-07 ──────┼──── HAD-03
                      ▼
                ROF-RWT-GATE
                      │
                      ▼
                  TRIAD-GATE
```

RWT-02/03/04 are intentionally parallel after the hydraulic/interface basis. They remain packets inside one workstream.

## Interfaces

- **ROF** supplies actual roof topology and collection interfaces; RWT can force topology reconsideration when drainage consequences are materially poor.
- **HAD** owns visible expression. It cannot aesthetically erase a necessary overflow or access route.
- **OAS** owns doors/windows/threshold assemblies; RWT owns adjacent surface-water consequence and can request an explicit rewind.
- **MRA** owns adversarial moisture assurance after selection, not initial RWT design.
- **DPL** owns real-site drainage beyond `SITE-WATER-HANDOFF`.
- **BCR/EPR** own construction resolution and competent technical questions exceeding architectural selection.
- **PHY** may test a genuinely critical collection/overflow/junction proposition where evidence warrants it.
- **DEL** owns workmanship, inspection, commissioning and maintenance acceptance.
- **OCG** may later test clearing/replacement interventions.
- **PLT** represents resolved authority only.

## Non-goals

RWT is not site-drainage/SuDS design, foul drainage design, a second ROF, a second MRA, a concealment programme for downpipes, a smart-sensor programme, a universal hydraulic solver or a claim that gutters/outlets never block.

## Exit gate

RWT closes only when:

- every intrinsic Reference House rain catchment has a selected primary path;
- high-consequence blockage/exceedance routes are explicit;
- access, cleaning and replacement are designed;
- material compatibility is controlled;
- the site boundary is a precise handoff rather than invented site evidence;
- the selected network has passed ROF-RWT-GATE with roof and architecture;
- unresolved technical claims have named downstream owners.

Closure establishes a controlled building-side rainwater-system proposition, not real-site drainage acceptance, hydraulic certification, statutory approval or workmanship proof.