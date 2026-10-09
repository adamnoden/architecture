# G-01 D5 / D6 Web-Evidence Pass v0.2

**Status:** active research record  
**Date:** 2026-10-07  
**Purpose:** harden the dimensional and plan/section/elevation research under a public-web-only evidence boundary, resolve the 76 Dean Street source problem, and record what is now strong enough to change the model.

## 1. Decision

The D5/D6 programme will not wait for privately supplied archive material.

Publicly inspectable web evidence is the hard boundary for this research phase.

Consequences:

1. **76 Dean Street remains in the corpus**, but its role is qualitative/topological unless a sufficiently good public drawing is available.
2. **Bedford Square is added as a supplementary urban D5/D6 case** because public-domain measured plans and direct dimensions are available online.
3. An archive catalogue entry does not authorise metric extraction merely because it says “plan / section / elevation”.
4. Missing measurements remain `UNKNOWN`; they are not reverse-engineered from weak images to make the table look complete.

This is a source-quality correction, not a retreat in ambition.

## 2. Web evidence classes

The original G-01 evidence grades remain useful. D5/D6 now add an access qualifier because the web-only boundary makes source inspectability material.

### W-I — inspectable

The actual drawing/text can be inspected at sufficient quality for the claim being made.

Examples:

- direct dimensions stated in an authoritative text;
- public measured plan with readable scale;
- high-resolution section/elevation.

### W-R — inspectable reproduction

A secondary site exposes a usable reproduction of a primary/measured source.

Use only with the source provenance retained and precision matched to image quality.

### W-L — located, not inspectable

The catalogue proves a potentially strong source exists, but the image/scan is unavailable or too poor to inspect.

May support an acquisition note.

May **not** support extracted dimensions.

### W-U — unavailable / unresolved

No adequate public source yet found.

This qualifier should travel with D5/D6 source records whenever access quality affects the claim.

## 3. Why this was necessary

The earlier D5/D6 seeds treated several high-authority archive records as promising next sources. That was correct as a research queue, but under a web-only programme some of them become dead ends.

Examples found during this pass include Historic England catalogue records for measured Georgian-house sheets whose metadata describes plans, sections and elevations but whose image is not publicly exposed.

Those records remain useful provenance. They are not measurements.

The distinction is now explicit.

## 4. 76 Dean Street — role resolved

### Keep

Dean Street remains unusually valuable for:

- constrained double-pile urban morphology;
- four-bay order without a central doorway;
- first-floor / piano-nobile hierarchy;
- differentiated opening hierarchy;
- coexistence of principal and service stairs;
- forcing `UNKNOWN` where plan/elevation correspondence cannot be proved.

### Stop expecting from it

Until stronger open drawings appear, do not rely on Dean Street for:

- room width:length ratios;
- exact opening-centre maps;
- precise stair widths;
- precise floor/ceiling heights;
- structural span geometry.

### Methodological result

A case does not need to answer every research question to remain useful.

The corpus is stronger when cases have explicit roles rather than being stretched beyond their evidence.

## 5. Bedford Square — new supplementary urban evidence

The full case record is [G-01 Case BSQ — Bedford Square urban family](g01-cases/bedford-square.md).

Why it earns admission:

- the 1914 *Survey of London* public-domain volume identifies multiple measured ground/first-floor plans;
- direct historical dimensions are stated in the text;
- alteration histories allow measurements to be phase-qualified;
- Bedford Square introduces row/block-level architectural order that the villa cases and Dean Street do not expose as clearly;
- a separate measured plan/section and frontage by Niels Rohweder is publicly catalogued with scales of 1:400 and 1:200 respectively.

## 6. D5 — current admitted dataset after the web pass

### A. Room/volume dimensions already admitted

These remain from the v0.1 D5 seed.

