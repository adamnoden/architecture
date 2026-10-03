# Boundary Family BF-WIN-MCW-01 — Window in Partial-Fill Masonry Cavity Wall

**Status:** supported-family research candidate v0.1  
**Applies to:** S0 wall/window interface  
**Purpose:** instantiate one actual reusable boundary family far enough that weather, moisture, thermal and air continuity stop being bespoke prose in every compile.  
**Construction status:** research family, not construction specification.

> **A supported boundary family defines a bounded route through the problem. It does not turn unknown site or product evidence into a pass.**

## 1. Family scope

Host wall:

- facing-masonry outer leaf;
- partial-fill insulation;
- drained residual cavity;
- masonry inner leaf;
- permanent room-side air-control layer.

S0 nominal host:

~~~text
102.5 mm facing brick
50 mm residual drained cavity
150 mm partial-fill mineral-wool zone
215 mm dense masonry inner leaf
parge / plaster / compatible permanent air-control layer
~~~

Opening:

- ordinary external window opening;
- explicit head/jamb/sill interfaces;
- replaceable window unit;
- structural head support modelled separately.

## 2. What this family owns

This family contributes to shared graphs for:

- WEATHER;
- MOISTURE;
- THERMAL;
- AIR.

It also contributes applicability/evidence dependencies to:

- FIRE at the cavity opening;
- WORKMANSHIP / Regulation 7;
- REPLACEMENT.

It does not own:

- lintel capacity;
- residual-pier structural adequacy;
- whole-elevation B4 fire-spread analysis;
- whole-room purge ventilation;
- emergency-egress strategy;
- window security;
- whole-dwelling overheating.

Those arise at other scales.

## 3. Eligibility inputs

The family is only fully supported when the following are known.

### Wall/material

- outer-leaf masonry family;
- pointing/joint condition;
- insulation product/family;
- residual cavity;
- inner-leaf material;
- air-control material/system.

### Site/exposure

- wind-driven-rain exposure route;
- orientation/local modifiers where required;
- any exceptional shelter/exposure condition.

### Window

- frame family;
- fixing/interface family;
- sill/head/reveal configuration;
- product weather/thermal evidence.

### Fire

- cavity/opening closure route;
- whole-building applicability context.

Unknown inputs do not become defaults.

## 4. Weather graph contribution

Conceptually:

~~~text
PRECIPITATION
    ↓
OUTER MASONRY
    ↓
DRAINED RESIDUAL CAVITY
    ├── head drainage / tray where applicable
    ├── jamb/reveal protection
    └── sill discharges outward
            ↓
         EXTERIOR
~~~

Approved Document C's common cavity-wall guidance recognises:

- a drained air space preventing precipitation transfer to the inner leaf;
- a cavity at least 50 mm wide in the common route;
- for partial fill, residual cavity not less than 50 mm nominal;
- exposure as a design input rather than a universal constant.

### Family rule

The S0 nominal 50 mm residual cavity is **geometrically eligible** for this common route.

Weather performance is **CONDITIONAL** until exposure and selected material/detail evidence are supplied.

## 5. Moisture graph contribution

Required propositions include:

- outer leaf and cavity manage precipitation;
- insulation installation does not bridge the drainage route in an unsupported way;
- inner leaf remains protected;
- opening head/jamb/sill do not create a moisture path to the interior;
- penetrations do not short-circuit cavity drainage;
- condensation/interstitial-moisture assessment is supplied where required by the selected building-physics route.

A 50 mm cavity alone does not prove these propositions.

## 6. Air graph contribution

For the pre-2027 S0 L route, the family uses the masonry inner face as the primary air-control side.

Conceptual path:

~~~text
PERMANENT PARGE / AIR LAYER
    ↓
WINDOW-OPENING TRANSITION
    ↓
WINDOW FRAME / AIR SEAL
~~~

Other interfaces contribute separately:

- floor edge;
- service penetration;
- roof/wall later.

The family therefore contributes a segment to AIR-B03.

It does not emit an independent whole-building airtightness pass.

## 7. Thermal graph contribution

Conceptual path:

~~~text
WALL INSULATION FIELD
    ↓
OPENING REVEAL / CLOSER TRANSITION
    ↓
WINDOW FRAME + GLAZING
~~~

Required evidence classes:

- opaque wall U-value;
- window Uw;
- junction / thermal-bridge assessment as required by the project route;
- product/family conductivity and geometry inputs.

The family owns the continuity relationship.

It does not invent missing product properties.

## 8. Fire contribution

At the opening, the cavity/fire model needs an accepted closure route where applicable.

The boundary family contributes:

- cavity edge identity;
- opening extent;
- selected closer/barrier family;
- material/evidence dependencies.

The canonical FIRE obligation is derived after composition with:

- building/fire context;
- wall role;
- window/opening;
- selected target.

## 9. Replacement contribution

The permanent boundary strategy should survive window replacement without making the removable frame itself the sole permanent air/weather strategy.

Required replacement semantics:

- window unit removable as one replacement class;
- permanent opening survives;
- air/weather/thermal transitions have a defined reinstatement method;
- replacement evidence is regenerated after intervention.

## 10. Workmanship / inspection

Critical hold points include, proportionately:

- cavity/insulation condition before closure;
- head/sill drainage conditions;
- window opening measurement;
- air transition before lining/concealment;
- penetration sealing;
- product identity.

The exact tolerance envelopes remain implementation/product dependent.

## 11. Family status for S0 Run 02

Given the current S0 source:

### Host geometry

PASS at research-family level.

### Residual cavity

PASS geometrically: nominal 50 mm.

### Exposure

UNRESOLVED.

### Insulation/product certification

UNRESOLVED.

### Window product

UNRESOLVED.

### Air-boundary topology

PASS semantically.

### Thermal performance

UNRESOLVED.

### Weather detail

UNRESOLVED pending exposure/product/detail.

### Fire closure

UNRESOLVED / target-context dependent.

Therefore:

**BF-WIN-MCW-01 = SUPPORTED FAMILY / INCOMPLETE EVIDENCE**

This is a useful state.

## 12. Product substitution

Changing the window product while preserving the masonry opening may leave:

- host-wall geometry;
- cavity geometry;
- structural head geometry;

unchanged.

It should re-evaluate:

- frame fixing;
- weather joint;
- air transition;
- Uw;
- reveal/thermal bridge;
- safety/security/operational evidence as applicable;
- replacement procedure.

The family is therefore a strong evidence-invalidation boundary.

## 13. Out-of-family conditions

Return **UNSUPPORTED** rather than stretch the family if, for example:

- wall ceases to be the represented masonry cavity construction;
- exposure/detail requires a materially different moisture strategy;
- window system requires an incompatible opening/closure arrangement;
- insulation/cavity arrangement leaves the declared family envelope;
- novel façade/cladding system changes the drainage principle.

A new supported family or external design evidence is required.

## 14. Source anchors

- Approved Document C: https://www.gov.uk/government/publications/site-preparation-and-resistance-to-contaminates-and-moisture-approved-document-c
- Approved Document L, 2021 edition incorporating 2023 amendments: https://www.gov.uk/government/publications/conservation-of-fuel-and-power-approved-document-l
- S0 source package: [S0 Frozen Source Package](s0-source-package.md)
- Window/wall bundle: [Window in Masonry Cavity Wall](interface-bundle-window-masonry.md)
