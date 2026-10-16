# G-01 Precedent Annotation Method

The precedent evidence behind G-01 is read through a common annotation method so that one building is not interpreted by whatever feature happens to look interesting while another is measured differently.

> **Annotate the building first. Infer the grammar later.**

The method is deliberately implementation-independent. It is an evidence discipline, not a proposed database schema.

## Evidence states

Every observation is identified as one of:

### Fact

Directly supported by a cited source or drawing.

### Derived fact

Computed or logically derived from supported facts: aspect ratio, access depth, graph steps from an entrance, alignment or similar relationships.

### Interpretation

Architectural reading requiring judgement, such as principal-room status, a secondary axis or a weakened hierarchy. The facts motivating the interpretation remain visible.

### Hypothesis

A possible cross-case relationship suggested by the evidence. A hypothesis is not a grammar rule until comparison and counterexample testing justify it.

### Unknown

A question for which the available evidence is inadequate. Unknown is a legitimate completed state; it is not filled with a guess to make the record look complete.

## Source identity and historical phase

Each case records its sources, their dates, type, scale where relevant, whether they are original/measured/reconstructed/interpretive, what state of the building they represent, known alterations, confidence and reproduction constraints where relevant.

A central rule follows:

> **Geometric authority and historical-phase authority are separate attributes.**

A precise measured plan can be excellent evidence of geometry and still be wrong for an eighteenth-century claim if it includes later alteration.

## Case identity and morphology

Each case records enough context to understand what kind of building is being compared:

- building, location and date range;
- architect/designer/attribution where known;
- primary historical use;
- morphology and attachment condition;
- storey, basement/attic and roof condition;
- principal frontage and approach;
- garden/service-wing/pavilion relationships;
- major projections, recesses and known alterations.

Description precedes value judgement.

## Semantic spaces

Identifiable spaces receive stable case-specific identities. Historical room names are retained alongside a small normalised role vocabulary so unlike buildings can be compared without erasing their differences.

Useful roles include entrance, principal/secondary reception, dining, principal/secondary sleeping, dressing, study/library, kitchen, service, primary/secondary circulation, primary/service stair, storage and other.

For each space, the record may include floor, public/private/service role, candidate hierarchy, frontage, exterior access, evidence and confidence.

## Spatial topology

Connections are represented separately from room geometry.

Useful edge types include doors, large openings, stairs, service connections, exterior connections and uncertain historic connections. Derived properties may include access depth, alternative-route count, through-room circulation, cul-de-sac status, enfilade, centrality and separation of principal/service circulation.

> **A doorway is geometry; an access relation is topology.**

The method also distinguishes direct connectivity from route role and required sequence. Two plans with the same rooms and doors can differ architecturally if the intended principal route changes.

## Spatial hierarchy

Hierarchy is not inferred from floor area alone.

Rank may be read through combinations of room use/name, size, ceiling height, decorative richness, position, opening hierarchy, access route and source commentary. Conflicting signals remain conflicts rather than being averaged into a false certainty.

## Ordering structure

The method records axes, centres, bays and symmetry at the scale at which they actually operate.

Symmetry is never reduced to `isSymmetric = true/false`. A façade, principal block, room, opening group or landscape relation may be symmetric even where the whole building is not. Scope, axis, exact/approximate status and phase matter.

Bay structure likewise records repeated and exceptional bays, centre emphasis, edge conditions and projection/recess.

## Dimensions and proportion

Metric fields are populated only from evidence adequate for measurement.

Raw dimensions are retained before ratios: width, length, height, area, wall thickness and opening dimensions where supported, with uncertainty.

Derived ratios are not rounded towards famous proportional families. A useful record keeps the measured value, candidate family and difference separate.

The purpose is to test whether dimensional families exist, not to manufacture them.

## Vertical relationships

Sectional evidence may include:

- floor-to-floor and clear ceiling heights;
- hierarchy between storeys;
- double-height conditions;
- stair continuity;
- wall and opening stacking;
- attic/garret and basement/piano-nobile relationships.