| Case | Entity | Width | Length | Height | Status |
|---|---|---:|---:|---:|---|
| Marble Hill | Great Room | 24 ft | 24 ft | 24 ft | direct authoritative statement |
| Danson | Entrance Hall | 20 ft | 26 ft 8 in | 16 ft | direct |
| Danson | Library | 18 ft | 36 ft | 16 ft | direct |
| Danson | Dining Room | 18 ft | 36 ft | 16 ft | direct |
| Danson | Saloon | 26 ft principal measure | 26 ft principal measure | 16 ft | direct; canted/octagonal geometry |

No rule is promoted from these numbers.

### B. Urban/parcel dimensions newly admitted

| Case | Entity | Raw evidence | Derived relation | Status |
|---|---|---:|---:|---|
| Bedford Square | square between house fronts | 520 × 320 ft | 1.625 : 1 | direct; urban context |
| Bedford Square | central garden | 375 × 255 ft | ≈1.471 : 1 | direct; urban context |
| Bedford Square | parcel corresponding to Nos. 24–27, south edge | 99.25 ft / four current houses | mean 24.8125 ft | direct + derived; not individual width |
| Bedford Square | same parcel, north edge | 98.5 ft / four current houses | mean 24.625 ft | direct + derived; not individual width |
| Bedford Square | same parcel depth | 73 ft east / 67.5 ft west | tapered parcel | direct |

### What changed

D5 is no longer implicitly a **room-ratio study**.

It now has at least four dimensional scales:

```text
URBAN FIELD
ROW / BLOCK
PLOT / DWELLING
ROOM / OPENING / ELEMENT
```

That does not mean G-01 will constrain all four. It means the evidence model must be capable of discovering which scales matter before selecting rules.

## 7. D5 — current conclusions

### D5-C1 — universal room ratio remains unsupported

The previous direct dataset already contains 1:1, 4:3, 2:1 and canted/square-principal-axis rooms under different sectional conditions.

Bedford Square does nothing to rescue a universal ratio hypothesis.

### D5-C2 — absolute scale and morphology must travel with ratio

A terrace house organised on a roughly mid-20-foot plot module is solving a different geometric problem from a compact freestanding villa.

The same nominal room ratio cannot be evaluated without:

- absolute width/length/height;
- role;
- morphology;
- neighbouring rooms;
- structure;
- section;
- exterior order.

### D5-C3 — aggregate dimensions can be architectural evidence

The width of a row module or the geometry of a square can shape architecture without being a room dimension.

D5 should therefore retain `scale/scope` on every metric record.

### D5-C4 — web precision must be declared

A scale bar in a downsampled reproduction does not justify millimetre-level derived data.

Future extracted values should carry one of:

- DIRECT;
- MEASURED-HIGH-RES;
- MEASURED-SCALED-REPRODUCTION with uncertainty;
- DERIVED;
- UNKNOWN.

This is now a completion requirement.

## 8. D5 completion state

**NOT COMPLETE. Meaningful progress made.**

Remaining blockers:

1. expand Marble Hill beyond the Great Room using publicly inspectable phase-appropriate measured material;
2. attach scaled/direct drawing provenance to the existing Danson dimensions and extend to openings/bays;
3. extract a comparable set of Bedford Square house/room values from the best public measured plans, with alteration state and image uncertainty;
4. compute the same derived fields across all admitted cases;
5. add at least one hold-out measured case before any dimensional preference is promoted.

Dean Street is no longer itself a blocker to D5 completion.

## 9. D6 — strongest new result

The v0.1 D6 seed established that coupling is **attribute-specific**:

- opening existence can be elevation-led;
- centreline can be plan-led;
- width can be mutual;
- one object can therefore carry several coupling authorities.

Bedford Square adds a second correction:

> **Coupling is also scope-specific.**

The strong architectural order may belong to:

- component;
- room;
- dwelling;
- row/block;
- site/urban field.

## 10. Evidence for scope-specific coupling

Bedford Square was conceived as a uniform row around the square. Georgian Cities records that on two sides the pedimented centrepiece covers two houses, with the central pilaster falling at the division between two symmetrical dwellings.

