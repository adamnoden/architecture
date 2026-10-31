# Architectural Drawing Engine

`compiler/architectural-drawing/` is the semantic/representation layer between architectural authority and the low-level publication vector backend.

The boundary is deliberate:

```text
architectural source / compiled facts
        ↓
architectural-drawing semantic model
        ↓
architectural-drawing representation compiler
        ↓
publication-drawing-v2 / DrawingSceneV2
        ↓
SVG / PDF
```

## What this layer owns

This layer may own **representation semantics** such as:

- physical wall runs and wall-network topology;
- references to source-owned wall assemblies;
- openings hosted by physical walls;
- unresolved partition datums that are explicitly not walls;
- required adjacency without invented doors;
- authority / precision / provenance carried into representation;
- model-space dimensions and labels;
- architectural scale and BOOK/WALL/PROOF representation profiles;
- bounded rules for joins, opening subtraction, uncertainty and scale-appropriate assembly visibility.

## What this layer does not own

It may not decide architecture merely to complete a drawing. In particular it must not invent:

- wall construction families;
- internal partition thicknesses;
- door positions or swings;
- window/frame positions;
- technical junction details;
- structural, thermal or regulatory adequacy.

Those remain upstream architectural / engineering / evidence decisions.

## Model-space first

ADE semantic geometry is expressed in real/model millimetres. It is not pre-scaled into paper coordinates.

A representation profile supplies the conventional architectural scale:

```text
1000 model mm @ 1:100 → 10 paper mm
1000 model mm @ 1:50  → 20 paper mm
```

Paper-space notation remains physical:

```text
2 mm marker @ 1:100 → 2 paper mm
2 mm marker @ 1:50  → 2 paper mm
```

Later representation packets may decide that a larger scale exposes more **already-owned** architectural structure. Scale never creates new source authority.

## Partition contract

`AdePartitionDatum` is intentionally a separate type from `AdeWallRun`.

A partition datum:

- has model-space location;
- has provenance;
- has no wall assembly;
- has no thickness;
- cannot host an architectural opening.

When architecture actually selects a physical partition family, that condition is represented as an ordinary physical wall run with an owned wall assembly. The drawing engine does not silently promote a datum into a wall.

## Wall assembly contract

An `AdeWallRun` is physical enough to require an `AdeWallAssembly` reference. The assembly's thickness may still be exact, approximate, ranged or unresolved depending on source authority.

The assembly compiler expresses source-owned coordination layers such as the Reference House cavity-wall family without selecting technical construction.

## Opening contract

An `AdeOpening`:

- must be hosted by a physical wall;
- carries separate position and width authority;
- may be exact, approximate, ranged, qualitative or unknown;
- does not imply a door leaf, frame, reveal or technical closure unless those facts are separately owned.

The opening compiler and uncertainty grammar preserve these precision states through composition.

## Accepted API and supported domain

`compileArchitecturalPlanScene(plan, options)` composes the accepted wall, assembly, opening, datum, adjacency, dimension and label capabilities into `DrawingSceneV2`. The caller supplies projection/profile, explicit admissible thickness resolutions, annotation sides and material abutments. The engine contains no Reference House identifiers or source decisions.

- `topology.ts` — joined orthogonal physical runs and explicit shared-node junctions;
- `assembly-topology.ts` — face-referenced ordered assembly bands;
- `opening-topology.ts` — true subtraction, wholly inside a host run;
- `opening-uncertainty.ts` — exact/approximate/range/centre-only/host-only states, with model left/right preserved through plan projection;
- `partition-adjacency.ts` — non-physical datum loci and connectivity obligations;
- `dimension-drawing.ts` — composed physical-paper dimensions with direction-aware labels;
- `compile-plan.ts` — generic composition, guaranteed-minimum range apertures and explicit material abutments;
- `contrast-fixture.ts` — durable asymmetric non-Reference-House regression/inspection fixture.

Unknown/qualitative aperture geometry is never cut. Non-orthogonal runs, ranged opening positions and apertures touching host endpoints remain unsupported. A physical partition remains an ordinary wall with an upstream assembly; it does not select a door or admit services.

The Reference House adapter and candidate profiles live in `compiler/reference-house/ade-plan.ts` and `ade-plan-scene.ts`. They preserve the source-owned wall families and their provisional ranges. Source choices belong there, never in the generic engine.

The existing v2 path backend suffices; v1 and unchanged terminal scenes retain their byte contracts. Plan topology is not a section, elevation or 3D model. Shared authority/provenance, physical units and terminal primitives can transfer, while other views must earn their own representation rules.

The original plan-engine acceptance, reproducible proof commands and PLT physical-review obligations are recorded in [the ADE closeout](../../docs/publication/architectural-drawing-engine-closeout.md). That programme's internal work is complete; later representation extensions are described below, and actual print-token acceptance remains with PLT.

## Section and face-on aperture representation

`section-assemblies.ts` adds bounded vertical wall cuts and horizontal floor
packages in model millimetres (longitudinal member convention; no automatic
framing orientation or cross-cut joist generation). Callers own layer thickness authority, orientation,
opening extents, provisional head zones, sloping caps, underground continuation,
support envelopes, floor packages, clear end gaps and indicative seats. Nominal
geometry requires exact or approximate source values; unknown/ranged layer
thicknesses fail closed. This API does not infer a building section from a plan.

Both leaves continue to a source-authored support reservation, with explicit
non-dimensionable metadata. That envelope is not a footing design. Opening head
zones remain distinct from leaves and joinery; closure across a cavity is an
authored convention, not a selected thermal/moisture detail. Floor voids produce
no material strokes. Adjacent thin solid layers with identical extent/style can
share a visual band at small physical scale while retaining every layer ID.

`aperture-drawing.ts` supplies face-on frames/grids and closed cut joinery. Grid
counts, frame/profile dimensions, fanlights and thresholds are caller choices;
there is no Georgian style or Reference House geometry in the engine.
`section-contrast-fixture.ts` exercises an asymmetric non-courtyard example with
different layer sizes, span, levels and openings. This extends the accepted plan
engine; it does not certify structural adequacy or complete 3D/BIM capability.