Section is treated as architectural evidence in its own right rather than as a technical afterthought to plan.

## Elevation and openings

For each relevant elevation the method may record frontage rank, storeys expressed, bay count, opening identities, entrance position, centre condition, projection/recess, material/order transitions, roof/parapet relationship and horizontal datums.

Where source quality permits, individual openings may carry centreline, dimensions, sill/head levels, associated room, hierarchy and surround information.

## Plan / section / elevation coupling

Coupling is tested attribute by attribute rather than asserted generically.

Questions include:

- which room an opening serves;
- whether it follows room centre, bay centre or vertical alignment;
- whether opening size correlates with room rank;
- whether entrance position corresponds to an internal route;
- whether external projection corresponds to internal hierarchy;
- whether façade symmetry continues into plan or stops at the external surface;
- whether room rank corresponds to sectional privilege;
- whether stairs or double-height conditions alter otherwise regular stacking.

The direction of coupling can differ. Useful states include **mutual**, **plan leads**, **elevation leads**, **conflict/compromise** and **unknown**. Existence, centreline, width, height and vertical alignment may have different causes even for one opening.

## Intentional absence

Architecture is partly made from what is deliberately not occupied or opened.

The evidence therefore distinguishes true openings, blind/simulated openings, prohibited openings, retained solid fields, protected clear zones and unknown conditions.

This prevents compositional aperture from being confused with physical aperture.

## Structural reading

The case record is not a retrospective structural calculation. It records only supportable observations such as load-bearing wall family, likely floor-span direction, repeated support lines, major transfers, chimney/fireplace mass, large openings and later structural alteration.

The question is whether architectural and structural order appear related, not whether historic fabric can be certified from drawings.

## Service and occupation reading

Historical kitchen location, service stairs/wings, servant circulation, sanitation changes and other service arrangements are recorded where they explain spatial form.

They are then marked as historical dependencies where appropriate so social organisation does not enter a contemporary grammar merely through repetition.

Social-history evidence can likewise identify patron/household context, labour structure, entertaining conventions, privacy practices and occupation changes where these materially explain the architecture.

## Translation to Ovid’s House

Historic buildings are not scored against Ovid’s House doctrine.

Instead, interpretation may note spatial order worth preserving, architectural depth that already performs tolerance/interface work, arrangements that conflict with contemporary maintainability, opportunities for service geography and likely distinctions between enduring architecture and faster-changing fit-out.

Those observations remain interpretations, not historical evidence for the doctrine.

## Candidate observations

Each case can end with neutral observations that keep the evidential chain explicit:

```text
FACT
  supported condition in the building

INTERPRETATION
  architectural reading of that condition

HYPOTHESIS
  possible cross-case relationship

TEST AGAINST
  named other cases / counterexamples
```

This is the bridge from precedent to grammar without turning one admired building into authority.

## Alteration and uncertainty

Every case retains enough chronology to distinguish target-phase fabric from later change. Uncertainties identify the question, affected observation, evidence needed and whether the unknown blocks topology, measurement or neither.

The method is considered complete when the relevant questions have been asked and unsupported claims have not been invented—not when every cell contains a number.

## Current cases

The current [precedent case set](g01-cases/README.md) spans Marble Hill House, Danson House, 76 Dean Street and Bedford Square.

That set has already forced several durable methodological conclusions:

- Georgian architecture is not one plan graph;
- symmetry must be scoped;
- hierarchy is not room area alone;
- proportion is not one preferred ratio;
- circulation is an architectural relationship, not residual space;
- plan and elevation can negotiate rather than share one centre;
- intentional absence can carry composition;
- historical phase belongs to geometric evidence;
- urban order can operate above the single-house scale.

The normative consequences belong in [G-01 v0.1](g01-v0.1.md); the evidence limits and rejected simplifications are synthesised in [G-01 Validation and Limits](g01-validation.md).