The result cannot be described adequately by asking only:

> does the house plan align with the house elevation?

The higher-level condition is:

```text
ROW / BLOCK ELEVATION ORDER
        ↓ constrains
INDIVIDUAL FRONTAGE
        ↕ negotiates with
DWELLING PLAN
```

The row can have a centre even where no single dwelling owns that centre.

## 11. D6 modelling correction v0.2

A coupling record should now contain:

```text
case
phase
scope_owner
subject
attribute
plan_entity
section_entity
elevation_entity
coupling_direction
authority / strength
evidence
conflict
resolution
architectural_consequence
```

`scope_owner` is the new field.

Candidate values are descriptive, not a software enum yet:

```text
COMPONENT
ROOM
DWELLING
ROW_BLOCK
SITE_URBAN
```

This is a **modelling correction (M0)**, not a Georgian style rule.

It belongs in the general grammar machinery because any architectural language may contain relations operating at several compositional scales.

## 12. D6 — cross-case reading after the web pass

| Case | Strongest coupling lesson | Current confidence |
|---|---|---|
| Marble Hill | architectural centre can coordinate plan + elevation + section; section can dominate hierarchy | high broad / exact centres incomplete |
| Danson | coupling authority can differ by attribute; deliberate plan/elevation compromise is legitimate | high qualitative |
| 76 Dean Street | ordered façade does not require centred entrance; vertical hierarchy can dominate urban house order | high qualitative / exact mapping unknown |
| Bedford Square | compositional authority may exist at row/block scale across dwelling boundaries | high qualitative + direct urban dimensional context |

The cases are now doing genuinely different work.

## 13. D6 mutation queue after v0.2

Existing mutations remain:

- Marble Hill centre/section flattening;
- Danson blind-window regularisation;
- Danson forced single room ratio;
- 76 Dean Street centred entrance;
- 76 Dean Street flattened piano-nobile opening hierarchy.

Add:

### D6-M06 — individualise Bedford Square centrepiece

Redraw a two-house centrepiece so each dwelling receives an autonomous classical centre.

Question:

> does the mutation improve dwelling-level symmetry while damaging row-level order?

This directly tests `scope_owner`.

It remains unevaluated until a controlled drawing comparison is produced.

## 14. D6 completion state

**NOT COMPLETE. Conceptual model materially improved.**

Before D6 closes:

1. measured opening/room centre relations must be added for at least one urban and one villa case;
2. one sectionally rich public source must be extracted numerically rather than only qualitatively;
3. coupling records must be instantiated with `scope_owner` across all trial cases;
4. mutation drawings must actually be evaluated;
5. the vocabulary must survive at least one hold-out case.

## 15. Promotion status

### Promote now — modelling only

**M0:** coupling relations require explicit scope/owner in addition to attribute and direction.

### Do not promote yet

No new G-01 architectural invariant.

In particular, do not promote:

- 25 ft townhouse width;
- whole-house symmetry;
- central entrance;
- Bedford Square row composition;
- any universal room ratio.

## 16. Research sequence from here

The next source work should be ordered by information gain:

1. **Marble Hill metric expansion** — strongest chance to complete plan/section/elevation geometry around a canonical compact villa.
2. **Danson opening/bay extraction** — already rich in direct dimensions and coupling evidence.
3. **Bedford Square measured-plan extraction** — build the comparable urban metric table and at least one room/opening map.
4. **Mutation drawings** — only after the inputs above are stable enough that a mutation changes one thing at a time.
5. **Hold-out** — test survivors without tuning against the hold-out.

No further search for “more Georgian buildings” is justified until these evidence gaps are attacked.

## 17. Current judgement

D5 and D6 have become stricter rather than merely larger.

The useful result of the web-only constraint is that source access is now part of the evidence model, Dean Street has a clear bounded role, and the urban case has exposed a missing formal concept: **architectural relationships have scope as well as direction**.

That is enough to continue the programme without either discarding Dean Street or pretending it can prove measurements it cannot.
