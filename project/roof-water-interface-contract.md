# Roof / rainwater interface contract

**Owners:** ROF / RWT / HAD  
**Status:** programme-level interface contract; architectural selection not yet made

## Purpose

Keep roof design, rainwater design and architectural expression separate enough to preserve ownership, but coupled enough that they cannot produce incompatible answers.

This contract is deliberately small. It is not a design freeze and it does not select a roof or drainage system.

## Current baseline

The current Reference House uses a provisional 25° inward/outward twin-pitch ring roof with symbolic collection routes in PLT. Those drawings are a useful controlled baseline only.

The project-level no-flat-roof constraint remains operative until ROF earns an explicit rewind. Nothing in this contract silently changes it.

## Ownership

### ROF owns

- roof topology, faces, pitches and junction families;
- covering/build-up candidate families;
- roof-side weathering and collection edges/points;
- roof penetration/access/renewal logic;
- system-level material compatibility on the roof side.

### RWT owns

- collection hardware after the agreed roof collection interface;
- courtyard surface-water collection intrinsic to the house;
- outlets, overflows, downpipes, junctions and building-side transitions;
- blockage/exceedance routes;
- cleaning, rodding and local replacement logic;
- the `SITE-WATER-HANDOFF` boundary.

### HAD owns

- roof silhouette and architectural composition;
- eaves/cornice/parapet expression;
- visible rainwater-goods expression and integration;
- material/patina expression consistent with ROF/RWT technical constraints.

### Other owners remain unchanged

- OAS — openings and thresholds;
- MRA — adversarial moisture assurance;
- BCR/EPR/PHY — construction resolution, competent technical judgement and physical evidence;
- DPL — real site beyond `SITE-WATER-HANDOFF`;
- DEL — workmanship/procurement/inspection/commissioning/acceptance;
- PLT — representation of resolved authority.

## Stable seams

### ROF → RWT collection interface

ROF must hand RWT, for each selected roof catchment:

- catchment identity and geometry sufficient to reason about collection;
- edge/low-point/collection condition;
- roof material/runoff compatibility constraints;
- expected movement/interface constraints;
- whether the catchment is exposed, trapped or otherwise high-consequence;
- allowable/required overflow territories where geometry determines them.

RWT must not alter roof topology silently to make collection easier. A material conflict becomes an explicit rewind request.

### RWT → DPL `SITE-WATER-HANDOFF`

RWT may define:

- handoff location/zone;
- flow identity and bounded generic design assumptions;
- inspection/access requirement;
- above-ground or building-side transition condition;
- failure/exceedance condition that the downstream site response must not defeat.

RWT may not define a real sewer, infiltration rate, soakaway, SuDS/attenuation volume, groundwater assumption, authority approval or final site route.

### RWT ↔ OAS threshold/courtyard seam

RWT may define adjacent surface falls, collection and exceedance requirements. OAS retains the threshold assembly itself. If the selected threshold cannot survive the water geometry, the conflict is rewound explicitly rather than patched by either stream.

## Shared candidate discipline

ROF and RWT may research independently where the question is genuinely separable, but final candidates must be evaluated as a coupled system.

Do not select:

- roof geometry without checking collection/failure consequences;
- covering material without checking downstream material compatibility;
- downpipe locations without checking facade/courtyard architecture;
- hidden collection merely to make elevations cleaner;
- visually simple roof forms whose actual water topology is hostile;
- redundant outlets/paths whose maintenance burden creates more risk than resilience.

## Shared gate

`ROF-RWT-GATE` occurs after ROF-07, RWT-07 and the current HAD-03 architectural convergence.

It passes only when:

1. one coherent Reference House roof/water architecture is selected;
2. every intrinsic rain catchment has a primary physical path;
3. high-consequence trapped catchments have explicit safe visible exceedance strategy where justified;
4. roof form, eaves/cornice and visible rainwater goods describe the same architecture;
5. courtyard/threshold consequences are reconciled without taking OAS authority;
6. access, cleaning, local repair and eventual renewal are plausible;
7. material compatibility/movement interfaces are explicit;
8. no current PLT geometry survives merely because it has already been drawn;
9. no cross-stream conflict is resolved by silent geometry mutation;
10. unresolved structural, hydraulic, condensation, workmanship or physical claims are routed to named downstream evidence owners.

The gate is a prerequisite to `TRIAD-GATE`. It does not replace the IAS/OAS/HAD triad, and it does not itself prove construction or moisture assurance.

## MRA relationship

MRA-00 may supply assurance questions while ROF/RWT design proceeds. MRA does not choose the preferred system.

After the coordinated house passes TRIAD-GATE, MRA-01/03 attack the selected external-water and condensation/drying propositions. MRA-04 then composes those findings into the whole-house moisture failure model.

This separation is deliberate:

> **ROF/RWT construct the preferred system; MRA tries to break it.**

## Formalisation

Any later compiler model must preserve these ownership boundaries. A graph or topology representation may be useful, but representability does not prove hydraulic, structural, moisture or workmanship adequacy.